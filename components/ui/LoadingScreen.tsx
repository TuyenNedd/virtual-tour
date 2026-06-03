'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  isLoading: boolean;
}

export function LoadingScreen({ isLoading }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            <p className="text-sm text-white/80">Loading virtual tour...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
