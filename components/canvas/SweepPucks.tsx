"use client";
import { useViewStore } from "@/stores/viewStore";
import { sweepsOnFloor } from "@/lib/sweepGraph";
import { PUCK_COLOR, PUCK_OPACITY } from "@/lib/constants";

export function SweepPucks() {
  const space = useViewStore((s) => s.space);
  const mode = useViewStore((s) => s.mode);
  const floorId = useViewStore((s) => s.floorId);
  const currentSweepId = useViewStore((s) => s.currentSweepId);
  const goToSweep = useViewStore((s) => s.goToSweep);

  if (!space || mode !== "inside") return null;
  const visible = sweepsOnFloor(space.sweeps, floorId);

  return (
    <group>
      {visible.map((sweep) => {
        const isCurrent = sweep.id === currentSweepId;
        const [x, y, z] = sweep.position;
        return (
          <mesh
            key={sweep.id}
            position={[x, y - 1.4, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              goToSweep(sweep.id);
            }}
            onPointerOver={() => (document.body.style.cursor = "pointer")}
            onPointerOut={() => (document.body.style.cursor = "default")}
          >
            <ringGeometry args={[0.18, 0.26, 32]} />
            <meshBasicMaterial
              color={PUCK_COLOR}
              transparent
              opacity={isCurrent ? 0.3 : PUCK_OPACITY}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
