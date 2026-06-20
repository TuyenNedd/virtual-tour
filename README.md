# Virtual Tour

A Matterport-style virtual tour viewer built entirely with free / open-source
tech. It renders a textured 3D mesh (from the Habitat-Matterport 3D research
dataset) with three navigation modes plus the navigation, annotation and
sharing features you expect from a 3D space tour.

No paid APIs or hosted services.

## Features

- **Inside walkthrough** — first-person look-in-place; click floor pucks (or the
  floor itself) to walk. Movement follows a path through connected capture
  points, so the camera never cuts through walls.
- **Dollhouse** — orbit the whole model from outside; auto-rotates when idle.
- **Floorplan** — true top-down orthographic view.
- **Smooth mode transitions** and camera fly-to between points.
- **Minimap** with the current position and a heading arrow.
- **Mattertags** — info hotspots floating in the space (title + description).
- **Measurement** — click points on surfaces to measure distances.
- **Guided tour** — step through highlighted stops with prev/next and autoplay.
- **Deep links** — the URL reflects the current mode + point so a copied link
  reopens the same view; a Share button copies it.
- **Floor selector** — appears automatically for multi-floor spaces.
- Works with **mouse, touch, and keyboard**, with basic accessibility support.

## Tech

- Next.js 14 (App Router) + React
- React Three Fiber + drei + three.js (WebGL)
- zustand (state), framer-motion (UI), Tailwind CSS
- Vitest (unit tests)
- @gltf-transform/cli (offline asset compression)

## Prerequisites

- Node.js 18+ and npm
- The source GLB at `public/hm3d-example-glb/00770-NBg5UqG3di3/NBg5UqG3di3.glb`
  (supplied locally; large source assets are gitignored)

## Setup & run

```bash
npm install

# 1. Compress the source GLB into public/model/space.glb (Draco + WebP)
npm run optimize

# 2. Generate navigation sweep points into public/data/space.json
npm run sweeps

# 3. Start the dev server
npm run dev
```

Then open http://localhost:3000.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm test` — run unit tests (pure logic)
- `npm run optimize` — compress the source GLB into `public/model/space.glb`
- `npm run sweeps` — (re)generate `public/data/space.json`

## Controls

**Inside view**

- **Mouse:** drag to look around, scroll to zoom, click a floor puck or the
  floor to walk there.
- **Touch:** one finger to look, two-finger pinch to zoom, tap a puck/floor to
  walk.
- **Keyboard:** Up / Down arrows walk to the point ahead / behind you, Left /
  Right arrows turn.

**Dollhouse / Floorplan**

- Drag to orbit (dollhouse), scroll to zoom; in floorplan, drag to pan.

**Buttons:** mode toggle (bottom-center), zoom / fullscreen / share
(bottom-right), Measure (top-center), Guided tour (bottom-left).

## Data files

These live in `public/data/` and can be hand-edited. Positions are in the
viewer's Y-up world (same space as the generated sweeps).

- **`space.json`** (generated) — `modelUrl`, `floors`, and the `sweeps` graph
  (each with `position` and `neighbors`).
- **`tags.json`** — Mattertag hotspots: `{ id, position, title, body, color? }`.
- **`rooms.json`** — room labels shown in dollhouse/floorplan:
  `{ id, position, name }`.

The guided tour visits each tag's nearest sweep, so editing `tags.json` also
updates the tour stops.

## How it works

- `scripts/optimize-glb.mjs` compresses the ~64MB scan mesh to ~24MB (Draco
  geometry + WebP textures).
- `scripts/generate-sweeps.mjs` loads the mesh, rotates it from the source
  Z-up orientation to Y-up, samples walkable points on the floor (raycast for
  floor + headroom), connects neighbors with a line-of-sight check, and writes
  `public/data/space.json`.
- The viewer loads the compressed GLB (Draco decoder served locally from
  `public/draco/`, no CDN), places the camera at sweep points, and animates
  between modes and points.

## Project structure

- `lib/` — pure logic (sweep graph, pathfinding, measurement, space/tags/rooms
  loading, WebGL check), unit-tested with Vitest.
- `stores/view-store.ts` — single zustand store for view state.
- `components/canvas/<name>/` — R3F scene pieces (model, pucks, camera, tags,
  measurements, room labels, first-person look).
- `components/ui/<name>/` — HTML overlay controls.
- `components/tour-viewer/` — composes the canvas + overlay.
- `scripts/` — offline asset/sweep generation.

## Testing

Pure logic in `lib/` is unit-tested (`npm test`). The 3D/React rendering is
verified by `npm run build` and manual testing in the browser (WebGL rendering
is not automated here).

## Notes

- `tags.json` and `rooms.json` ship with placeholder demo content — edit them
  for a real space.
- VR is intentionally out of scope.
