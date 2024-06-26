import { make } from "vuex-pathify";
import {
  PlaylistLocal,
  PlaylistFolder,
} from "@/libraries/playlist/PlaylistLocal";

export interface PlaylistStoreState {
  lastScan: Date;
  playlists: PlaylistLocal[];
  playlistFolders: PlaylistFolder;
}

const state = {
  lastScan: undefined,
  playlists: [],
  playlistFolders: undefined,
};

const getters = {
  ...make.getters(state),
};

function emptyCoverCopy(playlist: PlaylistLocal): PlaylistLocal {
  const copy = { ...playlist };
  copy.cover = null;
  return copy;
}

const mutations = {
  ...make.mutations(state),
  SET_PLAYLISTS(context: PlaylistStoreState, playlists: PlaylistLocal[]) {
    context.playlists = (playlists ?? []).map((p) => emptyCoverCopy(p));
  },
  SET_PLAYLIST_FOLDERS(context: PlaylistStoreState, folders: PlaylistFolder) {
    context.playlistFolders = { ...folders };
  },
  addPlaylist(
    context: PlaylistStoreState,
    payload: { playlist: PlaylistLocal }
  ) {
    context.playlists.push(emptyCoverCopy(payload.playlist));
  },
  removePlaylist(
    context: PlaylistStoreState,
    payload: { playlist: PlaylistLocal }
  ) {
    context.playlists = context.playlists.filter(
      (value: PlaylistLocal) => value.hash !== payload.playlist.hash
    );
  },
  replacePlaylist(
    context: PlaylistStoreState,
    payload: { from: PlaylistLocal; to: PlaylistLocal }
  ) {
    const index = context.playlists.findIndex(
      (item) => item.path === payload.from.path
    );
    context.playlists[index] = emptyCoverCopy(payload.to);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
};
