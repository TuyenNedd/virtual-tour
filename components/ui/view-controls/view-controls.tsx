"use client";
import { useState } from "react";
import { motion } from "framer-motion";

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
}

function zoom(deltaY: number) {
  const canvas = document.querySelector("canvas");
  canvas?.dispatchEvent(new WheelEvent("wheel", { deltaY, bubbles: true }));
}

const ICON_BTN =
  "flex h-9 w-9 items-center justify-center rounded-full text-lg text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400";
const TAP = { scale: 0.88 };

// Zoom / fullscreen / share. Rendered inline inside the Toolbar.
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

  return (
    <div className="flex items-center gap-0.5">
      <motion.button
        whileTap={TAP}
        className={ICON_BTN}
        aria-label="Zoom out"
        onClick={() => zoom(120)}
      >
        −
      </motion.button>
      <motion.button
        whileTap={TAP}
        className={ICON_BTN}
        aria-label="Zoom in"
        onClick={() => zoom(-120)}
      >
        +
      </motion.button>
      <motion.button
        whileTap={TAP}
        className={ICON_BTN}
        aria-label="Toggle fullscreen"
        onClick={toggleFullscreen}
      >
        ⛶
      </motion.button>
      <motion.button
        whileTap={TAP}
        className={`${ICON_BTN} relative`}
        aria-label="Copy share link"
        onClick={share}
      >
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
        {copied && (
          <span className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white">
            Link copied
          </span>
        )}
      </motion.button>
    </div>
  );
}
