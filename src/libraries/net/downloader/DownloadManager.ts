import events from "events";
import store from "@/plugins/store";
import { DownloadOperation } from "@/libraries/net/downloader/operation/DownloadOperation";
import DownloadLibrary from "@/libraries/net/downloader/DownloadLibrary";
import Logger from "@/libraries/helper/Logger";

const maxOperationInParallel = 1;
const ON_QUEUE_UPDATED = "on_queue_updated";
const PENDING_DURATION = 5 * 1000; // milliseconds

export default class DownloadManager {
  private static EventEmitter = new events.EventEmitter();

  private static pendingStart: Date | undefined;

  public static Initialize() {
    this.EventEmitter.setMaxListeners(1000);
  }

  public static AddQueue(operation: DownloadOperation) {
    DownloadLibrary.queuedOperation.push(operation);
    DownloadManager.UpdateQueue();
  }

  public static SetPending() {
    store.commit("appState/SET_DOWNLOAD_IS_PENDING", true);
    DownloadManager.pendingStart = new Date();
  }

  public static IsPending() {
    const pending = store.getters["appState/downloadIsPending"] as boolean;
    if (pending) {
      if (DownloadLibrary.queuedOperation.length > 0) {
        const now = new Date();
        if (
          DownloadManager.pendingStart != null &&
          now.getTime() - DownloadManager.pendingStart.getTime() <
            PENDING_DURATION
        ) {
          return true;
        }
      }
    }
    return false;
  }

  public static OnQueueUpdated(callback: () => void) {
    DownloadManager.EventEmitter.on(ON_QUEUE_UPDATED, callback);
  }

  public static RemoveOnQueueUpdatedListener(callback: () => void) {
    DownloadManager.EventEmitter.removeListener(ON_QUEUE_UPDATED, callback);
  }

  private static UpdateQueue() {
    Logger.debug(`CALLED UpdateQueue`, "DownloadManager");
    DownloadLibrary.completedOperation.push(
      ...DownloadLibrary.ongoingOperation.filter(
        (value: DownloadOperation) => value.isCompleted
      )
    );

    DownloadLibrary.ongoingOperation = DownloadLibrary.ongoingOperation.filter(
      (value: DownloadOperation) => !value.isCompleted
    );

    if (DownloadManager.IsPending()) {
      console.warn(`NOW PENDING`);
      setTimeout(() => {
        DownloadManager.UpdateQueue();
      }, 5 * 1000);
      return;
    }

    store.commit("appState/SET_DOWNLOAD_IS_PENDING", false);
    DownloadManager.pendingStart = undefined;

    while (
      DownloadLibrary.ongoingOperation.length < maxOperationInParallel &&
      DownloadLibrary.queuedOperation.length !== 0
    ) {
      const operation = DownloadLibrary.queuedOperation.pop();

      if (operation) {
        operation.OnCompleted(DownloadManager.UpdateQueue);
        operation.Start().then();
        DownloadLibrary.ongoingOperation.push(operation);
      }
    }

    DownloadManager.EventEmitter.emit(ON_QUEUE_UPDATED);
  }
}
