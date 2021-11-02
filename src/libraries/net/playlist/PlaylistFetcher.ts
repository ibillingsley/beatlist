import os from "os";
import path from "path";
import fs from "fs-extra";
import fetch from "node-fetch";
import { PlaylistLocal } from "@/libraries/playlist/PlaylistLocal";
import PlaylistLoader from "@/libraries/playlist/loader/PlaylistLoader";
import Progress from "@/libraries/common/Progress";
import util from "util";
import stream from "stream";
import crypto from "crypto";
import BeatSaber from "@/libraries/os/beatSaber/BeatSaber";
import PlaylistFilenameExtension from "@/libraries/playlist/PlaylistFilenameExtension";
import PlaylistFormatType from "@/libraries/playlist/PlaylistFormatType";
import PlaylistScanner from "@/libraries/scanner/playlist/PlaylistScanner";

const streamPipeline = util.promisify(stream.pipeline);

export default class PlaylistFetcher {
  public static async Fetch(
    url: string,
    progress?: Progress
  ): Promise<PlaylistLocal> {
    const extension = url.split(".").slice(-1)[0] ?? ".json";
    const randHex = crypto.randomBytes(6).toString("hex");
    const tmpFile = path.join(
      os.tmpdir(),
      `beatlist-playlist-${randHex}.${extension}`
    );

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
    const extension = url.split(".").slice(-1)[0] ?? ".json";
    const randHex = crypto.randomBytes(6).toString("hex");
    const tmpFile = path.join(
      os.tmpdir(),
      `beatlist-playlist-${randHex}.${extension}`
    );

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

  private static async download(url: string, writeStream: stream.Writable) {
    const response = await fetch(url);

    if (!response.ok)
      throw new Error(`unexpected response ${response.statusText}`);

    return streamPipeline(response.body, writeStream);
  }
}
