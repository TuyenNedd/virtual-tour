'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { MapControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useViewModeStore } from '@/stores/viewModeStore';
import { useSweepNavigation } from '@/hooks/useSweepNavigation';
import { ViewMode } from '@/lib/types';
import { FLOORPLAN_CAMERA_HEIGHT } from '@/lib/constants';

export function FloorplanView() {
  const currentMode = useViewModeStore((s) => s.currentMode);
  const isTransitioning = useViewModeStore((s) => s.isTransitioning);
  const { availableSweeps, currentSweepId } = useSweepNavigation();
  const { camera } = useThree();

  useEffect(() => {
    if (currentMode === ViewMode.Floorplan && !isTransitioning) {
      camera.position.set(0, FLOORPLAN_CAMERA_HEIGHT, 0);
      camera.lookAt(0, 0, 0);
      const perspCam = camera as THREE.PerspectiveCamera;
      perspCam.fov = 20;
      perspCam.updateProjectionMatrix();
    }
  }, [currentMode, isTransitioning, camera]);

  if (currentMode !== ViewMode.Floorplan) return null;

  const connections: [THREE.Vector3, THREE.Vector3][] = [];
  const visited = new Set<string>();

  availableSweeps.forEach((sweep) => {
    sweep.neighbors.forEach((neighborId) => {
      const key = [sweep.id, neighborId].sort().join('-');
      if (!visited.has(key)) {
        visited.add(key);
        const neighbor = availableSweeps.find((s) => s.id === neighborId);
        if (neighbor) {
          connections.push([
            new THREE.Vector3(sweep.position[0], 0.1, sweep.position[2]),
            new THREE.Vector3(neighbor.position[0], 0.1, neighbor.position[2]),
          ]);
        }
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.6} />

      <gridHelper args={[30, 30, '#333', '#222']} />

      {availableSweeps.map((sweep) => (
        <mesh
          key={sweep.id}
          position={[sweep.position[0], 0.1, sweep.position[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[sweep.id === currentSweepId ? 0.5 : 0.3, 32]} />
          <meshBasicMaterial
            color={sweep.id === currentSweepId ? '#4fc3f7' : '#888'}
          />
        </mesh>
      ))}

      {connections.map((points, i) => (
        <Line
          key={i}
          points={[points[0], points[1]]}
          color="#4fc3f7"
          lineWidth={1}
          opacity={0.5}
          transparent
        />
      ))}

      <MapControls
        enableRotate={false}
        enabled={!isTransitioning}
      />
    </>
  );
}
