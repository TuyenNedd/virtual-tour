'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSpaceStore } from '@/stores/spaceStore';
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
  const [error, setError] = useState<string | null>(null);

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
    </main>
  );
}
