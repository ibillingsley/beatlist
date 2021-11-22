import store from "@/plugins/store";
import { PlaylistLocal } from "@/libraries/playlist/PlaylistLocal";
import PlaylistSortColumnType, {
  getSortTypeDisplayNameFor,
} from "@/libraries/playlist/PlaylistSortColumnType";
import PlaylistSortOrderType, {
  getSortOrderDisplayNameFor,
} from "@/libraries/playlist/PlaylistSortOrderType";
import PlaylistIndentType, {
  getIndentTypeDisplayNameFor,
} from "./loader/serializer/PlaylistIndentType";

export default class PlaylistLibrary {
  public static GetAllPlaylists(): PlaylistLocal[] {
    return store.getters["playlist/playlists"] ?? [];
  }

  public static GetAllValidPlaylists(): PlaylistLocal[] {
    return this.GetAllPlaylists().filter(
      (playlist: PlaylistLocal) => playlist.loadState.valid
    );
  }

  public static GetAllInvalidPlaylists(): PlaylistLocal[] {
    return this.GetAllPlaylists().filter(
      (playlist: PlaylistLocal) => !playlist.loadState.valid
    );
  }

  public static GetLastScan(): Date {
    return store.getters["playlist/lastScan"];
  }

  public static GetByHash(hash: string): PlaylistLocal | undefined {
    return this.GetAllPlaylists().find(
      (playlist: PlaylistLocal) => playlist.hash === hash
    );
  }

  public static GetByPath(path: string): PlaylistLocal | undefined {
    return this.GetAllPlaylists().find(
      (playlist: PlaylistLocal) => playlist.path === path
    );
  }

  public static UpdateAllPlaylist(playlists: PlaylistLocal[]) {
    playlists = playlists.map((playlist) => {
      const copy = { ...playlist };
      copy.cover = null;
      return copy;
    });
    store.commit("playlist/SET_LAST_SCAN", new Date());
    store.commit("playlist/SET_PLAYLISTS", playlists);
  }

  public static ClearCache() {
    store.commit("playlist/SET_LAST_SCAN", undefined);
    store.commit("playlist/SET_PLAYLISTS", []);
  }

  public static AddPlaylist(playlist: PlaylistLocal) {
    store.commit("playlist/addPlaylist", { playlist });
  }

  public static RemovePlaylist(playlist: PlaylistLocal) {
    store.commit("playlist/removePlaylist", { playlist });
  }

  public static ReplacePlaylist(from: PlaylistLocal, to: PlaylistLocal) {
    store.commit("playlist/replacePlaylist", { from, to });
  }

  public static GetSortColumnList() {
    return Object.values(PlaylistSortColumnType).map((value) => {
      return {
        text: getSortTypeDisplayNameFor(value),
        value,
      };
    });
  }

  public static GetSortOrderList() {
    return Object.values(PlaylistSortOrderType).map((value) => {
      return {
        text: getSortOrderDisplayNameFor(value),
        value,
      };
    });
  }

  public static GetIndentTypeList() {
    return Object.values(PlaylistIndentType).map((value) => {
      return {
        text: getIndentTypeDisplayNameFor(value),
        value,
      };
    });
  }

  public static SortPlaylists(
    playlists: PlaylistLocal[],
    sortColumn: PlaylistSortColumnType,
    sortOrder: PlaylistSortOrderType
  ) {
    const workPlaylists = [...playlists];
    let sort = false;
    let targetColumn: keyof PlaylistLocal;

    const retVal = sortOrder === PlaylistSortOrderType.Asc ? 1 : -1;
    if (sortColumn === PlaylistSortColumnType.Title) {
      targetColumn = "title";
      sort = true;
    } else if (sortColumn === PlaylistSortColumnType.Author) {
      targetColumn = "author";
      sort = true;
    } else if (sortColumn === PlaylistSortColumnType.DateModified) {
      workPlaylists.sort((a: PlaylistLocal, b: PlaylistLocal) => {
        const aValue = a.modified?.getTime() ?? 0;
        const bValue = b.modified?.getTime() ?? 0;
        if (aValue > bValue) {
          return retVal;
        }
        if (aValue < bValue) {
          return -retVal;
        }
        return 0;
      });
    }

    if (sort) {
      workPlaylists.sort((a: PlaylistLocal, b: PlaylistLocal) => {
        const aValue = a[targetColumn] ?? "";
        const bValue = b[targetColumn] ?? "";
        if (aValue > bValue) {
          return retVal;
        }
        if (aValue < bValue) {
          return -retVal;
        }
        return 0;
      });
    }
    return workPlaylists;
  }
}
