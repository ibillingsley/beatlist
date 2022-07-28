import store from "@/plugins/store";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";
import {
  BeatsaverKey,
  toStrKey,
  BeatsaverKeyType,
} from "@/libraries/beatmap/repo/BeatsaverKeyType";
import BeatsaverCacheManager from "@/libraries/beatmap/repo/BeatsaverCacheManager";
import { BeatsaverItem } from "@/libraries/beatmap/repo/BeatsaverItem";

async function ReloadBeatsaverCache() {
  const beatmaps = BeatmapLibrary.GetAllValidMap();
  const validCache = BeatsaverCachedLibrary.GetAllValid();
  const invalidCache = BeatsaverCachedLibrary.GetAllInvalid();

  const targetKeys: BeatsaverKey[] = [];
  for (const beatmap of beatmaps) {
    const hash = beatmap.hash?.toUpperCase();
    if (hash == null) {
      // eslint-disable-next-line no-continue
      continue;
    }
    if (validCache.has(hash)) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const beatsaverKey: BeatsaverKey = {
      type: BeatsaverKeyType.Hash,
      value: hash,
    };
    const keyStr = toStrKey(beatsaverKey);
    if (!invalidCache.has(keyStr)) {
      targetKeys.push(beatsaverKey);
    }
  }
  if (targetKeys.length > 0) {
    const notCachedItems: {
      key: BeatsaverKey;
      item: BeatsaverItem;
    }[] = [];
    for (const beatsaverKey of targetKeys) {
      // eslint-disable-next-line no-await-in-loop
      const item = await BeatsaverCacheManager.forceGetCacheBeatmap(
        beatsaverKey,
        true
      );
      console.log(item);
      notCachedItems.push({ key: beatsaverKey, item });
    }
    BeatsaverCachedLibrary.AddAll(notCachedItems);
  }
}

function ClearPlaylistCache() {
  store.commit("playlist/SET_PLAYLISTS", []);
}

export default async (clearPlaylistCache: boolean) => {
  await ReloadBeatsaverCache();
  if (clearPlaylistCache) {
    ClearPlaylistCache();
  }
};
