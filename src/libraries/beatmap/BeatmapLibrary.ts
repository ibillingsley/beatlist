/* istanbul ignore file */
import store from "@/plugins/store";
import fs from "fs-extra";
import { BeatmapLocal } from "@/libraries/beatmap/BeatmapLocal";
import {
  BeatsaverBeatmap,
  Metadata,
} from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import { BeatmapsTableDataUnit } from "@/components/beatmap/table/core/BeatmapsTableDataUnit";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import Logger from "@/libraries/helper/Logger";
import Utilities from "@/libraries/helper/Utilities";
import PlaylistLibrary from "../playlist/PlaylistLibrary";
import { PlaylistLocal } from "../playlist/PlaylistLocal";

interface TableDataUnit {
  local: BeatmapLocal;
  data: BeatsaverBeatmap | undefined;
  coverPath: string | undefined;
  folderNameHash: string | undefined;
  downloaded: string | undefined;
}

export default class BeatmapLibrary {
  static generatedBeatmapCache = new Map<string, BeatsaverBeatmap>();

  public static GetAllMaps(): BeatmapLocal[] {
    // 純粋に store に保存されている曲のみ返却
    return store.getters["beatmap/beatmaps"] as BeatmapLocal[];
  }

  public static GetAllValidMap(): BeatmapLocal[] {
    return this.GetAllMaps().filter(
      (beatmap: BeatmapLocal) => beatmap.loadState.valid
    );
  }

  public static GetAllInvalidMap(): BeatmapLocal[] {
    return this.GetAllMaps().filter(
      (beatmap: BeatmapLocal) => !beatmap.loadState.valid
    );
  }

  public static async GetAllValidBeatmapAsTableData(): Promise<
    BeatmapsTableDataUnit[]
  > {
    Logger.debug(`start GetAllValidBeatmapAsTableData`, "BeatmapLibrary");

    const localValidMaps = BeatmapLibrary.GetAllValidMap();

    Logger.debug(
      `    start localValidMaps loop: ${localValidMaps.length}`,
      "BeatmapLibrary"
    );

    const result: BeatmapsTableDataUnit[] = [];
    const promiseResults: Promise<TableDataUnit>[] = [];
    const validCache = BeatsaverCachedLibrary.GetAllValid();
    let cnt = 0;
    for (const beatmap of localValidMaps) {
      cnt += 1;
      if (cnt > 200) {
        // イベントループやレンダリングの機会を提供するため sleep
        // eslint-disable-next-line no-await-in-loop
        await Utilities.sleep(50);
        Logger.debug(`    await sleep....`);
        cnt = 0;
      }
      let mydata: BeatsaverBeatmap | undefined;
      if (beatmap.hash) {
        const hash = beatmap.hash.toUpperCase();
        const { folderNameHash, downloaded } = beatmap;
        // mydata = BeatsaverCachedLibrary.GetByHash(hash)?.beatmap;
        mydata = validCache.get(hash)?.beatmap;
        if (mydata != null) {
          result.push({
            local: undefined,
            data: mydata,
            coverPath: beatmap.coverPath,
            folderNameHash,
            downloaded,
            duplicated: false,
            playlistMapIndex: undefined,
            diffHighlight: undefined,
          });
          // eslint-disable-next-line no-continue
          continue;
        }
        const generatedCache = BeatmapLibrary.generatedBeatmapCache.get(hash);
        if (generatedCache != null) {
          result.push({
            local: beatmap,
            data: generatedCache,
            coverPath: beatmap.coverPath,
            folderNameHash,
            downloaded,
            duplicated: false,
            playlistMapIndex: undefined,
            diffHighlight: undefined,
          });
          // eslint-disable-next-line no-continue
          continue;
        }
        // TODO 事前キャッシュはあるから Local に 40000件あっても大半はここに到達しないが、1000件ずつくらいに分割したほうがいい。
        promiseResults.push(
          new Promise<TableDataUnit>((resolve) => {
            BeatmapLibrary.GenerateBeatmap(beatmap)
              .then((generatedMap) => {
                resolve({
                  local: beatmap,
                  data: generatedMap,
                  coverPath: beatmap.coverPath,
                  folderNameHash,
                  downloaded,
                });
              })
              .catch((error: any) => {
                console.warn(error);
                resolve({
                  local: beatmap,
                  data: undefined,
                  coverPath: beatmap.coverPath,
                  folderNameHash,
                  downloaded,
                });
              });
          })
        );
      }
    }
    Logger.debug(
      `    end   localValidMaps loop: ${localValidMaps.length}`,
      "BeatmapLibrary"
    );
    let resolved: TableDataUnit[] = [];
    if (promiseResults.length > 0) {
      Logger.debug(
        `    start promise.all: ${promiseResults.length}`,
        "BeatmapLibrary"
      );
      resolved = await Promise.all(promiseResults);
      Logger.debug(
        `    end   promise.all: ${promiseResults.length}`,
        "BeatmapLibrary"
      );
    }
    Logger.debug(`end   GetAllValidBeatmapAsTableData`, "BeatmapLibrary");
    return result.concat(
      resolved.filter((item) => item.data != null) as BeatmapsTableDataUnit[]
    );
  }

  static async GenerateBeatmap(
    beatmap: BeatmapLocal | undefined
  ): Promise<BeatsaverBeatmap | undefined> {
    if (beatmap?.hash === undefined) {
      return undefined;
    }

    // Logger.debug(`start GenerateBeatmap`);

    const hash = beatmap.hash.toUpperCase();
    const cache = BeatmapLibrary.generatedBeatmapCache.get(hash);
    if (cache != null) {
      // Logger.debug(`end   GenerateBeatmap (cache hit): ${hash}`);
      return cache;
    }

    // Logger.debug(`    cache miss: ${hash}`);
    let beatmapDescription;
    try {
      const infoDat = await fs.readFile(`${beatmap.folderPath}/info.dat`);
      beatmapDescription = JSON.parse(infoDat.toString());
    } catch (e) {
      return undefined;
    }
    const v4 = beatmapDescription.version?.startsWith("4.");
    const myDifficulties = {
      easy: false,
      normal: false,
      hard: false,
      expert: false,
      expertPlus: false,
    };
    // BeatmapsTable 表示用
    const requirements = {
      chroma: false,
      ne: false,
      me: false,
      cinema: false,
      vivify: false,
    };
    const authors = new Set();
    for (const mapset of v4
      ? [beatmapDescription.difficultyBeatmaps]
      : beatmapDescription._difficultyBeatmapSets) {
      for (const map of v4 ? mapset : mapset._difficultyBeatmaps) {
        switch (v4 ? map.difficulty : map._difficulty) {
          case "Easy":
            myDifficulties.easy = true;
            break;
          case "Normal":
            myDifficulties.normal = true;
            break;
          case "Hard":
            myDifficulties.hard = true;
            break;
          case "Expert":
            myDifficulties.expert = true;
            break;
          case "ExpertPlus":
            myDifficulties.expertPlus = true;
            break;
          default:
            break;
        }
        if (v4 && map.beatmapAuthors) {
          for (const mapper of map.beatmapAuthors.mappers || [])
            authors.add(mapper);
          for (const lighter of map.beatmapAuthors.lighters || [])
            authors.add(lighter);
        }
        let reqs: string[] = [];
        if (map._customData?._suggestions != null) {
          reqs = reqs.concat(map._customData?._suggestions);
        }
        if (map._customData?._requirements != null) {
          reqs = reqs.concat(map._customData?._requirements);
        }
        if (v4 && map.customData?.suggestions != null) {
          reqs = reqs.concat(map.customData?.suggestions);
        }
        if (v4 && map.customData?.requirements != null) {
          reqs = reqs.concat(map.customData?.requirements);
        }
        requirements.chroma = requirements.chroma || reqs.includes("Chroma");
        requirements.ne = requirements.ne || reqs.includes("Noodle Extensions");
        requirements.me =
          requirements.me || reqs.includes("Mapping Extensions");
        requirements.cinema = requirements.cinema || reqs.includes("Cinema");
        requirements.vivify = requirements.vivify || reqs.includes("Vivify");
      }
    }

    const mymetadata: Metadata = {
      difficulties: myDifficulties,
      characteristics: [],
      songName: v4
        ? beatmapDescription.song.title
        : beatmapDescription._songName,
      songSubName: v4
        ? beatmapDescription.song.subTitle
        : beatmapDescription._songSubName,
      songAuthorName: v4
        ? beatmapDescription.song.author
        : beatmapDescription._songAuthorName,
      levelAuthorName: v4
        ? Array.from(authors).join(", ")
        : beatmapDescription._levelAuthorName,
      bpm: v4
        ? beatmapDescription.audio.bpm
        : beatmapDescription._beatsPerMinute,
      // info.dat の中に duration がないので取得不可
      duration: undefined,
      requirements,
    };
    const item: BeatsaverBeatmap = {
      metadata: mymetadata,
      stats: {
        downVotes: 0,
        // downloads: 0,
        // heat: 0,
        // plays: 0,
        rating: 0,
        upVotes: 0,
      },
      description: "",
      key: "",
      name: mymetadata.songName,
      // uploaded: null,
      hash: beatmap.hash,
      // directDownload: "",
      downloadURL: "",
      coverURL: "",
    };
    BeatmapLibrary.generatedBeatmapCache.set(hash, item);
    // Logger.debug(`end   GenerateBeatmap: ${hash}`);
    return item;
  }

  public static GetMapByHash(hash: string): BeatmapLocal | undefined {
    const hashmap: Map<string, BeatmapLocal> =
      store.getters["beatmap/beatmapHashMap"];
    return hashmap.get(hash.toUpperCase());
  }

  public static HasBeatmap(beatmap: BeatsaverBeatmap): boolean {
    const hashmap: Map<string, BeatmapLocal> =
      store.getters["beatmap/beatmapHashMap"];
    return hashmap.has(beatmap.hash.toUpperCase());
  }

  public static GetLastScanDate(): Date {
    return store.getters["beatmap/lastScan"];
  }

  public static GenerateBeatmapHashMap() {
    store.commit("beatmap/generateBeatmapHashMap");
  }

  public static UpdateAllMaps(beatmaps: BeatmapLocal[]) {
    store.commit("beatmap/SET_LAST_SCAN", new Date());
    store.commit("beatmap/SET_BEATMAPS", beatmaps);
    // SET_BEATMAPS を呼んだあとは SET_BEATMAP_HASH_MAP も必要 (beatlist 再起動すれば不整合はなくなるはずではあるが)
    store.commit("beatmap/SET_BEATMAP_HASH_MAP", new Map());
    store.commit("beatmap/generateBeatmapHashMap");
  }

  public static ClearCache() {
    store.commit("beatmap/SET_LAST_SCAN", undefined);
    store.commit("beatmap/SET_BEATMAPS", []);
    // SET_BEATMAPS を呼んだあとは SET_BEATMAP_HASH_MAP も必要 (beatlist 再起動すれば不整合はなくなるはずではあるが)
    store.commit("beatmap/SET_BEATMAP_HASH_MAP", new Map());
  }

  public static AddBeatmap(beatmap: BeatmapLocal) {
    store.commit("beatmap/addBeatmap", { beatmap });
  }

  public static AddBeatmaps(beatmaps: BeatmapLocal[]) {
    store.commit("beatmap/addBeatmaps", { beatmaps });
  }

  public static RemoveBeatmap(beatmap: BeatmapLocal) {
    store.commit("beatmap/removeBeatmap", { beatmap });
  }

  // public static RemoveBeatmapByPath(path: string) {
  //   store.commit("beatmap/removeBeatmapByPath", { path });
  // }

  public static RemoveBeatmapByPaths(paths: string[]) {
    store.commit("beatmap/removeBeatmapByPaths", { paths });
  }

  public static UpdateDownloadDate(downloadDateMap: Map<string, string>) {
    // key は toLowerCase() されている必要がある。
    store.commit("beatmap/updateDownloadDate", { downloadDateMap });
  }

  public static GetPlaylists(beatmap: BeatmapLocal): PlaylistLocal[] {
    return PlaylistLibrary.GetAllValidPlaylists().filter((playlist) =>
      playlist.maps.find(
        (map) =>
          map.hash !== undefined &&
          map.hash.toUpperCase() === beatmap.hash?.toUpperCase()
      )
    );
  }
}
