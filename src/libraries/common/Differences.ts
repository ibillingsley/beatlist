export interface Differences<T> {
  removed: T[];
  added: T[];
  kept: T[];
}

export function computeDifference<T>(olds: T[], news: T[]) {
  const difference = {} as Differences<T>;

  difference.added = news.filter(
    (fresh: T) => !olds.find((old: T) => old === fresh)
  );

  difference.kept = news.filter((fresh: T) =>
    olds.find((old: T) => old === fresh)
  );

  difference.removed = olds.filter(
    (old: T) => !news?.find((fresh: T) => fresh === old)
  );

  return difference;
}

export function computeDifferenceBySet<T>(olds: Set<T>, news: Set<T>) {
  const difference = {
    added: [],
    kept: [],
    removed: [],
  } as Differences<T>;

  for (const key of news) {
    if (olds.has(key)) {
      difference.kept.push(key);
    } else {
      difference.added.push(key);
    }
  }

  for (const key of olds) {
    if (!news.has(key)) {
      difference.removed.push(key);
    }
  }

  return difference;
}
