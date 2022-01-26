import { make } from "vuex-pathify";
import { BeatmapLocal } from "@/libraries/beatmap/BeatmapLocal";
import {
  BeatsaverItem,
  BeatsaverItemInvalid,
  BeatsaverItemValid,
} from "@/libraries/beatmap/repo/BeatsaverItem";
import {
  BeatsaverKey,
  toStrKey,
} from "@/libraries/beatmap/repo/BeatsaverKeyType";

export interface BeatmapStoreState {
  lastScan: Date;
  beatmaps: BeatmapLocal[];
  beatsaverCached: Map<string, BeatsaverItemValid>;
  beatsaverFailCached: Map<string, BeatsaverItemInvalid>;
  beatsaverKeyToHashIndex: Map<string, string>;
  beatsaverCacheUpdated: Date;
}

const state = {
  lastScan: undefined,
  beatmaps: [],
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
  },
  addBeatmaps(
    context: BeatmapStoreState,
    payload: { beatmaps: BeatmapLocal[] }
  ) {
    for (const beatmap of payload.beatmaps) {
      context.beatmaps.push(beatmap);
    }
  },
  removeBeatmap(
    context: BeatmapStoreState,
    payload: { beatmap: BeatmapLocal }
  ) {
    context.beatmaps = context.beatmaps.filter(
      (value: BeatmapLocal) => value.hash !== payload.beatmap.hash // BeatmapLocal どうしのhash比較
    );
  },
  // removeBeatmapByPath(context: BeatmapStoreState, payload: { path: string }) {
  //   context.beatmaps = context.beatmaps.filter(
  //     (value: BeatmapLocal) => value.folderPath.toLowerCase() !== payload.path
  //   );
  // },
  removeBeatmapByPaths(
    context: BeatmapStoreState,
    payload: { paths: string[] }
  ) {
    const pathSet = new Set<string>(payload.paths);
    context.beatmaps = context.beatmaps.filter(
      (value: BeatmapLocal) => !pathSet.has(value.folderPath.toLowerCase())
    );
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
