"use client";
import { useViewStore } from "@/stores/view-store";

// Measure toggle. Rendered inline in the Toolbar; the hint pops above the bar.
export function MeasureControls() {
  const mode = useViewStore((s) => s.mode);
  const measureMode = useViewStore((s) => s.measureMode);
  const toggleMeasure = useViewStore((s) => s.toggleMeasure);
  const clearMeasure = useViewStore((s) => s.clearMeasure);
  const points = useViewStore((s) => s.measurePoints);

  // measuring is available in the 3D views (inside / dollhouse)
  if (mode === "floorplan") return null;

  return (
    <>
      <button
        onClick={toggleMeasure}
        aria-pressed={measureMode}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
          measureMode
            ? "bg-white text-neutral-900 shadow-sm"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }`}
      >
        Measure
      </button>
      {measureMode && (
        <div className="absolute bottom-full left-1/2 mb-3 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-md">
          <span>
            {points.length === 0
              ? "Click points on surfaces to measure"
              : `${points.length} point${points.length > 1 ? "s" : ""}`}
          </span>
          <button
            onClick={clearMeasure}
            className="rounded bg-white/20 px-2 py-0.5 transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            Clear
          </button>
        </div>
      )}
    </>
  );
}
