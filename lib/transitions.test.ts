import { describe, it, expect } from "vitest";
import { easeInOutCubic, lerp, lerpVec3 } from "./transitions";

describe("transitions", () => {
  it("easeInOutCubic hits endpoints and midpoint", () => {
    expect(easeInOutCubic(0)).toBeCloseTo(0);
    expect(easeInOutCubic(1)).toBeCloseTo(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
  });

  it("easeInOutCubic is symmetric around 0.5", () => {
    expect(easeInOutCubic(0.25) + easeInOutCubic(0.75)).toBeCloseTo(1);
  });

  it("lerp interpolates scalars", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it("lerpVec3 interpolates vectors component-wise", () => {
    expect(lerpVec3([0, 0, 0], [2, 4, 6], 0.5)).toEqual([1, 2, 3]);
  });
});
