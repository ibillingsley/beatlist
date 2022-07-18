import {
  computeDifference,
  computeDifferenceBySet,
} from "@/libraries/common/Differences";

describe("differences", () => {
  it("should give the right differences", () => {
    expect.assertions(3);

    const difference = computeDifference([0, 1, 2], [1, 2, 3]);

    expect(difference.added).toHaveLength(1);
    expect(difference.removed).toHaveLength(1);
    expect(difference.kept).toHaveLength(2);
  });

  it("computeDifferenceBySet: should give the right differences", () => {
    expect.assertions(7);

    const olds = new Set<number>([0, 1, 2]);
    const news = new Set<number>([1, 2, 3]);

    const difference = computeDifferenceBySet<number>(olds, news);

    expect(difference.added).toHaveLength(1);
    expect(difference.added[0]).toBe(3);
    expect(difference.removed).toHaveLength(1);
    expect(difference.removed[0]).toBe(0);
    expect(difference.kept).toHaveLength(2);
    expect(difference.kept).toContain(1);
    expect(difference.kept).toContain(2);
  });

  it("computeDifferenceBySet: no differences", () => {
    expect.assertions(3);

    const olds = new Set<number>([0, 1, 2]);
    const news = new Set<number>([1, 2, 0]);

    const difference = computeDifferenceBySet<number>(olds, news);

    expect(difference.added).toHaveLength(0);
    expect(difference.removed).toHaveLength(0);
    expect(difference.kept).toHaveLength(3);
  });

  it("computeDifferenceBySet: all removed and added", () => {
    expect.assertions(3);

    const olds = new Set<number>([0, 1, 2]);
    const news = new Set<number>([3, 4]);

    const difference = computeDifferenceBySet<number>(olds, news);

    expect(difference.added).toHaveLength(2);
    expect(difference.removed).toHaveLength(3);
    expect(difference.kept).toHaveLength(0);
  });
});
