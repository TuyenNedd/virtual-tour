'use client';

import { useCallback } from 'react';
import { useSweepStore } from '@/stores/sweepStore';

export function useSweepNavigation() {
  const currentSweepId = useSweepStore((s) => s.currentSweepId);
  const sweeps = useSweepStore((s) => s.sweeps);
  const availableSweeps = useSweepStore((s) => s.availableSweeps);
  const setCurrentSweep = useSweepStore((s) => s.setCurrentSweep);
  const getNeighbors = useSweepStore((s) => s.getNeighbors);

  const currentSweep = sweeps[currentSweepId] || null;
  const neighbors = getNeighbors();

  const navigateToSweep = useCallback(
    (sweepId: string) => {
      if (!sweeps[sweepId]) return;
      setCurrentSweep(sweepId);
    },
    [sweeps, setCurrentSweep]
  );

  return { currentSweep, currentSweepId, neighbors, availableSweeps, navigateToSweep };
}
