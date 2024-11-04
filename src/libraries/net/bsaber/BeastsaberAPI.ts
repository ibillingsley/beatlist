import axios, { AxiosInstance } from "axios";
import {
  BeastsaberAPIResponse,
  BeastsaberAPIResponseStatus,
} from "@/libraries/net/bsaber/BeastsaberAPIResponse";

const API_BASE_URL = "https://api.beatsaver.com";
const PLAYLIST_API_ENDPOINT = "/playlists/latest";

export default class BeastsaberAPI {
  public static Singleton: BeastsaberAPI = new BeastsaberAPI();

  private http: AxiosInstance;

  private constructor() {
    this.http = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        // Keep only safe, standard headers
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36 Edg/90.0.818.56",
        Accept: "application/json",
        "Accept-Language": "de,de-DE;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
      },
    });
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
