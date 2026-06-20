"use client";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useViewStore } from "@/stores/viewStore";
import { loadSpace, fallbackSpace } from "@/lib/space";
import { loadTags } from "@/lib/tags";
import { isWebGLAvailable } from "@/lib/webgl";
import { INSIDE_FOV, DRACO_PATH, FALLBACK_MODEL_URL } from "@/lib/constants";
import { Scene } from "./canvas/Scene";
import { LoadingScreen } from "./ui/LoadingScreen";
import { ModeToggle } from "./ui/ModeToggle";
import { ViewControls } from "./ui/ViewControls";
import { FloorSelector } from "./ui/FloorSelector";
import { Minimap } from "./ui/Minimap";
import { TagPanel } from "./ui/TagPanel";
import { MeasureControls } from "./ui/MeasureControls";
import { GuidedTour } from "./ui/GuidedTour";
import { DeepLink } from "./DeepLink";

export function TourViewer() {
  const setSpace = useViewStore((s) => s.setSpace);
  const setTags = useViewStore((s) => s.setTags);
  const space = useViewStore((s) => s.space);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSpace()
      .then((s) => {
        setSpace(s);
        useGLTF.preload(s.modelUrl, DRACO_PATH);
      })
      .catch((e) => {
        try {
          const fb = fallbackSpace(FALLBACK_MODEL_URL, [0, 0, 0]);
          setSpace(fb);
          useGLTF.preload(fb.modelUrl, DRACO_PATH);
        } catch {
          setError(String(e));
        }
      });
    loadTags().then(setTags);
  }, [setSpace, setTags]);

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-neutral-900 text-white">
        <p>Could not load the tour.</p>
        <button
          className="rounded bg-white px-4 py-2 text-neutral-900"
          onClick={() => location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (typeof window !== "undefined" && !isWebGLAvailable()) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-neutral-900 text-white">
        Your browser does not support WebGL.
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-900">
      <Canvas
        camera={{
          fov: INSIDE_FOV,
          position: [0, 1.5, 0],
          near: 0.05,
          far: 1000,
        }}
      >
        <Scene />
      </Canvas>
      {space && (
        <>
          <div className="absolute left-4 top-4 z-40 rounded-md bg-black/45 px-3 py-1.5 text-sm text-white">
            Virtual Tour
          </div>
          <Minimap />
          <FloorSelector />
          <ModeToggle />
          <ViewControls />
          <MeasureControls />
          <GuidedTour />
          <TagPanel />
          <DeepLink />
        </>
      )}
      <LoadingScreen />
    </div>
  );
}
