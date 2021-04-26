import PlaylistLibrary from "@/libraries/playlist/PlaylistLibrary";
import {
  PlaylistLocal,
  PlaylistLocalMap,
  PlaylistValidMap,
} from "@/libraries/playlist/PlaylistLocal";
import { BeatmapsTableDataUnit } from "@/components/beatmap/table/core/BeatmapsTableDataUnit";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import BeatmapLibrary from "../beatmap/BeatmapLibrary";

export default class PlaylistMapsLibrary {
  public static GetAllInvalidMap(): {
    playlist: PlaylistLocal;
    invalids: PlaylistLocalMap[];
  }[] {
    return PlaylistLibrary.GetAllPlaylists().map((playlist) => ({
      playlist,
      invalids: this.GetAllInvalidMapFor(playlist),
    }));
  }

  public static GetAllInvalidMapFlatten(): {
    playlist: PlaylistLocal;
    map: PlaylistLocalMap;
  }[] {
    return this.GetAllInvalidMap().reduce(
      (previous: any[], current) =>
        previous.concat(
          ...current.invalids.map((invalid) => ({
            playlist: current.playlist,
            map: invalid,
          }))
        ),
      []
    );
  }

  public static GetAllInvalidMapFor(
    playlist: PlaylistLocal
  ): PlaylistLocalMap[] {
    return playlist.maps.filter((map) => map.error !== undefined);
  }

  public static GetAllValidMapFor(playlist: PlaylistLocal): PlaylistValidMap[] {
    return playlist.maps.filter(
      (map) => map.error === undefined && map.hash !== undefined
    ) as PlaylistValidMap[];
  }

  public static GetAllValidMapAsTableDataFor(
    playlist: PlaylistLocal
  ): BeatmapsTableDataUnit[] {
    /*
    return this.GetAllValidMapFor(playlist)
      .map((playlistMap: PlaylistValidMap) => ({
        data: BeatsaverCachedLibrary.GetByHash(playlistMap.hash)?.beatmap,
      }))
      .filter((unit) => unit.data !== undefined) as BeatmapsTableDataUnit[];
    */
    const validMaps = playlist.maps.filter((map) => {
      // console.log(map.hash);
      return map.hash !== undefined;
    }) as PlaylistValidMap[];

    return validMaps
      .map((playlistMap: PlaylistValidMap) => {
        let mydata = BeatsaverCachedLibrary.GetByHash(playlistMap.hash)
          ?.beatmap;
        if (mydata == null) {
          // console.log(`mydata == null`);
          const beatmapLocal = BeatmapLibrary.GetAllMaps().find(
            (item) => item.hash === playlistMap.hash
          );
          // console.log(beatmapLocal?.folderPath);
          if (beatmapLocal != null) {
            mydata = BeatmapLibrary.GenerateBeatmap(beatmapLocal);
          }
        }
        return {
          data: mydata,
        };
      })
      .filter((unit) => unit.data !== undefined) as BeatmapsTableDataUnit[];
  }
}
