'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useViewModeStore } from '@/stores/viewModeStore';
import { useCameraTransition } from '@/hooks/useCameraTransition';
import { easeInOutCubic, lerp } from '@/lib/transitions';
import { TRANSITION_DURATION } from '@/lib/constants';

export function CameraController() {
  const { camera } = useThree();
  const progressRef = useRef(0);
  const startPosRef = useRef(new THREE.Vector3());
  const startTargetRef = useRef(new THREE.Vector3());
  const startFovRef = useRef(75);
  const transitionStartedRef = useRef(false);
  const phaseAdvancedRef = useRef(false);
  const lookTargetRef = useRef(new THREE.Vector3());

  const { transitionState, isTransitioning, getTargetCameraState } = useCameraTransition();
  const completeTransition = useViewModeStore((s) => s.completeTransition);
  const advanceTransitionPhase = useViewModeStore((s) => s.advanceTransitionPhase);
  const setTransitionProgress = useViewModeStore((s) => s.setTransitionProgress);

  useFrame((_, delta) => {
    if (!isTransitioning || !transitionState.active) {
      transitionStartedRef.current = false;
      phaseAdvancedRef.current = false;
      return;
    }

    if (!transitionStartedRef.current) {
      transitionStartedRef.current = true;
      phaseAdvancedRef.current = false;
      progressRef.current = 0;
      startPosRef.current.copy(camera.position);
      startTargetRef.current
        .set(0, 0, -1)
        .applyQuaternion(camera.quaternion)
        .add(camera.position);
      startFovRef.current = (camera as THREE.PerspectiveCamera).fov;
    }

    progressRef.current += delta / TRANSITION_DURATION;
    const t = Math.min(progressRef.current, 1);
    const eased = easeInOutCubic(t);

    // At the midpoint, advance the transition phase to switch the rendered view
    if (t >= 0.5 && !phaseAdvancedRef.current) {
      phaseAdvancedRef.current = true;
      advanceTransitionPhase();
    }

    const target = getTargetCameraState(transitionState.to);

    camera.position.set(
      lerp(startPosRef.current.x, target.position[0], eased),
      lerp(startPosRef.current.y, target.position[1], eased),
      lerp(startPosRef.current.z, target.position[2], eased)
    );

    const perspCam = camera as THREE.PerspectiveCamera;
    perspCam.fov = lerp(startFovRef.current, target.fov, eased);
    perspCam.updateProjectionMatrix();

    const lookTarget = lookTargetRef.current.set(
      lerp(startTargetRef.current.x, target.target[0], eased),
      lerp(startTargetRef.current.y, target.target[1], eased),
      lerp(startTargetRef.current.z, target.target[2], eased)
    );
    camera.lookAt(lookTarget);

    setTransitionProgress(t);

    if (t >= 1) {
      completeTransition();
      transitionStartedRef.current = false;
      phaseAdvancedRef.current = false;
    }
  });

  return null;
}
