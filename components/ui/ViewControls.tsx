"use client";

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
}

function zoom(deltaY: number) {
  const canvas = document.querySelector("canvas");
  canvas?.dispatchEvent(new WheelEvent("wheel", { deltaY, bubbles: true }));
}

export function ViewControls() {
  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70";
  return (
    <div className="absolute bottom-4 right-4 z-40 flex gap-2">
      <button className={btn} aria-label="Zoom in" onClick={() => zoom(-120)}>
        +
      </button>
      <button className={btn} aria-label="Zoom out" onClick={() => zoom(120)}>
        −
      </button>
      <button
        className={btn}
        aria-label="Fullscreen"
        onClick={toggleFullscreen}
      >
        ⛶
      </button>
    </div>
  );
}
