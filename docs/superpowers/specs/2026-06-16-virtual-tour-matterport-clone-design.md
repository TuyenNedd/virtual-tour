# Virtual Tour — Matterport Showcase Clone (Design Spec)

**Date:** 2026-06-16
**Branch:** `w/superpowers` (treated as main for this project)
**Status:** Approved design — ready for implementation planning

## Goal

Recreate the Matterport Showcase viewer experience (reference:
`https://my.matterport.com/show/?m=vjZmzoTDbNS`) as closely as practical (1:1,
excluding VR), using **only free / open-source technology** — no paid APIs or
services.

The tour is driven by a textured 3D mesh from the Habitat-Matterport 3D
research dataset (HM3D), used for academic/research purposes:
`https://github.com/matterport/habitat-matterport-3dresearch`. Selected scene:
`00770-NBg5UqG3di3` (GLB, ~64MB, already in `public/`).

Because HM3D provides real 3D geometry (not captured photo panoramas), the
"Inside" walkthrough is a true real-time 3D walk through the mesh rather than
stitched 360° photos.

## Scope (v1)

Features 1–5 of the Matterport experience:

1. **Inside / walkthrough** — stand at a sweep point, free-look by mouse drag,
   click floor pucks to move between sweep points (smooth transition).
2. **Dollhouse view** — orbit the full 3D model from outside.
3. **Floorplan view** — top-down orthographic map view.
4. **Mode transitions** — smooth camera tween between the three modes.
5. **Minimap** — corner map showing sweep points + current position/heading.

**Out of scope (v2):** measurement tool, tags/hotspots, guided highlight reel,
VR.

## Tech Stack (100% free / OSS — already in package.json)

- **Next.js 14** (app router)
- **React Three Fiber + drei + three** — 3D rendering
- **zustand** — view mode, current sweep, transition state
- **framer-motion** — UI chrome animation
- **Tailwind** — styling
- **@gltf-transform/cli** — offline asset compression (build-time tool, not a
  runtime service)

No paid APIs, no Matterport SDK, no hosted services.

## Architecture

Single R3F `<Canvas>` holding the model, sweep pucks, and lights. A
`CameraController` reads state from zustand and animates the camera between
modes and sweep points. An HTML overlay layer sits above the canvas for chrome.

```
app/page.tsx
 └─ <TourViewer>
     ├─ <Canvas>  (R3F)
     │   ├─ <SpaceModel/>        # load GLB (Suspense + drei useGLTF)
     │   ├─ <SweepPucks/>        # floor rings, click to move
     │   ├─ <CameraController/>  # tween between modes + sweeps
     │   └─ lights / environment
     └─ <UIOverlay>
         ├─ <ModeToggle/>        # Inside / Dollhouse / Floorplan (#1-4)
         ├─ <Minimap/>           # (#5) sweep dots + position/heading
         ├─ <FloorSelector/>     # only if multi-floor
         ├─ <ViewControls/>      # zoom +/- , fullscreen
         └─ <LoadingScreen/>     # GLB load progress
```

### UI layout (confirmed against mockup)

- **Bottom-center:** mode toggle Inside / Dollhouse / Floorplan.
- **Bottom-right:** zoom +/- and fullscreen.
- **Top-right:** minimap with sweep dots + current position/heading.
- **Right edge:** floor selector (shown only if the scene has multiple floors).
- **Floor:** sweep pucks (rings) the user clicks to walk between points.
- **Top-left:** space title.

## Data Model — `public/data/space.json`

Auto-generated, hand-curatable:

```jsonc
{
  "modelUrl": "/hm3d-example-glb/00770-NBg5UqG3di3/NBg5UqG3di3.glb",
  "up": "y",
  "floors": [{ "id": 0, "name": "Floor 1", "yMin": 0, "yMax": 3 }],
  "sweeps": [
    {
      "id": "s0",
      "position": [0, 0, 0],
      "floor": 0,
      "neighbors": ["s1", "s3"],
    },
  ],
}
```

## Sweep Generation (hybrid — offline script)

`scripts/generate-sweeps.mjs` (headless three.js):

1. Load GLB, compute bounding box, raycast down to find floor height.
2. Sample a grid (~1.2m spacing); raycast up at each point to check headroom
   (sufficient clearance = walkable).
3. Connect neighbors by distance + line-of-sight check (no wall penetration).
4. Write `public/data/space.json`. Hand-curate afterward as needed.

## Mode Transitions (Matterport feel)

- **Inside:** perspective camera at sweep point, FOV ~75°, free-look by drag
  (clamped pitch).
- **Dollhouse:** camera pulled back, orbit around model center, ~45° tilt.
- **Floorplan:** orthographic camera straight down, rotation locked.
- Mode change = tween position + orientation (+ perspective↔ortho) with easing,
  ~1s. Puck click = camera flies to new sweep (~0.5–0.8s), then free-look.

## Performance & Assets

The 64MB GLB is heavy for web delivery. Add a compression step with
`@gltf-transform` (Draco geometry + KTX2 textures) to produce a much smaller
served asset; keep the original untouched. `LoadingScreen` shows load %.

## Error Handling

- GLB fails to load → friendly error screen + retry button.
- `space.json` missing → fallback to a single sweep at bounding-box center.
- WebGL unsupported → browser-support message.

## Testing

- Unit tests (Vitest, OSS) for pure logic: neighbor graph, nearest-sweep
  selection, transition math.
- `generate-sweeps` tested against a small synthetic mesh.
- 3D rendering verified manually (not automatable here).

## Notes / Assumptions

- Multi-floor support is conditional: floor detection derives from the model's
  vertical extent; `FloorSelector` renders only when more than one floor is
  detected.
- The original uncompressed GLB and OBJ+MTL assets remain in `public/` for
  reference; the app serves the compressed GLB.

```

```
