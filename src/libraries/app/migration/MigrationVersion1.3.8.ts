import store from "@/plugins/store";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import Logger from "@/libraries/helper/Logger";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";
import BeatSaber from "@/libraries/os/beatSaber/BeatSaber";

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
  SetFolderNameHashToAllBeatmaps();
  await UpdateDownloadDate();
};
