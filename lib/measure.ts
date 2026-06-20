import type { Vec3 } from "./types";

export function distance3(a: Vec3, b: Vec3): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export interface Segment {
  a: Vec3;
  b: Vec3;
  length: number;
  mid: Vec3;
}

// Consecutive segments of a polyline through the given points (0-1, 1-2, ...).
export function segments(points: Vec3[]): Segment[] {
  const out: Segment[] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    out.push({
      a,
      b,
      length: distance3(a, b),
      mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2],
    });
  }
  return out;
}

// Human-readable metres label, e.g. 1.07 m.
export function formatLength(metres: number): string {
  return `${metres.toFixed(2)} m`;
}
