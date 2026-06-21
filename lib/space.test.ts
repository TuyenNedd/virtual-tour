import { describe, it, expect } from "vitest";
import { validateSpace, fallbackSpace } from "./space";

describe("space validation", () => {
  it("accepts a well-formed space", () => {
    const data = {
      modelUrl: "/m.glb",
      up: "y",
      floors: [{ id: 0, name: "F1", yMin: 0, yMax: 3 }],
      sweeps: [{ id: "s0", position: [0, 0, 0], floor: 0, neighbors: [] }],
    };
    expect(validateSpace(data)).toEqual(data);
  });

  it("throws when modelUrl is missing", () => {
    expect(() => validateSpace({ sweeps: [], floors: [] })).toThrow();
  });

  it("throws when there are no sweeps", () => {
    expect(() =>
      validateSpace({ modelUrl: "/m.glb", up: "y", floors: [], sweeps: [] }),
    ).toThrow();
  });

  it("fallbackSpace builds a single center sweep", () => {
    const fb = fallbackSpace("/m.glb", [1, 0, 1]);
    expect(fb.sweeps).toHaveLength(1);
    expect(fb.sweeps[0].position).toEqual([1, 0, 1]);
    expect(fb.modelUrl).toBe("/m.glb");
  });
});
