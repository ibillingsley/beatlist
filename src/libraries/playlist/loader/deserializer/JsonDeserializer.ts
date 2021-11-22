/* eslint-disable no-continue */
import fs from "fs-extra";
import PlaylistDeserializer from "@/libraries/playlist/loader/deserializer/PlaylistDeserializer";
import {
  // PlaylistBase,
  PlaylistLocalMap,
  PlaylistMapImportError,
  PlaylistRaw,
  PlaylistRawMap,
} from "@/libraries/playlist/PlaylistLocal";
import Base64SrcLoader from "@/libraries/os/utils/Base64SrcLoader";
import Progress from "@/libraries/common/Progress";
import Utilities from "@/libraries/helper/Utilities";
import PlaylistDeserializeBeatsaverBeatmap from "@/libraries/playlist/loader/deserializer/helper/PlaylistDeserializeBeatsaverBeatmap";
import {
  BeatsaverItem,
  BeatsaverItemLoadError,
  BeatsaverItemValid,
  BeatsaverItemInvalidForPlaylist,
} from "@/libraries/beatmap/repo/BeatsaverItem";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import {
  BeatsaverKeyType,
  BeatsaverKey,
} from "@/libraries/beatmap/repo/BeatsaverKeyType";
import Logger from "@/libraries/helper/Logger";
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

  public static async readJson(filepath: string) {
    const rawJson = await fs.readFile(filepath);

    let jsonText = rawJson.toString();
    if (jsonText.length > 0 && jsonText.charCodeAt(0) === 0xfeff) {
      // BOM付きの場合は先頭のBOMを除外
      jsonText = jsonText.substring(1);
    }
    const json = JSON.parse(jsonText);

    return json;
  }

  public async deserializeAsRaw(): Promise<PlaylistRaw> {
    if (!(await fs.pathExists(this.filepath))) {
      throw FILE_NOT_FOUND;
    }

    try {
      const json = await JsonDeserializer.readJson(this.filepath);
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
      const stat = await fs.stat(this.filepath);
      const result = {
        title: json.playlistTitle,
        author: json.playlistAuthor ?? "",
        description: json.playlistDescription ?? "",
        cover,
        coverImageType,
        modified: stat.mtime,
        songs: json.songs ?? [],
        path: this.filepath,
        format: PlaylistFormatType.Json,
      } as PlaylistRaw;

      if (json.syncURL != null) {
        result.syncURL = json.syncURL;
      }
      if (json.customData != null) {
        result.customData = json.customData;
      }
      return result;
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
    songs: PlaylistRawMap[],
    progress: Progress
  ): Promise<PlaylistLocalMap[]> {
    const resultList: PlaylistLocalMap[] = new Array(songs.length);
    progress.setTotal(songs.length);

    const cacheItems: {
      key: BeatsaverKey;
      item: BeatsaverItem;
    }[] = [];

    let busyCount = 0;
    // 開始時点での有効な localMap
    const currentAllValidMap = BeatmapLibrary.GetAllValidMap();
    // 開始時点での有効な beatsaver cache
    const currentAllValidBeatsaverItems = BeatsaverCachedLibrary.GetAllValid();

    for (let idx = 0; idx < songs.length; idx += 1) {
      const song = songs[idx];

      let mapHash = song.hash?.toUpperCase();

      let localMap:
        | BeatsaverItemValid
        | BeatsaverItemInvalidForPlaylist
        | undefined;
      if (mapHash == null) {
        if (song.key == null) {
          Logger.debug(
            `Neither key or hash specified: ${JSON.stringify(song)}`,
            "JsonDeserializer"
          );
          progress.plusOne();
          continue;
        }
        // ------------------------------
        // key specified
        // ------------------------------
        mapHash = BeatsaverCachedLibrary.KeyToHash(song.key);
        if (mapHash == null) {
          busyCount = 0;
          // The data is not in the cache, so retrieve it from beatsaver.com.
          // eslint-disable-next-line no-await-in-loop
          localMap = await PlaylistDeserializeBeatsaverBeatmap.convertOne(
            song,
            cacheItems
          ); // return BeatsaverItemValid or BeatsaverItemInvalidForPlaylist or undefined
          if (localMap != null) {
            resultList[idx] = {
              dateAdded: new Date(),
              hash: localMap?.beatmap?.hash
                ? localMap?.beatmap?.hash
                : (localMap as any).originalHash,
              originalData: { ...song },
              attemptedSource: localMap.loadState.attemptedSource,
              ...this.getErrorFor(localMap),
            } as PlaylistLocalMap;
          } else {
            console.error(`Cannot get data: ${JSON.stringify(song)}`);
          }
          progress.plusOne();
          continue;
        }
        // else {} // hash specified
      }
      // ------------------------------
      // hash specified
      // ------------------------------
      const beatmap = currentAllValidMap.find(
        (value) => value.hash?.toUpperCase() === mapHash
      );
      if (beatmap != null) {
        // キャッシュにある場合はそれを配列に設定
        resultList[idx] = {
          dateAdded: new Date(),
          hash: beatmap.hash,
          originalData: { ...song },
          attemptedSource: {
            type: BeatsaverKeyType.Hash,
            value: song.hash,
          },
        } as PlaylistLocalMap;
        progress.plusOne();
      } else {
        // beatsaver のキャッシュ確認
        localMap = currentAllValidBeatsaverItems.get(mapHash); // return only BeatsaverItemValid
        if (localMap == null) {
          busyCount = 0; // await 呼ぶので busyCount をリセット
          // キャッシュにない場合は beatsaver.com に問い合わせ、その結果を配列に設定
          // ※beatsaver.com の制限に抵触しないように1件ずつ処理する
          // eslint-disable-next-line no-await-in-loop
          localMap = await PlaylistDeserializeBeatsaverBeatmap.convertOne(
            song,
            cacheItems
          ); // return BeatsaverItemValid or BeatsaverItemInvalidForPlaylist or undefined
        }
        if (localMap != null) {
          resultList[idx] = {
            dateAdded: new Date(),
            hash: localMap?.beatmap?.hash
              ? localMap?.beatmap?.hash
              : (localMap as any).originalHash,
            originalData: { ...song },
            attemptedSource: localMap.loadState.attemptedSource,
            ...this.getErrorFor(localMap),
          } as PlaylistLocalMap;
        } else {
          console.error(`Cannot get data: ${mapHash}`);
        }

        progress.plusOne();
      }
      busyCount += 1;
      if (busyCount > 100) {
        // busy loop が連続した時に Renderer process に描画処理させるためのダミーウェイト
        // ※本当は deserialize 処理等 main process で処理させたほうがいいのだが vuex store が絡むと難しい。
        // eslint-disable-next-line no-await-in-loop
        await Utilities.sleep(100);
        busyCount = 0;
      }
    }
    if (cacheItems.length > 0) {
      BeatsaverCachedLibrary.AddAll(cacheItems);
    }

    // 取得できなかったデータは除外
    return resultList.filter((item) => item != null);
    /*
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
    */

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
