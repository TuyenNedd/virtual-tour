'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSpaceStore } from '@/stores/spaceStore';
import { useSweepStore } from '@/stores/sweepStore';
import { useViewModeStore } from '@/stores/viewModeStore';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ModeButtons } from '@/components/ui/ModeButtons';
import { FloorSelector } from '@/components/ui/FloorSelector';
import { Minimap } from '@/components/ui/Minimap';
import { SpaceData } from '@/lib/types';

const Scene = dynamic(
  () => import('@/components/canvas/Scene').then((mod) => ({ default: mod.Scene })),
  { ssr: false }
);

export default function Home() {
  const isLoaded = useSpaceStore((s) => s.isLoaded);
  const loadSpace = useSpaceStore((s) => s.loadSpace);
  const isNavigating = useSweepStore((s) => s.isNavigating);
  const completeNavigation = useSweepStore((s) => s.completeNavigation);
  const isModeTransitioning = useViewModeStore((s) => s.isTransitioning);
  const transitionPhase = useViewModeStore((s) => s.transitionPhase);
  const [error, setError] = useState<string | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle fade transition: when isNavigating becomes true, wait for fade-out then complete
  useEffect(() => {
    if (isNavigating) {
      fadeTimerRef.current = setTimeout(() => {
        completeNavigation();
      }, 400);
    }
    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
    };
  }, [isNavigating, completeNavigation]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/data/space.json');
        if (!res.ok) {
          throw new Error(`Failed to load space data: ${res.status}`);
        }
        const data: SpaceData = await res.json();
        if (!data.sweeps || !data.floors) {
          throw new Error('Invalid space data format');
        }
        loadSpace(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load space data');
      }
    }
    fetchData();
  }, [loadSpace]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-screen">
      <LoadingScreen isLoading={!isLoaded} />
      <div className="absolute inset-0">
        <Scene />
      </div>
      {isLoaded && (
        <>
          <ModeButtons />
          <FloorSelector />
          <Minimap />
        </>
      )}
      <div
        className={`fixed inset-0 z-30 bg-black transition-opacity duration-[400ms] pointer-events-none ${
          isNavigating ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* Mode transition fade overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black pointer-events-none transition-opacity duration-[600ms] ${
          isModeTransitioning && transitionPhase === 0
            ? 'opacity-70'
            : isModeTransitioning && transitionPhase === 1
              ? 'opacity-0'
              : 'opacity-0'
        }`}
      />
    </main>
  );
}
