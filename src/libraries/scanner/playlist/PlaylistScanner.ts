import BeatSaber from "@/libraries/os/beatSaber/BeatSaber";
import PlaylistLibrary from "@/libraries/playlist/PlaylistLibrary";
import {
  PlaylistBase,
  PlaylistLocal,
  PlaylistRaw,
} from "@/libraries/playlist/PlaylistLocal";
import { computeDifference, Differences } from "@/libraries/common/Differences";
import PlaylistLoader from "@/libraries/playlist/loader/PlaylistLoader";
import ProgressGroup from "@/libraries/common/ProgressGroup";
import PlaylistScannerResult from "@/libraries/scanner/playlist/PlaylistScannerResult";
import { ScannerInterface } from "@/libraries/scanner/ScannerInterface";
import ScannerLocker from "@/libraries/scanner/ScannerLocker";
import Progress from "@/libraries/common/Progress";
import JsonDeserializer from "@/libraries/playlist/loader/deserializer/JsonDeserializer";

export default class PlaylistScanner
  implements ScannerInterface<PlaylistLocal> {
  public result: PlaylistScannerResult = new PlaylistScannerResult();

  public async scanAll(
    progressGroup: ProgressGroup = new ProgressGroup()
  ): Promise<PlaylistScannerResult> {
    return ScannerLocker.acquire(async () => {
      const diff = await PlaylistScanner.GetTheDifferenceInPath();

      // 追加された playlist の内容を(ほぼ)そのまま取得
      const playlistRaws: { playlist: PlaylistRaw; progress: Progress }[] = [];
      for (const added of diff.added) {
        const progress = progressGroup.getNewOne();
        // eslint-disable-next-line no-await-in-loop
        const playlist = await PlaylistLoader.LoadRaw(added, progress);
        playlistRaws.push({ playlist, progress });
      }
      // 追加された playlist の songs の key/hash から曲情報を取得し maps に格納
      // ※beatsaver.com へのアクセスを伴うので Rate Limit を避けるためひとつずつ実施
      for (const playlistData of playlistRaws) {
        const playlistRaw = playlistData.playlist;
        const { progress } = playlistData;

        if (playlistRaw.songs != null) {
          // eslint-disable-next-line no-await-in-loop
          const playlistLocalMap = await JsonDeserializer.convertToHash(
            playlistRaw.songs,
            progress
          );
          const playlistBase: PlaylistBase = {
            title: playlistRaw.title,
            author: playlistRaw.author,
            description: playlistRaw.description,
            cover: playlistRaw.cover,
            maps: playlistLocalMap,
          };
          const hash = PlaylistLoader.computeHash(
            playlistBase,
            playlistRaw.path ?? "" // 実際には空文字になることはない
          );
          this.result.newItems.push({
            title: playlistRaw.title,
            author: playlistRaw.author,
            description: playlistRaw.description,
            cover: playlistRaw.cover,
            maps: playlistLocalMap,
            loadState: { valid: true, format: playlistRaw.format },
            path: playlistRaw.path,
            hash,
            format: playlistRaw.format,
          });
        }
      }
      /*
      // TODO エラーになった場合の考慮が足りない？
      this.result.newItems = await Promise.all(
        diff.added.map(async (path: string) =>
          PlaylistLoader.Load(path, progressGroup.getNewOne())
        )
      );
      */

      this.result.removedItems = diff.removed.length;
      this.result.keptItems = diff.kept.length;

      await this.checkForChange(diff.kept, progressGroup);

      const allPlaylists = this.MergeWithExistingPlaylists(diff);
      PlaylistLibrary.UpdateAllPlaylist(allPlaylists);

      return this.result;
    });
  }

  public async scanOne(path: string): Promise<PlaylistLocal> {
    return ScannerLocker.acquire(async () => {
      const playlist = await PlaylistLoader.Load(path);
      const oldPlaylist =
        playlist.path && PlaylistLibrary.GetByPath(playlist.path);

      if (oldPlaylist) {
        // update
        PlaylistLibrary.RemovePlaylist(oldPlaylist);
        PlaylistLibrary.AddPlaylist(playlist);
        this.result.updatedItems += 1;
      } else {
        // add
        PlaylistLibrary.AddPlaylist(playlist);
        this.result.newItems = [playlist];
      }

      return playlist;
    });
  }

  private static async GetTheDifferenceInPath(): Promise<Differences<string>> {
    const currentPaths =
      (await BeatSaber.getAllPlaylistsPath())?.map((path: string) =>
        path.toLowerCase()
      ) ?? [];

    const oldPaths = PlaylistLibrary.GetAllPlaylists().map(
      (playlist: PlaylistLocal) => playlist.path?.toLowerCase() ?? ""
    );

    return computeDifference(oldPaths, currentPaths);
  }

  private MergeWithExistingPlaylists(
    diff: Differences<string>
  ): PlaylistLocal[] {
    const existingPlaylist = PlaylistLibrary.GetAllPlaylists().filter(
      (playlist: PlaylistLocal) =>
        diff.kept.find((path: string) => playlist.path === path)
    );

    return this.result.newItems.concat(existingPlaylist);
  }

  private async checkForChange(
    paths: string[],
    progress: ProgressGroup
  ): Promise<void[]> {
    return Promise.all(
      paths.map(async (path: string) => {
        const newPlaylist = await PlaylistLoader.Load(
          path,
          progress.getNewOne()
        );
        const fileHash = newPlaylist.hash;
        const libHash = PlaylistLibrary.GetByPath(path)?.hash;

        if (fileHash !== libHash || fileHash === undefined) {
          if (fileHash === undefined && libHash === undefined) {
            return; // we got nothing new, so that's not an update
          }

          const oldPlaylist = PlaylistLibrary.GetByPath(path);

          if (oldPlaylist) {
            PlaylistLibrary.ReplacePlaylist(oldPlaylist, newPlaylist);
          } else {
            PlaylistLibrary.AddPlaylist(newPlaylist);
          }

          this.result.updatedItems += 1;
        }
      })
    );
  }
}
