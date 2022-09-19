import path from "path";
import fs from "fs-extra";
import {
  PlaylistLocal,
  PlaylistMapImportError,
} from "@/libraries/playlist/PlaylistLocal";
import PlaylistLoader from "@/libraries/playlist/loader/PlaylistLoader";
import BeatsaverAPI from "@/libraries/net/beatsaver/BeatsaverAPI";
import PlaylistLoadStateError from "@/libraries/playlist/loader/PlaylistLoadStateError";
import { PlaylistLoadStateInvalid } from "@/libraries/playlist/loader/PlaylistLoadState";
import PlaylistFormatType from "@/libraries/playlist/PlaylistFormatType";
import {
  BeatsaverKey,
  BeatsaverKeyType,
} from "@/libraries/beatmap/repo/BeatsaverKeyType";
import mockResponseSuccess from "./helper/BeatsaverAPIResponseMocking";

jest.mock("@/plugins/store", () => ({
  getters: { "settings/defaultExportFormat": "Json" },
}));

jest.mock("@/libraries/beatmap/repo/BeatsaverCachedLibrary", () => ({
  cacheBeatmap: async () => ({
    loadState: { valid: true },
    beatmap: { hash: "foobar" },
  }),
  Get: (key: BeatsaverKey) => {
    if (
      key.type !== BeatsaverKeyType.Hash ||
      key.value.toLowerCase() !== "01fb2aa5064d8e30105de66181be1b3fbc9fa28a"
    ) {
      return undefined;
    }

    return {
      beatmap: {
        hash: "01fb2aa5064d8e30105de66181be1b3fbc9fa28a",
        metadata: {
          songName: "Arche",
        },
      },
      loadState: { valid: true },
    };
  },
  GetAllValid: () => {
    const map = new Map<string, any>();
    map.set("01fb2aa5064d8e30105de66181be1b3fbc9fa28a".toUpperCase(), {
      beatmap: {
        hash: "01fb2aa5064d8e30105de66181be1b3fbc9fa28a",
        metadata: {
          songName: "Arche",
        },
      },
      loadState: { valid: true },
    });
    return map;
  },
  KeyToHash: (key: string) => {
    if (key === "75f1") {
      return "01fb2aa5064d8e30105de66181be1b3fbc9fa28a".toUpperCase();
    }
    return undefined;
  },
  AddAll: async () => {},
}));

jest.mock("@/libraries/beatmap/BeatmapLibrary", () => ({
  GetAllValidMap: () => [],
}));

describe("playlist loader, using the JSON as format", () => {
  it("should fail if invalid path", async () => {
    expect.assertions(2);

    const playlist = await PlaylistLoader.Load("unknown.json");

    expect(playlist.loadState.valid).toBe(false);
    expect((playlist.loadState as PlaylistLoadStateInvalid).errorType).toBe(
      PlaylistLoadStateError.PathDoesntExist
    );
  });

  it("should not load an invalid playlist", async () => {
    expect.assertions(2);

    const oldFormatInvalid = path.join(
      __dirname,
      "../data/playlist/oldFormatInvalid.json"
    );
    const playlist = await PlaylistLoader.Load(oldFormatInvalid);

    expect(playlist.loadState.valid).toBe(false);
    expect((playlist.loadState as PlaylistLoadStateInvalid).errorType).toBe(
      PlaylistLoadStateError.FailedToParse
    );
  });

  it("should load a JSON format playlist", async () => {
    expect.assertions(6);

    const oldFormatBeatlist = path.join(
      __dirname,
      "../data/playlist/oldFormatFromBeatlist.json"
    );
    const oldFormatPeepee = path.join(
      __dirname,
      "../data/playlist/oldFormatFromPeepee.bplist"
    );

    const playlistBeatlist = await PlaylistLoader.Load(oldFormatBeatlist);
    const playlistPeepee = await PlaylistLoader.Load(oldFormatPeepee);

    expect(playlistBeatlist.loadState.valid).toBe(true);
    expect(playlistBeatlist.title).toBe("Test");
    expect(playlistBeatlist.maps[0].hash).toBe(
      "01fb2aa5064d8e30105de66181be1b3fbc9fa28a"
    );

    expect(playlistPeepee.loadState.valid).toBe(true);
    expect(playlistPeepee.title).toBe("Not played (2019-12-22)");
    expect(playlistPeepee.maps[0].hash).toBe(
      "01fb2aa5064d8e30105de66181be1b3fbc9fa28a"
    );
  });

  it("should load a JSON format playlist (key specified)", async () => {
    expect.assertions(5);

    const keyOnlyPlaylist = path.join(
      __dirname,
      "../data/playlist/keyOnly.json"
    );

    const playlistBeatlist = await PlaylistLoader.Load(keyOnlyPlaylist);

    expect(playlistBeatlist.loadState.valid).toBe(true);
    expect(playlistBeatlist.title).toBe("test-title");
    expect(playlistBeatlist.author).toBe("test-author");
    expect(playlistBeatlist.description).toBe("");
    expect(playlistBeatlist.maps[0].hash).toBe(
      "01fb2aa5064d8e30105de66181be1b3fbc9fa28a"
    );
  });

  it("should load a JSON format playlist (invalid key specified)", async () => {
    expect.assertions(6);

    // key: "xxxx"
    const keyOnlyPlaylist = path.join(
      __dirname,
      "../data/playlist/invalidKeyOnly.json"
    );

    const playlistBeatlist = await PlaylistLoader.Load(keyOnlyPlaylist);

    expect(playlistBeatlist.loadState.valid).toBe(true);
    expect(playlistBeatlist.title).toBe("test-title");
    expect(playlistBeatlist.author).toBe("test-author");
    expect(playlistBeatlist.description).toBe("");
    expect(playlistBeatlist.maps[0].error).toBe(
      PlaylistMapImportError.BeatsaverInexistent
    );
    // eslint-disable-next-line jest/prefer-strict-equal
    expect(playlistBeatlist.maps[0].originalData).toEqual({ key: "xxxx" });
  });

  it("should save the playlist correctly using JSON format", async () => {
    expect.assertions(5);

    const mockGetBeatmapByHash = jest.fn();
    mockGetBeatmapByHash.mockReturnValue(mockResponseSuccess({}));
    BeatsaverAPI.Singleton.getBeatmapByHash = mockGetBeatmapByHash;

    const playlistPath = path.join(
      __dirname,
      "../data/playlist/testPlaylistLoaderSaveFunction.json"
    );
    const playlistData = {
      title: "test",
      author: "test",
      description: null,
      cover: Buffer.from("test"),
      maps: [
        {
          dateAdded: new Date(),
          hash: "01fb2aa5064d8e30105de66181be1b3fbc9fa28a",
        },
      ],
    } as PlaylistLocal;

    await PlaylistLoader.SaveAt(
      playlistPath,
      playlistData,
      PlaylistFormatType.Json
    );

    await expect(fs.pathExists(playlistPath)).resolves.toBe(true);

    const playlist = await PlaylistLoader.Load(playlistPath);

    expect(playlist.loadState.valid).toBe(true);
    expect(playlist.title).toBe("test");
    expect(playlist.cover?.toString()).toBe("test");
    expect(playlist.maps[0].hash).toBe(
      "01fb2aa5064d8e30105de66181be1b3fbc9fa28a"
    );

    await fs.unlink(playlistPath);
  });

  it("should save the playlist correctly using JSON format (overwrite)", async () => {
    expect.assertions(8);

    const mockGetBeatmapByHash = jest.fn();
    mockGetBeatmapByHash.mockReturnValue(mockResponseSuccess({}));
    BeatsaverAPI.Singleton.getBeatmapByHash = mockGetBeatmapByHash;

    const playlistPath = path.join(
      __dirname,
      "../data/playlist/testPlaylistLoaderSaveFunctionOverwrite.json"
    );
    const playlistData = {
      title: "test",
      author: "test",
      description: null,
      cover: Buffer.from("test"),
      maps: [
        {
          dateAdded: new Date(),
          hash: "01fb2aa5064d8e30105de66181be1b3fbc9fa28a",
          originalData: {
            songName: "testsong",
            hash: "01fb2aa5064d8e30105de66181be1b3fbc9fa28a",
            levelid: "custom_level_01FB2AA5064D8E30105DE66181BE1B3FBC9FA28A",
            difficulties: [
              {
                characteristic: "Standard",
                name: "Expert",
              },
            ],
          },
        },
      ],
    } as unknown as PlaylistLocal;
    const prePlaylistData = {
      playlistTitle: "pre-test",
      playlistAuthor: "pre-author",
      playlistDescription: "pre-desc",
      image: "",
      customData: { syncUrl: "https://example.com/test.bplist" },
      songs: [
        {
          songName: "testsong",
          hash: "01fb2aa5064d8e30105de66181be1b3fbc9fa28a",
          levelid: "custom_level_01FB2AA5064D8E30105DE66181BE1B3FBC9FA28A",
          difficulties: [
            {
              characteristic: "Standard",
              name: "Expert",
            },
          ],
        },
      ],
    };
    const expectedPlaylistData = {
      playlistTitle: "test",
      playlistAuthor: "test",
      playlistDescription: null,
      image: "data:image/png;base64,dGVzdA==", // "test" を変換した値
      customData: { syncUrl: "https://example.com/test.bplist" },
      songs: [
        {
          songName: "testsong",
          hash: "01fb2aa5064d8e30105de66181be1b3fbc9fa28a",
          levelid: "custom_level_01FB2AA5064D8E30105DE66181BE1B3FBC9FA28A",
          difficulties: [
            {
              characteristic: "Standard",
              name: "Expert",
            },
          ],
        },
      ],
    };
    await fs.writeJSON(playlistPath, prePlaylistData);

    // overwrite
    await PlaylistLoader.SaveAt(
      playlistPath,
      playlistData,
      PlaylistFormatType.Json
    );

    await expect(fs.pathExists(playlistPath)).resolves.toBe(true);

    const actualJson = await fs.readJSON(playlistPath);
    // eslint-disable-next-line jest/prefer-strict-equal
    expect(actualJson).toEqual(expectedPlaylistData);

    const playlist = await PlaylistLoader.Load(playlistPath);

    expect(playlist.loadState.valid).toBe(true);
    expect(playlist.title).toBe("test");
    expect(playlist.author).toBe("test");
    expect(playlist.cover?.toString()).toBe("test");
    expect(playlist.maps[0].hash).toBe(
      "01fb2aa5064d8e30105de66181be1b3fbc9fa28a"
    );

    // playlistData 側に originalData がある場合は維持される
    // eslint-disable-next-line jest/prefer-strict-equal
    expect(playlist.maps[0].originalData).toEqual({
      songName: "testsong",
      hash: "01fb2aa5064d8e30105de66181be1b3fbc9fa28a",
      levelid: "custom_level_01FB2AA5064D8E30105DE66181BE1B3FBC9FA28A",
      difficulties: [
        {
          characteristic: "Standard",
          name: "Expert",
        },
      ],
    });

    await fs.unlink(playlistPath);
  });

  it("should save the playlist correctly using JSON format (overwrite, difficulties deleted)", async () => {
    expect.assertions(8);

    const mockGetBeatmapByHash = jest.fn();
    mockGetBeatmapByHash.mockReturnValue(mockResponseSuccess({}));
    BeatsaverAPI.Singleton.getBeatmapByHash = mockGetBeatmapByHash;

    const playlistPath = path.join(
      __dirname,
      "../data/playlist/testPlaylistLoaderSaveFunctionOverwrite2.json"
    );
    const playlistData = {
      title: "test",
      author: "test",
      description: null,
      cover: Buffer.from("test"),
      maps: [
        {
          dateAdded: new Date(),
          hash: "01fb2aa5064d8e30105de66181be1b3fbc9fa28a",
        },
      ],
    } as PlaylistLocal;
    const prePlaylistData = {
      playlistTitle: "pre-test",
      playlistAuthor: "pre-author",
      playlistDescription: "pre-desc",
      image: "",
      customData: { syncUrl: "https://example.com/test.bplist" },
      songs: [
        {
          songName: "testsong",
          hash: "01fb2aa5064d8e30105de66181be1b3fbc9fa28a",
          levelid: "custom_level_01FB2AA5064D8E30105DE66181BE1B3FBC9FA28A",
          difficulties: [
            {
              characteristic: "Standard",
              name: "Expert",
            },
          ],
        },
      ],
    };
    const expectedPlaylistData = {
      playlistTitle: "test",
      playlistAuthor: "test",
      playlistDescription: null,
      image: "data:image/png;base64,dGVzdA==", // "test" を変換した値
      customData: { syncUrl: "https://example.com/test.bplist" },
      songs: [
        {
          hash: "01fb2aa5064d8e30105de66181be1b3fbc9fa28a",
          songName: "Arche",
        },
      ],
    };
    await fs.writeJSON(playlistPath, prePlaylistData);

    // overwrite
    await PlaylistLoader.SaveAt(
      playlistPath,
      playlistData,
      PlaylistFormatType.Json
    );

    await expect(fs.pathExists(playlistPath)).resolves.toBe(true);

    const actualJson = await fs.readJSON(playlistPath);
    // eslint-disable-next-line jest/prefer-strict-equal
    expect(actualJson).toEqual(expectedPlaylistData);

    const playlist = await PlaylistLoader.Load(playlistPath);

    expect(playlist.loadState.valid).toBe(true);
    expect(playlist.title).toBe("test");
    expect(playlist.author).toBe("test");
    expect(playlist.cover?.toString()).toBe("test");
    expect(playlist.maps[0].hash).toBe(
      "01fb2aa5064d8e30105de66181be1b3fbc9fa28a"
    );

    // playlistData 側に originalData がなければ消える
    // eslint-disable-next-line jest/prefer-strict-equal
    expect(playlist.maps[0].originalData).toEqual({
      hash: "01fb2aa5064d8e30105de66181be1b3fbc9fa28a",
      songName: "Arche",
    });

    await fs.unlink(playlistPath);
  });
});
