import { ReqsMetadata } from "../net/beatsaver/BeatsaverBeatmap";

function getNameFor(name: string) {
  switch (name) {
    case "me":
      return "Mapping Extensions";
    case "ne":
      return "Noodle";
    case "chroma":
      return "Chroma";
    case "cinema":
      return "Cinema";
    case "vivify":
      return "Vivify";
    default:
      return undefined;
  }
}
function getShortNameFor(name: string) {
  switch (name) {
    case "me":
      return "ME";
    case "ne":
      return "NE";
    case "chroma":
      return "CR";
    case "cinema":
      return "CI";
    case "vivify":
      return "VI";
    default:
      return undefined;
  }
}

export function convertReqsMetadataToNameList(
  keys: (keyof ReqsMetadata)[],
  metadata: ReqsMetadata
) {
  const result: { key: string; enabled: boolean; name: string }[] = [];
  for (const key of keys) {
    const keyName = getNameFor(key);
    if (keyName != null) {
      result.push({
        key,
        enabled: metadata != null ? metadata[key] : false,
        name: keyName,
      });
    }
  }
  return result;
}

export function convertReqsMetadataToShortNameList(
  keys: (keyof ReqsMetadata)[],
  metadata: ReqsMetadata
) {
  const result: { key: string; enabled: boolean; shortName: string }[] = [];
  for (const key of keys) {
    const keyName = getShortNameFor(key);
    if (keyName != null) {
      result.push({
        key,
        enabled: metadata != null ? metadata[key] : false,
        shortName: keyName,
      });
    }
  }
  return result;
}
