import Vue from "vue";
import Vuex from "vuex";
import VuexPersistence from "vuex-persist";
import localForage from "localforage";
import pathify from "@/plugins/pathify";
import modules, { StoreState } from "@/store";

Vue.use(Vuex);

const vuexLocalCachedData = new VuexPersistence<StoreState>({
  key: "vuex-cached-data",
  storage: localForage,
  asyncStorage: true,
  strictMode: true,
  reducer: (state) => ({
    // beatmap: state.beatmap,
    beatmap: {
      lastScan: state.beatmap.lastScan,
      beatmaps: state.beatmap.beatmaps,
      beatsaverCached: state.beatmap.beatsaverCached,
      beatsaverFailCached: state.beatmap.beatsaverFailCached,
      beatsaverKeyToHashIndex: state.beatmap.beatsaverKeyToHashIndex,
      // beatsaverCacheUpdated は除外
    },
    // playlist: state.playlist,
    playlist: {
      lastScan: state.playlist.lastScan,
      playlists: state.playlist.playlists,
      // playlistFolders は除外
    },
  }),
});

const vuexLocalMain = new VuexPersistence<StoreState>({
  key: "vuex-main",
  storage: localForage,
  asyncStorage: true,
  strictMode: true,
  reducer: (state) => ({
    settings: state.settings,
    notification: state.notification,
    modal: state.modal,
  }),
});

const store = new Vuex.Store<StoreState>({
  plugins: [vuexLocalMain.plugin, vuexLocalCachedData.plugin, pathify.plugin],
  modules,
  mutations: {
    RESTORE_MUTATION: vuexLocalMain.RESTORE_MUTATION,
  },
  strict: true,
});

export default store as typeof store & { restored: Promise<void> };
