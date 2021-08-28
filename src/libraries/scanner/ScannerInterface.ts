import { ProgressInterface } from "@/libraries/common/Progress";
import { BeatsaverItemInvalid } from "../beatmap/repo/BeatsaverItem";

export interface ScannerInterface<T> {
  scanAll(
    progress?: ProgressInterface,
    retryTargetItems?: BeatsaverItemInvalid[]
  ): Promise<ScannerResultInterface>;

  scanOne(path: string): Promise<T>;

  result: ScannerResultInterface;
}

export interface ScannerResultInterface {
  anyChange(): boolean;

  toString(): string;
}
