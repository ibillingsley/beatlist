import { AxiosInstance } from "axios";
import AxiosCachedFactory from "@/libraries/net/AxiosCachedFactory";
import fs from "fs";

const TEST = false;

export default class BeatlistRepo {
  private static readonly baseUri: string =
    "https://raw.githubusercontent.com/ibillingsley/beatlist";

  private static readonly changelogUri: string = "/master/CHANGELOG.md";

  private static readonly changelogJaUri: string = "/master/CHANGELOG-ja.md";

  private readonly rawGithubHttp: AxiosInstance;

  constructor() {
    this.rawGithubHttp = AxiosCachedFactory.getAxios(BeatlistRepo.baseUri);
  }

  public GetChangelogContent(locale: string): Promise<string | undefined> {
    if (TEST) {
      // 動作確認用
      return Promise.resolve(
        fs.readFileSync("CHANGELOG-ja.md", { encoding: "utf8" })
      );
    }
    return this.rawGithubHttp
      .get(
        locale === "ja"
          ? BeatlistRepo.changelogJaUri
          : BeatlistRepo.changelogUri
      )
      .then((response) => response.data)
      .catch(() => undefined);
  }
}
