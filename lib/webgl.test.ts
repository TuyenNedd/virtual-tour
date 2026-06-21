import { describe, it, expect } from "vitest";
import { isWebGLAvailable } from "./webgl";

describe("webgl detection", () => {
  it("returns false when document is undefined (node)", () => {
    expect(isWebGLAvailable()).toBe(false);
  });
});
