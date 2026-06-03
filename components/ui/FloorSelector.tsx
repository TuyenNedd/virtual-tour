'use client';

import { useSpaceStore } from '@/stores/spaceStore';

export function FloorSelector() {
  const floors = useSpaceStore((s) => s.floors);
  const currentFloor = useSpaceStore((s) => s.currentFloor);
  const setFloor = useSpaceStore((s) => s.setFloor);

  if (floors.length <= 1) return null;

  return (
    <div className="fixed left-4 top-1/2 z-40 -translate-y-1/2">
      <div className="flex flex-col gap-2 rounded-lg bg-white/10 p-2 backdrop-blur-md">
        {floors.map((floor) => (
          <button
            key={floor.id}
            onClick={() => setFloor(floor.number)}
            className={`rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              currentFloor === floor.number
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white/90'
            }`}
          >
            {floor.name}
          </button>
        ))}
      </div>
    </div>
  );
}
