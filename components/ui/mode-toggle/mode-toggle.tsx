"use client";
import { useViewStore } from "@/stores/view-store";
import type { ViewMode } from "@/lib/types";

const MODES: { id: ViewMode; label: string }[] = [
  { id: "inside", label: "Inside" },
  { id: "dollhouse", label: "Dollhouse" },
  { id: "floorplan", label: "Floorplan" },
];

export function ModeToggle() {
  const mode = useViewStore((s) => s.mode);
  const setMode = useViewStore((s) => s.setMode);
  return (
    <div className="absolute bottom-4 left-1/2 z-40 -translate-x-1/2">
      <div
        className="flex gap-1 rounded-full bg-black/50 p-1 backdrop-blur"
        role="group"
        aria-label="View mode"
      >
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            aria-pressed={mode === m.id}
            className={`rounded-full px-4 py-1.5 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              mode === m.id
                ? "bg-white text-neutral-900"
                : "text-white hover:bg-white/10"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
