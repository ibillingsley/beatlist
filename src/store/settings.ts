import { make } from "vuex-pathify";
import PlaylistFormatType from "@/libraries/playlist/PlaylistFormatType";
import PlaylistIndentType from "@/libraries/playlist/loader/serializer/PlaylistIndentType";
import PlaylistSortColumnType from "@/libraries/playlist/PlaylistSortColumnType";
import PlaylistSortOrderType from "@/libraries/playlist/PlaylistSortOrderType";
import { ColorblindMode } from "@/libraries/app/Colorblind";
import BeatsaverServerUrl from "@/libraries/net/beatsaver/BeatsaverServerUrl";

export interface BeatmapTableStoreState {
  shownColumn: string[];
  itemsPerPage: number;
}

export interface SettingsStoreState {
  appVersion: string | undefined;
  installationPath: string;
  installationPathValid: boolean;
  darkTheme: boolean;
  enableDiscordRichPresence: boolean;
  defaultExportFormat: PlaylistFormatType;
  playlistIndentType: PlaylistIndentType;
  disablePlaylistFolderManagement: boolean;
  beatmapsTable: {
    localBeatmaps: BeatmapTableStoreState;
    beatsaverBeatmaps: BeatmapTableStoreState;
    playlistContent: BeatmapTableStoreState;
    playlistBrowser: BeatmapTableStoreState;
    beastsaberPlaylistContent: BeatmapTableStoreState;
  };
  oneClick: {
    enabled: boolean;
    downloadOnClick: boolean;
  };
  accessibility: {
    showLetterInDifficulty: boolean;
    colorBlindMode: ColorblindMode;
  };
  beatsaverServerUrl: BeatsaverServerUrl;
  arcviewerPath: string;
  addRemoveFromPlaylistsDialog: {
    sortColumn: PlaylistSortColumnType;
    sortOrder: PlaylistSortOrderType;
  };
  myPlaylists: {
    sortColumn: PlaylistSortColumnType;
    sortOrder: PlaylistSortOrderType;
  };
}

const defaultTableSettings = {
  shownColumn: ["cover", "name", "mapper", "difficulties"],
  itemsPerPage: 10,
};

const state = {
  appVersion: undefined,
  installationPath: "",
  installationPathValid: false,
  darkTheme: true,
  enableDiscordRichPresence: false,
  defaultExportFormat: PlaylistFormatType.Json,
  playlistIndentType: PlaylistIndentType.Space2,
  disablePlaylistFolderManagement: false,
  beatmapsTable: {
    localBeatmaps: { ...defaultTableSettings },
    beatsaverBeatmaps: { ...defaultTableSettings },
    playlistContent: { ...defaultTableSettings },
    playlistBrowser: { ...defaultTableSettings },
    beastsaberPlaylistContent: { ...defaultTableSettings },
  },
  oneClick: {
    enabled: false,
    downloadOnClick: false,
  },
  accessibility: {
    showLetterInDifficulty: false,
    colorBlindMode: ColorblindMode.None,
  },
  beatsaverServerUrl: BeatsaverServerUrl.Beatsaver,
  arcviewerPath: "",
  addRemoveFromPlaylistsDialog: {
    sortColumn: PlaylistSortColumnType.Title,
    sortOrder: PlaylistSortOrderType.Asc,
  },
  myPlaylists: {
    sortColumn: PlaylistSortColumnType.Title,
    sortOrder: PlaylistSortOrderType.Asc,
  },
};

const mutations = {
  ...make.mutations(state),
  removeShownColumn(
    context: SettingsStoreState,
    payload: { columns: string[] }
  ) {
    const removeColumns = payload.columns;
    const beatmapTableStoreStates = [
      context.beatmapsTable.localBeatmaps,
      context.beatmapsTable.beatsaverBeatmaps,
      context.beatmapsTable.playlistContent,
      context.beatmapsTable.playlistBrowser,
      context.beatmapsTable.beastsaberPlaylistContent,
    ];
    for (const beatmapTableStoreState of beatmapTableStoreStates) {
      console.log(beatmapTableStoreState.shownColumn);
      beatmapTableStoreState.shownColumn =
        beatmapTableStoreState.shownColumn.filter(
          (column) => !removeColumns.includes(column)
        );
      console.log(beatmapTableStoreState.shownColumn);
    }
  },
};

const getters = {
  ...make.getters(state),
  configValid(currentState: SettingsStoreState) {
    return currentState.installationPathValid;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
};
