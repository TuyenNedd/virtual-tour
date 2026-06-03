'use client';

import { motion } from 'framer-motion';
import { useViewMode } from '@/hooks/useViewMode';
import { ViewMode } from '@/lib/types';
import { useViewModeStore } from '@/stores/viewModeStore';

function PanoramaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1.5 7h11M7 1.5c-1.5 1.5-2 3.5-2 5.5s.5 4 2 5.5M7 1.5c1.5 1.5 2 3.5 2 5.5s-.5 4-2 5.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function DollhouseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 1L1.5 5v7.5h11V5L7 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5.5 12.5V9h3v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function FloorplanIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1.5 5.5h11M5.5 5.5v7M9 1.5v4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

const modes = [
  { mode: ViewMode.Panorama, label: 'Inside', Icon: PanoramaIcon },
  { mode: ViewMode.Dollhouse, label: 'Dollhouse', Icon: DollhouseIcon },
  { mode: ViewMode.Floorplan, label: 'Floorplan', Icon: FloorplanIcon },
];

export function ModeButtons() {
  const { currentMode, isTransitioning, switchToMode } = useViewMode();
  const transitionState = useViewModeStore((s) => s.transitionState);

  return (
    <div className="fixed bottom-8 left-1/2 z-40 -translate-x-1/2">
      <div className="relative flex gap-2 rounded-full border border-white/10 bg-white/10 p-2 shadow-lg backdrop-blur-md">
        {modes.map(({ mode, label, Icon }) => {
          const isTarget = isTransitioning && transitionState.to === mode;
          return (
            <button
              key={mode}
              onClick={() => switchToMode(mode)}
              disabled={isTransitioning}
              className={`relative z-10 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                currentMode === mode
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/90'
              } disabled:opacity-50`}
            >
              {currentMode === mode && (
                <motion.div
                  layoutId="modeIndicator"
                  className="absolute inset-0 rounded-full bg-white/25"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className={`relative ${isTarget ? 'animate-pulse' : ''}`}>
                <Icon />
              </span>
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
