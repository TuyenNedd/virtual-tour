"use client";
import { useProgress } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const { active, progress } = useProgress();
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 text-white"
        >
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
            Loading tour
          </div>
          <div className="mt-4 h-1 w-52 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-cyan-400 transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs tabular-nums text-white/50">
            {Math.round(progress)}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
