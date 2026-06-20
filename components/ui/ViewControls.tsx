"use client";
import { useState } from "react";

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
}

function zoom(deltaY: number) {
  const canvas = document.querySelector("canvas");
  canvas?.dispatchEvent(new WheelEvent("wheel", { deltaY, bubbles: true }));
}

export function ViewControls() {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be unavailable (insecure context) — ignore
    }
  };

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70";
  return (
    <div className="absolute bottom-4 right-4 z-40 flex items-center gap-2">
      {copied && (
        <span className="rounded bg-black/60 px-2 py-1 text-xs text-white backdrop-blur">
          Link copied
        </span>
      )}
      <button className={btn} aria-label="Copy share link" onClick={share}>
        ⇪
      </button>
      <button className={btn} aria-label="Zoom in" onClick={() => zoom(-120)}>
        +
      </button>
      <button className={btn} aria-label="Zoom out" onClick={() => zoom(120)}>
        −
      </button>
      <button
        className={btn}
        aria-label="Fullscreen"
        onClick={toggleFullscreen}
      >
        ⛶
      </button>
    </div>
  );
}
