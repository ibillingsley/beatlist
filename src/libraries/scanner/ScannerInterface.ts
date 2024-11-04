import { ProgressInterface } from "@/libraries/common/Progress";
import { BeatsaverItemInvalid } from "../beatmap/repo/BeatsaverItem";

export interface ScannerResultInterface {
  anyChange(): boolean;

  toString(): string;
}

export interface ScannerInterface<T> {
  scanAll(
    progress?: ProgressInterface,
    forceUpdate?: boolean,
    retryTargetItems?: BeatsaverItemInvalid[]
  ): Promise<ScannerResultInterface>;

  scanOne(path: string): Promise<T>;

  result: ScannerResultInterface;
}
