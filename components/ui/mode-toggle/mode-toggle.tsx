"use client";
import { useViewStore } from "@/stores/view-store";
import type { ViewMode } from "@/lib/types";

const MODES: { id: ViewMode; label: string }[] = [
  { id: "inside", label: "Inside" },
  { id: "dollhouse", label: "Dollhouse" },
  { id: "floorplan", label: "Floorplan" },
];

// Segmented mode control. Rendered inline inside the Toolbar (no positioning).
export function ModeToggle() {
  const mode = useViewStore((s) => s.mode);
  const setMode = useViewStore((s) => s.setMode);
  return (
    <div
      className="flex items-center gap-0.5"
      role="group"
      aria-label="View mode"
    >
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          aria-pressed={mode === m.id}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            mode === m.id
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-white/80 hover:bg-white/10 hover:text-white"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
