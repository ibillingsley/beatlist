import {
  BeatsaverBeatmap,
  DifficultiesSimple,
} from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import { BeatmapLocal } from "@/libraries/beatmap/BeatmapLocal";

export interface BeatmapsTableDataUnit {
  local: BeatmapLocal | undefined;
  data: BeatsaverBeatmap;
  // foldeNameHash will only be used to display local maps.
  folderNameHash: string | undefined;
  // duplicated and playlistMapIndex will only be used to display maps of playlist.
  duplicated: boolean | undefined;
  playlistMapIndex: number | undefined;
  diffHighlight: { [key: string]: DifficultiesSimple } | undefined;
}
