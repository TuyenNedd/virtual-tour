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
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-900 text-white"
        >
          <div className="text-sm tracking-widest uppercase opacity-70">
            Loading tour
          </div>
          <div className="mt-4 h-1 w-48 overflow-hidden rounded bg-white/20">
            <div
              className="h-full bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs opacity-50">{Math.round(progress)}%</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
