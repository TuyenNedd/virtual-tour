'use client';

import { useCallback } from 'react';
import { useViewModeStore } from '@/stores/viewModeStore';
import { ViewMode } from '@/lib/types';

export function useViewMode() {
  const currentMode = useViewModeStore((s) => s.currentMode);
  const isTransitioning = useViewModeStore((s) => s.isTransitioning);
  const transitionState = useViewModeStore((s) => s.transitionState);
  const setMode = useViewModeStore((s) => s.setMode);

  const switchToMode = useCallback(
    (mode: ViewMode) => {
      if (isTransitioning) return;
      setMode(mode);
    },
    [isTransitioning, setMode]
  );

  return { currentMode, isTransitioning, transitionState, switchToMode };
}
