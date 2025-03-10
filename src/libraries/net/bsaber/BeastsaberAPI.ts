import { AxiosInstance } from "axios";
import AxiosCachedFactory from "@/libraries/net/AxiosCachedFactory";
import {
  BeastsaberAPIResponse,
  BeastsaberAPIResponseStatus,
} from "@/libraries/net/bsaber/BeastsaberAPIResponse";

const API_BASE_URL = "https://api.beatsaver.com";
const PLAYLIST_API_ENDPOINT = "/playlists/search/0?sortOrder=Latest"; // playlists/latest includes empty playlists

export default class BeastsaberAPI {
  public static Singleton: BeastsaberAPI = new BeastsaberAPI();

  private http: AxiosInstance;

  private constructor() {
    this.http = AxiosCachedFactory.getAxios(API_BASE_URL);
  }

  public async GetPlaylists(): Promise<BeastsaberAPIResponse> {
    try {
      const res = await this.http.get(PLAYLIST_API_ENDPOINT);
      return {
        status: BeastsaberAPIResponseStatus.Success,
        data: res.data,
      };
    } catch (e) {
      return {
        status: BeastsaberAPIResponseStatus.Failed,
        error: "Request failed",
      };
    }
  }
}
