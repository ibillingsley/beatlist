import fs from "fs-extra";
import path from "path";
import { resolveInstallPath } from "@/libraries/os/pathResolver/Resolve";
import store from "@/plugins/store";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import PlaylistFilenameExtension from "@/libraries/playlist/PlaylistFilenameExtension";
import {
  PlaylistFolder,
  PLAYLIST_FOLDER_ID_ROOT,
} from "@/libraries/playlist/PlaylistLocal";

const BEAT_SABER_EXE = "Beat Saber.exe";
const BEAT_SABER_PLAYLIST = "Playlists";
const PLAYLIST_MANAGER_IMAGES_PATH = "CoverImages";
const BEAT_SABER_CUSTOM_LEVEL = path.join("Beat Saber_Data", "CustomLevels");

export default class BeatSaber {
  public static validateInstallationPathSync(folderPath: string): boolean {
    const exePath = path.join(folderPath, BEAT_SABER_EXE);
    return fs.pathExistsSync(exePath);
  }

  public static async solveInstallationPath(): Promise<string | undefined> {
    return resolveInstallPath();
  }

  public static async getBeatmapFolder(): Promise<string> {
    const installationPath = store.getters["settings/installationPath"];
    const beatmapFolder = path.join(installationPath, BEAT_SABER_CUSTOM_LEVEL);

    if (!(await fs.pathExists(beatmapFolder))) {
      if (await fs.pathExists(installationPath)) {
        await fs.mkdirp(beatmapFolder);
      }
    }

    return beatmapFolder;
  }

  public static async getPlaylistFolder(): Promise<string> {
    const installationPath = store.getters["settings/installationPath"];
    const playlistPath = path.join(installationPath, BEAT_SABER_PLAYLIST);

    if (!(await fs.pathExists(playlistPath))) {
      if (await fs.pathExists(installationPath)) {
        await fs.mkdirp(playlistPath);
      }
    }

    return playlistPath;
  }

  public static async getAllSongFolderPath(): Promise<string[]> {
    const pathSongList = await this.getBeatmapFolder();
    const directoryList = await fs.readdir(pathSongList);
    return directoryList.map((directory) => path.join(pathSongList, directory));
  }

  public static async getAllPlaylistsPath(): Promise<string[] | undefined> {
    const pathPlaylists = await this.getPlaylistFolder();
    const disablePlaylistFolderManagement =
      store.getters["settings/disablePlaylistFolderManagement"];

    if (!disablePlaylistFolderManagement) {
      const fileList = [] as string[];
      await BeatSaber.getPlaylistsPathRecursively(
        pathPlaylists,
        0,
        ".",
        fileList
      );

      return fileList;
    }
    const fileList = await fs.readdir(pathPlaylists);

    const allFile = await Promise.all(
      fileList.map(async (file: string) => {
        const filepath = path.join(pathPlaylists, file);

        if ((await fs.stat(filepath)).isFile()) {
          if (PlaylistFilenameExtension.isValid(filepath)) {
            return filepath;
          }
        }

        return undefined;
      })
    );

    const isString = (str: string | undefined): str is string => !!str;
    return allFile.filter(isString);
  }

  private static async getPlaylistsPathRecursively(
    baseDir: string,
    level: number,
    parentDir: string,
    fileList: string[]
  ) {
    const list = await fs.readdir(path.join(baseDir, parentDir));
    for (const filename of list) {
      if (level === 0 && filename === PLAYLIST_MANAGER_IMAGES_PATH) {
        // eslint-disable-next-line no-continue
        continue;
      }
      const filepath = path.join(baseDir, parentDir, filename);
      const stat = fs.statSync(filepath);
      if (stat.isFile() && PlaylistFilenameExtension.isValid(filename)) {
        fileList.push(filepath);
      } else if (stat.isDirectory()) {
        // eslint-disable-next-line no-await-in-loop
        await BeatSaber.getPlaylistsPathRecursively(
          baseDir,
          level + 1,
          path.join(parentDir, filename),
          fileList
        );
      }
    }
  }

  public static async getAllPlaylistFolders() {
    const pathPlaylists = await this.getPlaylistFolder();

    const playlistRootFolder: PlaylistFolder = {
      id: PLAYLIST_FOLDER_ID_ROOT,
      name: BEAT_SABER_PLAYLIST,
      path: pathPlaylists,
      modified: undefined,
      children: [],
    };
    const allItems = new Map<string, PlaylistFolder>();
    await BeatSaber.getPlaylistFoldersRecursively(
      pathPlaylists,
      0,
      ".",
      playlistRootFolder.id,
      playlistRootFolder.children,
      allItems
    );
    playlistRootFolder.allChildren = allItems;
    return playlistRootFolder;
  }

  private static async getPlaylistFoldersRecursively(
    baseDir: string,
    level: number,
    parentDir: string,
    parentId: string,
    playlistDirs: PlaylistFolder[],
    allItems: Map<string, PlaylistFolder>
  ) {
    const list = await fs.readdir(path.join(baseDir, parentDir));
    for (const filename of list) {
      if (level === 0 && filename === PLAYLIST_MANAGER_IMAGES_PATH) {
        // eslint-disable-next-line no-continue
        continue;
      }
      const filepath = path.join(baseDir, parentDir, filename);
      const stat = fs.statSync(filepath);
      if (stat.isDirectory()) {
        const playlistFolder = {
          id: `${parentId}:${filename}`,
          name: filename,
          path: filepath,
          modified: stat.mtime,
          children: [],
        } as PlaylistFolder;
        // eslint-disable-next-line no-await-in-loop
        await BeatSaber.getPlaylistFoldersRecursively(
          baseDir,
          level + 1,
          path.join(parentDir, filename),
          playlistFolder.id,
          playlistFolder.children,
          allItems
        );
        playlistDirs.push(playlistFolder);
        allItems.set(playlistFolder.id, playlistFolder);
      }
    }
  }

  public static GetFolderPathFor(beatmap: BeatsaverBeatmap): string {
    const purgeText = (text: string) =>
      text
        .replace(/\s/g, " ")
        .replace(/[^a-zA-Z0-9 &]/g, "")
        .trim();

    const installationPath = store.getters["settings/installationPath"];

    const key = purgeText(beatmap.key);
    const songName = purgeText(beatmap.metadata.songName);
    const levelAuthorName = purgeText(beatmap.metadata.levelAuthorName);

    const beatmapFolder = `${key} (${songName} - ${levelAuthorName})`;

    return path.join(installationPath, BEAT_SABER_CUSTOM_LEVEL, beatmapFolder);
  }
}
