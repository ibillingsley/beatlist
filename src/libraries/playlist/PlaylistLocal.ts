import { PlaylistLoadState } from "@/libraries/playlist/loader/PlaylistLoadState";
import PlaylistFormatType from "@/libraries/playlist/PlaylistFormatType";
import { BeatsaverKey } from "@/libraries/beatmap/repo/BeatsaverKeyType";

export const PLAYLIST_FOLDER_ID_ROOT = "root";

export interface PlaylistFolder {
  id: string;
  name: string;
  path: string;
  modified: Date | undefined;
  children: PlaylistFolder[];
  allChildren?: Map<string, PlaylistFolder>; // id = root のみ保持、root は含まない
}

export interface PlaylistBase {
  title: string;
  author: string;
  description: string | null;
  syncURL?: string;
  customData?: { [key: string]: any };
  cover: Buffer | null;
  coverImageType?: string; // png か jpeg
  modified: Date | undefined;
  maps: PlaylistMap[];
}

export interface PlaylistRawMap {
  hash: string | undefined;
  key: string | undefined;
  levelid?: string;
  songName?: string;
  difficulties: { [key: string]: any }[] | undefined;
  // ここの customData は beatlist では使い道がないので省略。
}

export interface PlaylistRaw {
  title: string;
  author: string;
  description: string | null;
  // BeastSaber の playlist では customData の中ではなく直下に定義されている。
  syncURL?: string;
  customData?: { [key: string]: any };
  cover: Buffer | null;
  coverImageType?: string; // png か jpeg
  modified: Date;
  songs?: PlaylistRawMap[];
  maps?: PlaylistMap[];
  path: string | undefined;
  format: PlaylistFormatType;
}

export interface PlaylistLocal extends PlaylistBase {
  path: string | undefined;
  hash: string | undefined;
  maps: PlaylistLocalMap[];
  loadState: PlaylistLoadState;
  format: PlaylistFormatType;
}

export interface PlaylistMap {
  hash: string | undefined;
  difficulties: { [key: string]: any }[] | undefined;
  originalData: PlaylistRawMap | undefined;
  dateAdded: Date;
}

export interface PlaylistValidMap extends PlaylistMap {
  hash: string;
}

export interface PlaylistLocalMap extends PlaylistMap {
  error: PlaylistMapImportError | undefined;
  errorInfo: string | undefined;
  attemptedSource: BeatsaverKey;
}

export enum PlaylistMapImportError {
  BeatmapTypeLevelIdNotSupported = 0,
  BeatsaverInexistent = 1,
  BeatsaverRequestError = 2,
  Unknown = 3,
}

export function isPlaylistLocal(
  playlist: PlaylistRaw | PlaylistLocal
): playlist is PlaylistLocal {
  return (
    "path" in playlist &&
    "hash" in playlist &&
    "format" in playlist &&
    "loadState" in playlist
  );
}
