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

export default { byIndex, sleep, silentClose };
