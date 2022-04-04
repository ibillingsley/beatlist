export interface Range {
  min: number | undefined;
  max: number | undefined;
}

export interface DateRange {
  min: Date | undefined;
  max: Date | undefined;
}

export function IsIn(
  value: number,
  range: Range,
  excludeMaxValue: boolean = false // 最大値を含めない場合は true
): boolean {
  if (range.min === undefined && range.max === undefined) {
    return true;
  }

  if (range.min === undefined && range.max !== undefined) {
    if (excludeMaxValue) {
      return value < range.max;
    }
    return value <= range.max;
  }

  if (range.min !== undefined && range.max === undefined) {
    return value >= range.min;
  }

  if (range.min !== undefined && range.max !== undefined) {
    if (excludeMaxValue) {
      return range.min <= value && range.max > value;
    }
    return range.min <= value && range.max >= value;
  }

  return false;
}

export function IsInDate(value: Date, range: DateRange): boolean {
  let max = range.max?.getTime();
  if (max != null) {
    // add one day
    max += 86400 * 1000;
  }
  return IsIn(
    value.getTime(),
    {
      min: range.min?.getTime(),
      max,
    },
    true // exclude max value
  );
}
