"use client";
import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useViewStore } from "@/stores/view-store";

const SENSITIVITY = 0.005;
const PITCH_LIMIT = Math.PI / 2 - 0.05;
const FOV_MIN = 30;
const FOV_MAX = 90;

// First-person look-in-place for Inside mode: dragging rotates the camera's own
// orientation (yaw/pitch) without moving it, like standing and turning your head.
// Heading is preserved across sweep moves because CameraController never touches
// rotation in inside mode.
export function FirstPersonLook({ enabled }: { enabled: boolean }) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const setInsideFov = useViewStore((s) => s.setInsideFov);

  const yaw = useRef(0);
  const pitch = useRef(0);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  // Re-sync yaw/pitch from the camera each time we (re)enter look mode, so we
  // continue from wherever the camera is currently facing.
  useEffect(() => {
    if (!enabled) return;
    const e = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
    yaw.current = e.y;
    pitch.current = e.x;
  }, [enabled, camera]);

  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e: PointerEvent) => {
      if (!enabled) return;
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      if (!enabled || !dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      // "grab the world" feel (like Matterport): dragging right turns the view
      // left so the scene follows the cursor; dragging down looks up.
      yaw.current += dx * SENSITIVITY;
      pitch.current += dy * SENSITIVITY;
      pitch.current = Math.max(
        -PITCH_LIMIT,
        Math.min(PITCH_LIMIT, pitch.current),
      );
    };
    const onUp = () => {
      dragging.current = false;
    };
    // wheel / +-buttons zoom by adjusting FOV (Matterport-style zoom)
    const onWheel = (e: WheelEvent) => {
      if (!enabled) return;
      e.preventDefault();
      const cam = camera as THREE.PerspectiveCamera;
      if (!cam.isPerspectiveCamera) return;
      const next = Math.max(
        FOV_MIN,
        Math.min(FOV_MAX, cam.fov + e.deltaY * 0.03),
      );
      cam.fov = next;
      cam.updateProjectionMatrix();
      setInsideFov(next);
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
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
