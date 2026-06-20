import { describe, it, expect } from "vitest";
import { nearestSweep, neighborsOf, sweepsOnFloor } from "./sweep-graph";
import type { Sweep } from "./types";

const sweeps: Sweep[] = [
  { id: "a", position: [0, 0, 0], floor: 0, neighbors: ["b"] },
  { id: "b", position: [2, 0, 0], floor: 0, neighbors: ["a", "c"] },
  { id: "c", position: [2, 3, 0], floor: 1, neighbors: ["b"] },
];

describe("sweepGraph", () => {
  it("finds the nearest sweep to a point", () => {
    expect(nearestSweep(sweeps, [0.4, 0, 0])?.id).toBe("a");
    expect(nearestSweep(sweeps, [1.9, 0.1, 0])?.id).toBe("b");
  });

  it("returns undefined for an empty list", () => {
    expect(nearestSweep([], [0, 0, 0])).toBeUndefined();
  });

  it("resolves neighbor objects from ids", () => {
    expect(neighborsOf(sweeps, "b").map((s) => s.id)).toEqual(["a", "c"]);
  });

  it("filters sweeps by floor", () => {
    expect(sweepsOnFloor(sweeps, 0).map((s) => s.id)).toEqual(["a", "b"]);
    expect(sweepsOnFloor(sweeps, 1).map((s) => s.id)).toEqual(["c"]);
  });
});
