import fs from "fs-extra";
import path from "path";
import Base64SrcLoader from "@/libraries/os/utils/Base64SrcLoader";
import { BeatsaverKeyType } from "@/libraries/beatmap/repo/BeatsaverKeyType";
import BeatsaverCacheManager from "@/libraries/beatmap/repo/BeatsaverCacheManager";
import { BeatmapLocal } from "./BeatmapLocal";
import BeatmapLoadStateError from "./BeatmapLoadStateError";
import { BeatmapLoadState } from "./BeatmapLoadState";
import BeatmapHashComputer from "./BeatmapHashComputer";

export default class BeatmapLoader {
  private readonly beatmap: BeatmapLocal;

  private beatmapFolder: string = "";

  private hash: string | undefined;

  public static async Load(
    beatmapFolder: string,
    skipApiCall = false
  ): Promise<BeatmapLocal> {
    return new BeatmapLoader().Load(beatmapFolder, skipApiCall);
  }

  public static async LoadCoverByPath(
    coverPath: string
  ): Promise<string | undefined> {
    if (!(await fs.pathExists(coverPath))) {
      return undefined;
    }

    return Base64SrcLoader.FromFile(coverPath);
  }

  public static async LoadCover(
    beatmap: BeatmapLocal
  ): Promise<string | undefined> {
    return this.LoadCoverByPath(beatmap.coverPath);
  }

  private constructor() {
    this.beatmap = {} as BeatmapLocal;
    this.beatmap.loadState = { valid: false } as BeatmapLoadState;
  }

  private async Load(
    beatmapFolder: string,
    skipApiCall = false
  ): Promise<BeatmapLocal> {
    try {
      this.beatmapFolder = beatmapFolder;
      this.beatmap.folderPath = beatmapFolder;

      await this.ValidateFolderContent();
      await this.FindTheHash();
      if (!skipApiCall) {
        await this.CacheBeatsaverMap();
      }

      this.beatmap.loadState.valid =
        this.beatmap.loadState.errorType === undefined;

      return this.beatmap;
    } catch (e) {
      // 例外を外側に投げない
      console.log(e);
      this.beatmap.loadState.valid = false;
      this.beatmap.loadState.errorType = BeatmapLoadStateError.Unknown;
      this.beatmap.loadState.errorMessage =
        typeof e === "string" ? e : (e as any).message;
      return this.beatmap;
    }
  }

  private async ValidateFolderContent() {
    let coverImageFilePath: string;
    let soundFilePath: string;

    this.beatmap.folderNameHash = BeatmapHashComputer.getFolderNameHash(
      this.beatmapFolder
    );

    try {
      const infoDatPath = path.join(this.beatmapFolder, "info.dat");
      const infoDat = await fs.readFile(infoDatPath);

      const stat = await fs.stat(infoDatPath);
      this.beatmap.downloaded = stat.birthtime.toISOString();

      const beatmapDescription = JSON.parse(infoDat.toString());

      coverImageFilePath = path.join(
        this.beatmapFolder,
        beatmapDescription._coverImageFilename
      );
      soundFilePath = path.join(
        this.beatmapFolder,
        beatmapDescription._songFilename
      );
    } catch (e) {
      this.beatmap.loadState.errorType =
        BeatmapLoadStateError.NoInfoDatFileFound;
      return;
    }

    if (!(await fs.pathExists(coverImageFilePath))) {
      this.beatmap.loadState.errorType =
        BeatmapLoadStateError.NoCoverImageFound;
    } else {
      this.beatmap.coverPath = coverImageFilePath;
    }

    if (!(await fs.pathExists(soundFilePath))) {
      this.beatmap.loadState.errorType = BeatmapLoadStateError.NoSoundFileFound;
    } else {
      this.beatmap.songPath = soundFilePath;
    }
  }

  private async FindTheHash() {
    this.beatmap.hash = undefined;

    if (this.beatmap.loadState.errorType) {
      return;
    }

    this.hash = await BeatmapHashComputer.Compute(this.beatmapFolder);

    if (!this.hash) {
      this.beatmap.loadState.errorType =
        BeatmapLoadStateError.FailedToComputeHash;
    } else {
      this.beatmap.hash = this.hash;
    }
  }

  private async CacheBeatsaverMap() {
    if (this.hash) {
      await BeatsaverCacheManager.forceGetCacheBeatmap({
        type: BeatsaverKeyType.Hash,
        value: this.hash,
      });
    }
  }
}
