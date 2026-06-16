"use client";
import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useViewStore } from "@/stores/viewStore";
import { INSIDE_FOV, DOLLHOUSE_FOV } from "@/lib/constants";

function desiredPose(
  mode: string,
  sweepPos: THREE.Vector3,
  center: THREE.Vector3,
  size: THREE.Vector3,
): { pos: THREE.Vector3; target: THREE.Vector3; fov: number } {
  const radius = Math.max(size.x, size.z);
  if (mode === "dollhouse") {
    return {
      pos: new THREE.Vector3(
        center.x + radius,
        center.y + radius * 0.9,
        center.z + radius,
      ),
      target: center.clone(),
      fov: DOLLHOUSE_FOV,
    };
  }
  if (mode === "floorplan") {
    return {
      pos: new THREE.Vector3(
        center.x,
        center.y + radius * 1.6,
        center.z + 0.001,
      ),
      target: center.clone(),
      fov: DOLLHOUSE_FOV,
    };
  }
  const look = center.clone();
  look.y = sweepPos.y;
  return { pos: sweepPos.clone(), target: look, fov: INSIDE_FOV };
}

export function CameraController() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const space = useViewStore((s) => s.space);
  const mode = useViewStore((s) => s.mode);
  const currentSweepId = useViewStore((s) => s.currentSweepId);
  const setTransitioning = useViewStore((s) => s.setTransitioning);

  const targetRef = useRef(new THREE.Vector3());
  const bounds = useRef({
    center: new THREE.Vector3(),
    size: new THREE.Vector3(10, 3, 10),
  });

  useEffect(() => {
    if (!space) return;
    const xs = space.sweeps.map((s) => s.position[0]);
    const zs = space.sweeps.map((s) => s.position[2]);
    const ys = space.sweeps.map((s) => s.position[1]);
    const center = new THREE.Vector3(
      (Math.min(...xs) + Math.max(...xs)) / 2,
      (Math.min(...ys) + Math.max(...ys)) / 2,
      (Math.min(...zs) + Math.max(...zs)) / 2,
    );
    const size = new THREE.Vector3(
      Math.max(...xs) - Math.min(...xs) || 10,
      3,
      Math.max(...zs) - Math.min(...zs) || 10,
    );
    bounds.current = { center, size };
  }, [space]);

  useFrame((_, delta) => {
    if (!space) return;
    const sweep =
      space.sweeps.find((s) => s.id === currentSweepId) ?? space.sweeps[0];
    const sweepPos = new THREE.Vector3(...sweep.position);
    const { pos, target, fov } = desiredPose(
      mode,
      sweepPos,
      bounds.current.center,
      bounds.current.size,
    );

    const k = 1 - Math.pow(0.001, delta);
    camera.position.lerp(pos, k);
    targetRef.current.lerp(target, k);
    camera.lookAt(targetRef.current);

    if (Math.abs(camera.fov - fov) > 0.1) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, fov, k);
      camera.updateProjectionMatrix();
    }

    const settled = camera.position.distanceTo(pos) < 0.02;
    setTransitioning(!settled);
  });

  return null;
}
