import store from "@/plugins/store";
import PlaylistSortColumnType from "@/libraries/playlist/PlaylistSortColumnType";
import PlaylistSortOrderType from "@/libraries/playlist/PlaylistSortOrderType";
import ScannerService from "@/libraries/scanner/ScannerService";
import PlaylistIndentType from "@/libraries/playlist/loader/serializer/PlaylistIndentType";

function ClearPlaylistCache() {
  store.commit("playlist/SET_PLAYLISTS", []);
  ScannerService.requestDialogToBeOpened();
}

function SetDefaultSortSettingsOfPlaylists() {
  store.commit("settings/SET_MY_PLAYLISTS", {
    sortColumn: PlaylistSortColumnType.Title,
    sortOrder: PlaylistSortOrderType.Asc,
  });
  store.commit("settings/SET_ADD_REMOVE_FROM_PLAYLISTS_DIALOG", {
    sortColumn: PlaylistSortColumnType.Title,
    sortOrder: PlaylistSortOrderType.Asc,
  });
}

function SetPlaylistIndentType() {
  store.commit("settings/SET_PLAYLIST_INDENT_TYPE", PlaylistIndentType.Space2);
}

export default () => {
  SetDefaultSortSettingsOfPlaylists();
  ClearPlaylistCache();
  SetPlaylistIndentType();
};
