import fs from "fs-extra";
import path from "path";
import crypto from "crypto";

export default class BeatmapHashComputer {
  public static async Compute(folderPath: string): Promise<string | undefined> {
    try {
      const infoDatPath = path.join(folderPath, "info.dat");
      const infoDatStr = (await fs.readFile(infoDatPath)).toString();
      const infoDat = JSON.parse(infoDatStr);

      let binary = infoDatStr;

      for (const diffSet of infoDat._difficultyBeatmapSets) {
        for (const d of diffSet._difficultyBeatmaps) {
          binary += fs
            .readFileSync(path.join(folderPath, d._beatmapFilename))
            .toString();
        }
      }

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
        .substr(0, 5);
    } catch (error) {
      console.warn(`Get folder name hash failed: ${folderPath}`, error);
      return undefined;
    }
  }
}
