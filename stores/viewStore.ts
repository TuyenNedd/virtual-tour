import { create } from "zustand";
import type { SpaceData, Tag, ViewMode } from "@/lib/types";
import { DEFAULT_MODE, INSIDE_FOV } from "@/lib/constants";
import { findPath } from "@/lib/pathfinding";

interface ViewState {
  space: SpaceData | null;
  mode: ViewMode;
  currentSweepId: string | null;
  pendingPath: string[]; // remaining waypoints when walking to a distant sweep
  floorId: number;
  isTransitioning: boolean;
  facing: number; // screen-space heading (radians) for the minimap arrow
  insideFov: number; // perspective FOV for inside mode (zoom)
  tags: Tag[];
  selectedTagId: string | null;
  setSpace: (s: SpaceData) => void;
  setMode: (m: ViewMode) => void;
  goToSweep: (id: string) => void;
  advancePath: () => void;
  setFloor: (id: number) => void;
  setTransitioning: (v: boolean) => void;
  setFacing: (f: number) => void;
  setInsideFov: (f: number) => void;
  setTags: (t: Tag[]) => void;
  selectTag: (id: string | null) => void;
}

export const useViewStore = create<ViewState>((set, get) => ({
  space: null,
  mode: DEFAULT_MODE,
  currentSweepId: null,
  pendingPath: [],
  floorId: 0,
  isTransitioning: false,
  facing: 0,
  insideFov: INSIDE_FOV,
  tags: [],
  selectedTagId: null,
  setSpace: (space) =>
    set({
      space,
      currentSweepId: space.sweeps[0]?.id ?? null,
      floorId: space.floors[0]?.id ?? 0,
      pendingPath: [],
    }),
  setMode: (mode) => set({ mode }),
  // Walk to a sweep along the neighbor graph (Matterport-style) instead of
  // cutting straight through walls. The camera glides through each waypoint.
  goToSweep: (targetId) => {
    const { space, currentSweepId } = get();
    if (!space || !currentSweepId || currentSweepId === targetId) {
      set({ currentSweepId: targetId, mode: "inside", pendingPath: [] });
      return;
    }
    const path = findPath(space.sweeps, currentSweepId, targetId);
    if (path.length <= 1) {
      // disconnected / unknown: fall back to a direct jump
      set({ currentSweepId: targetId, mode: "inside", pendingPath: [] });
      return;
    }
    // path[0] is the current sweep; step into path[1] and queue the rest.
    set({
      mode: "inside",
      currentSweepId: path[1],
      pendingPath: path.slice(2),
    });
  },
  advancePath: () => {
    const { pendingPath } = get();
    if (pendingPath.length === 0) return;
    set({ currentSweepId: pendingPath[0], pendingPath: pendingPath.slice(1) });
  },
  setFloor: (floorId) => set({ floorId }),
  setTransitioning: (isTransitioning) => set({ isTransitioning }),
  setFacing: (facing) => set({ facing }),
  setInsideFov: (insideFov) => set({ insideFov }),
  setTags: (tags) => set({ tags }),
  selectTag: (selectedTagId) => set({ selectedTagId }),
}));
