import BeastsaberPlaylist from "@/libraries/net/bsaber/BeastsaberPlaylist";

export enum BeastsaberAPIResponseStatus {
  Success = 0,
  Failed = 1,
}

export interface BeastsaberAPIResponseBase {
  status: BeastsaberAPIResponseStatus;
}

export interface BeastsaberAPIResponseSuccess {
  status: BeastsaberAPIResponseStatus.Success;
  data: BeastsaberPlaylist[];
}

export interface BeastsaberAPIResponseFailed {
  status: BeastsaberAPIResponseStatus.Failed;
  error: string;
}

export type BeastsaberAPIResponse = BeastsaberAPIResponseBase &
  (BeastsaberAPIResponseSuccess | BeastsaberAPIResponseFailed);
