'use client';

import { motion } from 'framer-motion';
import { useSpaceStore } from '@/stores/spaceStore';

export function FloorSelector() {
  const floors = useSpaceStore((s) => s.floors);
  const currentFloor = useSpaceStore((s) => s.currentFloor);
  const setFloor = useSpaceStore((s) => s.setFloor);

  if (floors.length <= 1) return null;

  return (
    <div className="fixed left-4 top-1/2 z-40 -translate-y-1/2">
      <div className="flex flex-col gap-1 rounded-full border border-white/10 bg-white/10 p-1.5 shadow-lg backdrop-blur-md">
        {floors.map((floor) => (
          <motion.button
            key={floor.id}
            onClick={() => setFloor(floor.number)}
            whileTap={{ scale: 0.9 }}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              currentFloor === floor.number
                ? 'text-white'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            {currentFloor === floor.number && (
              <motion.div
                layoutId="floorIndicator"
                className="absolute inset-0 rounded-full bg-white/25"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative">{floor.number}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
