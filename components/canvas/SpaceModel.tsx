"use client";
import { useGLTF } from "@react-three/drei";
import { DRACO_PATH } from "@/lib/constants";

export function SpaceModel({ url }: { url: string }) {
  const { scene } = useGLTF(url, DRACO_PATH);
  return <primitive object={scene} />;
}
