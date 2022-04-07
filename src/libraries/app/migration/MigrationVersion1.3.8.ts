import store from "@/plugins/store";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import Logger from "@/libraries/helper/Logger";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";
import BeatSaber from "@/libraries/os/beatSaber/BeatSaber";
import PlaylistLibrary from "@/libraries/playlist/PlaylistLibrary";
import { PlaylistMapImportError } from "@/libraries/playlist/PlaylistLocal";

function RemoveTemporaryInvalidBeatmapFromInvalidCache() {
  Logger.debug(
    "start RemoveTemporaryInvalidBeatmapFromInvalidCache",
    "MigrationVersion1.3.8"
  );
  BeatsaverCachedLibrary.RemoveTemporaryInvalid();
  Logger.debug(
    "end   RemoveTemporaryInvalidBeatmapFromInvalidCache",
    "MigrationVersion1.3.8"
  );
}

function RemovePlaylistCacheContainsInvalidMap() {
  Logger.debug(
    "start RemovePlaylistCacheContainsInvalidMap",
    "MigrationVersion1.3.8"
  );
  // invalid な map を含む playlist のキャッシュを破棄する。
  // ※playlist 自体が不正なものはそもそも map の情報を検証できないので対象外。
  const invalidPlaylists = PlaylistLibrary.GetAllValidPlaylists().filter(
    (playlist) => {
      const hasInvalid = playlist.maps.some(
        (map) =>
          map.error === PlaylistMapImportError.BeatsaverRequestError ||
          map.error === PlaylistMapImportError.Unknown
      );
      return hasInvalid;
    }
  );
  for (const invalidPlaylist of invalidPlaylists) {
    console.log(`clear playlist cache: ${invalidPlaylist.path}`);
    PlaylistLibrary.RemovePlaylist(invalidPlaylist);
  }
  Logger.debug(
    "end   RemovePlaylistCacheContainsInvalidMap",
    "MigrationVersion1.3.8"
  );
}

function SetFolderNameHashToAllBeatmaps() {
  Logger.debug("start SetFolderNameHashToAllBeatmaps", "MigrationVersion1.3.8");
  store.commit("beatmap/setFolderNameHashToAllBeatmaps");
  Logger.debug("end   SetFolderNameHashToAllBeatmaps", "MigrationVersion1.3.8");
}

async function UpdateDownloadDate() {
  Logger.debug("start UpdateDownloadDate", "MigrationVersion1.3.8");
  const kept: string[] = [];
  BeatmapLibrary.GetAllValidMap().forEach((map) => {
    kept.push(map.folderPath.toLowerCase());
  });
  const downloadDateMap = await BeatSaber.getDownloadDate(kept);
  if (downloadDateMap.size > 0) {
    BeatmapLibrary.UpdateDownloadDate(downloadDateMap);
  }
  Logger.debug("end   UpdateDownloadDate", "MigrationVersion1.3.8");
}

export default async () => {
  RemoveTemporaryInvalidBeatmapFromInvalidCache();
  RemovePlaylistCacheContainsInvalidMap();
  SetFolderNameHashToAllBeatmaps();
  await UpdateDownloadDate();
};
