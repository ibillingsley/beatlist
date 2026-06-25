import fs from "fs-extra";
import path from "path";
import crypto from "crypto";

export default class BeatmapHashComputer {
  public static async Compute(folderPath: string): Promise<string | undefined> {
    try {
      const infoDatPath = path.join(folderPath, "info.dat");
      const infoDatStr = (await fs.readFile(infoDatPath)).toString();
      const infoDat = JSON.parse(infoDatStr);
      const v4 = infoDat.version?.startsWith("4.");
      const filenames: string[] = [];

      if (v4) {
        filenames.push(infoDat.audio.audioDataFilename);
        for (const d of infoDat.difficultyBeatmaps) {
          if (d.beatmapDataFilename) filenames.push(d.beatmapDataFilename);
          if (d.lightshowDataFilename) filenames.push(d.lightshowDataFilename);
        }
      } else {
        for (const diffSet of infoDat._difficultyBeatmapSets) {
          for (const d of diffSet._difficultyBeatmaps) {
            filenames.push(d._beatmapFilename);
          }
        }
      }

      const fileStr = await Promise.all(
        filenames.map((name) =>
          fs.readFile(path.join(folderPath, name)).then((buf) => buf.toString())
        )
      );

      const binary = [infoDatStr].concat(fileStr).join("");

      return crypto
        .createHash("sha1")
        .update(binary)
        .digest("hex")
        .toUpperCase();
    } catch (e) {
      return undefined;
    }
  }

  public static getFolderNameHash(folderPath: string) {
    if (folderPath == null) {
      return undefined;
    }
    try {
      const { base } = path.parse(folderPath);
      return crypto
        .createHash("sha1")
        .update(base.toLowerCase())
        .digest("hex")
        .substring(0, 5);
    } catch (error) {
      console.warn(`Get folder name hash failed: ${folderPath}`, error);
      return undefined;
    }
  }
}
