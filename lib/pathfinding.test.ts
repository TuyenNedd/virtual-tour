import { describe, it, expect } from "vitest";
import { findPath } from "./pathfinding";
import type { Sweep } from "./types";

// a - b - c - d  (chain), plus isolated e
const sweeps: Sweep[] = [
  { id: "a", position: [0, 0, 0], floor: 0, neighbors: ["b"] },
  { id: "b", position: [1, 0, 0], floor: 0, neighbors: ["a", "c"] },
  { id: "c", position: [2, 0, 0], floor: 0, neighbors: ["b", "d"] },
  { id: "d", position: [3, 0, 0], floor: 0, neighbors: ["c"] },
  { id: "e", position: [9, 0, 9], floor: 0, neighbors: [] },
];

describe("findPath", () => {
  it("returns the shortest hop path inclusive of both ends", () => {
    expect(findPath(sweeps, "a", "d")).toEqual(["a", "b", "c", "d"]);
  });

  it("returns a single-element path when from === to", () => {
    expect(findPath(sweeps, "b", "b")).toEqual(["b"]);
  });

  it("returns [] when the target is unreachable", () => {
    expect(findPath(sweeps, "a", "e")).toEqual([]);
  });

  it("returns [] when an endpoint id is unknown", () => {
    expect(findPath(sweeps, "a", "zzz")).toEqual([]);
    expect(findPath(sweeps, "zzz", "a")).toEqual([]);
  });

  it("prefers fewer hops when multiple routes exist", () => {
    // add a shortcut a-c
    const withShortcut: Sweep[] = sweeps.map((s) =>
      s.id === "a"
        ? { ...s, neighbors: ["b", "c"] }
        : s.id === "c"
          ? { ...s, neighbors: ["b", "d", "a"] }
          : s,
    );
    expect(findPath(withShortcut, "a", "d")).toEqual(["a", "c", "d"]);
  });
});
