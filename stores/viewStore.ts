import { create } from "zustand";
import type { SpaceData, ViewMode } from "@/lib/types";
import { DEFAULT_MODE, INSIDE_FOV } from "@/lib/constants";

interface ViewState {
  space: SpaceData | null;
  mode: ViewMode;
  currentSweepId: string | null;
  floorId: number;
  isTransitioning: boolean;
  facing: number; // screen-space heading (radians) for the minimap arrow
  insideFov: number; // perspective FOV for inside mode (zoom)
  setSpace: (s: SpaceData) => void;
  setMode: (m: ViewMode) => void;
  goToSweep: (id: string) => void;
  setFloor: (id: number) => void;
  setTransitioning: (v: boolean) => void;
  setFacing: (f: number) => void;
  setInsideFov: (f: number) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  space: null,
  mode: DEFAULT_MODE,
  currentSweepId: null,
  floorId: 0,
  isTransitioning: false,
  facing: 0,
  insideFov: INSIDE_FOV,
  setSpace: (space) =>
    set({
      space,
      currentSweepId: space.sweeps[0]?.id ?? null,
      floorId: space.floors[0]?.id ?? 0,
    }),
  setMode: (mode) => set({ mode }),
  goToSweep: (currentSweepId) => set({ currentSweepId, mode: "inside" }),
  setFloor: (floorId) => set({ floorId }),
  setTransitioning: (isTransitioning) => set({ isTransitioning }),
  setFacing: (facing) => set({ facing }),
  setInsideFov: (insideFov) => set({ insideFov }),
}));
