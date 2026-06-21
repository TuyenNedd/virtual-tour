import { describe, it, expect } from "vitest";
import { distance3, segments, formatLength } from "./measure";

describe("measure", () => {
  it("distance3 computes euclidean distance", () => {
    expect(distance3([0, 0, 0], [3, 4, 0])).toBe(5);
    expect(distance3([1, 2, 3], [1, 2, 3])).toBe(0);
  });

  it("segments builds consecutive segments with length and midpoint", () => {
    const segs = segments([
      [0, 0, 0],
      [2, 0, 0],
      [2, 0, 2],
    ]);
    expect(segs).toHaveLength(2);
    expect(segs[0].length).toBe(2);
    expect(segs[0].mid).toEqual([1, 0, 0]);
    expect(segs[1].length).toBe(2);
    expect(segs[1].mid).toEqual([2, 0, 1]);
  });

  it("segments returns [] for fewer than two points", () => {
    expect(segments([])).toEqual([]);
    expect(segments([[0, 0, 0]])).toEqual([]);
  });

  it("formatLength renders two decimals with unit", () => {
    expect(formatLength(1.071)).toBe("1.07 m");
  });
});
