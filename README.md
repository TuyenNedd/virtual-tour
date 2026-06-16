# Virtual Tour

A Matterport-style virtual tour viewer built entirely with free / open-source tech. It renders a textured 3D mesh (from the Habitat-Matterport 3D research dataset) with three navigation modes — Inside walkthrough, Dollhouse, and Floorplan — plus smooth camera transitions and a minimap.

## Tech

- Next.js 14 (App Router) + React
- React Three Fiber + drei + three.js (WebGL)
- zustand (state), framer-motion (UI), Tailwind CSS
- Vitest (unit tests)
- @gltf-transform/cli (offline asset compression)

No paid APIs or hosted services.

## Prerequisites

- Node.js 18+ and npm
- The source GLB at `public/hm3d-example-glb/00770-NBg5UqG3di3/NBg5UqG3di3.glb`

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

## Other scripts

- `npm test` — run unit tests
- `npm run build` — production build

## How it works

- `scripts/optimize-glb.mjs` compresses the 64MB scan mesh to ~24MB.
- `scripts/generate-sweeps.mjs` samples walkable sweep points on the mesh floor (raycast for floor + headroom) and connects neighbors with a line-of-sight check, writing `public/data/space.json`.
- The viewer loads the compressed GLB (Draco decoder served locally from `public/draco/`), places the camera at sweep points, and animates between modes/sweeps.
