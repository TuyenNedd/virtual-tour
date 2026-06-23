"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Ruler } from "lucide-react";
import { useViewStore } from "@/stores/view-store";
import { GLASS_SPRING } from "@/lib/constants";

// Measure toggle. Animates its real *width* in/out (transform-free) so the glass
// bar resizes smoothly without losing its backdrop-filter.
export function MeasureControls() {
  const mode = useViewStore((s) => s.mode);
  const measureMode = useViewStore((s) => s.measureMode);
  const toggleMeasure = useViewStore((s) => s.toggleMeasure);
  const clearMeasure = useViewStore((s) => s.clearMeasure);
  const points = useViewStore((s) => s.measurePoints);

  // measuring is available in the 3D views (inside / dollhouse)
  const show = mode !== "floorplan";

  return (
    <>
      <AnimatePresence initial={false}>
        {show && (
          <motion.div
            key="measure"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={GLASS_SPRING}
            className="overflow-hidden"
          >
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={toggleMeasure}
              aria-pressed={measureMode}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                measureMode
                  ? "bg-gradient-to-b from-white to-white/80 text-neutral-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_14px_rgba(0,0,0,0.3)] ring-1 ring-black/5"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Ruler size={14} />
                Measure
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {show && measureMode && (
          <motion.div
            key="measure-hint"
            initial={{ opacity: 0, x: "-50%", y: 6 }}
            animate={{ opacity: 1, x: "-50%", y: 0 }}
            exit={{ opacity: 0, x: "-50%", y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full left-1/2 mb-3 flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-md"
          >
            <span>
              {points.length === 0
                ? "Click points on surfaces to measure"
                : `${points.length} point${points.length > 1 ? "s" : ""}`}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={clearMeasure}
              className="rounded bg-white/20 px-2 py-0.5 transition hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              Clear
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
