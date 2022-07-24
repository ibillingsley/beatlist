import path from "path";
import BeatSaber from "@/libraries/os/beatSaber/BeatSaber";
import PlaylistLoader from "@/libraries/playlist/loader/PlaylistLoader";
import { PlaylistLocal, PlaylistRaw } from "@/libraries/playlist/PlaylistLocal";
import PlaylistLibrary from "@/libraries/playlist/PlaylistLibrary";
import PlaylistScanner from "@/libraries/scanner/playlist/PlaylistScanner";
import PlaylistFormatType from "@/libraries/playlist/PlaylistFormatType";

jest.mock("@/plugins/store", () => ({
  commit: () => {},
  getters: {
    "settings/installationPath": path.join(
      __dirname,
      "../data/fakeInstallation"
    ),
  },
}));

describe("playlist scanner", () => {
  it("should only scan the difference", async () => {
    expect.assertions(13);

    jest
      .spyOn(BeatSaber, "getAllPlaylistsPath")
      .mockImplementation()
      .mockResolvedValue(["foo", "bar", "foobar"]);

    jest
      .spyOn(PlaylistLoader, "Load")
      .mockImplementation(
        async (pathStr: string) => ({ path: pathStr } as PlaylistLocal)
      );

    jest
      .spyOn(PlaylistLoader, "LoadRaw")
      .mockImplementation(async (pathStr: string) => {
        const result = ({
          songs: [], // songs に要素をもつと mock が増えるので空配列で代用
          path: pathStr,
          format: PlaylistFormatType.Json,
        } as unknown) as PlaylistRaw;
        return result;
      });

    jest.spyOn(PlaylistLoader, "computeHashOfRaw").mockReturnValue("hash1");

    jest
      .spyOn(PlaylistLoader, "ConvertRawToPlaylistLocal")
      // 引数: progress は無視
      .mockImplementation(async (playlistRaw: PlaylistRaw, hash: string) => {
        const result = {
          ...playlistRaw,
          hash,
        } as PlaylistLocal;
        return result;
      });

    jest
      .spyOn(PlaylistLibrary, "GetAllPlaylists")
      .mockReturnValue([
        { path: "bar" } as PlaylistLocal,
        { path: "baz" } as PlaylistLocal,
      ]);

    jest
      .spyOn(PlaylistLibrary, "GetByPath")
      .mockReturnValue({} as PlaylistLocal);

    jest
      .spyOn(PlaylistLibrary, "UpdateAllPlaylist")
      .mockImplementation(() => {});

    jest.spyOn(PlaylistLibrary, "AddPlaylist").mockImplementation(() => {});

    jest.spyOn(PlaylistLibrary, "RemovePlaylist").mockImplementation(() => {});

    const scanner = new PlaylistScanner();
    // checkForChange() は別のテストで試験したほうがいいのでダミーの関数で上書き
    (scanner as any).checkForChange = async () => {};
    await scanner.scanAll();

    expect((PlaylistLoader.Load as any).mock.calls).toHaveLength(0);
    expect((PlaylistLoader.LoadRaw as any).mock.calls).toHaveLength(2);
    expect((PlaylistLoader.computeHashOfRaw as any).mock.calls).toHaveLength(2);
    expect(
      (PlaylistLoader.ConvertRawToPlaylistLocal as any).mock.calls
    ).toHaveLength(2);
    expect((PlaylistLibrary.GetAllPlaylists as any).mock.calls).toHaveLength(2);
    expect((PlaylistLibrary.GetByPath as any).mock.calls).toHaveLength(0);
    expect((PlaylistLibrary.UpdateAllPlaylist as any).mock.calls).toHaveLength(
      1
    );
    // checkForChange() を mock してるので AddPlaylist、RemovePlaylist は呼ばれない
    expect((PlaylistLibrary.AddPlaylist as any).mock.calls).toHaveLength(0);
    expect((PlaylistLibrary.RemovePlaylist as any).mock.calls).toHaveLength(0);

    expect(scanner.result.newItems[0].path).toBe("foo");
    expect(scanner.result.newItems[1].path).toBe("foobar");
    expect(scanner.result.keptItems).toBe(1);
    expect(scanner.result.removedItems).toBe(1);
  });
});
