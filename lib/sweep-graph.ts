import type { Sweep, Vec3 } from "./types";

function dist2(a: Vec3, b: Vec3): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}

export function nearestSweep(sweeps: Sweep[], point: Vec3): Sweep | undefined {
  let best: Sweep | undefined;
  let bestD = Infinity;
  for (const s of sweeps) {
    const d = dist2(s.position, point);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

export function neighborsOf(sweeps: Sweep[], id: string): Sweep[] {
  const sweep = sweeps.find((s) => s.id === id);
  if (!sweep) return [];
  return sweep.neighbors
    .map((nid) => sweeps.find((s) => s.id === nid))
    .filter((s): s is Sweep => Boolean(s));
}

export function sweepsOnFloor(sweeps: Sweep[], floor: number): Sweep[] {
  return sweeps.filter((s) => s.floor === floor);
}

// Pick the graph neighbor best aligned with a horizontal direction (dirX, dirZ),
// e.g. the camera forward. Returns undefined if none is aligned beyond `minDot`.
export function bestNeighborInDirection(
  sweeps: Sweep[],
  fromId: string,
  dirX: number,
  dirZ: number,
  minDot = 0.3,
): Sweep | undefined {
  const from = sweeps.find((s) => s.id === fromId);
  if (!from) return undefined;
  const dl = Math.hypot(dirX, dirZ);
  if (dl === 0) return undefined;
  const ndx = dirX / dl;
  const ndz = dirZ / dl;

  let best: Sweep | undefined;
  let bestDot = minDot;
  for (const n of neighborsOf(sweeps, fromId)) {
    const vx = n.position[0] - from.position[0];
    const vz = n.position[2] - from.position[2];
    const vl = Math.hypot(vx, vz);
    if (vl === 0) continue;
    const dot = (vx / vl) * ndx + (vz / vl) * ndz;
    if (dot > bestDot) {
      bestDot = dot;
      best = n;
    }
  }
  return best;
}
