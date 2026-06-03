import { create } from 'zustand';
import { Sweep } from '@/lib/types';

interface SweepState {
  currentSweepId: string;
  sweeps: Record<string, Sweep>;
  availableSweeps: Sweep[];
  setCurrentSweep: (id: string) => void;
  loadSweeps: (sweeps: Sweep[]) => void;
  setAvailableSweeps: (sweeps: Sweep[]) => void;
  getNeighbors: () => Sweep[];
}

export const useSweepStore = create<SweepState>((set, get) => ({
  currentSweepId: '',
  sweeps: {},
  availableSweeps: [],

  setCurrentSweep: (id: string) => {
    set({ currentSweepId: id });
  },

  loadSweeps: (sweeps: Sweep[]) => {
    const sweepMap: Record<string, Sweep> = {};
    sweeps.forEach((s) => {
      sweepMap[s.id] = s;
    });
    set({
      sweeps: sweepMap,
      availableSweeps: sweeps,
      currentSweepId: sweeps.length > 0 ? sweeps[0].id : '',
    });
  },

  setAvailableSweeps: (sweeps: Sweep[]) => {
    set({ availableSweeps: sweeps });
  },

  getNeighbors: () => {
    const { currentSweepId, sweeps } = get();
    const current = sweeps[currentSweepId];
    if (!current) return [];
    return current.neighbors
      .map((id) => sweeps[id])
      .filter(Boolean);
  },
}));
