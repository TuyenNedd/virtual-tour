'use client';

import { OrbitControls } from '@react-three/drei';
import { useViewModeStore } from '@/stores/viewModeStore';
import { ViewMode } from '@/lib/types';

export function DollhouseView() {
  const currentMode = useViewModeStore((s) => s.currentMode);
  const isTransitioning = useViewModeStore((s) => s.isTransitioning);

  if (currentMode !== ViewMode.Dollhouse) return null;

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} />

      {/* Floor */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#444" wireframe />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 1.5, -6]}>
        <boxGeometry args={[12, 3, 0.2]} />
        <meshStandardMaterial color="#666" wireframe />
      </mesh>
      <mesh position={[0, 1.5, 6]}>
        <boxGeometry args={[12, 3, 0.2]} />
        <meshStandardMaterial color="#666" wireframe />
      </mesh>
      <mesh position={[-6, 1.5, 0]}>
        <boxGeometry args={[0.2, 3, 12]} />
        <meshStandardMaterial color="#666" wireframe />
      </mesh>
      <mesh position={[6, 1.5, 0]}>
        <boxGeometry args={[0.2, 3, 12]} />
        <meshStandardMaterial color="#666" wireframe />
      </mesh>

      {/* Interior wall */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[6, 3, 0.15]} />
        <meshStandardMaterial color="#888" wireframe />
      </mesh>

      {/* Roof outline */}
      <mesh position={[0, 3.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#555" wireframe />
      </mesh>

      <OrbitControls
        minDistance={5}
        maxDistance={50}
        enablePan
        enabled={!isTransitioning}
      />
    </>
  );
}
