'use client';

import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { MapControls, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useViewModeStore } from '@/stores/viewModeStore';
import { useSweepStore } from '@/stores/sweepStore';
import { useSweepNavigation } from '@/hooks/useSweepNavigation';
import { ViewMode, Sweep } from '@/lib/types';
import { FLOORPLAN_CAMERA_HEIGHT, ROOM_LABELS } from '@/lib/constants';

function FloorplanPuck({ sweep, isCurrent }: { sweep: Sweep; isCurrent: boolean }) {
  const [hovered, setHovered] = useState(false);
  const setMode = useViewModeStore((s) => s.setMode);
  const setCurrentSweep = useSweepStore((s) => s.setCurrentSweep);

  const radius = isCurrent ? 0.5 : 0.35;
  const color = isCurrent ? '#4fc3f7' : hovered ? '#aaa' : '#888';
  const scale = hovered ? 1.3 : 1;

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default';
    };
  }, []);

  return (
    <mesh
      position={[sweep.position[0], 0.15, sweep.position[2]]}
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
      <circleGeometry args={[radius, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

export function FloorplanView() {
  const currentMode = useViewModeStore((s) => s.currentMode);
  const isTransitioning = useViewModeStore((s) => s.isTransitioning);
  const { availableSweeps, currentSweepId } = useSweepNavigation();
  const { camera } = useThree();

  useEffect(() => {
    if (currentMode === ViewMode.Floorplan && !isTransitioning) {
      camera.position.set(0, FLOORPLAN_CAMERA_HEIGHT, 0.01);
      camera.lookAt(0, 0, 0);
      const perspCam = camera as THREE.PerspectiveCamera;
      perspCam.fov = 6;
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
      <ambientLight intensity={0.8} />

      {/* Grid overlay */}
      <gridHelper args={[20, 20, '#333', '#222']} />

      {/* Floor outline rectangle matching house shape */}
      <Line
        points={[
          new THREE.Vector3(-6, 0.05, -6),
          new THREE.Vector3(6, 0.05, -6),
          new THREE.Vector3(6, 0.05, 6),
          new THREE.Vector3(-6, 0.05, 6),
          new THREE.Vector3(-6, 0.05, -6),
        ]}
        color="#666"
        lineWidth={2}
      />

      {/* Connection lines between neighbors */}
      {connections.map((points, i) => (
        <Line
          key={i}
          points={[points[0], points[1]]}
          color="#4fc3f7"
          lineWidth={1.5}
          opacity={0.5}
          transparent
        />
      ))}

      {/* Sweep circles */}
      {availableSweeps.map((sweep) => (
        <FloorplanPuck
          key={sweep.id}
          sweep={sweep}
          isCurrent={sweep.id === currentSweepId}
        />
      ))}

      {/* Room labels */}
      {ROOM_LABELS.map((label) => (
        <Text
          key={label.name}
          position={[label.position[0], 0.2, label.position[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label.name}
        </Text>
      ))}

      <MapControls
        enableRotate={false}
        enabled={!isTransitioning}
      />
    </>
  );
}
