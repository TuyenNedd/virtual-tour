'use client';

import { useState } from 'react';
import { useSweepNavigation } from '@/hooks/useSweepNavigation';
import { useViewModeStore } from '@/stores/viewModeStore';
import { ViewMode, Sweep } from '@/lib/types';
import { SWEEP_PUCK_RADIUS, SWEEP_PUCK_COLOR } from '@/lib/constants';

function Puck({ sweep, isCurrent }: { sweep: Sweep; isCurrent: boolean }) {
  const [hovered, setHovered] = useState(false);
  const { navigateToSweep } = useSweepNavigation();

  const scale = hovered ? 1.4 : 1;
  const color = isCurrent ? '#ffffff' : hovered ? '#80d8ff' : SWEEP_PUCK_COLOR;

  return (
    <mesh
      position={[sweep.position[0], 0.05, sweep.position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[scale, scale, 1]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
      onClick={(e) => {
        e.stopPropagation();
        navigateToSweep(sweep.id);
      }}
    >
      <circleGeometry args={[SWEEP_PUCK_RADIUS, 32]} />
      <meshBasicMaterial color={color} transparent opacity={isCurrent ? 1 : 0.7} />
    </mesh>
  );
}

export function SweepPuck() {
  const currentMode = useViewModeStore((s) => s.currentMode);
  const { availableSweeps, currentSweepId } = useSweepNavigation();

  if (currentMode === ViewMode.Panorama) return null;

  return (
    <>
      {availableSweeps.map((sweep) => (
        <Puck
          key={sweep.id}
          sweep={sweep}
          isCurrent={sweep.id === currentSweepId}
        />
      ))}
    </>
  );
}
