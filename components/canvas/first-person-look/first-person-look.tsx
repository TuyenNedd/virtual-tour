"use client";
import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useViewStore } from "@/stores/view-store";
import { bestNeighborInDirection } from "@/lib/sweep-graph";

const SENSITIVITY = 0.005;
const PITCH_LIMIT = Math.PI / 2 - 0.05;
const FOV_MIN = 30;
const FOV_MAX = 90;
const ROTATE_STEP = 0.12; // radians per arrow-key press

// First-person look-in-place for Inside mode. Works with mouse and touch:
// one pointer drags to look (grab-the-world), two pointers pinch to zoom (FOV).
// Wheel also zooms. Arrow keys move (Up/Down to the neighbor ahead/behind) and
// turn (Left/Right). Heading is preserved across sweep moves.
export function FirstPersonLook({ enabled }: { enabled: boolean }) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const setInsideFov = useViewStore((s) => s.setInsideFov);

  const yaw = useRef(0);
  const pitch = useRef(0);
  // active pressed pointers (pointerId -> last position); unifies mouse + touch
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchLast = useRef(0);

  // Re-sync yaw/pitch from the camera each time we (re)enter look mode.
  useEffect(() => {
    if (!enabled) return;
    const e = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
    yaw.current = e.y;
    pitch.current = e.x;
  }, [enabled, camera]);

  useEffect(() => {
    const el = gl.domElement;

    const applyFov = (next: number) => {
      const cam = camera as THREE.PerspectiveCamera;
      if (!cam.isPerspectiveCamera) return;
      cam.fov = Math.max(FOV_MIN, Math.min(FOV_MAX, next));
      cam.updateProjectionMatrix();
      setInsideFov(cam.fov);
    };

    const onDown = (e: PointerEvent) => {
      if (!enabled) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.current.size === 2) pinchLast.current = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (!enabled) return;
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return; // only react to pressed pointers
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size === 1) {
        // single pointer: look around (grab-the-world feel)
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        yaw.current += dx * SENSITIVITY;
        pitch.current += dy * SENSITIVITY;
        pitch.current = Math.max(
          -PITCH_LIMIT,
          Math.min(PITCH_LIMIT, pitch.current),
        );
      } else if (pointers.current.size >= 2) {
        // two pointers: pinch to zoom (FOV)
        const [a, b] = [...pointers.current.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchLast.current > 0) {
          const cam = camera as THREE.PerspectiveCamera;
          if (cam.isPerspectiveCamera) {
            applyFov(cam.fov + (pinchLast.current - dist) * 0.1);
          }
        }
        pinchLast.current = dist;
      }
    };

    const onUp = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) pinchLast.current = 0;
    };

    const onWheel = (e: WheelEvent) => {
      if (!enabled) return;
      e.preventDefault();
      const cam = camera as THREE.PerspectiveCamera;
      if (!cam.isPerspectiveCamera) return;
      applyFov(cam.fov + e.deltaY * 0.03);
    };

    const onKey = (e: KeyboardEvent) => {
      if (!enabled) return;
      if (e.key === "ArrowLeft") {
        yaw.current += ROTATE_STEP;
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        yaw.current -= ROTATE_STEP;
        e.preventDefault();
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const { space, currentSweepId, goToSweep } = useViewStore.getState();
        if (!space || !currentSweepId) return;
        const dir = camera.getWorldDirection(new THREE.Vector3());
        const sign = e.key === "ArrowUp" ? 1 : -1;
        const ns = bestNeighborInDirection(
          space.sweeps,
          currentSweepId,
          dir.x * sign,
          dir.z * sign,
        );
        if (ns) goToSweep(ns.id);
      }
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", onKey);
      pointers.current.clear();
      pinchLast.current = 0;
    };
  }, [enabled, gl, camera, setInsideFov]);

  useFrame(() => {
    if (!enabled) return;
    camera.quaternion.setFromEuler(
      new THREE.Euler(pitch.current, yaw.current, 0, "YXZ"),
    );
  });

  return null;
}
