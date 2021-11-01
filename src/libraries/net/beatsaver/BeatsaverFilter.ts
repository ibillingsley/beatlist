export interface BeatsaverFilter {
  mode: "filter" | "nps" | "date" | "all";
  ai?: boolean;
  ranked?: boolean;
  fs?: boolean;
  chroma?: boolean;
  noodle?: boolean;
  me?: boolean;
  cinema?: boolean;
  minNps?: number;
  maxNps?: number;
  minDate?: Date;
  maxDate?: Date;
}
