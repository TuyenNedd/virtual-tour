"use client";
import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useViewStore } from "@/stores/viewStore";
import { INSIDE_FOV, DOLLHOUSE_FOV } from "@/lib/constants";

type OrbitLike = THREE.EventDispatcher & {
  target: THREE.Vector3;
  enabled: boolean;
  update: () => void;
};

export function CameraController() {
  const camera = useThree((s) => s.camera);
  const viewport = useThree((s) => s.size);
  // OrbitControls registers itself here via makeDefault (null in inside mode)
  const controls = useThree((s) => s.controls) as OrbitLike | null;

  const space = useViewStore((s) => s.space);
  const mode = useViewStore((s) => s.mode);
  const currentSweepId = useViewStore((s) => s.currentSweepId);
  const setTransitioning = useViewStore((s) => s.setTransitioning);
  const setFacing = useViewStore((s) => s.setFacing);
  const insideFov = useViewStore((s) => s.insideFov);

  const bounds = useRef({
    center: new THREE.Vector3(),
    size: new THREE.Vector3(10, 3, 10),
  });
  const animating = useRef(false);
  const goalPos = useRef(new THREE.Vector3());
  const goalTarget = useRef(new THREE.Vector3());
  const goalFov = useRef(INSIDE_FOV);
  const goalZoom = useRef(1);
  const prevMode = useRef<string | null>(null);
  const lastFacing = useRef(0);
  const tmp = useRef(new THREE.Vector3());

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
    const sp = new THREE.Vector3(...sweep.position);
    const { center, size } = bounds.current;
    const radius = Math.max(size.x, size.z);

    if (mode === "dollhouse") {
      goalPos.current.set(
        center.x + radius,
        center.y + radius * 0.9,
        center.z + radius,
      );
      goalTarget.current.copy(center);
      goalFov.current = DOLLHOUSE_FOV;
    } else if (mode === "floorplan") {
      goalPos.current.set(center.x, center.y + radius * 2 + 10, center.z);
      goalTarget.current.copy(center);
      // orthographic zoom to fit the floor footprint into the viewport
      goalZoom.current =
        Math.min(
          viewport.width / (size.x || 1),
          viewport.height / (size.z || 1),
        ) * 0.9;
    } else {
      // inside: move to the sweep; rotation is owned by FirstPersonLook.
      goalPos.current.copy(sp);
      goalTarget.current.set(center.x, sp.y, center.z);
      goalFov.current = insideFov;
      // On first entry into inside mode, face the room center once so the
      // initial view is sensible. On subsequent sweep moves keep the heading.
      if (prevMode.current !== "inside") {
        camera.position.copy(sp);
        camera.lookAt(goalTarget.current);
      }
    }
    prevMode.current = mode;
    animating.current = true;
    setTransitioning(true);
  }, [
    mode,
    currentSweepId,
    space,
    viewport.width,
    viewport.height,
    camera,
    setTransitioning,
  ]);

  useFrame((_, delta) => {
    // publish camera heading (screen-space angle) for the minimap arrow
    const dir = camera.getWorldDirection(tmp.current);
    const facing = Math.atan2(dir.z, dir.x);
    if (Math.abs(facing - lastFacing.current) > 0.03) {
      lastFacing.current = facing;
      setFacing(facing);
    }

    if (!animating.current) return;
    const k = 1 - Math.pow(0.001, delta);
    const ortho = (camera as THREE.OrthographicCamera).isOrthographicCamera;

    camera.position.lerp(goalPos.current, k);

    if (mode !== "inside") {
      if (controls) {
        controls.enabled = false;
        controls.target.lerp(goalTarget.current, k);
        controls.update();
      } else {
        camera.lookAt(goalTarget.current);
      }
    }

    if (ortho) {
      const oc = camera as THREE.OrthographicCamera;
      oc.zoom = THREE.MathUtils.lerp(oc.zoom, goalZoom.current, k);
      oc.updateProjectionMatrix();
    } else {
      const pc = camera as THREE.PerspectiveCamera;
      if (Math.abs(pc.fov - goalFov.current) > 0.1) {
        pc.fov = THREE.MathUtils.lerp(pc.fov, goalFov.current, k);
        pc.updateProjectionMatrix();
      }
    }

    const posSettled = camera.position.distanceTo(goalPos.current) < 0.05;
    const zoomSettled =
      !ortho ||
      Math.abs((camera as THREE.OrthographicCamera).zoom - goalZoom.current) <
        0.5;
    if (posSettled && zoomSettled) {
      camera.position.copy(goalPos.current);
      if (ortho) {
        const oc = camera as THREE.OrthographicCamera;
        oc.zoom = goalZoom.current;
        oc.updateProjectionMatrix();
      }
      if (mode !== "inside" && controls) {
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
