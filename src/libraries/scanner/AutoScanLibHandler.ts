import chokidar from "chokidar";
import lodash from "lodash";
import BeatSaber from "@/libraries/os/beatSaber/BeatSaber";
import store from "@/plugins/store";
import ScannerService from "@/libraries/scanner/ScannerService";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";
import PlaylistLibrary from "@/libraries/playlist/PlaylistLibrary";

export default class AutoScanLibHandler {
  public static async register(): Promise<void> {
    await store.restored;

    const beatmapFolder = await BeatSaber.getBeatmapFolder();
    const playlistFolder = await BeatSaber.getPlaylistFolder();

    const watcher = chokidar.watch([beatmapFolder, playlistFolder], {
      ignoreInitial: true,
    });

    const delayFunc = lodash.debounce(
      () => {
        if (
          BeatmapLibrary.GetAllMaps().length > 0 ||
          PlaylistLibrary.GetAllPlaylists().length > 0
        ) {
          ScannerService.ScanAll();
        }
      },
      500,
      { maxWait: 5000 }
    );

    // watcher.on("add", AutoScanLibHandler.onChange);
    // watcher.on("change", AutoScanLibHandler.onChange);
    // watcher.on("unlink", AutoScanLibHandler.onChange);
    // watcher.on("addDir", AutoScanLibHandler.onChange);
    // watcher.on("unlinkDir", AutoScanLibHandler.onChange);
    watcher.on("add", delayFunc);
    watcher.on("change", delayFunc);
    watcher.on("unlink", delayFunc);
    watcher.on("addDir", delayFunc);
    watcher.on("unlinkDir", delayFunc);

    if (
      store.getters["settings/configValid"] &&
      !store.getters["modal/newUserModal"]
    ) {
      // this.onChange();
      delayFunc();
    }
  }

  /*
  private static onChange() {
    if (
      BeatmapLibrary.GetAllMaps().length > 0 ||
      PlaylistLibrary.GetAllPlaylists().length > 0
    ) {
      ScannerService.ScanAll().then();
    }
  }
  */
}
