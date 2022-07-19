import { make } from "vuex-pathify";
import { BeatmapLocal } from "@/libraries/beatmap/BeatmapLocal";
import {
  BeatsaverItem,
  BeatsaverItemInvalid,
  BeatsaverItemValid,
  BeatsaverItemLoadError,
} from "@/libraries/beatmap/repo/BeatsaverItem";
import {
  BeatsaverKey,
  toStrKey,
} from "@/libraries/beatmap/repo/BeatsaverKeyType";
import BeatmapHashComputer from "@/libraries/beatmap/BeatmapHashComputer";

// メソッド定義がなくても make.mutations() によって作成される処理(beatmap/SET_BEATMAPS とか)もあるので、
// データの整合性には注意が必要。
export interface BeatmapStoreState {
  lastScan: Date;
  beatmaps: BeatmapLocal[];
  beatmapHashSet: Set<string>; // hash のみ保持
  beatsaverCached: Map<string, BeatsaverItemValid>;
  beatsaverFailCached: Map<string, BeatsaverItemInvalid>;
  beatsaverKeyToHashIndex: Map<string, string>;
  beatsaverCacheUpdated: Date;
}

const state = {
  lastScan: undefined,
  beatmaps: [],
  beatmapHashSet: new Set<string>(),
  beatsaverCached: new Map<string, BeatsaverItemInvalid>(),
  beatsaverFailCached: new Map<string, BeatsaverItemInvalid>(),
  beatsaverKeyToHashIndex: new Map<string, string>(),
  beatsaverCacheUpdated: new Date(), // persistent 対象外
};

const getters = {
  ...make.getters(state),
};

const mutations = {
  ...make.mutations(state),
  addBeatmap(context: BeatmapStoreState, payload: { beatmap: BeatmapLocal }) {
    context.beatmaps.push(payload.beatmap);
    if (payload.beatmap.hash != null) {
      // null になるのは invalid な map だけ
      context.beatmapHashSet.add(payload.beatmap.hash.toUpperCase());
    }
  },
  addBeatmaps(
    context: BeatmapStoreState,
    payload: { beatmaps: BeatmapLocal[] }
  ) {
    for (const beatmap of payload.beatmaps) {
      context.beatmaps.push(beatmap);
      if (beatmap.hash != null) {
        // null になるのは invalid な map だけ
        context.beatmapHashSet.add(beatmap.hash.toUpperCase());
      }
    }
  },
  removeBeatmap(
    context: BeatmapStoreState,
    payload: { beatmap: BeatmapLocal }
  ) {
    context.beatmaps = context.beatmaps.filter(
      (value: BeatmapLocal) => value.hash !== payload.beatmap.hash // BeatmapLocal どうしのhash比較
    );
    const hashset = new Set<string>();
    context.beatmaps.forEach((value) => {
      if (value.hash != null) {
        hashset.add(value.hash.toUpperCase());
      }
    });
    context.beatmapHashSet = hashset;
  },
  // removeBeatmapByPath(context: BeatmapStoreState, payload: { path: string }) {
  //   context.beatmaps = context.beatmaps.filter(
  //     (value: BeatmapLocal) => value.folderPath.toLowerCase() !== payload.path
  //   );
  // },
  // 現状、BeatmapScanner からしか呼ばれない。※削除ボタンは trash() を直接呼び出している。
  removeBeatmapByPaths(
    context: BeatmapStoreState,
    payload: { paths: string[] }
  ) {
    const pathSet = new Set<string>(payload.paths);
    context.beatmaps = context.beatmaps.filter(
      (value: BeatmapLocal) => !pathSet.has(value.folderPath.toLowerCase())
    );
    const hashset = new Set<string>();
    context.beatmaps.forEach((value) => {
      if (value.hash != null) {
        hashset.add(value.hash.toUpperCase());
      }
    });
    context.beatmapHashSet = hashset;
  },
  generateBeatmapHashSet(context: BeatmapStoreState) {
    const hashset = new Set<string>();
    context.beatmaps.forEach((value) => {
      if (value.hash != null) {
        hashset.add(value.hash.toUpperCase());
      }
    });
    context.beatmapHashSet = hashset;
  },
  updateDownloadDate(
    context: BeatmapStoreState,
    payload: { downloadDateMap: Map<string, string> }
  ) {
    const { downloadDateMap } = payload;
    console.log(`downloadDateMap: ${downloadDateMap.size}件`);
    context.beatmaps.forEach((value) => {
      const key = value.folderPath.toLowerCase();
      if (downloadDateMap.has(key)) {
        const newDownloaded = downloadDateMap.get(key);
        if (newDownloaded != null && value.downloaded !== newDownloaded) {
          console.log(
            `downloaded changed: ${value.downloaded} => ${newDownloaded}`
          );
          value.downloaded = newDownloaded;
        }
      }
    });
  },
  setBeatsaverCached(
    context: BeatmapStoreState,
    payload: { hash: string; item: BeatsaverItemValid }
  ) {
    context.beatsaverCached.set(payload.hash.toUpperCase(), payload.item);
    context.beatsaverKeyToHashIndex.set(
      payload.item.beatmap.key.toUpperCase(),
      payload.item.beatmap.hash.toUpperCase()
    );
    context.beatsaverCacheUpdated = new Date();
  },
  addAllBeatsaverCached(
    context: BeatmapStoreState,
    payload: {
      items: {
        key: BeatsaverKey;
        item: BeatsaverItem;
      }[];
    }
  ) {
    for (const item of payload.items) {
      if (item.item.beatmap) {
        // 値あり
        context.beatsaverCached.set(
          item.item.beatmap.hash.toUpperCase(),
          item.item
        );
        context.beatsaverKeyToHashIndex.set(
          item.item.beatmap.key.toUpperCase(),
          item.item.beatmap.hash.toUpperCase()
        );
      } else {
        // 値なし
        context.beatsaverFailCached.set(toStrKey(item.key), item.item);
      }
    }
    if (payload.items.length > 0) {
      context.beatsaverCacheUpdated = new Date();
    }
  },
  addBeatsaverCachedInvalid(
    context: BeatmapStoreState,
    payload: { key: BeatsaverKey; item: BeatsaverItemInvalid }
  ) {
    context.beatsaverFailCached.set(toStrKey(payload.key), payload.item);
  },
  removeBeatsaverCachedInvalid(
    context: BeatmapStoreState,
    payload: { key: BeatsaverKey | BeatsaverKey[] }
  ) {
    let keys: BeatsaverKey[];
    if (Array.isArray(payload.key)) {
      keys = payload.key;
    } else {
      keys = [payload.key];
    }
    for (const key of keys) {
      context.beatsaverFailCached.delete(toStrKey(key));
    }
  },
  removeBeatsaverCachedTemporaryInvalid(context: BeatmapStoreState) {
    // 50xエラーや429エラーなど一時的なエラーにより Invalid となったキャッシュを削除
    // beatsaverKeyToHashIndex には invaild なデータは含まれない。
    const keys: string[] = [];
    for (const mapEntry of context.beatsaverFailCached) {
      if (
        mapEntry[1].loadState.errorType !==
        BeatsaverItemLoadError.BeatmapNotOnBeatsaver
      ) {
        // 404 以外は削除
        keys.push(mapEntry[0]);
      }
    }
    for (const key of keys) {
      context.beatsaverFailCached.delete(key);
    }
  },
  removeBeatsaverCachedValid(context: BeatmapStoreState) {
    // キャッシュの構造変更などにより破棄が必要になった場合に呼び出す。
    const keys: string[] = [];
    for (const mapEntry of context.beatsaverCached) {
      if (mapEntry[1].loadState.valid) {
        // 有効なキャッシュを破棄対象に追加
        keys.push(mapEntry[0]);
      }
    }
    // 破棄
    for (const key of keys) {
      context.beatsaverCached.delete(key);
    }
    // beatsaverKeyToHashIndex 再作成
    context.beatsaverKeyToHashIndex = new Map<string, string>();
    for (const mapEntry of context.beatsaverCached) {
      if (mapEntry[1].loadState.valid) {
        context.beatsaverKeyToHashIndex.set(
          mapEntry[1].beatmap.key.toUpperCase(),
          mapEntry[0].toUpperCase()
        );
      }
    }
  },
  setFolderNameHashToAllBeatmaps(context: BeatmapStoreState) {
    // folderNameHash を計算してセット (1.3.7 以前から 1.3.8 以降へのアップグレード用)
    context.beatmaps.forEach((value) => {
      if (value.folderNameHash == null) {
        value.folderNameHash = BeatmapHashComputer.getFolderNameHash(
          value.folderPath
        );
      }
    });
  },
  clearBeatsaverCache(context: BeatmapStoreState) {
    context.beatsaverCached = new Map<string, BeatsaverItemValid>();
    context.beatsaverFailCached = new Map<string, BeatsaverItemInvalid>();
    context.beatsaverKeyToHashIndex = new Map<string, string>();
    context.beatsaverCacheUpdated = new Date();
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
};
