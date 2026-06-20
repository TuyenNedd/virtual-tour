"use client";
import { useViewStore } from "@/stores/view-store";

export function MeasureControls() {
  const mode = useViewStore((s) => s.mode);
  const measureMode = useViewStore((s) => s.measureMode);
  const toggleMeasure = useViewStore((s) => s.toggleMeasure);
  const clearMeasure = useViewStore((s) => s.clearMeasure);
  const points = useViewStore((s) => s.measurePoints);

  // measuring is available in the 3D views (inside / dollhouse)
  if (mode === "floorplan") return null;

  return (
    <div className="absolute left-1/2 top-4 z-40 flex -translate-x-1/2 items-center gap-2">
      <button
        onClick={toggleMeasure}
        aria-pressed={measureMode}
        className={`rounded-full px-3 py-1.5 text-sm backdrop-blur transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
          measureMode
            ? "bg-white text-neutral-900"
            : "bg-black/50 text-white hover:bg-black/70"
        }`}
      >
        Measure
      </button>
      {measureMode && (
        <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur">
          <span>
            {points.length === 0
              ? "Click points on surfaces"
              : `${points.length} point${points.length > 1 ? "s" : ""}`}
          </span>
          <button
            onClick={clearMeasure}
            className="rounded bg-white/20 px-2 py-0.5 hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
