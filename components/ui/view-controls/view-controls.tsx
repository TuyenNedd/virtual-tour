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
    "flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400";
  return (
    <div className="absolute bottom-4 right-4 z-40 flex items-center gap-2">
      {copied && (
        <span className="rounded bg-black/60 px-2 py-1 text-xs text-white backdrop-blur">
          Link copied
        </span>
      )}
      <button className={btn} aria-label="Copy share link" onClick={share}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
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
