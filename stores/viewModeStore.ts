import { create } from 'zustand';
import { ViewMode, TransitionState } from '@/lib/types';

interface ViewModeState {
  currentMode: ViewMode;
  previousMode: ViewMode;
  transitionState: TransitionState;
  isTransitioning: boolean;
  setMode: (mode: ViewMode) => void;
  setTransitionProgress: (progress: number) => void;
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

  setMode: (mode: ViewMode) => {
    const { currentMode } = get();
    if (mode === currentMode) return;
    set({
      previousMode: currentMode,
      currentMode: mode,
      isTransitioning: true,
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

  completeTransition: () => {
    set((state) => ({
      isTransitioning: false,
      transitionState: {
        ...state.transitionState,
        active: false,
        progress: 1,
      },
    }));
  },
}));
