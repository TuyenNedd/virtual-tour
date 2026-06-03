'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PanoramaView } from './PanoramaView';
import { DollhouseView } from './DollhouseView';
import { FloorplanView } from './FloorplanView';
import { SweepPuck } from './SweepPuck';
import { CameraController } from './CameraController';
import { DEFAULT_FOV } from '@/lib/constants';

export function Scene() {
  return (
    <Canvas
      camera={{ fov: DEFAULT_FOV, near: 0.1, far: 2000, position: [0, 0, 0] }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <PanoramaView />
        <DollhouseView />
        <FloorplanView />
        <SweepPuck />
        <CameraController />
      </Suspense>
    </Canvas>
  );
}
