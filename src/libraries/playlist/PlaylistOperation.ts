import PlaylistInstaller from "@/libraries/os/beatSaber/installer/PlaylistInstaller";
import {
  PlaylistLocal,
  PlaylistLocalMap,
} from "@/libraries/playlist/PlaylistLocal";
import PlaylistLoader from "@/libraries/playlist/loader/PlaylistLoader";
import PlaylistScanner from "@/libraries/scanner/playlist/PlaylistScanner";
import PlaylistLibrary from "@/libraries/playlist/PlaylistLibrary";
import PlaylistMapsLibrary from "@/libraries/playlist/PlaylistMapsLibrary";

export default class PlaylistOperation {
  public static async CreateNewPlaylist(
    playlistTitle: string,
    saveFolder?: string
  ): Promise<PlaylistLocal> {
    return PlaylistInstaller.InstallNewEmpty(playlistTitle, saveFolder);
  }

  public static async DeletePlaylist(playlist: PlaylistLocal): Promise<void> {
    return PlaylistInstaller.Uninstall(playlist);
  }

  public static async UpdatePlaylist(
    playlist: PlaylistLocal
  ): Promise<PlaylistLocal | undefined> {
    if (!playlist.path) return undefined;
    const oldPlaylist = { ...playlist };

    let updatedPlaylist = await PlaylistLoader.Save(playlist);
    const scanner = new PlaylistScanner();

    if (updatedPlaylist.path) {
      if (oldPlaylist.path !== updatedPlaylist.path) {
        PlaylistLibrary.RemovePlaylist(oldPlaylist);
      }

      updatedPlaylist = await scanner.scanOne(updatedPlaylist.path);
    }

    return updatedPlaylist;
  }

  public static AddMapInPlaylist(
    playlist: PlaylistLocal,
    beatmapHash: string
  ): Promise<PlaylistLocal | undefined> {
    const copy = { ...playlist };
    copy.maps = [...playlist.maps];

    const existsHashSet = new Set<string>();
    for (const map of copy.maps) {
      if (map.hash) {
        existsHashSet.add(map.hash.toUpperCase());
      }
    }
    if (existsHashSet.has(beatmapHash.toUpperCase())) {
      // UIで制御しているはずだが念のためここでも重複チェック
      return Promise.resolve(playlist);
    }
    this.PushMapInPlaylist(copy, beatmapHash);

    return this.UpdatePlaylist(copy);
  }

  public static RemoveMapFromPlaylist(
    playlist: PlaylistLocal,
    beatmapHash: string,
    playlistMapIndex?: number
  ) {
    const copy = { ...playlist };
    console.log(
      `[RemoveMapFromPlaylist] beatmapHash: ${beatmapHash}, playlistMapIndex: ${playlistMapIndex}`
    );
    const targetHash = beatmapHash.toUpperCase();
    const duplicated = PlaylistMapsLibrary.GetDuplicatedHashSet(playlist.maps);
    copy.maps = playlist.maps.filter(
      (entry: PlaylistLocalMap, index: number) => {
        const hash = entry.hash?.toUpperCase();
        if (hash == null) {
          return true;
        }
        if (duplicated.has(hash) && playlistMapIndex != null) {
          // 重複あり、かつ index 指定ありの場合、hash と index が一致するものだけ削除
          return index !== playlistMapIndex || hash !== targetHash;
        }
        // 重複なし、または index 指定なしの場合、hash だけで削除
        return hash !== targetHash;
      }
    );

    return this.UpdatePlaylist(copy);
  }

  public static BulkAddMapInPlaylist(
    playlist: PlaylistLocal,
    beatmapHashes: string[]
  ) {
    const copy = { ...playlist };
    copy.maps = [...playlist.maps];
    const existsHashSet = new Set<string>();
    for (const map of copy.maps) {
      if (map.hash) {
        existsHashSet.add(map.hash.toUpperCase());
      }
    }
    beatmapHashes
      // UIで制御しているはずだが念のためここでも重複チェック
      .filter((hash) => !existsHashSet.has(hash.toUpperCase()))
      .forEach((hash: string) => {
        this.PushMapInPlaylist(copy, hash);
      });

    return this.UpdatePlaylist(copy);
  }

  public static BulkRemoveMapFromPlaylist(
    playlist: PlaylistLocal,
    // beatmapHashes: string[]
    mapIndexes: number[]
  ) {
    const copy = { ...playlist };

    // copy.maps = playlist.maps.filter(
    //   (entry: PlaylistLocalMap) =>
    //     !beatmapHashes.find(
    //       (hash: string) => entry.hash?.toUpperCase() === hash.toUpperCase()
    //     )
    // );
    copy.maps = playlist.maps.filter(
      (entry: PlaylistLocalMap, index: number) => !mapIndexes.includes(index)
    );

    return this.UpdatePlaylist(copy);
  }

  private static PushMapInPlaylist(
    playlist: PlaylistLocal,
    beatmapHash: string
  ) {
    const playlistLocalMap = {
      hash: beatmapHash,
      dateAdded: new Date(),
    } as PlaylistLocalMap;

    playlist.maps.push(playlistLocalMap);
  }
}
