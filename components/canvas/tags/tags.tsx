"use client";
import { Billboard } from "@react-three/drei";
import { useViewStore } from "@/stores/view-store";

// Mattertag-style hotspots: billboarded dots that always face the camera and
// stay visible through walls (depthTest off), like Matterport. Click to open.
export function Tags() {
  const tags = useViewStore((s) => s.tags);
  const mode = useViewStore((s) => s.mode);
  const selectedTagId = useViewStore((s) => s.selectedTagId);
  const selectTag = useViewStore((s) => s.selectTag);
  const measureMode = useViewStore((s) => s.measureMode);

  if (mode === "floorplan" || measureMode || tags.length === 0) return null;

  return (
    <>
      {tags.map((t) => (
        <Billboard key={t.id} position={t.position}>
          <mesh
            renderOrder={999}
            onClick={(e) => {
              e.stopPropagation();
              selectTag(t.id);
            }}
            onPointerOver={() => (document.body.style.cursor = "pointer")}
            onPointerOut={() => (document.body.style.cursor = "default")}
          >
            <circleGeometry args={[0.12, 24]} />
            <meshBasicMaterial
              color={t.color ?? "#22d3ee"}
              transparent
              opacity={0.9}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
          <mesh renderOrder={999}>
            <ringGeometry args={[0.14, 0.18, 24]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={selectedTagId === t.id ? 0.95 : 0.45}
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
        </Billboard>
      ))}
    </>
  );
}
