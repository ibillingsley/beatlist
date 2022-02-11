import { make } from "vuex-pathify";

export interface AppStateStoreState {
  subNav: Object[];
  lockPlaylistModification: boolean;
  beatsaverRateLimit: undefined | Date;
  // downloadIsPending: boolean;
  selectedPlaylistFolderInDialog: {
    name: string;
    path: string | undefined;
  };
}

const state = {
  subNav: [],
  lockPlaylistModification: false,
  beatsaverRateLimit: undefined,
  // downloadIsPending: false,
  selectedPlaylistFolderInDialog: {
    name: "",
    path: undefined,
  },
};

const getters = {
  ...make.getters(state),
};

const mutations = {
  ...make.mutations(state),
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
};
