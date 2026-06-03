'use client';

import { motion } from 'framer-motion';
import { useViewMode } from '@/hooks/useViewMode';
import { ViewMode } from '@/lib/types';

const modes = [
  { mode: ViewMode.Panorama, label: 'Inside' },
  { mode: ViewMode.Dollhouse, label: 'Dollhouse' },
  { mode: ViewMode.Floorplan, label: 'Floorplan' },
];

export function ModeButtons() {
  const { currentMode, isTransitioning, switchToMode } = useViewMode();

  return (
    <div className="fixed bottom-8 left-1/2 z-40 -translate-x-1/2">
      <div className="relative flex gap-2 rounded-full bg-white/10 p-2 backdrop-blur-md">
        {modes.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => switchToMode(mode)}
            disabled={isTransitioning}
            className={`relative z-10 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              currentMode === mode
                ? 'text-white'
                : 'text-white/60 hover:text-white/90'
            } disabled:opacity-50`}
          >
            {currentMode === mode && (
              <motion.div
                layoutId="modeIndicator"
                className="absolute inset-0 rounded-full bg-white/20"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
