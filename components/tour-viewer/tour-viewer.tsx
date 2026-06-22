"use client";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useViewStore } from "@/stores/view-store";
import { loadSpace, fallbackSpace } from "@/lib/space";
import { loadTags } from "@/lib/tags";
import { loadRooms } from "@/lib/rooms";
import { isWebGLAvailable } from "@/lib/webgl";
import { INSIDE_FOV, DRACO_PATH, FALLBACK_MODEL_URL } from "@/lib/constants";
import { Scene } from "../canvas/scene/scene";
import { LoadingScreen } from "../ui/loading-screen/loading-screen";
import { FloorSelector } from "../ui/floor-selector/floor-selector";
import { Minimap } from "../ui/minimap/minimap";
import { TagPanel } from "../ui/tag-panel/tag-panel";
import { Toolbar } from "../ui/toolbar/toolbar";
import { DeepLink } from "../deep-link/deep-link";
import { refractive } from "@hashintel/refractive";

export function TourViewer() {
  const setSpace = useViewStore((s) => s.setSpace);
  const setTags = useViewStore((s) => s.setTags);
  const setRooms = useViewStore((s) => s.setRooms);
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
    loadRooms().then(setRooms);
  }, [setSpace, setTags, setRooms]);

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-neutral-900 text-white">
        <p>Could not load the tour.</p>
        <button
          className="rounded bg-white px-4 py-2 text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
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
    <div
      className="relative h-screen w-screen overflow-hidden bg-neutral-900"
      role="application"
      aria-label="3D virtual tour viewer"
    >
      <p className="sr-only">
        Use the mode buttons to switch between Inside, Dollhouse and Floorplan
        views. In Inside view, drag to look around, scroll or pinch to zoom, use
        the arrow keys to move forward and back and to turn, and click a floor
        marker to walk there.
      </p>
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
          <refractive.div
            refraction={{ radius: 18, blur: 5, bezelWidth: 8 }}
            className="absolute left-4 top-4 z-40 border border-white/10 bg-black/40 px-3.5 py-1.5 text-sm font-medium text-white/90"
          >
            Virtual Tour
          </refractive.div>
          <Minimap />
          <FloorSelector />
          <Toolbar />
          <TagPanel />
          <DeepLink />
        </>
      )}
      <LoadingScreen />
    </div>
  );
}
