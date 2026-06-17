import type { ViewMode } from "./types";

export const INSIDE_FOV = 75;
export const DOLLHOUSE_FOV = 50;

// transition durations (seconds)
export const MODE_TRANSITION_S = 1.0;
export const SWEEP_TRANSITION_S = 0.7;

// sweep generation
export const SWEEP_GRID_SPACING = 1.2; // metres
export const SWEEP_MIN_HEADROOM = 1.4; // metres of clearance to be "walkable"
export const SWEEP_EYE_HEIGHT = 1.5; // camera height above floor in inside mode
export const SWEEP_NEIGHBOR_RADIUS = 2.2; // connect sweeps within this distance

// puck visuals
export const PUCK_COLOR = "#ffffff";
export const PUCK_OPACITY = 0.85;

export const DEFAULT_MODE: ViewMode = "inside";

export const DRACO_PATH = "/draco/";
export const FALLBACK_MODEL_URL = "/model/space.glb";

// HM3D source meshes are Z-up; rotate -90° about X to present them Y-up.
// The sweep generator (scripts/generate-sweeps.mjs) bakes the same rotation.
export const MODEL_UP_FIX_ROTATION_X = -Math.PI / 2;
