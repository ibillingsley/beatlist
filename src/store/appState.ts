import { make } from "vuex-pathify";

export interface AppStateStoreState {
  subNav: Object[];
  lockPlaylistModification: boolean;
  beatsaverRateLimit: undefined | Date;
  // downloadIsPending: boolean;
}

const state = {
  subNav: [],
  lockPlaylistModification: false,
  beatsaverRateLimit: undefined,
  // downloadIsPending: false,
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
