import {
  DifficultiesSimple,
  ReqsMetadata,
} from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import { DateRange, IsIn, IsInDate, Range } from "@/libraries/common/Range";

export function FilterRange(value: number, search: Range) {
  return IsIn(value, search);
}

export function FilterText(value: string, search: string) {
  return value
    .toLowerCase()
    .includes(search.toLowerCase().replace("!bsr ", ""));
}

export function FilterDateRange(value: Date, search: DateRange) {
  return IsInDate(value, search);
}

export function FilterDifficulties(
  value: DifficultiesSimple,
  search: string[]
) {
  return search.some((diff: string) => value[diff]);
}

export function FilterRequirements(
  value: ReqsMetadata,
  search: {
    me: boolean;
    ne: boolean;
    chroma: boolean;
    cinema: boolean;
    vivify: boolean;
  }
) {
  if (search.chroma) {
    if (value?.chroma !== search.chroma) {
      return false;
    }
  }
  if (search.ne) {
    if (value?.ne !== search.ne) {
      return false;
    }
  }
  if (search.me) {
    if (value?.me !== search.me) {
      return false;
    }
  }
  if (search.cinema) {
    if (value?.cinema !== search.cinema) {
      return false;
    }
  }
  if (search.vivify) {
    if (value?.vivify !== search.vivify) {
      return false;
    }
  }
  return true;
}

/*
export default {
  FilterRange,
  FilterText,
  FilterDateRange,
  FilterDifficulties,
};
*/
