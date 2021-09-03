function byIndex(obj: any, index: string): any {
  return index.split(".").reduce((o, i) => o[i], obj);
}

const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

export default { byIndex, sleep };
