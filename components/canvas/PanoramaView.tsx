'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { useSweepNavigation } from '@/hooks/useSweepNavigation';
import { useViewModeStore } from '@/stores/viewModeStore';
import { ViewMode } from '@/lib/types';

function createGradientTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#1a237e');
  gradient.addColorStop(0.3, '#4fc3f7');
  gradient.addColorStop(0.6, '#ffb74d');
  gradient.addColorStop(1, '#ff7043');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

export function PanoramaView() {
  const { currentSweep } = useSweepNavigation();
  const isTransitioning = useViewModeStore((s) => s.isTransitioning);
  const currentMode = useViewModeStore((s) => s.currentMode);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const { camera } = useThree();

  const texture = useMemo(() => {
    const tex = createGradientTexture();
    textureRef.current = tex;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (currentMode === ViewMode.Panorama && currentSweep && !isTransitioning) {
      camera.position.set(...currentSweep.position);
    }
  }, [currentSweep, currentMode, isTransitioning, camera]);

  if (currentMode !== ViewMode.Panorama) return null;

  const position: [number, number, number] = currentSweep
    ? currentSweep.position
    : [0, 0, 0];

  return (
    <>
      <mesh position={position} scale={[-1, 1, 1]}>
        <sphereGeometry args={[500, 64, 32]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={-0.3}
        enabled={!isTransitioning}
      />
    </>
  );
}
