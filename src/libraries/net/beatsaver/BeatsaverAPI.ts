import http from "http";
import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import AxiosCachedFactory from "@/libraries/net/AxiosCachedFactory";
import BeatsaverRateLimitManager from "@/libraries/net/beatsaver/BeatsaverRateLimitManager";
import BeatsaverServerUrl from "@/libraries/net/beatsaver/BeatsaverServerUrl";
import {
  BeatsaverBeatmap,
  BeatsaverNewBeatmap,
  BeatsaverPage,
  Characteristic,
  DifficultiesSimple,
  Difficulty,
  isBeatsaverBeatmap,
} from "./BeatsaverBeatmap";

const GET_BY_HASH = "maps/hash";
const GET_BY_KEY = "maps/id";
const SEARCH = "search/text";
// const GET_BY_HOT = "maps/hot";
// const GET_BY_PLAYS = "maps/plays";
// const GET_BY_DOWNLOADS = "maps/downloads";
// const GET_BY_LATEST = "maps/latest";
// const GET_BY_RATING = "maps/rating";
export const ITEM_COUNT_PER_PAGE_OF_SEARCH = 20;

export type BeatSaverAPIResponse<T> =
  | BeatSaverAPIResponseDataFound<T>
  | BeatSaverAPIResponseDataInvalid
  | BeatSaverAPIResponseDataRateLimited
  | BeatSaverAPIResponseDataInexistent
  | BeatSaverAPIResponseDataTimeout;

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

export enum BeatSaverAPIResponseStatus {
  ResourceFound = 0, // 200
  ResourceNotFound = 1, // 404
  ResourceFoundButInvalidData = 2, // 200 but data is not what we expected
  ServerNotAvailable = 3, // the rest
  RateLimited = 4, // rate-limit-remaining headers is at 0
  Timeout = 5, // timeout
}

const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

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
    sortOrder = "Relevance",
    page: number = 0
  ): Promise<BeatSaverAPIResponse<BeatsaverPage>> {
    return this.makeRequest<BeatsaverPage>(
      `${SEARCH}/${page}?q=${search}&sortOrder=${sortOrder}`,
      undefined,
      page
    );
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
    page: number = 0
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

    await sleep(150);

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
        const newData = (answer.data as unknown) as BeatsaverNewBeatmap;
        const data = BeatsaverAPI.convertNewMapToMap(newData);
        return {
          data: Object.freeze((data as unknown) as T),
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
      for (const doc of ((answer.data as any)
        .docs as unknown) as BeatsaverNewBeatmap[]) {
        const data = BeatsaverAPI.convertNewMapToMap(doc);
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
        data: Object.freeze((page as unknown) as T),
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
    const remainingHeader = error.response?.headers["rate-limit-remaining"];
    const totalHeader = error.response?.headers["rate-limit-total"];
    let resetHeader = error.response?.headers["rate-limit-reset"];

    if (resetHeader !== undefined) {
      resetHeader = new Date(resetHeader * 1000); // sec to ms
      BeatsaverRateLimitManager.NotifyRateLimit(resetHeader);
    }

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

  private static createDifficultiesMetadata(
    doc: BeatsaverNewBeatmap
  ): DifficultiesSimple {
    const version = doc.versions[0];
    const result: DifficultiesSimple = {
      easy: false,
      normal: false,
      hard: false,
      expert: false,
      expertPlus: false,
    };
    for (const diff of version.diffs) {
      if (diff.characteristic === "Standard") {
        switch (diff.difficulty) {
          case "ExpertPlus":
            result.expertPlus = true;
            break;
          case "Expert":
            result.expert = true;
            break;
          case "Hard":
            result.hard = true;
            break;
          case "Normal":
            result.normal = true;
            break;
          case "Easy":
            result.easy = true;
            break;
          default:
            break;
        }
      }
    }
    return result;
  }

  private static createCharacteristicMetadata(
    doc: BeatsaverNewBeatmap
  ): Characteristic[] {
    const version = doc.versions[0];
    const result: Characteristic[] = [];
    const resultMap = new Map<string, Characteristic>();

    for (const diff of version.diffs) {
      const characteristicKey = diff.characteristic;
      let characteristic = resultMap.get(characteristicKey);
      if (characteristic == null) {
        characteristic = {
          name: characteristicKey,
          difficulties: {
            easy: null,
            normal: null,
            hard: null,
            expert: null,
            expertPlus: null,
          },
        };
        resultMap.set(characteristicKey, characteristic);
      }
      const diffDetail: Difficulty = {
        duration: doc.metadata.duration,
        length: diff.length,
        bombs: diff.bombs,
        notes: diff.notes,
        obstacles: diff.obstacles,
        njs: diff.njs,
        njsOffset: diff.offset,
      };
      switch (diff.difficulty) {
        case "ExpertPlus":
          characteristic.difficulties.expertPlus = diffDetail;
          break;
        case "Expert":
          characteristic.difficulties.expert = diffDetail;
          break;
        case "Hard":
          characteristic.difficulties.hard = diffDetail;
          break;
        case "Normal":
          characteristic.difficulties.normal = diffDetail;
          break;
        case "Easy":
          characteristic.difficulties.easy = diffDetail;
          break;
        default:
          break;
      }
    }
    for (const value of resultMap.values()) {
      result.push(value);
    }
    return result;
  }

  public static convertNewMapToMap(doc: BeatsaverNewBeatmap): BeatsaverBeatmap {
    const data: BeatsaverBeatmap = {
      metadata: {
        bpm: doc.metadata.bpm,
        songName: doc.metadata.songName,
        songSubName: doc.metadata.songSubName,
        songAuthorName: doc.metadata.songAuthorName,
        levelAuthorName: doc.metadata.levelAuthorName,
        difficulties: BeatsaverAPI.createDifficultiesMetadata(doc),
        characteristics: BeatsaverAPI.createCharacteristicMetadata(doc),
      },
      coverURL: doc.versions[0].coverURL,
      description: doc.description,
      key: doc.id,
      hash: doc.versions[0].hash,
      downloadURL: doc.versions[0].downloadURL,
      name: doc.name,
      stats: {
        downloads: doc.stats.downloads,
        downVotes: doc.stats.downvotes,
        upVotes: doc.stats.upvotes,
        plays: doc.stats.plays,
        rating: doc.stats.score,
      },
      uploaded: doc.uploaded,
      directDownload: "",
    };
    return data;
  }
}
