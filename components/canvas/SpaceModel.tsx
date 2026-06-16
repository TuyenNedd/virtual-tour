"use client";
import { useGLTF } from "@react-three/drei";

const DRACO_PATH = "/draco/";

export function SpaceModel({ url }: { url: string }) {
  const { scene } = useGLTF(url, DRACO_PATH);
  return <primitive object={scene} />;
}
