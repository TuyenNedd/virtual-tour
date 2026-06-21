"use client";
import { ModeToggle } from "../mode-toggle/mode-toggle";
import { MeasureControls } from "../measure-controls/measure-controls";
import { GuidedTour } from "../guided-tour/guided-tour";
import { ViewControls } from "../view-controls/view-controls";

const Divider = () => (
  <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-white/15" />
);

// Single consolidated control bar (glass). Groups mode / tools / view controls.
// The full-width wrapper is click-through; only the bar itself is interactive.
export function Toolbar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-40 flex justify-center px-3">
      <div className="pointer-events-auto relative flex max-w-[calc(100vw-1.5rem)] items-center gap-1.5 overflow-visible rounded-full border border-white/10 bg-black/55 p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <ModeToggle />
        <Divider />
        <MeasureControls />
        <GuidedTour />
        <Divider />
        <ViewControls />
      </div>
    </div>
  );
}
