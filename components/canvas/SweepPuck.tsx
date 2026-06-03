'use client';

import { useViewModeStore } from '@/stores/viewModeStore';
import { ViewMode } from '@/lib/types';

export function SweepPuck() {
  const currentMode = useViewModeStore((s) => s.currentMode);

  // In Panorama mode: handled by PanoramaSweepPucks inside PanoramaView
  // In Floorplan mode: handled by FloorplanView's own clickable circles
  // In Dollhouse mode: handled by DollhouseView's own DollhousePuck components
  // So SweepPuck no longer renders anything directly
  if (currentMode !== ViewMode.Dollhouse) return null;

  // Dollhouse pucks are now rendered inside DollhouseView directly
  return null;
}
