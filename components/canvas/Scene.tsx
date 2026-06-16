"use client";
import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";
import { useViewStore } from "@/stores/viewStore";
import { SpaceModel } from "./SpaceModel";
import { SweepPucks } from "./SweepPucks";
import { CameraController } from "./CameraController";

export function Scene() {
  const space = useViewStore((s) => s.space);
  const mode = useViewStore((s) => s.mode);
  if (!space) return null;

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} />
      <Suspense fallback={null}>
        <SpaceModel url={space.modelUrl} />
      </Suspense>
      <SweepPucks />
      {/* OrbitControls registers as default; CameraController drives it during transitions.
          inside: rotate-only look-around; dollhouse: orbit+zoom; floorplan: pan+zoom, no rotate. */}
      <OrbitControls
        makeDefault
        enablePan={mode === "floorplan"}
        enableZoom={mode !== "inside"}
        enableRotate={mode !== "floorplan"}
      />
      <CameraController />
    </>
  );
}
