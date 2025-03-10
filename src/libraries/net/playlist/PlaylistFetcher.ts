import os from "os";
import path from "path";
import fs from "fs-extra";
import crypto from "crypto";
import { PlaylistLocal } from "@/libraries/playlist/PlaylistLocal";
import PlaylistLoader from "@/libraries/playlist/loader/PlaylistLoader";
import Progress from "@/libraries/common/Progress";
import BeatSaber from "@/libraries/os/beatSaber/BeatSaber";
import PlaylistFilenameExtension from "@/libraries/playlist/PlaylistFilenameExtension";
import PlaylistFormatType from "@/libraries/playlist/PlaylistFormatType";
import PlaylistScanner from "@/libraries/scanner/playlist/PlaylistScanner";
import Logger from "@/libraries/helper/Logger";

export default class PlaylistFetcher {
  public static async Fetch(
    url: string,
    progress?: Progress
  ): Promise<PlaylistLocal> {
    const randHex = crypto.randomBytes(6).toString("hex");
    const tmpFile = path.join(os.tmpdir(), `beatlist-playlist-${randHex}.json`);

    await this.download(url, fs.createWriteStream(tmpFile));

    const playlist = await PlaylistLoader.Load(tmpFile, progress, true);

    await fs.unlink(tmpFile);

    return playlist;
  }

  public static async Install(
    url: string,
    filename: string,
    format: PlaylistFormatType
  ): Promise<string> {
    const playlistFolder = await BeatSaber.getPlaylistFolder();
    const filepath = path
      .join(
        playlistFolder,
        `${filename}.${PlaylistFilenameExtension.GetFor(format)}`
      )
      .toLowerCase();
    const randHex = crypto.randomBytes(6).toString("hex");
    const tmpFile = path.join(os.tmpdir(), `beatlist-playlist-${randHex}.json`);

    // await this.download(url, fs.createWriteStream(filepath));
    let writeStream;
    try {
      writeStream = fs.createWriteStream(tmpFile);
      await this.download(url, writeStream);
    } finally {
      if (writeStream != null) {
        writeStream.close();
      }
    }
    await fs.move(tmpFile, filepath, { overwrite: true });

    new PlaylistScanner().scanOne(filepath);

    return filepath;
  }

  private static async download(url: string, writeStream: fs.WriteStream) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`unexpected response ${response.statusText}`);
    }

    const totalStr = response.headers.get("content-length");
    let total = 0;
    if (totalStr != null) {
      total = Number(totalStr);
    }

    const reader = response.body?.getReader();
    if (reader == null) {
      throw new Error(`Cannot read stream.`);
    }
    let receivedLength = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const result = await reader.read();

      if (result.done) {
        break;
      }

      receivedLength += result.value.length;
      writeStream.write(result.value);
      Logger.debug(`received: ${receivedLength} / total: ${total}`);
    }
    return Promise.resolve();
  }
}
