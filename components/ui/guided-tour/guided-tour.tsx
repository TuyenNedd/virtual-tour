"use client";
import { useEffect, useMemo, useState } from "react";
import { useViewStore } from "@/stores/view-store";
import { nearestSweep } from "@/lib/sweep-graph";

const AUTOPLAY_MS = 4000;

// Guided tour / highlight reel: steps through the tagged highlights (each tag's
// nearest sweep) with prev/next and autoplay. Rendered inline in the Toolbar.
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

  if (!active) {
    return (
      <button
        onClick={() => {
          if (measureMode) toggleMeasure();
          setActive(true);
          goTo(0);
        }}
        className="rounded-full px-3 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        Tour
      </button>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      <button
        className={iconBtn}
        aria-label="Previous stop"
        disabled={index === 0}
        onClick={() => index > 0 && goTo(index - 1)}
      >
        ‹
      </button>
      <button
        className={iconBtn}
        aria-label={playing ? "Pause tour" : "Play tour"}
        onClick={() => setPlaying((p) => !p)}
      >
        {playing ? "❚❚" : "▶"}
      </button>
      <button
        className={iconBtn}
        aria-label="Next stop"
        disabled={index === stops.length - 1}
        onClick={() => index < stops.length - 1 && goTo(index + 1)}
      >
        ›
      </button>
      <span className="max-w-[7rem] truncate px-1 text-xs text-white/90">
        {index + 1}/{stops.length} · {stops[index]?.title}
      </span>
      <button
        className={iconBtn}
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
