import type { SpaceData, Vec3 } from "./types";

export function validateSpace(data: unknown): SpaceData {
  if (!data || typeof data !== "object") {
    throw new Error("space.json: not an object");
  }
  const d = data as Record<string, unknown>;
  if (typeof d.modelUrl !== "string" || d.modelUrl.length === 0) {
    throw new Error("space.json: missing modelUrl");
  }
  if (!Array.isArray(d.sweeps) || d.sweeps.length === 0) {
    throw new Error("space.json: no sweeps");
  }
  if (!Array.isArray(d.floors)) {
    throw new Error("space.json: missing floors");
  }
  return data as SpaceData;
}

export function fallbackSpace(modelUrl: string, center: Vec3): SpaceData {
  return {
    modelUrl,
    up: "y",
    floors: [
      { id: 0, name: "Floor 1", yMin: center[1] - 2, yMax: center[1] + 2 },
    ],
    sweeps: [{ id: "s0", position: center, floor: 0, neighbors: [] }],
  };
}

export async function loadSpace(url = "/data/space.json"): Promise<SpaceData> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`space.json: HTTP ${res.status}`);
  return validateSpace(await res.json());
}
