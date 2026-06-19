"use client";
import { Suspense } from "react";
import {
  OrbitControls,
  PerspectiveCamera,
  OrthographicCamera,
} from "@react-three/drei";
import { useViewStore } from "@/stores/viewStore";
import { INSIDE_FOV } from "@/lib/constants";
import { SpaceModel } from "./SpaceModel";
import { SweepPucks } from "./SweepPucks";
import { CameraController } from "./CameraController";
import { FirstPersonLook } from "./FirstPersonLook";
import { Tags } from "./Tags";

export function Scene() {
  const space = useViewStore((s) => s.space);
  const mode = useViewStore((s) => s.mode);
  const isTransitioning = useViewStore((s) => s.isTransitioning);
  if (!space) return null;

  const isInside = mode === "inside";
  const isFloorplan = mode === "floorplan";

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} />
      <Suspense fallback={null}>
        <SpaceModel url={space.modelUrl} />
      </Suspense>
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
