import Logger from "@/libraries/helper/Logger";

function sortNumber(a: number, b: number): number {
  if (!a || !b) {
    return 0;
  }

  return a - b;
}

function sortKeyHex(a: string, b: string): number {
  // null か空文字は先頭に持っていく(降順ソートのとき最後に行くようにするため)
  if (a == null || a === "") {
    if (b == null || b === "") {
      return 0;
    }
    return -1;
  }
  if (b == null || b === "") {
    return 1;
  }
  let numA = 0;
  let numB = 0;
  try {
    numA = parseInt(a.trim(), 16);
  } catch (error) {
    // ignore
    if (Logger.isDebugEnabled()) {
      console.warn(error);
    }
  }
  try {
    numB = parseInt(b.trim(), 16);
  } catch (error) {
    // ignore
    if (Logger.isDebugEnabled()) {
      console.warn(error);
    }
  }
  return numA - numB;
}

function sortText(a: string, b: string): number {
  return a.localeCompare(b);
}

function sortDateFromString(a: string, b: string): number {
  if (!a || !b) {
    return 0;
  }

  const dateA = new Date(a);
  const dateB = new Date(b);

  if (dateA === dateB) {
    return 0;
  }

  return new Date(a) > new Date(b) ? 1 : -1;
}

export { sortText, sortNumber, sortDateFromString, sortKeyHex };
