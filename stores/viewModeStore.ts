import { create } from 'zustand';
import { ViewMode, TransitionState } from '@/lib/types';

interface ViewModeState {
  currentMode: ViewMode;
  previousMode: ViewMode;
  transitionState: TransitionState;
  isTransitioning: boolean;
  transitionPhase: number;
  setMode: (mode: ViewMode) => void;
  setTransitionProgress: (progress: number) => void;
  advanceTransitionPhase: () => void;
  completeTransition: () => void;
}

export const useViewModeStore = create<ViewModeState>((set, get) => ({
  currentMode: ViewMode.Panorama,
  previousMode: ViewMode.Panorama,
  transitionState: {
    active: false,
    progress: 0,
    from: ViewMode.Panorama,
    to: ViewMode.Panorama,
  },
  isTransitioning: false,
  transitionPhase: 0,

  setMode: (mode: ViewMode) => {
    const { currentMode } = get();
    if (mode === currentMode) return;
    set({
      previousMode: currentMode,
      isTransitioning: true,
      transitionPhase: 0,
      transitionState: {
        active: true,
        progress: 0,
        from: currentMode,
        to: mode,
      },
    });
  },

  setTransitionProgress: (progress: number) => {
    set((state) => ({
      transitionState: { ...state.transitionState, progress },
    }));
  },

  advanceTransitionPhase: () => {
    const { transitionState } = get();
    set({
      transitionPhase: 1,
      currentMode: transitionState.to,
    });
  },

  completeTransition: () => {
    set((state) => ({
      isTransitioning: false,
      transitionPhase: 0,
      transitionState: {
        ...state.transitionState,
        active: false,
        progress: 1,
      },
    }));
  },
}));
