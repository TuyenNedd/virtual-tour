"use client";
import { motion } from "framer-motion";
import { Eye, Box, Map, type LucideIcon } from "lucide-react";
import { useViewStore } from "@/stores/view-store";
import { GLASS_SPRING } from "@/lib/constants";
import type { ViewMode } from "@/lib/types";

const MODES: { id: ViewMode; label: string; Icon: LucideIcon }[] = [
  { id: "inside", label: "Inside", Icon: Eye },
  { id: "dollhouse", label: "Dollhouse", Icon: Box },
  { id: "floorplan", label: "Floorplan", Icon: Map },
];

// Segmented mode switch: a glassy thumb slides between options (shared layout)
// with a spring, plus a press scale. These transforms are on the thumb/buttons,
// NOT on the glass bar, so they don't affect the backdrop-filter.
export function ModeToggle() {
  const mode = useViewStore((s) => s.mode);
  const setMode = useViewStore((s) => s.setMode);
  return (
    <div
      className="relative flex items-center gap-0.5"
      role="group"
      aria-label="View mode"
    >
      {MODES.map((m) => {
        const active = mode === m.id;
        return (
          <motion.button
            key={m.id}
            onClick={() => setMode(m.id)}
            aria-pressed={active}
            whileTap={{ scale: 0.92 }}
            transition={GLASS_SPRING}
            className="relative z-10 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {active && (
              <motion.span
                layoutId="mode-thumb"
                transition={GLASS_SPRING}
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-b from-white to-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_14px_rgba(0,0,0,0.3)] ring-1 ring-black/5"
              />
            )}
            <span
              className={`flex items-center gap-1.5 ${
                active ? "text-neutral-900" : "text-white/70 hover:text-white"
              }`}
            >
              <m.Icon size={15} />
              {m.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
