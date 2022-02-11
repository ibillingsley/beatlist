import fs from "fs-extra";
import store from "@/plugins/store";
import PlaylistSerializer from "@/libraries/playlist/loader/serializer/PlaylistSerializer";
import {
  PlaylistBase,
  PlaylistMap,
  PlaylistRawMap,
} from "@/libraries/playlist/PlaylistLocal";
import Base64SrcLoader from "@/libraries/os/utils/Base64SrcLoader";
import JsonDeserializer from "@/libraries/playlist/loader/deserializer/JsonDeserializer";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import PlaylistIndentType from "./PlaylistIndentType";

export default class JsonSerializer extends PlaylistSerializer {
  public async serialize(playlist: PlaylistBase): Promise<void> {
    let json = {} as { [key: string]: any };
    try {
      json = await JsonDeserializer.readJson(this.filepath);
    } catch (error) {
      // do nothing
    }
    const data = JsonSerializer.format(playlist);
    for (const key of Object.keys(data)) {
      json[key] = data[key];
    }
    const options: fs.WriteOptions = {
      EOL: "\r\n",
    };
    const indentType = store.getters["settings/playlistIndentType"];
    if (indentType === PlaylistIndentType.Space2) {
      options.spaces = 2;
    } else if (indentType === PlaylistIndentType.Space4) {
      options.spaces = 4;
    } else if (indentType === PlaylistIndentType.Tab) {
      options.spaces = "\t";
    }
    await fs.writeJSON(this.filepath, json, options);
  }

  private static format(playlist: PlaylistBase): { [key: string]: any } {
    const validMap = BeatsaverCachedLibrary.GetAllValid();
    return {
      playlistTitle: playlist.title,
      playlistAuthor: playlist.author,
      playlistDescription: playlist.description,
      songs: playlist.maps.map((beatmap: PlaylistMap) => {
        let song = {} as PlaylistRawMap;
        let songName;
        const hash = beatmap.hash?.toUpperCase();
        if (hash != null) {
          songName = validMap.get(hash)?.beatmap.metadata.songName;
        }
        if (beatmap.originalData != null) {
          song = { ...beatmap.originalData };
          if (song.songName == null && songName != null) {
            song = { songName, ...song };
          }
          if (beatmap.difficulties != null) {
            song.difficulties = { ...beatmap.difficulties };
          }
          if (song.hash == null) {
            song.hash = beatmap.hash;
          } else if (song.hash.toUpperCase() !== beatmap.hash?.toUpperCase()) {
            // hash 値上書き
            song.hash = beatmap.hash;
            if (song.levelid != null) {
              song.levelid = `custom_level_${beatmap.hash?.toUpperCase()}`;
            }
          }
        } else {
          song = {
            songName,
            hash: beatmap.hash,
          } as PlaylistRawMap;
        }
        return song;
      }),
      image: playlist.cover
        ? Base64SrcLoader.FromBuffer(
            playlist.cover,
            playlist.coverImageType ?? "png"
          )
        : "",
    };
  }
}
