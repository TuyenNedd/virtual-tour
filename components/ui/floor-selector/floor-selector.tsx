"use client";
import { useViewStore } from "@/stores/view-store";

export function FloorSelector() {
  const space = useViewStore((s) => s.space);
  const floorId = useViewStore((s) => s.floorId);
  const setFloor = useViewStore((s) => s.setFloor);

  if (!space || space.floors.length < 2) return null;

  return (
    <div
      className="absolute right-4 top-44 z-40 flex flex-col gap-1.5"
      role="group"
      aria-label="Floor"
    >
      {space.floors.map((f) => (
        <button
          key={f.id}
          onClick={() => setFloor(f.id)}
          aria-pressed={floorId === f.id}
          aria-label={`Floor ${f.id + 1}`}
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold backdrop-blur-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            floorId === f.id
              ? "bg-white text-neutral-900 shadow-sm"
              : "border border-white/10 bg-black/55 text-white/80 hover:bg-black/70 hover:text-white"
          }`}
        >
          {f.id + 1}
        </button>
      ))}
    </div>
  );
}
