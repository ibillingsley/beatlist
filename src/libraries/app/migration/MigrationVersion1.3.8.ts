import store from "@/plugins/store";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import Logger from "@/libraries/helper/Logger";

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

export default () => {
  RemoveTemporaryInvalidBeatmapFromInvalidCache();
  SetFolderNameHashToAllBeatmaps();
};
