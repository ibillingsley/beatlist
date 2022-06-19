import AsyncLock from "async-lock";
import { BeatsaverBeatmap } from "./BeatsaverBeatmap";
import { BeatsaverFilter } from "./BeatsaverFilter";
import BeatsaverAPI, { BeatSaverAPIResponseStatus } from "./BeatsaverAPI";
import BeatsaverUtilities from "./BeatsaverUtilities";
import BeatsaverLocker from "./BeatsaverLocker";

export interface SearchBeatmapsResult {
  error: string | undefined;
  beatmaps: BeatsaverBeatmap[] | undefined;
  totalDocs: number | undefined;
}

export interface SearchBeatmapsCache {
  cache: BeatsaverBeatmap[];
  lastPage: number;
  isLast: boolean;
}

export default class BeatsaverLibrary {
  public static locker = new AsyncLock();

  public static async searchBeatmaps(
    search: string,
    sortOrder: string,
    page: number, // 0 始まり
    itemsPerPage: number,
    dataCache: SearchBeatmapsCache,
    filters?: BeatsaverFilter // ,
  ): Promise<SearchBeatmapsResult> {
    return BeatsaverLocker.acquire(async () => {
      const start = page * itemsPerPage;
      const next = (page + 1) * itemsPerPage;
      if (dataCache.cache.length >= next + 1 || dataCache.isLast) {
        // 指定された範囲のデータがキャッシュにある、または該当のデータはないが最後まで検索済み
        console.log(
          `totalDocs: ${dataCache.isLast ? dataCache.cache.length : undefined}`
        );
        return {
          error: undefined,
          beatmaps: dataCache.cache.slice(start, next),
          totalDocs: dataCache.isLast ? dataCache.cache.length : undefined,
        };
      }

      let error;

      while (dataCache.cache.length < next + 1) {
        // 1件分先読み
        // eslint-disable-next-line no-await-in-loop
        const response = await BeatsaverAPI.Singleton.searchBeatmaps(
          search,
          sortOrder,
          // page,
          dataCache.lastPage + 1,
          filters
        );

        if (response.status === BeatSaverAPIResponseStatus.ResourceFound) {
          if (response.data.docs.length === 0) {
            // これ以上データが存在しない
            // TODO 20件未満の場合も isLast = true ではないのか？
            dataCache.isLast = true;
            break;
          }
          const keySet = new Set<string>();
          for (const beatmap of dataCache.cache) {
            const key = beatmap.key.toUpperCase();
            keySet.add(key);
          }
          for (const beatmap of response.data.docs) {
            // TODO not filter を実装
            const key = beatmap.key.toUpperCase();
            if (!keySet.has(key)) {
              // 曲が新たに登録された場合、同じ曲が再度現れることがあるのでチェックして除外
              dataCache.cache.push(beatmap);
            }
          }
        } else if (
          response.status === BeatSaverAPIResponseStatus.ResourceNotFound
        ) {
          // これ以上データが存在しない
          error = undefined;
          dataCache.isLast = true;
          break;
        }
        error = BeatsaverUtilities.ErrorToMessage(response);
        if (error != null) {
          break;
        }
        dataCache.lastPage += 1;
      }
      if (error == null) {
        return {
          error: undefined,
          beatmaps: dataCache.cache.slice(start, next),
          totalDocs: dataCache.isLast ? dataCache.cache.length : undefined,
        };
      }
      return { error, beatmaps: undefined, totalDocs: undefined };
    });
  }
}
