export interface BeatsaverBeatmap {
  metadata: Metadata;
  stats: Stats;
  description: string;
  key: string;
  name: string;
  uploaded?: Date;
  hash: string;
  // directDownload: string;
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
  diffs: BeatsaverNewDiffs[];
  downloadURL: string;
  coverURL: string;
  previewURL: string;
}

export interface BeatsaverNewDiffs {
  characteristic: string;
  difficulty: string;
  length: number;
  bombs: number;
  njs: number;
  notes: number;
  obstacles: number;
  offset: number;
  nps: number;
  me: boolean;
  ne: boolean;
  chroma: boolean;
  cinema: boolean;
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
  duration: number | undefined;
  // BeatmapsTable 表示用。本来は difficulty ごとに設定されるものだが性能向上のためtopにも持つ。
  requirements: ReqsMetadata;
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
  nps: number;
  chroma: boolean;
  ne: boolean;
  me: boolean;
  cinema: boolean;
}

export interface DifficultiesSimple {
  easy: boolean;
  normal: boolean;
  hard: boolean;
  expert: boolean;
  expertPlus: boolean;

  [difficulty: string]: boolean;
}

export interface ReqsMetadata {
  chroma: boolean;
  ne: boolean;
  me: boolean;
  cinema: boolean;
}

export interface Stats {
  // downloads: number;
  // plays: number;
  downVotes: number;
  upVotes: number;
  // heat: number;
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

/*
function createDifficultiesMetadata(
  doc: BeatsaverNewBeatmap
): DifficultiesSimple {
  const version = doc.versions[0];
  const result: DifficultiesSimple = {
    easy: false,
    normal: false,
    hard: false,
    expert: false,
    expertPlus: false,
  };
  for (const diff of version.diffs) {
    switch (diff.difficulty) {
      case "ExpertPlus":
        result.expertPlus = true;
        break;
      case "Expert":
        result.expert = true;
        break;
      case "Hard":
        result.hard = true;
        break;
      case "Normal":
        result.normal = true;
        break;
      case "Easy":
        result.easy = true;
        break;
      default:
        break;
    }
  }
  return result;
}
*/

function createCharacteristicMetadata(
  doc: BeatsaverNewBeatmap
): {
  characteristics: Characteristic[];
  difficulties: DifficultiesSimple;
  requirements: any;
} {
  const version = doc.versions[0];
  const result: Characteristic[] = [];
  const resultMap = new Map<string, Characteristic>();
  const diffSimple: DifficultiesSimple = {
    easy: false,
    normal: false,
    hard: false,
    expert: false,
    expertPlus: false,
  };
  // BeatmapsTable 表示用
  const requirements = {
    chroma: false,
    ne: false,
    me: false,
    cinema: false,
  };

  for (const diff of version.diffs) {
    const characteristicKey = diff.characteristic;
    let characteristic = resultMap.get(characteristicKey);
    if (characteristic == null) {
      characteristic = {
        name: characteristicKey,
        difficulties: {
          easy: null,
          normal: null,
          hard: null,
          expert: null,
          expertPlus: null,
        },
      };
      resultMap.set(characteristicKey, characteristic);
    }
    const diffDetail: Difficulty = {
      duration: doc.metadata.duration,
      length: diff.length,
      bombs: diff.bombs,
      notes: diff.notes,
      obstacles: diff.obstacles,
      njs: diff.njs,
      njsOffset: diff.offset,
      nps: diff.nps,
      me: diff.me,
      ne: diff.ne,
      chroma: diff.chroma,
      cinema: diff.cinema,
    };
    requirements.me = requirements.me || diff.me;
    requirements.ne = requirements.ne || diff.ne;
    requirements.chroma = requirements.chroma || diff.chroma;
    requirements.cinema = requirements.cinema || diff.cinema;
    switch (diff.difficulty) {
      case "ExpertPlus":
        characteristic.difficulties.expertPlus = diffDetail;
        diffSimple.expertPlus = true;
        break;
      case "Expert":
        characteristic.difficulties.expert = diffDetail;
        diffSimple.expert = true;
        break;
      case "Hard":
        characteristic.difficulties.hard = diffDetail;
        diffSimple.hard = true;
        break;
      case "Normal":
        characteristic.difficulties.normal = diffDetail;
        diffSimple.normal = true;
        break;
      case "Easy":
        characteristic.difficulties.easy = diffDetail;
        diffSimple.easy = true;
        break;
      default:
        break;
    }
  }
  for (const value of resultMap.values()) {
    result.push(value);
  }
  return { characteristics: result, difficulties: diffSimple, requirements };
}

export function convertNewMapToMap(doc: BeatsaverNewBeatmap): BeatsaverBeatmap {
  const {
    characteristics,
    difficulties,
    requirements,
  } = createCharacteristicMetadata(doc);
  const data: BeatsaverBeatmap = {
    metadata: {
      bpm: doc.metadata.bpm,
      duration: doc.metadata.duration,
      songName: doc.metadata.songName,
      songSubName: doc.metadata.songSubName,
      songAuthorName: doc.metadata.songAuthorName,
      levelAuthorName: doc.metadata.levelAuthorName,
      difficulties,
      characteristics,
      requirements,
    },
    coverURL: doc.versions[0].coverURL,
    description: doc.description,
    key: doc.id,
    hash: doc.versions[0].hash,
    downloadURL: doc.versions[0].downloadURL,
    name: doc.name,
    stats: {
      // downloads: doc.stats.downloads,
      downVotes: doc.stats.downvotes,
      upVotes: doc.stats.upvotes,
      // plays: doc.stats.plays,
      rating: doc.stats.score,
    },
    uploaded: doc.uploaded,
    // directDownload: "",
  };
  return data;
}
