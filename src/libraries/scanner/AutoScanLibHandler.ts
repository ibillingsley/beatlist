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

    this.watch(beatmapFolder, {
      ignoreInitial: true,
      depth: 0,
    });

    this.watch(playlistFolder, {
      ignoreInitial: true,
    });

    if (
      store.getters["settings/configValid"] &&
      !store.getters["modal/newUserModal"]
    ) {
      this.onChange();
    }
  }

  private static watch(folder: string, options: chokidar.WatchOptions) {
    const watcher = chokidar.watch(folder, options);

    watcher.on("add", this.onChange);
    watcher.on("change", this.onChange);
    watcher.on("unlink", this.onChange);
    watcher.on("addDir", this.onChange);
    watcher.on("unlinkDir", this.onChange);
  }

  private static onChange = lodash.debounce(
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
}
