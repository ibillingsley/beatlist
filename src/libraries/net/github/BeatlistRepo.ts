import { AxiosInstance } from "axios";
import AxiosCachedFactory from "@/libraries/net/AxiosCachedFactory";

export default class BeatlistRepo {
  private static readonly baseUri: string =
    "https://raw.githubusercontent.com/ranmd9a/beatlist";

  private static readonly changelogUri: string = "/master/CHANGELOG.md";

  private static readonly changelogJaUri: string = "/develop/CHANGELOG-ja.md";

  private readonly rawGithubHttp: AxiosInstance;

  constructor() {
    this.rawGithubHttp = AxiosCachedFactory.getAxios(BeatlistRepo.baseUri);
  }

  public GetChangelogContent(locale: string): Promise<string | undefined> {
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
