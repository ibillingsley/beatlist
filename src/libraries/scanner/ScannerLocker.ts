import Asynclock from "async-lock";

const SCAN_LOCK_KEY = "ScannerLocker";

export default class ScannerLocker {
  public static locker = new Asynclock();

  public static acquire<T>(func: () => T): Promise<T> {
    return ScannerLocker.locker.acquire(SCAN_LOCK_KEY, func, {
      timeout: 5 * 60 * 1000, // 5分待ってもロックが取得できない場合は中断
    });
  }
}
