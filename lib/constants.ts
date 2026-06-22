import type { ViewMode } from "./types";

export const INSIDE_FOV = 75;
export const DOLLHOUSE_FOV = 50;

// camera height above the floor at a sweep (also used to seat pucks on the floor)
export const SWEEP_EYE_HEIGHT = 1.5;

// puck visuals
export const PUCK_COLOR = "#ffffff";
export const PUCK_OPACITY = 0.85;

export const DEFAULT_MODE: ViewMode = "inside";

export const DRACO_PATH = "/draco/";
export const FALLBACK_MODEL_URL = "/model/space.glb";

// HM3D source meshes are Z-up; rotate -90 deg about X to present them Y-up.
// The sweep generator (scripts/generate-sweeps.mjs) bakes the same rotation.
export const MODEL_UP_FIX_ROTATION_X = -Math.PI / 2;

// Liquid-glass "material" params for @hashintel/refractive, matching the values
// from the lib author's article (kube.io/blog/liquid-glass-css-svg):
// blur 0 (clear, not frosted), specular opacity 0.40, refraction at max
// (refractiveIndex 1.5 = the lib's glass default). "Specular saturation" from
// the article is not exposed in refractive v0.0.4, so it's omitted.
// Each surface adds its own `radius` (and optional `bezelWidth`).
export const LIQUID_GLASS = {
  blur: 0,
  specularOpacity: 0.4,
  refractiveIndex: 1.5,
} as const;
