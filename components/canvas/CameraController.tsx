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
  // inside: camera sits at the sweep; target is a short distance ahead toward
  // the room center so OrbitControls becomes a gentle in-place look-around.
  const dir = new THREE.Vector3(
    center.x - sweepPos.x,
    0,
    center.z - sweepPos.z,
  );
  if (dir.lengthSq() < 1e-6) dir.set(0, 0, -1);
  dir.normalize();
  const target = sweepPos.clone().add(dir.multiplyScalar(1.5));
  return { pos: sweepPos.clone(), target, fov: INSIDE_FOV };
}

export function CameraController() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  // OrbitControls registers itself here via makeDefault (may be null on first frames)
  const controls = useThree((s) => s.controls) as
    | (THREE.EventDispatcher & {
        target: THREE.Vector3;
        enabled: boolean;
        update: () => void;
      })
    | null;

  const space = useViewStore((s) => s.space);
  const mode = useViewStore((s) => s.mode);
  const currentSweepId = useViewStore((s) => s.currentSweepId);
  const setTransitioning = useViewStore((s) => s.setTransitioning);

  const bounds = useRef({
    center: new THREE.Vector3(),
    size: new THREE.Vector3(10, 3, 10),
  });
  const animating = useRef(false);
  const goalPos = useRef(new THREE.Vector3());
  const goalTarget = useRef(new THREE.Vector3());
  const goalFov = useRef(INSIDE_FOV);

  // recompute model bounds from sweep extents when the space changes
  useEffect(() => {
    if (!space || space.sweeps.length === 0) return;
    const xs = space.sweeps.map((s) => s.position[0]);
    const ys = space.sweeps.map((s) => s.position[1]);
    const zs = space.sweeps.map((s) => s.position[2]);
    bounds.current = {
      center: new THREE.Vector3(
        (Math.min(...xs) + Math.max(...xs)) / 2,
        (Math.min(...ys) + Math.max(...ys)) / 2,
        (Math.min(...zs) + Math.max(...zs)) / 2,
      ),
      size: new THREE.Vector3(
        Math.max(...xs) - Math.min(...xs) || 10,
        3,
        Math.max(...zs) - Math.min(...zs) || 10,
      ),
    };
  }, [space]);

  // start a transition whenever mode or current sweep changes
  useEffect(() => {
    if (!space || space.sweeps.length === 0) return;
    const sweep =
      space.sweeps.find((s) => s.id === currentSweepId) ?? space.sweeps[0];
    const { pos, target, fov } = desiredPose(
      mode,
      new THREE.Vector3(...sweep.position),
      bounds.current.center,
      bounds.current.size,
    );
    goalPos.current.copy(pos);
    goalTarget.current.copy(target);
    goalFov.current = fov;
    animating.current = true;
    setTransitioning(true);
  }, [mode, currentSweepId, space, setTransitioning]);

  useFrame((_, delta) => {
    if (!animating.current) return;
    const k = 1 - Math.pow(0.001, delta);

    camera.position.lerp(goalPos.current, k);
    if (controls) {
      controls.enabled = false;
      controls.target.lerp(goalTarget.current, k);
      controls.update();
    } else {
      camera.lookAt(goalTarget.current);
    }
    if (Math.abs(camera.fov - goalFov.current) > 0.1) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, goalFov.current, k);
      camera.updateProjectionMatrix();
    }

    if (camera.position.distanceTo(goalPos.current) < 0.02) {
      camera.position.copy(goalPos.current);
      camera.fov = goalFov.current;
      camera.updateProjectionMatrix();
      if (controls) {
        controls.target.copy(goalTarget.current);
        controls.enabled = true;
        controls.update();
      }
      animating.current = false;
      setTransitioning(false);
    }
  });

  return null;
}
