import fs from "fs-extra";
import PlaylistDeserializer from "@/libraries/playlist/loader/deserializer/PlaylistDeserializer";
import {
  // PlaylistBase,
  PlaylistLocalMap,
  PlaylistMapImportError,
  PlaylistRaw,
} from "@/libraries/playlist/PlaylistLocal";
import Base64SrcLoader from "@/libraries/os/utils/Base64SrcLoader";
import Progress from "@/libraries/common/Progress";
import PlaylistDeserializeBeatsaverBeatmap from "@/libraries/playlist/loader/deserializer/helper/PlaylistDeserializeBeatsaverBeatmap";
import {
  BeatsaverItem,
  BeatsaverItemLoadError,
} from "@/libraries/beatmap/repo/BeatsaverItem";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";
import { BeatsaverKeyType } from "@/libraries/beatmap/repo/BeatsaverKeyType";
import PlaylistFormatType from "../../PlaylistFormatType";

export const FILE_NOT_FOUND: Error = new Error("File not found");
export const INVALID_JSON: Error = new Error("Invalid JSON");

export default class JsonDeserializer extends PlaylistDeserializer {
  /*
  public async deserialize(progress?: Progress): Promise<PlaylistBase> {
    if (!(await fs.pathExists(this.filepath))) {
      throw FILE_NOT_FOUND;
    }

    const rawJson = await fs.readFile(this.filepath);

    try {
      const json = JSON.parse(rawJson.toString());
      JsonDeserializer.validateJson(json);

      return {
        title: json.playlistTitle,
        author: json.playlistAuthor ?? "",
        description: json.playlistDescription ?? "",
        cover: Buffer.from(
          Base64SrcLoader.GetRawSrc(json.image ?? ""),
          "base64"
        ),
        // convertToHash の中で beatsaver api を呼び出している
        maps: await JsonDeserializer.convertToHash(
          json.songs ?? [],
          progress ?? new Progress()
        ),
      } as PlaylistBase;
    } catch (e) {
      throw INVALID_JSON;
    }
  }
  */

  public async deserializeAsRaw(): Promise<PlaylistRaw> {
    if (!(await fs.pathExists(this.filepath))) {
      throw FILE_NOT_FOUND;
    }

    const rawJson = await fs.readFile(this.filepath);

    try {
      let jsonText = rawJson.toString();
      if (jsonText.length > 0 && jsonText.charCodeAt(0) === 0xfeff) {
        // BOM付きの場合は先頭のBOMを除外
        jsonText = jsonText.substring(1);
      }
      const json = JSON.parse(jsonText);
      JsonDeserializer.validateJson(json);

      const cover = Buffer.from(
        Base64SrcLoader.GetRawSrc(json.image ?? ""),
        "base64"
      );
      let coverImageType: string | undefined;
      if (json.image != null) {
        coverImageType = Base64SrcLoader.GetFileType(cover);
        if (coverImageType == null) {
          const match = json.image.match(/^data:image\/(.*);base64,/);
          if (match != null && match.length > 0) {
            // eslint-disable-next-line prefer-destructuring
            coverImageType = match[1];
          }
        }
      }
      return {
        title: json.playlistTitle,
        author: json.playlistAuthor ?? "",
        description: json.playlistDescription ?? "",
        cover,
        coverImageType,
        songs: json.songs ?? [],
        path: this.filepath,
        format: PlaylistFormatType.Json,
      } as PlaylistRaw;
    } catch (e) {
      throw INVALID_JSON;
    }
  }

  private static validateJson(json: any) {
    // check for required fields
    if (!json.playlistTitle) {
      throw new Error("missing required fields");
    }
  }

  public static async convertToHash(
    songs: { hash: string | undefined; key: string | undefined }[],
    progress: Progress
  ): Promise<PlaylistLocalMap[]> {
    const resultList: PlaylistLocalMap[] = [];

    // ダウンロード済の曲(CustomLevels 以下に存在する曲)はそれを返す
    // 未ダウンロードの曲は newSongs に格納
    const newSongs: {
      hash: string | undefined;
      key: string | undefined;
    }[] = [];
    for (const song of songs) {
      if (song.hash != null) {
        const beatmap = BeatmapLibrary.GetAllValidMap().find(
          (value) => value.hash?.toUpperCase() === song.hash?.toUpperCase()
        );
        if (beatmap == null) {
          newSongs.push(song);
        } else {
          resultList.push({
            dateAdded: new Date(),
            hash: beatmap.hash,
            attemptedSource: {
              type: BeatsaverKeyType.Hash,
              value: song.hash,
            },
          } as PlaylistLocalMap);
        }
      }
    }
    // 未ダウンロードの曲をキャッシュあるいは beatsaver.com から取得
    // ※本来 deserializer がやることじゃない
    const notLocalMaps = await PlaylistDeserializeBeatsaverBeatmap.convert(
      newSongs,
      progress
    );
    const newPlaylistLocalMaps = notLocalMaps
      .filter((item): item is BeatsaverItem => item !== undefined)
      .map(
        (item: BeatsaverItem) =>
          ({
            dateAdded: new Date(),
            hash: item?.beatmap?.hash
              ? item?.beatmap?.hash
              : (item as any).originalHash,
            attemptedSource: item.loadState.attemptedSource,
            ...this.getErrorFor(item),
          } as PlaylistLocalMap)
      );
    // 取得できたものをダウンロード済みの曲とマージして返却
    return resultList.concat(newPlaylistLocalMaps);

    // return (await PlaylistDeserializeBeatsaverBeatmap.convert(songs, progress))
    //   .filter((item): item is BeatsaverItem => item !== undefined)
    //   .map(
    //     (item: BeatsaverItem) =>
    //       ({
    //         dateAdded: new Date(),
    //         hash: item?.beatmap?.hash
    //           ? item?.beatmap?.hash
    //           : (item as any).originalHash,
    //         attemptedSource: item.loadState.attemptedSource,
    //         ...this.getErrorFor(item),
    //       } as PlaylistLocalMap)
    //   );
  }

  private static getErrorFor(
    item: BeatsaverItem
  ): { error?: PlaylistMapImportError; errorInfo?: string } {
    if (item.loadState.valid) {
      return { error: undefined, errorInfo: undefined };
    }

    switch (item.loadState.errorType) {
      case BeatsaverItemLoadError.BeatmapNotOnBeatsaver:
        return {
          error: PlaylistMapImportError.BeatsaverInexistent,
          errorInfo: "Beatmap not found on beatsaber",
        };
      case BeatsaverItemLoadError.BeatsaverServerNotAvailable:
        return {
          error: PlaylistMapImportError.BeatsaverRequestError,
          errorInfo: "Server not available",
        };
      case BeatsaverItemLoadError.InvalidDataReceivedFromBeatsaver:
        return {
          error: PlaylistMapImportError.BeatsaverRequestError,
          errorInfo: "Unexpected data received from beatsaber",
        };
      case BeatsaverItemLoadError.BeatsaverRateLimited:
        return {
          error: PlaylistMapImportError.BeatsaverRequestError,
          errorInfo: "Reached the rate limit",
        };

      case BeatsaverItemLoadError.RequestTimeout:
        return {
          error: PlaylistMapImportError.BeatsaverRequestError,
          errorInfo: "Request timeout",
        };

      case BeatsaverItemLoadError.Unknown:
      default:
        return { error: PlaylistMapImportError.Unknown, errorInfo: "Unknown" };
    }
  }
}
