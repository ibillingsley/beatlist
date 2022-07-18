export enum BeatmapsTableHeadersTemplate {
  Text = "Text",
  Cover = "Cover",
  Difficulties = "Difficulties",
  Playlists = "Playlists",
  StrToDate = "StrToDate",
  StrToDateLocal = "StrToDateLocal",
  TextTooltip = "TextTooltip",
  BeatmapName = "BeatmapName",
  Rating = "Rating",
  Number = "Number",
  Time = "Time",
}

export enum BeatmapsTableFilterType {
  RangeInt = "Range",
  Text = "Text",
  Difficulties = "Difficulties",
  Date = "Date",
  Playlists = "Playlists",
}

export interface BeatmapsTableHeader {
  value: string;
  text: string;
  align?: "start" | "center" | "end";
  width?: number;
  digits?: number;

  sortable?: boolean;
  filterable?: boolean;

  sort?: (a: any, b: any) => number;
  localFilter?: (value: any) => boolean;
  globalSearch?: (value: string) => boolean;
  filterType?: BeatmapsTableFilterType;

  template: BeatmapsTableHeadersTemplate;
  templateItemAccess?: string;
}
