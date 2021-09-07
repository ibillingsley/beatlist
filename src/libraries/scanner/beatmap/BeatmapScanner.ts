// import * as Throttle from "promise-parallel-throttle";
import BeatSaber from "@/libraries/os/beatSaber/BeatSaber";
import { computeDifference, Differences } from "@/libraries/common/Differences";
import Progress from "@/libraries/common/Progress";
import BeatmapScannerResult from "@/libraries/scanner/beatmap/BeatmapScannerResult";
import { ScannerInterface } from "@/libraries/scanner/ScannerInterface";
import ScannerLocker from "@/libraries/scanner/ScannerLocker";
import BeatsaverCacheManager from "@/libraries/beatmap/repo/BeatsaverCacheManager";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import {
  BeatsaverKey,
  BeatsaverKeyType,
} from "@/libraries/beatmap/repo/BeatsaverKeyType";
import {
  BeatsaverItem,
  BeatsaverItemInvalid,
} from "@/libraries/beatmap/repo/BeatsaverItem";
import { BeatmapLocal } from "@/libraries/beatmap/BeatmapLocal";
import BeatmapLoader from "@/libraries/beatmap/BeatmapLoader";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";

export default class BeatmapScanner implements ScannerInterface<BeatmapLocal> {
  public result: BeatmapScannerResult = new BeatmapScannerResult();

  public async scanAll(
    progress: Progress = new Progress(),
    retryTargetItems: BeatsaverItemInvalid[] = []
  ): Promise<BeatmapScannerResult> {
    return ScannerLocker.acquire(async () => {
      const diff = await BeatmapScanner.GetTheDifferenceInPath();

      // 削除されたディレクトリのキャッシュを破棄
      BeatmapLibrary.RemoveBeatmapByPaths(diff.removed);

      this.result.removedItems = diff.removed.length;
      this.result.keptItems = diff.kept.length;
      diff.removed = []; // 件数しか使用しないので早めに破棄
      diff.kept = []; // 件数しか使用しないので早めに破棄

      progress.setTotal(diff.added.length + retryTargetItems.length);

      // 追加された曲
      this.result.newItems = [];
      const notCached: string[] = [];
      let addedBeatmapList: BeatmapLocal[] = [];
      // Scan added beatmaps under the CustomLevels directory
      for (let i = 0; i < diff.added.length; i += 25) {
        const addedPaths = diff.added.slice(i, i + 25);
        const addedBeatmapPromise = addedPaths.map(
          (path: string) => BeatmapLoader.Load(path, true) // Promise の配列を返す。beatsaver.com への問い合わせはスキップ。
        );
        // eslint-disable-next-line no-await-in-loop
        const addedBeatmaps = await Promise.all(addedBeatmapPromise); // 最大25件分、非同期で実行し完了を待機
        addedBeatmapList = addedBeatmapList.concat(addedBeatmaps);
        if (addedBeatmapList.length >= 1000) {
          // store への登録は 1000件単位
          BeatmapLibrary.AddBeatmaps(addedBeatmapList);
          addedBeatmapList = [];
        }
        for (const beatmap of addedBeatmaps) {
          // BeatmapLibrary.AddBeatmap(beatmap);
          if (!beatmap.loadState.valid || beatmap.hash == null) {
            // 読み込めなかった or HASHが計算できなかった beatmapLocal は beatsaver API を呼ばないのでカウントアップ
            progress.plusOne();
          } else {
            const existingBeatmap = BeatsaverCachedLibrary.Get({
              type: BeatsaverKeyType.Hash,
              value: beatmap.hash,
            });
            if (existingBeatmap?.beatmap != null) {
              // キャッシュがすでにある beatmapLocal は beatsaver API を呼ばないのでカウントアップ
              // TODO 404 エラーは再度問い合わせ不要か？
              progress.plusOne();
            } else {
              notCached.push(beatmap.hash);
            }
          }
        }
        this.result.newItems = this.result.newItems.concat(addedBeatmaps);
      }
      if (addedBeatmapList.length > 0) {
        BeatmapLibrary.AddBeatmaps(addedBeatmapList);
        addedBeatmapList = [];
      }
      // Get an information of not cached beatmaps from beatsaver.com in order.
      console.log(
        `not cached: ${notCached.length} item(s). retry target: ${retryTargetItems.length} item(s).`
      );
      const notCachedItems: {
        key: BeatsaverKey;
        item: BeatsaverItem;
      }[] = [];
      for (const hash of notCached.concat(
        retryTargetItems.map((value) =>
          value.loadState.attemptedSource.value.toUpperCase()
        )
      )) {
        const beatsaverKey: BeatsaverKey = {
          type: BeatsaverKeyType.Hash,
          value: hash,
        };
        // eslint-disable-next-line no-await-in-loop
        const item = await BeatsaverCacheManager.forceGetCacheBeatmap(
          beatsaverKey,
          true
        );
        notCachedItems.push({ key: beatsaverKey, item });
        progress.plusOne();
      }
      BeatsaverCachedLibrary.AddAll(notCachedItems);
      //   // エラーが発生した場合の考慮が足りない？
      //   this.result.newItems = await Throttle.all(
      //     diff.added.map((path: string) => () =>
      //       // BeatmapLoader.Load() はエラーになることがないようにした(つもり)。
      //       BeatmapLoader.Load(path).then((beatmap: BeatmapLocal) => {
      //         progress.plusOne();
      //         BeatmapLibrary.AddBeatmap(beatmap);
      //         return beatmap;
      //       })
      //     ),
      //     { maxInProgress: 25 }
      //   );

      // this.result.removedItems = diff.removed.length;
      // this.result.keptItems = diff.kept.length;

      // const allBeatmaps = this.ReassembleAllBeatmap(diff);
      // BeatmapLibrary.UpdateAllMaps(allBeatmaps);

      return this.result;
    });
  }

  public async scanOne(path: string): Promise<BeatmapLocal> {
    return ScannerLocker.acquire(async () => {
      const beatmap = await BeatmapLoader.Load(path);
      BeatmapLibrary.AddBeatmap(beatmap);

      this.result.newItems = [beatmap];
      return beatmap;
    });
  }

  private static async GetTheDifferenceInPath(): Promise<Differences<string>> {
    const currentPaths = (
      await BeatSaber.getAllSongFolderPath()
    )?.map((path: string) => path.toLowerCase());

    const oldPaths = BeatmapLibrary.GetAllMaps().map((beatmap: BeatmapLocal) =>
      beatmap.folderPath.toLowerCase()
    );

    return computeDifference(oldPaths, currentPaths);
  }

  //   private ReassembleAllBeatmap(diff: Differences<string>): BeatmapLocal[] {
  //     const existingBeatmap = BeatmapLibrary.GetAllMaps().filter(
  //       (beatmap: BeatmapLocal) =>
  //         diff.kept.find((path: string) => beatmap.folderPath === path)
  //     );

  //     return this.result.newItems.concat(existingBeatmap);
  //   }
}
