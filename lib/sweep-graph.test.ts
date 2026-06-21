import { describe, it, expect } from "vitest";
import {
  nearestSweep,
  neighborsOf,
  sweepsOnFloor,
  bestNeighborInDirection,
} from "./sweep-graph";
import type { Sweep } from "./types";

const sweeps: Sweep[] = [
  { id: "a", position: [0, 0, 0], floor: 0, neighbors: ["b"] },
  { id: "b", position: [2, 0, 0], floor: 0, neighbors: ["a", "c"] },
  { id: "c", position: [2, 3, 0], floor: 1, neighbors: ["b"] },
];

// cross layout around a center for direction tests
const cross: Sweep[] = [
  { id: "c", position: [0, 1.5, 0], floor: 0, neighbors: ["e", "w", "s"] },
  { id: "e", position: [2, 1.5, 0], floor: 0, neighbors: ["c"] },
  { id: "w", position: [-2, 1.5, 0], floor: 0, neighbors: ["c"] },
  { id: "s", position: [0, 1.5, 2], floor: 0, neighbors: ["c"] },
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

  it("picks the neighbor aligned with a horizontal direction", () => {
    expect(bestNeighborInDirection(cross, "c", 1, 0)?.id).toBe("e");
    expect(bestNeighborInDirection(cross, "c", -1, 0)?.id).toBe("w");
    expect(bestNeighborInDirection(cross, "c", 0, 1)?.id).toBe("s");
  });

  it("returns undefined when no neighbor is aligned enough", () => {
    expect(bestNeighborInDirection(cross, "c", 0, -1)).toBeUndefined();
  });

  it("returns undefined for unknown id or zero direction", () => {
    expect(bestNeighborInDirection(cross, "zzz", 1, 0)).toBeUndefined();
    expect(bestNeighborInDirection(cross, "c", 0, 0)).toBeUndefined();
  });
});
