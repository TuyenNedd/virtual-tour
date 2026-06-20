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
