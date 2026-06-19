"use client";
import { Suspense, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  OrthographicCamera,
} from "@react-three/drei";
import * as THREE from "three";
import { useViewStore } from "@/stores/viewStore";
import { nearestSweep } from "@/lib/sweepGraph";
import { INSIDE_FOV } from "@/lib/constants";
import { SpaceModel } from "./SpaceModel";
import { SweepPucks } from "./SweepPucks";
import { CameraController } from "./CameraController";
import { FirstPersonLook } from "./FirstPersonLook";
import { Tags } from "./Tags";

// Clicks/hover on floor geometry below this height count as floor interactions.
const FLOOR_CLICK_MAX_Y = 0.9;

export function Scene() {
  const space = useViewStore((s) => s.space);
  const mode = useViewStore((s) => s.mode);
  const isTransitioning = useViewStore((s) => s.isTransitioning);
  const goToSweep = useViewStore((s) => s.goToSweep);
  const reticle = useRef<THREE.Mesh>(null);

  if (!space) return null;

  const isInside = mode === "inside";
  const isFloorplan = mode === "floorplan";

  const onModelMove = (e: ThreeEvent<PointerEvent>) => {
    if (!reticle.current) return;
    const onFloor = isInside && e.point.y < FLOOR_CLICK_MAX_Y;
    reticle.current.visible = onFloor;
    if (onFloor)
      reticle.current.position.set(e.point.x, e.point.y + 0.02, e.point.z);
  };

  const onModelClick = (e: ThreeEvent<MouseEvent>) => {
    if (!isInside || e.point.y >= FLOOR_CLICK_MAX_Y) return;
    e.stopPropagation();
    const ns = nearestSweep(space.sweeps, [e.point.x, e.point.y, e.point.z]);
    if (ns) goToSweep(ns.id);
  };

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} />
      <group
        onPointerMove={onModelMove}
        onPointerOut={() => {
          if (reticle.current) reticle.current.visible = false;
        }}
        onClick={onModelClick}
      >
        <Suspense fallback={null}>
          <SpaceModel url={space.modelUrl} />
        </Suspense>
      </group>

      {/* floor reticle: follows the cursor on the floor in inside mode */}
      <mesh
        ref={reticle}
        visible={false}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={998}
      >
        <ringGeometry args={[0.2, 0.3, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.8}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>

      <SweepPucks />
      <Tags />

      {/* Perspective camera for inside + dollhouse; orthographic for floorplan. */}
      <PerspectiveCamera
        makeDefault={!isFloorplan}
        fov={INSIDE_FOV}
        position={[0, 1.5, 0]}
        near={0.05}
        far={2000}
      />
      <OrthographicCamera
        makeDefault={isFloorplan}
        position={[0, 100, 0]}
        near={0.1}
        far={4000}
      />

      {/* Inside = first-person look-in-place; dollhouse/floorplan = OrbitControls. */}
      {isInside ? (
        <FirstPersonLook enabled={!isTransitioning} />
      ) : (
        <OrbitControls
          makeDefault
          enablePan={isFloorplan}
          enableZoom
          enableRotate={!isFloorplan}
        />
      )}
      <CameraController />
    </>
  );
}
