import fs from "fs-extra";
import {
  BeatsaverKey,
  BeatsaverKeyType,
  toStrKey,
} from "@/libraries/beatmap/repo/BeatsaverKeyType";
import {
  BeatsaverItem,
  BeatsaverItemInvalid,
  BeatsaverItemValid,
} from "@/libraries/beatmap/repo/BeatsaverItem";
import store from "@/plugins/store";
import {
  BeatsaverNewBeatmap,
  convertNewMapToMap,
} from "@/libraries/net/beatsaver/BeatsaverBeatmap";

const CACHE_FILES_DIR = "resources/cache";

export default class BeatsaverCachedLibrary {
  static beatsaverCache = new Map<string, BeatsaverItemValid>();

  static beatsaverCacheKeyToIndex = new Map<string, string>();

  public static Add(hash: string, item: BeatsaverItemValid) {
    store.commit("beatmap/setBeatsaverCached", { hash, item });
  }

  public static AddAll(
    items: {
      key: BeatsaverKey;
      item: BeatsaverItem;
    }[]
  ) {
    store.commit("beatmap/addAllBeatsaverCached", { items });
  }

  public static AddInvalid(key: BeatsaverKey, item: BeatsaverItemInvalid) {
    store.commit("beatmap/addBeatsaverCachedInvalid", { key, item });
  }

  public static async LoadAll() {
    /*
    store
      .dispatch("beatmap/loadBeatmapsAsCache")
      .then(() => {
        return Promise.resolve();
      })
      .catch((error) => {
        return Promise.reject(error);
      });
    */
    if (!fs.existsSync(CACHE_FILES_DIR)) {
      console.log(`no cache directory.`);
      return;
    }

    const files = fs.readdirSync(CACHE_FILES_DIR, { withFileTypes: true });
    const fileNames = files
      .filter(
        (dirent) =>
          dirent.isFile() && dirent.name.match(/^beatsaverCache[0-9]+\.json$/)
      )
      .map((dirent) => dirent.name);

    for (const fileName of fileNames) {
      const beatmaps = JSON.parse(
        // eslint-disable-next-line no-await-in-loop
        await fs.readFile(`${CACHE_FILES_DIR}/${fileName}`, {
          encoding: "utf8",
        })
      ) as BeatsaverNewBeatmap[];
      for (const newBeatmap of beatmaps) {
        const beatmap = convertNewMapToMap(newBeatmap);
        const hash = beatmap.hash.toUpperCase();
        const validMap = {
          beatmap,
          loadState: {
            valid: true,
            attemptedSource: {
              type: BeatsaverKeyType.Hash,
              value: hash,
            },
          },
        } as BeatsaverItemValid;
        BeatsaverCachedLibrary.beatsaverCache.set(hash, validMap);
        BeatsaverCachedLibrary.beatsaverCacheKeyToIndex.set(
          beatmap.key.toUpperCase(),
          hash
        );
        /*
          context.state.beatsaverKeyToHashIndex.set(
            beatmap.key.toUpperCase(),
            hash
          );
          */
      }
    }
  }

  public static Exist(key: BeatsaverKey) {
    return BeatsaverCachedLibrary.Get(key) !== undefined;
  }

  public static GetByKey(key: string): BeatsaverItem | undefined {
    const hash =
      this.GetKeyToHashIndex().get(key) ??
      BeatsaverCachedLibrary.beatsaverCacheKeyToIndex.get(key);

    return (
      (hash ? this.GetByHash(hash) : undefined) ??
      this.GetAllInvalid().get(
        toStrKey({
          type: BeatsaverKeyType.Key,
          value: key,
        })
      )
    );
  }

  public static GetByHash(hash: string): BeatsaverItem | undefined {
    hash = hash.toUpperCase();

    const beatmap =
      BeatsaverCachedLibrary.GetAllValid().get(hash) ??
      BeatsaverCachedLibrary.GetAllInvalid().get(
        toStrKey({
          type: BeatsaverKeyType.Hash,
          value: hash,
        })
      );
    if (beatmap?.beatmap?.coverURL.startsWith("/cdn/")) {
      beatmap.beatmap.coverURL = `https://cdn.beatsaver.com/${hash.toLowerCase()}.jpg`;
    }
    return beatmap;
    // return (
    //   BeatsaverCachedLibrary.GetAllValid().get(hash) ??
    //   BeatsaverCachedLibrary.GetAllInvalid().get(
    //     toStrKey({
    //       type: BeatsaverKeyType.Hash,
    //       value: hash,
    //     })
    //   )
    // );
  }

  public static GetAllValid(): Map<string, BeatsaverItemValid> {
    const result = new Map(BeatsaverCachedLibrary.beatsaverCache);
    const storedCache = store.getters["beatmap/beatsaverCached"] as Map<
      string,
      BeatsaverItemValid
    >;
    for (const key of storedCache.keys()) {
      const value = storedCache.get(key);
      if (value != null) {
        result.set(key, value);
      }
    }
    return result;
    // return store.getters["beatmap/beatsaverCached"];
  }

  public static GetAllInvalid(): Map<string, BeatsaverItemInvalid> {
    return store.getters["beatmap/beatsaverFailCached"];
  }

  public static GetCacheLastUpdated() {
    return store.getters["beatmap/beatsaverCacheUpdated"];
  }

  public static Get(key: BeatsaverKey) {
    switch (key.type) {
      case BeatsaverKeyType.Hash:
        return BeatsaverCachedLibrary.GetByHash(key.value);
      case BeatsaverKeyType.Key:
        return BeatsaverCachedLibrary.GetByKey(key.value);
      default:
        throw new Error("Unexpected key type");
    }
  }

  public static UpdateOne(item: BeatsaverItem) {
    if (item.beatmap === undefined || !item.loadState.valid) {
      return;
    }

    this.Add(item.beatmap.hash, item);
  }

  public static ClearCache() {
    store.commit("beatmap/clearBeatsaverCache");
  }

  public static RemoveInvalid(key: BeatsaverKey | BeatsaverKey[]) {
    store.commit("beatmap/removeBeatsaverCachedInvalid", { key });
  }

  private static GetKeyToHashIndex(): Map<string, string> {
    return store.getters["beatmap/beatsaverKeyToHashIndex"];
  }
}
