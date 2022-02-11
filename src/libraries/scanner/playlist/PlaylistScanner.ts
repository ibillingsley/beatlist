import BeatSaber from "@/libraries/os/beatSaber/BeatSaber";
import PlaylistLibrary from "@/libraries/playlist/PlaylistLibrary";
import {
  isPlaylistLocal,
  // PlaylistBase,
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
// import JsonDeserializer from "@/libraries/playlist/loader/deserializer/JsonDeserializer";

export default class PlaylistScanner
  implements ScannerInterface<PlaylistLocal> {
  public result: PlaylistScannerResult = new PlaylistScannerResult();

  public async scanAll(
    progressGroup: ProgressGroup = new ProgressGroup()
  ): Promise<PlaylistScannerResult> {
    return ScannerLocker.acquire(async () => {
      const playlistFolders = await BeatSaber.getAllPlaylistFolders();
      PlaylistLibrary.SetPlaylistFolders(playlistFolders);

      const diff = await PlaylistScanner.GetTheDifferenceInPath();

      // 追加された playlist の内容を(ほぼ)そのまま取得
      const playlistRaws: {
        playlist: PlaylistRaw;
        hash: string;
        progress: Progress;
      }[] = [];
      for (const added of diff.added) {
        const progress = progressGroup.getNewOne();
        // eslint-disable-next-line no-await-in-loop
        const playlist = await PlaylistLoader.LoadRaw(added, progress);

        if (isPlaylistLocal(playlist)) {
          // PlaylistLoader.LoadRaw() で PlaylistLocal が返されるのはエラー時のみ。
          // 不正な playlist は変換を行わない。
          PlaylistLibrary.AddPlaylist(playlist);
          this.result.newItems.push(playlist);
        } else {
          const hash = PlaylistLoader.computeHashOfRaw(playlist, added);

          playlistRaws.push({ playlist, hash, progress });
        }
      }
      // 追加された playlist の songs の key/hash から曲情報を取得し maps に格納
      // ※beatsaver.com へのアクセスを伴うので Rate Limit を避けるためひとつずつ実施
      for (const playlistData of playlistRaws) {
        const playlistRaw = playlistData.playlist;
        const { hash, progress } = playlistData;

        if (playlistRaw.songs != null) {
          // eslint-disable-next-line no-await-in-loop
          const playlistLocal = await PlaylistLoader.ConvertRawToPlaylistLocal(
            playlistRaw,
            hash,
            progress
          );
          this.result.newItems.push(playlistLocal);
          /*
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
          */
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
  ): Promise<void> {
    // 基本1000個も playlist はない想定
    let playlistRaws: {
      playlist: PlaylistRaw | PlaylistLocal;
      hash: string;
      progress: Progress;
    }[] = [];

    // paths は filePath が前回と変わっていないものの一覧
    const promiseResults: Promise<any>[] = [];
    for (const path of paths) {
      promiseResults.push(
        new Promise((resolve) => {
          PlaylistLoader.LoadRaw(path)
            .then((newPlaylist) => {
              // 空の json がふたつあったとしても filePath も hash 計算に使用しているため重複しないはず。
              const fileHash = PlaylistLoader.computeHashOfRaw(
                newPlaylist as PlaylistRaw,
                path
              );
              if (isPlaylistLocal(newPlaylist)) {
                // PlaylistLoader.LoadRaw() で PlaylistLocal が返されるのはエラー時のみ。
                // 不正な playlist は変換を行わない。
                console.log(`invalid json: ${newPlaylist.path}`);
                resolve({
                  playlist: newPlaylist,
                  hash: fileHash,
                  progress: progress.getNewOne(),
                });
                return;
              }
              const libPlaylist = PlaylistLibrary.GetByPath(path);
              const libHash = libPlaylist?.hash;
              if (fileHash !== libHash || fileHash === undefined) {
                // 既存 playlist の hash 値が変わった場合 ※fileHash が undefined になることは基本的にはないはず
                if (fileHash === undefined && libHash === undefined) {
                  resolve(null); // we got nothing new, so that's not an update
                  return;
                }
                resolve({
                  playlist: newPlaylist,
                  hash: fileHash,
                  progress: progress.getNewOne(),
                });
                return;
              }
              // 既存 playlist の hash 値に変化なし
              if (
                newPlaylist.modified.getTime() !==
                libPlaylist?.modified?.getTime()
              ) {
                // 更新日付が変わっている場合
                const tmpPlaylist = { ...libPlaylist } as PlaylistLocal;
                tmpPlaylist.modified = newPlaylist.modified;
                resolve({
                  playlist: tmpPlaylist,
                  hash: fileHash,
                  progress: progress.getNewOne(),
                });
                return;
              }
              // hash 値も更新日付も変化なし
              resolve(null);
            })
            .catch((error) => {
              // 原則としてエラーにはならない。
              console.error(error);
              resolve(null);
            });
        })
      );
    }
    playlistRaws = await Promise.all(promiseResults);
    playlistRaws = playlistRaws.filter((item) => item != null);

    // 追加された playlist の songs の key/hash から曲情報を取得し maps に格納
    // ※beatsaver.com へのアクセスを伴うので Rate Limit を避けるためひとつずつ実施
    for (const playlistData of playlistRaws) {
      const playlistRaw = playlistData.playlist;
      const { hash } = playlistData;
      const playlistProgress = playlistData.progress;

      const oldPlaylist = PlaylistLibrary.GetByPath(playlistRaw.path ?? ""); // 実際は空文字になることはない
      if (isPlaylistLocal(playlistRaw)) {
        // playlistData.playlist が PlaylistLocal になるのは、
        // PlaylistLoader.LoadRaw() がエラーを返したときか hash に変更はないが更新日時だけ変わった場合。
        if (oldPlaylist) {
          PlaylistLibrary.ReplacePlaylist(oldPlaylist, playlistRaw);
        } else {
          PlaylistLibrary.AddPlaylist(playlistRaw);
        }
        this.result.updatedItems += 1;
        return;
      }
      if (playlistRaw.songs != null) {
        // eslint-disable-next-line no-await-in-loop
        const newPlaylist = await PlaylistLoader.ConvertRawToPlaylistLocal(
          playlistRaw,
          hash,
          playlistProgress
        );

        if (oldPlaylist) {
          PlaylistLibrary.ReplacePlaylist(oldPlaylist, newPlaylist);
        } else {
          PlaylistLibrary.AddPlaylist(newPlaylist);
        }

        this.result.updatedItems += 1;
      }
    }
    /*
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
    */
  }
}
