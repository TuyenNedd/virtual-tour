import { create } from 'zustand';
import { SpaceData, Floor } from '@/lib/types';
import { useSweepStore } from './sweepStore';

interface SpaceState {
  spaceData: SpaceData | null;
  currentFloor: number;
  floors: Floor[];
  isLoaded: boolean;
  loadSpace: (data: SpaceData) => void;
  setFloor: (floorNumber: number) => void;
  getSweepsForFloor: (floor: number) => string[];
}

export const useSpaceStore = create<SpaceState>((set, get) => ({
  spaceData: null,
  currentFloor: 0,
  floors: [],
  isLoaded: false,

  loadSpace: (data: SpaceData) => {
    set({
      spaceData: data,
      floors: data.floors,
      currentFloor: data.floors.length > 0 ? data.floors[0].number : 0,
      isLoaded: true,
    });
    useSweepStore.getState().loadSweeps(data.sweeps);
  },

  setFloor: (floorNumber: number) => {
    const { spaceData } = get();
    if (!spaceData) return;
    set({ currentFloor: floorNumber });
    const floorSweeps = spaceData.sweeps.filter((s) => s.floor === floorNumber);
    useSweepStore.getState().setAvailableSweeps(floorSweeps);
    if (floorSweeps.length > 0) {
      useSweepStore.getState().setCurrentSweep(floorSweeps[0].id);
    }
  },

  getSweepsForFloor: (floor: number) => {
    const { spaceData } = get();
    if (!spaceData) return [];
    return spaceData.sweeps
      .filter((s) => s.floor === floor)
      .map((s) => s.id);
  },
}));
