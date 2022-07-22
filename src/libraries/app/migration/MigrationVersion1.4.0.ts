import store from "@/plugins/store";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import Logger from "@/libraries/helper/Logger";

function RemoveValidBeatmapFromValidCache() {
  Logger.debug(
    "start RemoveValidBeatmapFromValidCache",
    "MigrationVersion1.3.9"
  );
  BeatsaverCachedLibrary.RemoveValid();
  Logger.debug(
    "end   RemoveValidBeatmapFromValidCache",
    "MigrationVersion1.3.9"
  );
}

function RemoveShownColumn() {
  Logger.debug("start RemoveShownColumn", "MigrationVersion1.3.9");
  store.commit("settings/removeShownColumn", { columns: ["dl", "plays"] });
  Logger.debug("end   RemoveShownColumn", "MigrationVersion1.3.9");
}

export default async () => {
  RemoveValidBeatmapFromValidCache();
  RemoveShownColumn();
};
