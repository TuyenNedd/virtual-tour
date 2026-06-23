"use client";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, X, Route } from "lucide-react";
import { useViewStore } from "@/stores/view-store";
import { nearestSweep } from "@/lib/sweep-graph";
import { GLASS_SPRING } from "@/lib/constants";

const AUTOPLAY_MS = 4000;
const TAP = { scale: 0.88 };

// Guided tour / highlight reel. The trigger ↔ cluster swap animates real width
// (transform-free) so the glass bar grows/shrinks smoothly without losing glass.
export function GuidedTour() {
  const space = useViewStore((s) => s.space);
  const tags = useViewStore((s) => s.tags);
  const goToSweep = useViewStore((s) => s.goToSweep);
  const setMode = useViewStore((s) => s.setMode);
  const measureMode = useViewStore((s) => s.measureMode);
  const toggleMeasure = useViewStore((s) => s.toggleMeasure);

  const stops = useMemo(() => {
    if (!space) return [] as { sweepId: string; title: string }[];
    return tags
      .map((t) => {
        const s = nearestSweep(space.sweeps, t.position);
        return s ? { sweepId: s.id, title: t.title } : null;
      })
      .filter((x): x is { sweepId: string; title: string } => x !== null);
  }, [space, tags]);

  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const goTo = (i: number) => {
    const stop = stops[i];
    if (!stop) return;
    setIndex(i);
    setMode("inside");
    goToSweep(stop.sweepId);
  };

  useEffect(() => {
    if (!active || !playing) return;
    const id = setTimeout(() => {
      if (index < stops.length - 1) goTo(index + 1);
      else setPlaying(false);
    }, AUTOPLAY_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, playing, index, stops.length]);

  if (stops.length === 0) return null;

  const iconBtn =
    "flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {!active ? (
        <motion.div
          key="tour-trigger"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={GLASS_SPRING}
          className="overflow-hidden"
        >
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              if (measureMode) toggleMeasure();
              setActive(true);
              goTo(0);
            }}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <span className="flex items-center gap-1.5">
              <Route size={15} />
              Tour
            </span>
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          key="tour-cluster"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={GLASS_SPRING}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-0.5">
            <motion.button
              whileTap={TAP}
              className={iconBtn}
              aria-label="Previous stop"
              disabled={index === 0}
              onClick={() => index > 0 && goTo(index - 1)}
            >
              <ChevronLeft size={18} />
            </motion.button>
            <motion.button
              whileTap={TAP}
              className={iconBtn}
              aria-label={playing ? "Pause tour" : "Play tour"}
              onClick={() => {
                const next = !playing;
                setPlaying(next);
                if (next) goTo(index < stops.length - 1 ? index + 1 : 0);
              }}
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
            </motion.button>
            <motion.button
              whileTap={TAP}
              className={iconBtn}
              aria-label="Next stop"
              disabled={index === stops.length - 1}
              onClick={() => index < stops.length - 1 && goTo(index + 1)}
            >
              <ChevronRight size={18} />
            </motion.button>
            <span className="whitespace-nowrap px-1 text-xs text-white/90">
              {index + 1}/{stops.length} · {stops[index]?.title}
            </span>
            {playing && (
              <span
                className="relative block h-1 w-12 shrink-0 overflow-hidden rounded-full bg-white/20"
                aria-hidden="true"
              >
                <span
                  key={index}
                  className="absolute inset-0 origin-left rounded-full bg-cyan-400"
                  style={{
                    animation: `tour-progress ${AUTOPLAY_MS}ms linear forwards`,
                  }}
                />
              </span>
            )}
            <motion.button
              whileTap={TAP}
              className={iconBtn}
              aria-label="Close tour"
              onClick={() => {
                setActive(false);
                setPlaying(false);
              }}
            >
              <X size={16} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
