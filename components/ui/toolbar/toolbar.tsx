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

// Single consolidated control bar (liquid glass). The bar element must NOT be
// transformed (no framer-motion layout/scale here) — a transform turns it into
// a backdrop root and kills its backdrop-filter (the glass). Smooth resizing is
// done by animating child *width* (a layout prop, transform-free), not layout.
export function Toolbar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-40 flex justify-center px-3">
      <refractive.div
        refraction={{ ...LIQUID_GLASS, radius: 24, bezelWidth: 10 }}
        className="pointer-events-auto relative flex max-w-[calc(100vw-1.5rem)] items-center gap-1.5 overflow-visible border border-white/15 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_30px_rgba(0,0,0,0.5)]"
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
