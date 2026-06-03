'use client';

import { useState, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useViewModeStore } from '@/stores/viewModeStore';
import { useSweepStore } from '@/stores/sweepStore';
import { useSweepNavigation } from '@/hooks/useSweepNavigation';
import { ViewMode, Sweep } from '@/lib/types';

function WallSegment({ start, end, height = 3 }: { start: [number, number]; end: [number, number]; height?: number }) {
  const dx = end[0] - start[0];
  const dz = end[1] - start[1];
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  const cx = (start[0] + end[0]) / 2;
  const cz = (start[1] + end[1]) / 2;

  return (
    <mesh position={[cx, height / 2, cz]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, height, 0.15]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  );
}

function DollhousePuck({ sweep, isCurrent }: { sweep: Sweep; isCurrent: boolean }) {
  const [hovered, setHovered] = useState(false);
  const setMode = useViewModeStore((s) => s.setMode);
  const setCurrentSweep = useSweepStore((s) => s.setCurrentSweep);

  const scale = hovered ? 1.4 : 1;
  const color = isCurrent ? '#ffffff' : hovered ? '#80d8ff' : '#4fc3f7';

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default';
    };
  }, []);

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
        document.body.style.cursor = 'default';
        setCurrentSweep(sweep.id);
        setMode(ViewMode.Panorama);
      }}
    >
      <circleGeometry args={[0.3, 32]} />
      <meshBasicMaterial color={color} transparent opacity={isCurrent ? 1 : 0.7} />
    </mesh>
  );
}

export function DollhouseView() {
  const currentMode = useViewModeStore((s) => s.currentMode);
  const isTransitioning = useViewModeStore((s) => s.isTransitioning);
  const { availableSweeps, currentSweepId } = useSweepNavigation();

  if (currentMode !== ViewMode.Dollhouse) return null;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} />

      {/* Floor plane with grid */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#333" wireframe />
      </mesh>
      <gridHelper args={[12, 12, '#555', '#444']} position={[0, 0.01, 0]} />

      {/* Outer walls: 12x12 footprint */}
      {/* North wall */}
      <WallSegment start={[-6, -6]} end={[6, -6]} />
      {/* South wall */}
      <WallSegment start={[-6, 6]} end={[6, 6]} />
      {/* West wall */}
      <WallSegment start={[-6, -6]} end={[-6, 6]} />
      {/* East wall */}
      <WallSegment start={[6, -6]} end={[6, 6]} />

      {/* Interior wall 1: horizontal divider (with door gap) */}
      <WallSegment start={[-6, 0]} end={[-1, 0]} />
      <WallSegment start={[1, 0]} end={[6, 0]} />

      {/* Interior wall 2: vertical divider in top half (with door gap) */}
      <WallSegment start={[0, -6]} end={[0, -1.5]} />
      <WallSegment start={[0, 1.5]} end={[0, 6]} />

      {/* Interior wall 3: small room in bottom-left */}
      <WallSegment start={[-6, 3]} end={[-2, 3]} />

      {/* Ceiling wireframe */}
      <mesh position={[0, 3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#555" wireframe transparent opacity={0.3} />
      </mesh>

      {/* Sweep puck markers */}
      {availableSweeps.map((sweep) => (
        <DollhousePuck
          key={sweep.id}
          sweep={sweep}
          isCurrent={sweep.id === currentSweepId}
        />
      ))}

      <OrbitControls
        minDistance={8}
        maxDistance={40}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        enablePan
        enabled={!isTransitioning}
      />
    </>
  );
}
