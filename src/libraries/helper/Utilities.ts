import fs from "fs-extra";

function byIndex(obj: any, index: string): any {
  return index.split(".").reduce((o, i) => o[i], obj);
}

const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

function silentClose(stream: fs.WriteStream): void {
  try {
    if (stream != null) {
      stream.close();
    }
  } catch (error) {
    // ignore
  }
}

function isDateEquals(
  date1: Date | undefined,
  date2: Date | undefined
): boolean {
  if (date1 == null) {
    if (date2 == null) {
      return true;
    }
    return false;
  }
  if (date2 == null) {
    return false;
  }
  return date1.getTime() === date2.getTime();
}

function convertTimeHHMMSS(val: number | undefined): string {
  if (val == null) {
    return "";
  }
  try {
    let time = new Date(val * 1000).toISOString().substring(11, 19);
    if (val >= 86400) {
      // 24h 以上
      time = `${Math.floor(val / 3600)}:${time.substring(3)}`;
      return time;
    }
    if (time.startsWith("00:")) {
      time = time.substring(3);
    }
    if (time.startsWith("0")) {
      time = time.substring(1);
    }
    return time;
  } catch (e) {
    console.warn(e);
    return "N/A";
  }
}

export default { byIndex, sleep, silentClose, isDateEquals, convertTimeHHMMSS };
