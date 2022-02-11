import fs from "fs-extra";
import path from "path";
import trash from "trash";
import {
  PlaylistBase,
  PlaylistLocal,
} from "@/libraries/playlist/PlaylistLocal";
import PlaylistLibrary from "@/libraries/playlist/PlaylistLibrary";
import PlaylistLoader from "@/libraries/playlist/loader/PlaylistLoader";
import BeatSaber from "@/libraries/os/beatSaber/BeatSaber";
import PlaylistScanner from "@/libraries/scanner/playlist/PlaylistScanner";
import PlaylistFormatType from "@/libraries/playlist/PlaylistFormatType";
import store from "@/plugins/store";
import PlaylistFilenameExtension from "@/libraries/playlist/PlaylistFilenameExtension";
import PlaylistFilename from "@/libraries/playlist/PlaylistFilename";

declare const __static: string;
const defaultCoverPath = path.join(__static, "defaultCover.jpg");

export default class PlaylistInstaller {
  public static async Install(
    playlist: PlaylistLocal,
    format: PlaylistFormatType,
    filename: string
  ) {
    const playlistFolder = await BeatSaber.getPlaylistFolder();
    const filepath = path.join(
      playlistFolder,
      `${filename}.${PlaylistFilenameExtension.GetFor(format)}`
    );
    return PlaylistLoader.SaveAt(filepath, playlist, format);
  }

  public static GetFilename(title: string) {
    if (title == null || title === "") {
      return "";
    }
    const extension = this.getDefaultExtension();
    return `${PlaylistFilename.computeFilenameFor(title)}.${extension}`;
  }

  public static async ExistsPlaylist(title: string) {
    if (title == null || title === "") {
      return false;
    }
    const extension = this.getDefaultExtension();
    const filepath = path
      .join(
        await BeatSaber.getPlaylistFolder(),
        `${PlaylistFilename.computeFilenameFor(title)}.${extension}`
      )
      .toLowerCase();
    return fs.existsSync(filepath);
  }

  public static async InstallNewEmpty(
    playlistTitle?: string,
    saveFolder?: string
  ): Promise<PlaylistLocal> {
    let name = playlistTitle;
    if (name == null || name === "") {
      const randNum = Math.floor(Math.random() * 1e6 - 1) + 1e5;
      name = `new_playlist_${randNum}`;
    }
    const cover = Buffer.from(await fs.readFile(defaultCoverPath));
    const format = store.getters[
      "settings/defaultExportFormat"
    ] as PlaylistFormatType;
    let targetFolder = saveFolder ?? "";
    if (targetFolder === "") {
      targetFolder = await BeatSaber.getPlaylistFolder();
    }
    const extension = PlaylistFilenameExtension.GetFor(format);
    const filepath = path
      .join(
        targetFolder,
        `${PlaylistFilename.computeFilenameFor(name)}.${extension}`
      )
      .toLowerCase();

    const emptyPlaylist = {
      title: name,
      author: "",
      description: "",
      cover,
      modified: undefined,
      maps: [],
    } as PlaylistBase;

    await PlaylistLoader.SaveAt(filepath, emptyPlaylist, format);
    return new PlaylistScanner().scanOne(filepath);
  }

  public static async Uninstall(playlist: PlaylistLocal): Promise<void> {
    if (playlist.path) {
      // await fs.unlink(playlist.path);
      await trash(playlist.path);
    }

    PlaylistLibrary.RemovePlaylist(playlist);
  }

  private static getDefaultExtension() {
    const format = store.getters[
      "settings/defaultExportFormat"
    ] as PlaylistFormatType;
    const extension = PlaylistFilenameExtension.GetFor(format);
    return extension;
  }
}
