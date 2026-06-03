'use client';

import { useViewModeStore } from '@/stores/viewModeStore';
import { ViewMode } from '@/lib/types';
import {
  DOLLHOUSE_CAMERA_DISTANCE,
  FLOORPLAN_CAMERA_HEIGHT,
  DEFAULT_FOV,
} from '@/lib/constants';

export function useCameraTransition() {
  const transitionState = useViewModeStore((s) => s.transitionState);
  const isTransitioning = useViewModeStore((s) => s.isTransitioning);

  function getTargetCameraState(mode: ViewMode, sweepPosition: [number, number, number]) {
    switch (mode) {
      case ViewMode.Panorama:
        return {
          position: sweepPosition,
          target: [
            sweepPosition[0],
            sweepPosition[1],
            sweepPosition[2] - 1,
          ] as [number, number, number],
          fov: DEFAULT_FOV,
        };
      case ViewMode.Dollhouse:
        return {
          position: [
            sweepPosition[0] + DOLLHOUSE_CAMERA_DISTANCE * 0.5,
            DOLLHOUSE_CAMERA_DISTANCE,
            sweepPosition[2] + DOLLHOUSE_CAMERA_DISTANCE * 0.5,
          ] as [number, number, number],
          target: [0, 0, 0] as [number, number, number],
          fov: DEFAULT_FOV,
        };
      case ViewMode.Floorplan:
        return {
          position: [0, FLOORPLAN_CAMERA_HEIGHT, 0] as [number, number, number],
          target: [0, 0, 0] as [number, number, number],
          fov: 20,
        };
      default:
        return {
          position: sweepPosition,
          target: [0, 0, 0] as [number, number, number],
          fov: DEFAULT_FOV,
        };
    }
  }

  return { transitionState, isTransitioning, getTargetCameraState };
}
