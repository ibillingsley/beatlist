import http from "http";
import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import AxiosCachedFactory from "@/libraries/net/AxiosCachedFactory";
import BeatsaverRateLimitManager from "@/libraries/net/beatsaver/BeatsaverRateLimitManager";
import BeatsaverServerUrl from "@/libraries/net/beatsaver/BeatsaverServerUrl";
import Utilities from "@/libraries/helper/Utilities";
import {
  BeatsaverBeatmap,
  BeatsaverNewBeatmap,
  BeatsaverPage,
  convertNewMapToMap,
  isBeatsaverBeatmap,
} from "./BeatsaverBeatmap";
import { BeatsaverFilter } from "./BeatsaverFilter";

const GET_BY_HASH = "maps/hash";
const GET_BY_KEY = "maps/id";
const SEARCH = "search/text";
// const GET_BY_HOT = "maps/hot";
// const GET_BY_PLAYS = "maps/plays";
// const GET_BY_DOWNLOADS = "maps/downloads";
// const GET_BY_LATEST = "maps/latest";
// const GET_BY_RATING = "maps/rating";
export const ITEM_COUNT_PER_PAGE_OF_SEARCH = 20;

export enum BeatSaverAPIResponseStatus {
  ResourceFound = 0, // 200
  ResourceNotFound = 1, // 404
  ResourceFoundButInvalidData = 2, // 200 but data is not what we expected
  ServerNotAvailable = 3, // the rest
  RateLimited = 4, // rate-limit-remaining headers is at 0
  Timeout = 5, // timeout
}

export interface BeatSaverAPIResponseDataFound<T> {
  status: BeatSaverAPIResponseStatus.ResourceFound;
  data: T;
}

export interface BeatSaverAPIResponseDataInvalid {
  status: BeatSaverAPIResponseStatus.ResourceFoundButInvalidData;
  rawData: any;
}

export interface BeatSaverAPIResponseDataRateLimited {
  status: BeatSaverAPIResponseStatus.RateLimited;
  remaining: number | undefined;
  resetAt: Date | undefined;
  total: number | undefined;
}

export interface BeatSaverAPIResponseDataInexistent {
  status:
    | BeatSaverAPIResponseStatus.ResourceNotFound
    | BeatSaverAPIResponseStatus.ServerNotAvailable;
  statusCode: number;
  statusMessage: string;
}

export interface BeatSaverAPIResponseDataTimeout {
  status: BeatSaverAPIResponseStatus.Timeout;
}

export type BeatSaverAPIResponse<T> =
  | BeatSaverAPIResponseDataFound<T>
  | BeatSaverAPIResponseDataInvalid
  | BeatSaverAPIResponseDataRateLimited
  | BeatSaverAPIResponseDataInexistent
  | BeatSaverAPIResponseDataTimeout;

export default class BeatsaverAPI {
  public static Singleton: BeatsaverAPI = new BeatsaverAPI();

  public http: AxiosInstance;

  public constructor() {
    this.http = AxiosCachedFactory.getAxios(BeatsaverServerUrl.Beatsaver);
  }

  public async getBeatmapByHash(
    hash: string
  ): Promise<BeatSaverAPIResponse<BeatsaverBeatmap>> {
    return this.makeRequest<BeatsaverBeatmap>(
      `${GET_BY_HASH}/${hash}`,
      isBeatsaverBeatmap
    );
  }

  public async getBeatmapByKey(
    key: string
  ): Promise<BeatSaverAPIResponse<BeatsaverBeatmap>> {
    return this.makeRequest<BeatsaverBeatmap>(
      `${GET_BY_KEY}/${key}`,
      isBeatsaverBeatmap
    );
  }

  public async searchBeatmaps(
    search: string,
    sortOrder: string,
    page: number,
    filters?: BeatsaverFilter
  ): Promise<BeatSaverAPIResponse<BeatsaverPage>> {
    const query: string[] = [];
    if (filters?.ai) {
      query.push(`automapper=true`);
    }
    if (filters?.ranked) {
      query.push(`ranked=true`);
    }
    if (filters?.curated) {
      query.push(`curated=true`);
    }
    if (filters?.verified) {
      query.push(`verified=true`);
    }
    if (filters?.fs) {
      query.push(`fullSpread=true`);
    }
    const extraFilters: (keyof BeatsaverFilter)[] = [
      "chroma",
      "noodle",
      "me",
      "cinema",
      "vivify",
    ];
    for (const extraFilter of extraFilters) {
      if (filters != null && filters[extraFilter]) {
        query.push(`${extraFilter}=true`);
      }
    }
    if (filters?.minNps != null) {
      query.push(`minNps=${filters.minNps}`);
    }
    if (filters?.maxNps != null) {
      query.push(`maxNps=${filters.maxNps}`);
    }
    if (filters?.minDate != null) {
      query.push(`from=${filters.minDate.toISOString().substring(0, 10)}`);
    }
    if (filters?.maxDate != null) {
      query.push(`to=${filters.maxDate.toISOString().substring(0, 10)}`);
    }
    let path = `${SEARCH}/${page}?q=${search ?? ""}&sortOrder=${sortOrder}`;
    if (query.length > 0) {
      path += `&${query.join("&")}`;
    }
    return this.makeRequest<BeatsaverPage>(path, undefined, page);
  }

  //   public async getByHot(
  //     page: number = 0
  //   ): Promise<BeatSaverAPIResponse<BeatsaverPage>> {
  //     return this.makeRequest<BeatsaverPage>(`${GET_BY_HOT}/${page}`);
  //   }

  //   public async getByPlays(
  //     page: number = 0
  //   ): Promise<BeatSaverAPIResponse<BeatsaverPage>> {
  //     return this.makeRequest<BeatsaverPage>(`${GET_BY_PLAYS}/${page}`);
  //   }

  //   public async getByDownloads(
  //     page: number = 0
  //   ): Promise<BeatSaverAPIResponse<BeatsaverPage>> {
  //     return this.makeRequest<BeatsaverPage>(`${GET_BY_DOWNLOADS}/${page}`);
  //   }

  public async getByLatest(
    page = 0
  ): Promise<BeatSaverAPIResponse<BeatsaverPage>> {
    return this.makeRequest<BeatsaverPage>(
      `${SEARCH}/${page}?sortOrder=Latest`,
      undefined,
      page
    );
  }

  //   public async getByRating(
  //     page: number = 0
  //   ): Promise<BeatSaverAPIResponse<BeatsaverPage>> {
  //     return this.makeRequest<BeatsaverPage>(`${GET_BY_RATING}/${page}`);
  //   }

  public updateBaseUrl(baseUrl: BeatsaverServerUrl) {
    console.log(`updateBaseUrl: ${baseUrl}`);
    this.http = AxiosCachedFactory.getAxios(baseUrl);
  }

  private async makeRequest<T>(
    apiPath: string,
    validation?: (data: any) => boolean,
    targetPageNumber?: number
  ): Promise<BeatSaverAPIResponse<T>> {
    if (BeatsaverRateLimitManager.HasHitRateLimit()) {
      return BeatsaverAPI.RateLimitedAnswer<T>();
    }

    await Utilities.sleep(150);

    return this.http
      .get(apiPath, {
        validateStatus: (status: number) => status === 200,
      })
      .then((answer) =>
        BeatsaverAPI.handleResourceFoundCase<T>(
          validation,
          answer,
          targetPageNumber
        )
      )
      .catch((error: AxiosError) =>
        BeatsaverAPI.handleResourceNotFoundCase<T>(error)
      );
  }

  private static handleResourceFoundCase<T>(
    validation: ((data: any) => boolean) | undefined,
    answer: AxiosResponse<T>,
    targetPageNumber?: number
  ) {
    let valid = true;
    if (validation !== undefined) {
      valid = validation(answer.data);
      if (!valid) {
        // 新APIの応答に対して isBeatsaverBeatmap は false になる。
        // TODO validation の意味がないので、isBeatsaverNewBeatmap を定義して if (valid) { に修正すべき。
        const newData = answer.data as unknown as BeatsaverNewBeatmap;
        const data = convertNewMapToMap(newData);
        return {
          data: Object.freeze(data as unknown as T),
          status: BeatSaverAPIResponseStatus.ResourceFound,
        } as BeatSaverAPIResponse<T>;
      }
    }

    if (valid) {
      const page: BeatsaverPage = {
        docs: [],
        lastPage: 1,
        prevPage: null,
        nextPage: null,
        totalDocs: Number.MAX_SAFE_INTEGER, // API の response にないので INTEGER の最大値
      };
      for (const doc of (answer.data as any)
        .docs as unknown as BeatsaverNewBeatmap[]) {
        const data = convertNewMapToMap(doc);
        page.docs.push(data);
      }
      if (
        targetPageNumber != null &&
        page.docs.length < ITEM_COUNT_PER_PAGE_OF_SEARCH
      ) {
        page.totalDocs =
          targetPageNumber * ITEM_COUNT_PER_PAGE_OF_SEARCH + page.docs.length;
      }
      return {
        // data: Object.freeze(answer.data as T),
        data: Object.freeze(page as unknown as T),
        status: BeatSaverAPIResponseStatus.ResourceFound,
      } as BeatSaverAPIResponse<T>;
    }

    return {
      status: BeatSaverAPIResponseStatus.ResourceFoundButInvalidData,
      rawData: answer.data,
    } as BeatSaverAPIResponse<T>;
  }

  private static handleResourceNotFoundCase<T>(error: AxiosError) {
    if (error.response?.status === 429) {
      return BeatsaverAPI.handleRateLimitedCase<T>(error);
    }

    if (error.code === "ECONNABORTED") {
      return BeatsaverAPI.handleTimeoutCase<T>();
    }

    return {
      status:
        error.response?.status === 404
          ? BeatSaverAPIResponseStatus.ResourceNotFound
          : BeatSaverAPIResponseStatus.ServerNotAvailable,
      statusCode: error.response?.status,
      statusMessage: error.response
        ? http.STATUS_CODES[error.response.status]
        : "",
    } as BeatSaverAPIResponse<T>;
  }

  private static handleRateLimitedCase<T>(error: AxiosError) {
    // background.ts で応答に access-control-allow-origin: "*",
    // Access-Control-Expose-Headers: "rate-limit-remaining, rate-limit-total, rate-limit-reset"
    // を追加しているが、2021/08/13時点では beatsaver.com からの応答ヘッダーにそれらは含まれていない。
    const remainingHeader = error.response?.headers["rate-limit-remaining"];
    const totalHeader = error.response?.headers["rate-limit-total"];
    const resetHeader = error.response?.headers["rate-limit-reset"];
    let resetDate: Date;

    if (resetHeader != null) {
      try {
        const resetValue = Number.parseInt(resetHeader, 10);
        if (Number.isNaN(resetValue)) {
          resetDate = new Date(new Date().getTime() + 5000);
        } else {
          resetDate = new Date(resetValue * 1000); // sec to ms
        }
      } catch (e) {
        resetDate = new Date(new Date().getTime() + 5000);
      }
    } else {
      // 上記 rate-limit-reset ヘッダーがなくても、429 が返されたことに変わりはないので 5秒間リクエストを遮断する。
      resetDate = new Date(new Date().getTime() + 5000);
    }
    BeatsaverRateLimitManager.NotifyRateLimit(resetDate); // ここで通知した日時が過ぎるまでリクエストは遮断される

    return {
      status: BeatSaverAPIResponseStatus.RateLimited,
      remaining: remainingHeader,
      resetAt: resetHeader,
      total: totalHeader,
    } as BeatSaverAPIResponse<T>;
  }

  private static handleTimeoutCase<T>() {
    return {
      status: BeatSaverAPIResponseStatus.Timeout,
    } as BeatSaverAPIResponse<T>;
  }

  private static RateLimitedAnswer<T>() {
    return {
      status: BeatSaverAPIResponseStatus.RateLimited,
      remaining: 0,
      resetAt: BeatsaverRateLimitManager.GetResetDate(),
      total: undefined,
    } as BeatSaverAPIResponse<T>;
  }
}
