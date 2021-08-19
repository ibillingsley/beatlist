import fs from "fs";
import { make } from "vuex-pathify";
import { BeatmapLocal } from "@/libraries/beatmap/BeatmapLocal";
import {
  BeatsaverItem,
  BeatsaverItemInvalid,
  BeatsaverItemValid,
} from "@/libraries/beatmap/repo/BeatsaverItem";
import {
  BeatsaverKey,
  BeatsaverKeyType,
  toStrKey,
} from "@/libraries/beatmap/repo/BeatsaverKeyType";
import {
  BeatsaverNewBeatmap,
  convertNewMapToMap,
} from "@/libraries/net/beatsaver/BeatsaverBeatmap";

export interface BeatmapStoreState {
  lastScan: Date;
  beatmaps: BeatmapLocal[];
  beatsaverCached: Map<string, BeatsaverItemValid>;
  beatsaverFailCached: Map<string, BeatsaverItemInvalid>;
  beatsaverKeyToHashIndex: Map<string, string>;
}

const state = {
  lastScan: undefined,
  beatmaps: [],
  beatsaverCached: new Map<string, BeatsaverItemInvalid>(),
  beatsaverFailCached: new Map<string, BeatsaverItemInvalid>(),
  beatsaverKeyToHashIndex: new Map<string, string>(),
};

const getters = {
  ...make.getters(state),
};

const mutations = {
  ...make.mutations(state),
  addBeatmap(context: BeatmapStoreState, payload: { beatmap: BeatmapLocal }) {
    context.beatmaps.push(payload.beatmap);
  },
  removeBeatmap(
    context: BeatmapStoreState,
    payload: { beatmap: BeatmapLocal }
  ) {
    context.beatmaps = context.beatmaps.filter(
      (value: BeatmapLocal) => value.hash !== payload.beatmap.hash
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
  loadBeatmaps(context: BeatmapStoreState, payload: { path: string }) {
    const beatmaps = JSON.parse(
      fs.readFileSync(payload.path, { encoding: "utf8" })
    ) as BeatsaverNewBeatmap[];
    for (const newBeatmap of beatmaps) {
      const beatmap = convertNewMapToMap(newBeatmap);
      const hash = beatmap.hash.toUpperCase();
      if (beatmap.coverURL?.startsWith("/cdn/")) {
        beatmap.coverURL = `https://cdn.beatsaver.com/${hash.toLowerCase()}.jpg`;
      }
      const validMap = {
        beatmap,
        loadState: {
          valid: true,
          attemptedSource: {
            type: BeatsaverKeyType.Hash,
            value: hash,
          },
        },
      } as BeatsaverItemValid;
      context.beatsaverCached.set(hash, validMap);
      context.beatsaverKeyToHashIndex.set(beatmap.key.toUpperCase(), hash);
    }
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
  },
  addBeatsaverCachedInvalid(
    context: BeatmapStoreState,
    payload: { key: BeatsaverKey; item: BeatsaverItemInvalid }
  ) {
    context.beatsaverFailCached.set(toStrKey(payload.key), payload.item);
  },
  removeBeatsaverCachedInvalid(
    context: BeatmapStoreState,
    payload: { key: BeatsaverKey }
  ) {
    context.beatsaverFailCached.delete(toStrKey(payload.key));
  },
  clearBeatsaverCache(context: BeatmapStoreState) {
    context.beatsaverCached = new Map<string, BeatsaverItemValid>();
    context.beatsaverFailCached = new Map<string, BeatsaverItemInvalid>();
    context.beatsaverKeyToHashIndex = new Map<string, string>();
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
};
