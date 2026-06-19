"use client";
import { useViewStore } from "@/stores/viewStore";
import { neighborsOf } from "@/lib/sweepGraph";
import { PUCK_COLOR, PUCK_OPACITY, SWEEP_EYE_HEIGHT } from "@/lib/constants";

export function SweepPucks() {
  const space = useViewStore((s) => s.space);
  const mode = useViewStore((s) => s.mode);
  const currentSweepId = useViewStore((s) => s.currentSweepId);
  const goToSweep = useViewStore((s) => s.goToSweep);

  if (!space || mode !== "inside") return null;
  const visible = currentSweepId
    ? neighborsOf(space.sweeps, currentSweepId)
    : [];

  return (
    <group>
      {visible.map((sweep) => {
        const isCurrent = sweep.id === currentSweepId;
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
            {/* visible ring */}
            <mesh>
              <ringGeometry args={[0.18, 0.26, 32]} />
              <meshBasicMaterial
                color={PUCK_COLOR}
                transparent
                opacity={isCurrent ? 0.3 : PUCK_OPACITY}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
