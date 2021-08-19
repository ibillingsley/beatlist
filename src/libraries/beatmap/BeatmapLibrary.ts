/* istanbul ignore file */
import store from "@/plugins/store";
import fs from "fs-extra";
import { BeatmapLocal } from "@/libraries/beatmap/BeatmapLocal";
import {
  BeatsaverBeatmap,
  Metadata,
} from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import { BeatmapsTableDataUnit } from "@/components/beatmap/table/core/BeatmapsTableDataUnit";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import PlaylistLibrary from "../playlist/PlaylistLibrary";
import { PlaylistLocal } from "../playlist/PlaylistLocal";

export default class BeatmapLibrary {
  public static GetAllMaps(): BeatmapLocal[] {
    return store.getters["beatmap/beatmaps"] as BeatmapLocal[];
  }

  public static GetAllValidMap(): BeatmapLocal[] {
    return this.GetAllMaps().filter(
      (beatmap: BeatmapLocal) => beatmap.loadState.valid
    );
  }

  public static GetAllInvalidMap(): BeatmapLocal[] {
    return this.GetAllMaps().filter(
      (beatmap: BeatmapLocal) => !beatmap.loadState.valid
    );
  }

  public static GetAllValidBeatmapAsTableData(): BeatmapsTableDataUnit[] {
    /*
    return this.GetAllMaps()
      .map((beatmap: BeatmapLocal) => ({
        local: beatmap,
        data: beatmap.hash
          ? BeatsaverCachedLibrary.GetByHash(beatmap.hash)?.beatmap
          : undefined,
      }))
      .filter((unit) => unit.data !== undefined) as BeatmapsTableDataUnit[];
    */

    return this.GetAllMaps()
      .map((beatmap: BeatmapLocal) => {
        let mydata: BeatsaverBeatmap | undefined;
        if (beatmap.hash) {
          mydata = BeatsaverCachedLibrary.GetByHash(beatmap.hash)?.beatmap;
          if (mydata == null) {
            mydata = BeatmapLibrary.GenerateBeatmap(beatmap);
          }
        }
        return {
          local: beatmap,
          data: mydata,
        };
      })
      .filter((unit) => unit.data !== undefined) as BeatmapsTableDataUnit[];
  }

  static GenerateBeatmap(beatmap: BeatmapLocal): BeatsaverBeatmap | undefined {
    if (beatmap.hash === undefined) {
      return undefined;
    }
    let beatmapDescription;
    try {
      const infoDat = fs.readFileSync(`${beatmap.folderPath}/info.dat`);
      beatmapDescription = JSON.parse(infoDat.toString());
    } catch (e) {
      return undefined;
    }
    const myDifficulties = {
      easy: false,
      normal: false,
      hard: false,
      expert: false,
      expertPlus: false,
    };
    for (const mapset of beatmapDescription._difficultyBeatmapSets) {
      if (mapset._beatmapCharacteristicName === "Standard") {
        for (const map of mapset._difficultyBeatmaps) {
          switch (map._difficulty) {
            case "Easy":
              myDifficulties.easy = true;
              break;
            case "Normal":
              myDifficulties.normal = true;
              break;
            case "Hard":
              myDifficulties.hard = true;
              break;
            case "Expert":
              myDifficulties.expert = true;
              break;
            case "ExpertPlus":
              myDifficulties.expertPlus = true;
              break;
            default:
              break;
          }
        }
      }
    }

    const mymetadata: Metadata = {
      difficulties: myDifficulties,
      characteristics: [],
      songName: beatmapDescription._songName,
      songSubName: beatmapDescription._songSubName,
      songAuthorName: beatmapDescription._songAuthorName,
      levelAuthorName: beatmapDescription._levelAuthorName,
      bpm: 0,
    };
    const item: BeatsaverBeatmap = {
      metadata: mymetadata,
      stats: {
        downVotes: 0,
        downloads: 0,
        heat: 0,
        plays: 0,
        rating: 0,
        upVotes: 0,
      },
      description: "",
      key: "",
      name: beatmapDescription._songName,
      // uploaded: null,
      hash: beatmap.hash,
      directDownload: "",
      downloadURL: "",
      coverURL: "",
    };
    return item;
  }

  public static GetMapByHash(hash: string): BeatmapLocal | undefined {
    return this.GetAllValidMap().find(
      (beatmap: BeatmapLocal) => beatmap.hash === hash.toUpperCase()
    );
  }

  public static HasBeatmap(beatmap: BeatsaverBeatmap): boolean {
    return this.GetMapByHash(beatmap.hash) !== undefined;
  }

  public static GetLastScanDate(): Date {
    return store.getters["beatmap/lastScan"];
  }

  public static UpdateAllMaps(beatmaps: BeatmapLocal[]) {
    store.commit("beatmap/SET_LAST_SCAN", new Date());
    store.commit("beatmap/SET_BEATMAPS", beatmaps);
  }

  public static ClearCache() {
    store.commit("beatmap/SET_LAST_SCAN", undefined);
    store.commit("beatmap/SET_BEATMAPS", []);
  }

  public static AddBeatmap(beatmap: BeatmapLocal) {
    store.commit("beatmap/addBeatmap", { beatmap });
  }

  public static RemoveBeatmap(beatmap: BeatmapLocal) {
    store.commit("beatmap/removeBeatmap", { beatmap });
  }

  // public static RemoveBeatmapByPath(path: string) {
  //   store.commit("beatmap/removeBeatmapByPath", { path });
  // }

  public static RemoveBeatmapByPaths(paths: string[]) {
    store.commit("beatmap/removeBeatmapByPaths", { paths });
  }

  public static GetPlaylists(beatmap: BeatmapLocal): PlaylistLocal[] {
    return PlaylistLibrary.GetAllValidPlaylists().filter((playlist) =>
      playlist.maps.find(
        (map) => map.hash !== undefined && map.hash === beatmap.hash
      )
    );
  }
}
