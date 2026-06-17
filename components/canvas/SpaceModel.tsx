"use client";
import { useGLTF } from "@react-three/drei";
import { DRACO_PATH, MODEL_UP_FIX_ROTATION_X } from "@/lib/constants";

export function SpaceModel({ url }: { url: string }) {
  const { scene } = useGLTF(url, DRACO_PATH);
  // HM3D meshes are Z-up; rotate to Y-up to match the sweep generator and camera.
  return (
    <group rotation={[MODEL_UP_FIX_ROTATION_X, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}
