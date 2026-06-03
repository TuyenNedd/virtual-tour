'use client';

import { useState, useCallback, useEffect } from 'react';
import { useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { useViewModeStore } from '@/stores/viewModeStore';
import { useSweepStore } from '@/stores/sweepStore';
import { ViewMode, Sweep } from '@/lib/types';
import { SWEEP_PUCK_COLOR } from '@/lib/constants';

function PanoramaSweepPuck({ sweep, currentSweep }: { sweep: Sweep; currentSweep: Sweep }) {
  const [hovered, setHovered] = useState(false);
  const startNavigation = useSweepStore((s) => s.startNavigation);

  // Calculate direction from current sweep to neighbor in XZ plane
  const dx = sweep.position[0] - currentSweep.position[0];
  const dz = sweep.position[2] - currentSweep.position[2];
  const dist = Math.sqrt(dx * dx + dz * dz);

  // Normalize direction and place puck at fixed distance from origin
  const puckDistance = 3;
  let px: number, pz: number;
  if (dist > 0.01) {
    px = (dx / dist) * puckDistance;
    pz = (dz / dist) * puckDistance;
  } else {
    // Fallback if sweeps are at same XZ position (different floor)
    px = puckDistance;
    pz = 0;
  }

  const scale = hovered ? 1.4 : 1.0;
  const color = hovered ? '#80d8ff' : SWEEP_PUCK_COLOR;

  return (
    <mesh
      position={[px, -1.5, pz]}
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
        startNavigation(sweep.id);
      }}
    >
      <circleGeometry args={[0.3, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.9}
        toneMapped={false}
      />
    </mesh>
  );
}

function PanoramaSweepPucks() {
  const getNeighbors = useSweepStore((s) => s.getNeighbors);
  const currentSweepId = useSweepStore((s) => s.currentSweepId);
  const sweeps = useSweepStore((s) => s.sweeps);
  const isNavigating = useSweepStore((s) => s.isNavigating);

  const currentSweep = sweeps[currentSweepId];
  if (!currentSweep || isNavigating) return null;

  const neighbors = getNeighbors();

  return (
    <>
      {neighbors.map((neighbor) => (
        <PanoramaSweepPuck
          key={neighbor.id}
          sweep={neighbor}
          currentSweep={currentSweep}
        />
      ))}
    </>
  );
}

export function PanoramaView() {
  const currentMode = useViewModeStore((s) => s.currentMode);
  const isTransitioning = useViewModeStore((s) => s.isTransitioning);
  const currentSweepId = useSweepStore((s) => s.currentSweepId);
  const sweeps = useSweepStore((s) => s.sweeps);
  const { camera } = useThree();

  const currentSweep = sweeps[currentSweepId];
  const panoramaUrl = currentSweep?.panoramaUrl || '/panoramas/sundowner_deck.jpg';

  const texture = useLoader(THREE.TextureLoader, panoramaUrl);

  // Ensure camera stays at origin in panorama mode
  useEffect(() => {
    if (currentMode === ViewMode.Panorama && !isTransitioning) {
      camera.position.set(0, 0, 0);
    }
  }, [currentMode, isTransitioning, camera, currentSweepId]);

  if (currentMode !== ViewMode.Panorama) return null;

  return (
    <>
      <mesh position={[0, 0, 0]} scale={[-1, 1, 1]}>
        <sphereGeometry args={[500, 64, 32]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      <PanoramaSweepPucks />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={-0.3}
        target={[0, 0, 0]}
        enabled={!isTransitioning}
      />
    </>
  );
}
