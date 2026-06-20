"use client";
import { useViewStore } from "@/stores/viewStore";
import { sweepsOnFloor } from "@/lib/sweepGraph";
import { PUCK_COLOR, PUCK_OPACITY, SWEEP_EYE_HEIGHT } from "@/lib/constants";

export function SweepPucks() {
  const space = useViewStore((s) => s.space);
  const mode = useViewStore((s) => s.mode);
  const floorId = useViewStore((s) => s.floorId);
  const currentSweepId = useViewStore((s) => s.currentSweepId);
  const goToSweep = useViewStore((s) => s.goToSweep);
  const measureMode = useViewStore((s) => s.measureMode);

  if (!space || mode !== "inside" || measureMode) return null;
  // Show every walkable point on the floor (like Matterport). Walls naturally
  // occlude pucks behind them via depth testing, so you only see reachable ones
  // and can always spot the way out of a room. Skip the one under the camera.
  const visible = sweepsOnFloor(space.sweeps, floorId).filter(
    (s) => s.id !== currentSweepId,
  );

  return (
    <group>
      {visible.map((sweep) => {
        const [x, y, z] = sweep.position;
        return (
          <group
            key={sweep.id}
            position={[x, y - SWEEP_EYE_HEIGHT + 0.1, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              goToSweep(sweep.id);
            }}
            onPointerOver={() => (document.body.style.cursor = "pointer")}
            onPointerOut={() => (document.body.style.cursor = "default")}
          >
            {/* invisible filled disc = full click/hover hit area (the ring's hole isn't hittable) */}
            <mesh>
              <circleGeometry args={[0.3, 32]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            {/* visible ring; depthTest lets walls occlude pucks in other rooms */}
            <mesh>
              <ringGeometry args={[0.18, 0.26, 32]} />
              <meshBasicMaterial
                color={PUCK_COLOR}
                transparent
                opacity={PUCK_OPACITY}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
