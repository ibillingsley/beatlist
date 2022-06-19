import store from "@/plugins/store";
import Logger from "@/libraries/helper/Logger";

function SetItemsPerPageOfBeatsaverBeatmaps() {
  Logger.debug(
    "start SetItemsPerPageOfBeatsaverBeatmaps",
    "MigrationVersion1.3.9"
  );
  store.commit("settings/setTableSettings", {
    table: "beatsaverBeatmaps",
    key: "itemsPerPage",
    value: 20,
  });
  Logger.debug(
    "end   SetItemsPerPageOfBeatsaverBeatmaps",
    "MigrationVersion1.3.9"
  );
}

export default () => {
  SetItemsPerPageOfBeatsaverBeatmaps();
};
