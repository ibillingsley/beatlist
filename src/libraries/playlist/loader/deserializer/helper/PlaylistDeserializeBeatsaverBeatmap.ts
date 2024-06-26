import {
  BeatsaverItem,
  BeatsaverItemInvalid,
  BeatsaverItemInvalidForPlaylist,
  BeatsaverItemValid,
} from "@/libraries/beatmap/repo/BeatsaverItem";
import {
  BeatsaverKey,
  BeatsaverKeyType,
} from "@/libraries/beatmap/repo/BeatsaverKeyType";
import Progress from "@/libraries/common/Progress";
import BeatsaverCacheManager from "@/libraries/beatmap/repo/BeatsaverCacheManager";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";

// const MAX_CONCURRENCY_ITEM = 3;

export default class PlaylistDeserializeBeatsaverBeatmap {
  public static async fromHash(
    hash: string,
    skipStore = false
  ): Promise<BeatsaverItem> {
    const k: BeatsaverKey = {
      type: BeatsaverKeyType.Hash,
      value: hash.toUpperCase(),
    };
    return BeatsaverCacheManager.forceGetCacheBeatmap(k, skipStore);
  }

  public static async fromKey(
    key: string,
    skipStore = false
  ): Promise<BeatsaverItem> {
    const k: BeatsaverKey = {
      type: BeatsaverKeyType.Key,
      value: key.toUpperCase(),
    };
    return BeatsaverCacheManager.forceGetCacheBeatmap(k, skipStore);
  }

  public static async convertOne(
    identifier: { key?: string; hash?: string },
    cacheItems: {
      key: BeatsaverKey;
      item: BeatsaverItem;
    }[]
  ) {
    // fromAny の中で store 取得を行っているので連続で convertOne を呼び出すと遅い
    const item = await this.fromAny(identifier);
    if (item != null) {
      // キャッシュ情報を作成
      cacheItems.push({
        key: {
          type: identifier.hash ? BeatsaverKeyType.Hash : BeatsaverKeyType.Key,
          value: identifier.hash
            ? identifier.hash.toUpperCase()
            : identifier.key?.toUpperCase() ?? "",
        },
        item,
      });
    } else {
      // item is null
      return undefined;
    }
    if (!item.beatmap) {
      // item is not null, but item.beatmap is null.
      const newItem: BeatsaverItemInvalidForPlaylist = {
        originalHash: identifier.hash ? identifier.hash : "",
        ...(item as BeatsaverItemInvalid),
      };
      return newItem;
    }
    // if (item != null) {
    //   return item;
    // }
    // return undefined;
    return item;
  }

  public static async convert(
    identifiers: { key?: string; hash?: string }[],
    progress: Progress
  ) {
    progress.setTotal(identifiers.length);
    const result: (BeatsaverItemValid | BeatsaverItemInvalidForPlaylist)[] = [];
    const cacheItems: {
      key: BeatsaverKey;
      item: BeatsaverItem;
    }[] = [];

    for (const identifier of identifiers) {
      // eslint-disable-next-line no-await-in-loop
      const item = await this.fromAny(identifier);
      if (item != null) {
        // キャッシュ情報を作成
        cacheItems.push({
          key: {
            type: identifier.hash
              ? BeatsaverKeyType.Hash
              : BeatsaverKeyType.Key,
            value: identifier.hash
              ? identifier.hash.toUpperCase()
              : identifier.key?.toUpperCase() ?? "",
          },
          item,
        });
      }
      if (!item?.beatmap) {
        const newItem: BeatsaverItemInvalidForPlaylist = {
          originalHash: identifier.hash ? identifier.hash : "",
          ...(item as BeatsaverItemInvalid),
        };
        progress.plusOne();
        result.push(newItem);
        // eslint-disable-next-line no-continue
        continue;
      }
      progress.plusOne();
      // return item;
      if (item != null) {
        result.push(item);
      }
    }
    if (cacheItems.length > 0) {
      BeatsaverCachedLibrary.AddAll(cacheItems);
    }
    return result;
  }

  private static async fromAny(identifier: { key?: string; hash?: string }) {
    if (identifier.hash) {
      return this.fromHash(identifier.hash, true); // store 更新はスキップ
    }
    if (identifier.key) {
      return this.fromKey(identifier.key, true); // store 更新はスキップ
    }
    return undefined;
  }
}
