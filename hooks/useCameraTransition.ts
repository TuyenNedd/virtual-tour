'use client';

import { useViewModeStore } from '@/stores/viewModeStore';
import { ViewMode } from '@/lib/types';

export function useCameraTransition() {
  const transitionState = useViewModeStore((s) => s.transitionState);
  const isTransitioning = useViewModeStore((s) => s.isTransitioning);
  const transitionPhase = useViewModeStore((s) => s.transitionPhase);

  function getTargetCameraState(mode: ViewMode) {
    switch (mode) {
      case ViewMode.Panorama:
        return {
          position: [0, 0, 0] as [number, number, number],
          target: [0, 0, -1] as [number, number, number],
          fov: 75,
        };
      case ViewMode.Dollhouse:
        return {
          position: [10, 15, 10] as [number, number, number],
          target: [0, 0, 0] as [number, number, number],
          fov: 60,
        };
      case ViewMode.Floorplan:
        return {
          position: [0, 50, 0.01] as [number, number, number],
          target: [0, 0, 0] as [number, number, number],
          fov: 6,
        };
      default:
        return {
          position: [0, 0, 0] as [number, number, number],
          target: [0, 0, -1] as [number, number, number],
          fov: 75,
        };
    }
  }

  return { transitionState, isTransitioning, transitionPhase, getTargetCameraState };
}
