import fs from "fs";
import { make } from "vuex-pathify";
import { BeatmapLocal } from "@/libraries/beatmap/BeatmapLocal";
import {
  BeatsaverItemInvalid,
  BeatsaverItemValid,
} from "@/libraries/beatmap/repo/BeatsaverItem";
import {
  BeatsaverKey,
  BeatsaverKeyType,
  toStrKey,
} from "@/libraries/beatmap/repo/BeatsaverKeyType";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";

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
  removeBeatmapByPath(context: BeatmapStoreState, payload: { path: string }) {
    context.beatmaps = context.beatmaps.filter(
      (value: BeatmapLocal) => value.folderPath.toLowerCase() !== payload.path
    );
  },
  loadBeatmaps(context: BeatmapStoreState, payload: { path: string }) {
    const beatmaps = JSON.parse(
      fs.readFileSync(payload.path, { encoding: "utf8" })
    ) as BeatsaverBeatmap[];
    for (const beatmap of beatmaps) {
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
