export interface BeatsaverBeatmap {
  metadata: Metadata;
  stats: Stats;
  description: string;
  key: string;
  name: string;
  uploaded?: Date;
  hash: string;
  directDownload: string;
  downloadURL: string;
  coverURL: string;
}

export interface BeatsaverNewBeatmap {
  id: string;
  name: string;
  description: string;
  uploader: any;
  metadata: NewMetadata;
  stats: NewStats;
  uploaded?: Date;
  automapper: boolean;
  ranked: boolean;
  qualified: boolean;
  versions: BeatsaverNewVersion[];
}

export interface BeatsaverNewVersion {
  hash: string;
  state: string;
  diffs: any[];
  downloadURL: string;
  coverURL: string;
  previewURL: string;
}

export interface NewStats {
  downloads: number;
  plays: number;
  downvotes: number;
  upvotes: number;
  score: number;

  [stat: string]: number;
}

export interface NewMetadata {
  bpm: number;
  duration: number;
  songName: string;
  songSubName: string;
  songAuthorName: string;
  levelAuthorName: string;
}

export interface Metadata {
  difficulties: DifficultiesSimple;
  characteristics: Characteristic[];
  songName: string;
  songSubName: string;
  songAuthorName: string;
  levelAuthorName: string;
  bpm: number;
}

export interface Characteristic {
  name: string;
  difficulties: DifficultiesDetailed;
}

export interface DifficultiesDetailed {
  easy: Difficulty | null;
  normal: Difficulty | null;
  hard: Difficulty | null;
  expert: Difficulty | null;
  expertPlus: Difficulty | null;
}

export interface Difficulty {
  duration: number;
  length: number;
  bombs: number;
  notes: number;
  obstacles: number;
  njs: number;
  njsOffset: number;
}

export interface DifficultiesSimple {
  easy: boolean;
  normal: boolean;
  hard: boolean;
  expert: boolean;
  expertPlus: boolean;

  [difficulty: string]: boolean;
}

export interface Stats {
  downloads: number;
  plays: number;
  downVotes: number;
  upVotes: number;
  //   heat: number;
  rating: number;

  [stat: string]: number;
}

export interface BeatsaverPage {
  docs: BeatsaverBeatmap[];
  totalDocs: number;
  lastPage: number;
  prevPage: number | null;
  nextPage: number | null;
}

// Dumb and quick check if the object is kinda what we expect, doesn't fully validate it
export function isBeatsaverBeatmap(beatmap: any): beatmap is BeatsaverBeatmap {
  return (
    "metadata" in beatmap &&
    "stats" in beatmap &&
    "key" in beatmap &&
    "hash" in beatmap &&
    "name" in beatmap
  );
}
