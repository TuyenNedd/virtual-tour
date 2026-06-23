"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Maximize, Link2 } from "lucide-react";

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
}

function zoom(deltaY: number) {
  const canvas = document.querySelector("canvas");
  canvas?.dispatchEvent(new WheelEvent("wheel", { deltaY, bubbles: true }));
}

const ICON_BTN =
  "flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400";
const TAP = { scale: 0.88 };
const ICON_SIZE = 17;

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
        <Minus size={ICON_SIZE} />
      </motion.button>
      <motion.button
        whileTap={TAP}
        className={ICON_BTN}
        aria-label="Zoom in"
        onClick={() => zoom(-120)}
      >
        <Plus size={ICON_SIZE} />
      </motion.button>
      <motion.button
        whileTap={TAP}
        className={ICON_BTN}
        aria-label="Toggle fullscreen"
        onClick={toggleFullscreen}
      >
        <Maximize size={ICON_SIZE - 2} />
      </motion.button>
      <motion.button
        whileTap={TAP}
        className={`${ICON_BTN} relative`}
        aria-label="Copy share link"
        onClick={share}
      >
        <Link2 size={ICON_SIZE - 1} />
        {copied && (
          <span className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white">
            Link copied
          </span>
        )}
      </motion.button>
    </div>
  );
}
