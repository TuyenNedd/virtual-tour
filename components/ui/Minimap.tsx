'use client';

import { useRef, useEffect } from 'react';
import { useSweepNavigation } from '@/hooks/useSweepNavigation';
import { useViewModeStore } from '@/stores/viewModeStore';
import { ViewMode } from '@/lib/types';

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { availableSweeps, currentSweepId } = useSweepNavigation();
  const cameraYaw = useViewModeStore((s) => s.cameraYaw);
  const currentMode = useViewModeStore((s) => s.currentMode);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 128;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, size, size);

    if (availableSweeps.length === 0) return;

    // Calculate bounds
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    availableSweeps.forEach((s) => {
      minX = Math.min(minX, s.position[0]);
      maxX = Math.max(maxX, s.position[0]);
      minZ = Math.min(minZ, s.position[2]);
      maxZ = Math.max(maxZ, s.position[2]);
    });

    const padding = 20;
    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;
    const scale = (size - padding * 2) / Math.max(rangeX, rangeZ);

    const toScreen = (pos: [number, number, number]) => ({
      x: padding + (pos[0] - minX) * scale,
      y: padding + (pos[2] - minZ) * scale,
    });

    // Draw connections
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.4)';
    ctx.lineWidth = 1;
    const drawnEdges = new Set<string>();
    availableSweeps.forEach((sweep) => {
      sweep.neighbors.forEach((nId) => {
        const key = [sweep.id, nId].sort().join('-');
        if (drawnEdges.has(key)) return;
        drawnEdges.add(key);
        const neighbor = availableSweeps.find((s) => s.id === nId);
        if (!neighbor) return;
        const from = toScreen(sweep.position);
        const to = toScreen(neighbor.position);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      });
    });

    // Draw sweep dots
    availableSweeps.forEach((sweep) => {
      const { x, y } = toScreen(sweep.position);
      ctx.beginPath();
      ctx.arc(x, y, sweep.id === currentSweepId ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = sweep.id === currentSweepId ? '#4fc3f7' : '#888';
      ctx.fill();
    });

    // Draw orientation arrow at current sweep position (only in panorama mode)
    if (currentMode === ViewMode.Panorama) {
      const currentSweep = availableSweeps.find((s) => s.id === currentSweepId);
      if (currentSweep) {
        const { x, y } = toScreen(currentSweep.position);
        const arrowLength = 10;
        // Camera yaw: rotation.y in Three.js, negative because canvas Y is flipped
        // In Three.js, rotation.y = 0 faces -Z. On our minimap, -Z maps to up (decreasing y)
        const angle = -cameraYaw - Math.PI / 2;

        const tipX = x + Math.cos(angle) * arrowLength;
        const tipY = y + Math.sin(angle) * arrowLength;
        const baseLeft = {
          x: x + Math.cos(angle + 2.5) * 5,
          y: y + Math.sin(angle + 2.5) * 5,
        };
        const baseRight = {
          x: x + Math.cos(angle - 2.5) * 5,
          y: y + Math.sin(angle - 2.5) * 5,
        };

        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(baseLeft.x, baseLeft.y);
        ctx.lineTo(baseRight.x, baseRight.y);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }
  }, [availableSweeps, currentSweepId, cameraYaw, currentMode]);

  return (
    <div className="fixed right-4 top-4 z-40 overflow-hidden rounded-lg border border-white/10 shadow-lg">
      <canvas ref={canvasRef} className="h-32 w-32" />
    </div>
  );
}
