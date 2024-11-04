import fs from "fs-extra";
import {
  DownloadUnitProgress,
  DownloadUnitProgressFactory,
} from "@/libraries/net/downloader/DownloadUnitProgress";
import DownloadManager from "@/libraries/net/downloader/DownloadManager";
import Utilities from "@/libraries/helper/Utilities";

export default class DownloadUnit {
  public static TimeoutMs = 10 * 1e3;

  private onCompletedListener: () => void = () => {};

  private onErrorListener: (error: Error) => void = () => {};

  private readonly progress: DownloadUnitProgress;

  public constructor(progress?: DownloadUnitProgress) {
    this.progress = progress ?? DownloadUnitProgressFactory();
  }

  public async Start(url: string, stream: fs.WriteStream) {
    try {
      this.SetProgressStartAt();

      const res = await fetch(url, {
        headers: {
          authority: "beatsaver.com",
          pragma: "no-cache",
          "cache-control": "no-cache",
          "sec-ch-ua":
            '" Not A;Brand";v="99", "Chromium";v="90", "Microsoft Edge";v="90"',
          "sec-ch-ua-mobile": "?0",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36 Edg/90.0.818.56",
          accept: "*/*",
          "sec-fetch-site": "same-origin",
          "sec-fetch-mode": "cors",
          "sec-fetch-dest": "empty",
          "accept-language": "de,de-DE;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
          dnt: "1",
          "sec-gpc": "1",
        },
      });

      if (!res.ok) {
        console.warn(
          `Response is not ok. status: ${res.status}, statusText: ${res.statusText}`
        );
        if (res.status === 429) {
          // Rate limit error
          DownloadManager.SetPending();
        }
        throw new Error(res.statusText || "Download failed.");
      }
      this.SetProgressTotalHeader(res);

      const reader = res.body?.getReader();
      if (reader == null) {
        throw new Error(`Cannot read stream.`);
      }
      let receivedLength = 0;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const result = await reader.read();

        if (result.done) {
          this.onCompletedListener();
          this.UpdateProgress();
          break;
        }

        receivedLength += result.value.length;
        this.progress.bytes.received = receivedLength;
        this.UpdateProgress();
        stream.write(result.value);
      }
    } catch (error) {
      console.error(error);
      // this.onErrorListener(error);
      this.onErrorListener(Utilities.unknownToError(error));
    }
  }

  public ClearListener() {
    this.onCompletedListener = () => {};
    this.onErrorListener = () => {};
  }

  public onCompleted(listener: () => void) {
    // 追加ではなく上書き
    this.onCompletedListener = listener;
  }

  public onError(listener: (error: Error) => void) {
    // 追加ではなく上書き
    this.onErrorListener = listener;
  }

  private SetProgressTotalHeader(response: Response) {
    const total = Number(response.headers.get("content-length")) || undefined;

    if (total) {
      this.progress.bytes.total = total;
    }
  }

  private SetProgressStartAt() {
    this.progress.time.startedAt = new Date().getTime();
  }

  private UpdateProgress() {
    if (!this.progress) {
      return;
    }

    if (this.progress.bytes.total !== 0) {
      this.progress.bytes.percent =
        this.progress.bytes.received / this.progress.bytes.total;
    }

    const elapsedTimeMs = new Date().getTime() - this.progress.time.startedAt;
    this.progress.bytes.speed = this.progress.bytes.received / elapsedTimeMs;

    const missingBytesAmount =
      this.progress.bytes.total - this.progress.bytes.received;
    this.progress.time.remaining =
      missingBytesAmount / this.progress.bytes.speed;
  }
}
