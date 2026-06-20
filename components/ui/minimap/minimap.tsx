"use client";
import { useMemo } from "react";
import { useViewStore } from "@/stores/view-store";
import { sweepsOnFloor } from "@/lib/sweep-graph";

const SIZE = 128;
const PAD = 10;

export function Minimap() {
  const space = useViewStore((s) => s.space);
  const floorId = useViewStore((s) => s.floorId);
  const currentSweepId = useViewStore((s) => s.currentSweepId);
  const goToSweep = useViewStore((s) => s.goToSweep);
  const facing = useViewStore((s) => s.facing);

  const data = useMemo(() => {
    if (!space) return null;
    const sweeps = sweepsOnFloor(space.sweeps, floorId);
    if (sweeps.length === 0) return null;
    const xs = sweeps.map((s) => s.position[0]);
    const zs = sweeps.map((s) => s.position[2]);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs);
    const minZ = Math.min(...zs),
      maxZ = Math.max(...zs);
    const span = Math.max(maxX - minX, maxZ - minZ) || 1;
    const project = (x: number, z: number) => ({
      cx: PAD + ((x - minX) / span) * (SIZE - 2 * PAD),
      cy: PAD + ((z - minZ) / span) * (SIZE - 2 * PAD),
    });
    return { sweeps, project };
  }, [space, floorId]);

  if (!data) return null;

  const current = data.sweeps.find((s) => s.id === currentSweepId);
  const cur = current
    ? data.project(current.position[0], current.position[2])
    : null;
  const facingDeg = (facing * 180) / Math.PI;

  return (
    <div
      className="absolute right-4 top-4 z-40 rounded-lg border border-white/20 bg-black/50 backdrop-blur"
      style={{ width: SIZE, height: SIZE }}
    >
      <svg width={SIZE} height={SIZE}>
        {data.sweeps.map((s) => {
          const { cx, cy } = data.project(s.position[0], s.position[2]);
          const isCurrent = s.id === currentSweepId;
          return (
            <circle
              key={s.id}
              cx={cx}
              cy={cy}
              r={isCurrent ? 5 : 3}
              fill={isCurrent ? "#ffffff" : "rgba(255,255,255,0.5)"}
              style={{ cursor: "pointer" }}
              onClick={() => goToSweep(s.id)}
            />
          );
        })}
        {/* heading arrow at the current sweep (points where the camera faces) */}
        {cur && (
          <polygon
            points="11,0 -4,-5 -4,5"
            fill="#4ade80"
            transform={`translate(${cur.cx} ${cur.cy}) rotate(${facingDeg})`}
            style={{ pointerEvents: "none" }}
          />
        )}
      </svg>
    </div>
  );
}
