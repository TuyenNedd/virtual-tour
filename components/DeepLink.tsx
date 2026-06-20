"use client";
import { useEffect, useRef } from "react";
import { useViewStore } from "@/stores/viewStore";
import type { ViewMode } from "@/lib/types";

function parseHash() {
  const h = new URLSearchParams(window.location.hash.slice(1));
  return { s: h.get("s"), m: h.get("m") };
}

const MODES: ViewMode[] = ["inside", "dollhouse", "floorplan"];

// Reflects current mode + sweep in the URL hash (#m=inside&s=s12) and restores
// it on load, so a copied link reopens the same view.
export function DeepLink() {
  const space = useViewStore((s) => s.space);
  const mode = useViewStore((s) => s.mode);
  const currentSweepId = useViewStore((s) => s.currentSweepId);
  const applied = useRef(false);

  // restore from URL once, after the space is available
  useEffect(() => {
    if (!space || applied.current) return;
    applied.current = true;
    const { s, m } = parseHash();
    if (m && MODES.includes(m as ViewMode)) {
      useViewStore.getState().setMode(m as ViewMode);
    }
    if (s && space.sweeps.some((sw) => sw.id === s)) {
      // jump directly (no walk animation) when restoring
      useViewStore.setState({ currentSweepId: s, pendingPath: [] });
    }
  }, [space]);

  // keep the URL in sync with state
  useEffect(() => {
    if (!space) return;
    const params = new URLSearchParams();
    params.set("m", mode);
    if (currentSweepId) params.set("s", currentSweepId);
    const hash = `#${params.toString()}`;
    if (hash !== window.location.hash) {
      window.history.replaceState(null, "", hash);
    }
  }, [space, mode, currentSweepId]);

  return null;
}
