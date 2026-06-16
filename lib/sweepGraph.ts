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
