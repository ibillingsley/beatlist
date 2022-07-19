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

export default async () => {
  RemoveValidBeatmapFromValidCache();
};
