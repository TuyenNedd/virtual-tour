"use client";
import { refractive } from "@hashintel/refractive";
import { LIQUID_GLASS } from "@/lib/constants";
import { ModeToggle } from "../mode-toggle/mode-toggle";
import { MeasureControls } from "../measure-controls/measure-controls";
import { GuidedTour } from "../guided-tour/guided-tour";
import { ViewControls } from "../view-controls/view-controls";

const Divider = () => (
  <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-white/15" />
);

// Single consolidated control bar (liquid glass). Groups mode / tools / view.
// The full-width wrapper is click-through; only the bar itself is interactive.
export function Toolbar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-40 flex justify-center px-3">
      <refractive.div
        refraction={{ ...LIQUID_GLASS, radius: 24, bezelWidth: 10 }}
        className="pointer-events-auto relative flex max-w-[calc(100vw-1.5rem)] items-center gap-1.5 overflow-visible border border-white/10 p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
      >
        <ModeToggle />
        <Divider />
        <MeasureControls />
        <GuidedTour />
        <Divider />
        <ViewControls />
      </refractive.div>
    </div>
  );
}
