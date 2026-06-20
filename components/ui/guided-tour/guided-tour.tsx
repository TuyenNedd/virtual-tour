"use client";
import { useEffect, useMemo, useState } from "react";
import { useViewStore } from "@/stores/view-store";
import { nearestSweep } from "@/lib/sweep-graph";

const AUTOPLAY_MS = 4000;

// Guided tour / highlight reel: steps through the tagged highlights (each tag's
// nearest sweep) with prev/next and autoplay, walking the camera to each stop.
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

  if (!active) {
    return (
      <button
        onClick={() => {
          if (measureMode) toggleMeasure();
          setActive(true);
          goTo(0);
        }}
        className="absolute bottom-4 left-4 z-40 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white backdrop-blur hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        Guided tour
      </button>
    );
  }

  const btn =
    "px-2 py-0.5 disabled:opacity-40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded";
  return (
    <div className="absolute bottom-4 left-4 z-40 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1.5 text-white backdrop-blur">
      <button
        className={btn}
        aria-label="Previous"
        disabled={index === 0}
        onClick={() => index > 0 && goTo(index - 1)}
      >
        ‹
      </button>
      <button
        className={btn}
        aria-label={playing ? "Pause tour" : "Play tour"}
        onClick={() => setPlaying((p) => !p)}
      >
        {playing ? "Pause" : "Play"}
      </button>
      <button
        className={btn}
        aria-label="Next"
        disabled={index === stops.length - 1}
        onClick={() => index < stops.length - 1 && goTo(index + 1)}
      >
        ›
      </button>
      <span className="px-1 text-xs text-white/90">
        {index + 1}/{stops.length} · {stops[index]?.title}
      </span>
      <button
        className="px-2 text-lg leading-none text-white/60 hover:text-white"
        aria-label="Close tour"
        onClick={() => {
          setActive(false);
          setPlaying(false);
        }}
      >
        ×
      </button>
    </div>
  );
}
