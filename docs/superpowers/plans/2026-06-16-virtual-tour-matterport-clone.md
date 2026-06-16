# Virtual Tour — Matterport Clone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 1:1-style Matterport Showcase clone (inside walkthrough, dollhouse, floorplan, smooth mode transitions, minimap) over a textured HM3D 3D mesh, using only free/OSS tech.

**Architecture:** A single React Three Fiber `<Canvas>` holds the GLB model, floor sweep pucks, and lights. A `CameraController` reads view state from a zustand store and tweens the camera between modes (Inside perspective / Dollhouse orbit / Floorplan ortho) and between sweep points. An HTML overlay renders the chrome (mode toggle, minimap, floor selector, view controls, loading screen). Sweep points are generated offline by a headless three.js script into `public/data/space.json`.

**Tech Stack:** Next.js 14 (app router), React Three Fiber + drei + three, zustand, framer-motion, Tailwind, Vitest (tests), @gltf-transform/cli (offline asset compression).

**Reference spec:** `docs/superpowers/specs/2026-06-16-virtual-tour-matterport-clone-design.md`

---

## File Structure

Pure logic (unit-tested with Vitest):

- `lib/types.ts` — shared TS types (`ViewMode`, `Sweep`, `Floor`, `SpaceData`).
- `lib/constants.ts` — tunable constants (FOV, durations, grid spacing, colors).
- `lib/sweepGraph.ts` — `nearestSweep`, `neighborsOf`, `sweepsOnFloor` pure helpers.
- `lib/transitions.ts` — easing + `lerpVec3`, `dampAngle`, camera pose presets per mode.
- `lib/space.ts` — fetch/validate `space.json`, fallback to a single center sweep.

State:

- `stores/viewStore.ts` — zustand store: `mode`, `currentSweepId`, `isTransitioning`, `floorId`, actions.

Offline scripts:

- `scripts/generate-sweeps.mjs` — headless three.js sweep grid generator → `public/data/space.json`.
- `scripts/optimize-glb.mjs` — wrapper around @gltf-transform to produce compressed GLB.

3D (R3F, manual verification):

- `components/canvas/SpaceModel.tsx` — load + display GLB.
- `components/canvas/SweepPucks.tsx` — floor rings; click to navigate.
- `components/canvas/CameraController.tsx` — per-frame camera tween.
- `components/canvas/Scene.tsx` — assembles canvas contents.

UI overlay (manual verification):

- `components/ui/LoadingScreen.tsx`
- `components/ui/ModeToggle.tsx`
- `components/ui/ViewControls.tsx`
- `components/ui/FloorSelector.tsx`
- `components/ui/Minimap.tsx`
- `components/TourViewer.tsx` — composes Canvas + overlay.
- `app/page.tsx` — renders `<TourViewer/>`.

**Testing strategy:** Pure logic in `lib/` is built test-first with Vitest. R3F/React components are verified by type-check + `next build` + a manual checklist (3D rendering is not automatable in this environment), per the approved spec.

---

## Task 1: Test infrastructure (Vitest)

**Files:**

- Modify: `package.json` (add devDeps + `test` script)
- Create: `vitest.config.ts`
- Create: `lib/__tests__/smoke.test.ts`

- [ ] **Step 1: Install Vitest**

Run:

```bash
npm install -D vitest@^2.1.0
```

Expected: added to devDependencies, no errors.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Add test script to `package.json`**

In the `"scripts"` block add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Write a smoke test**

`lib/__tests__/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("test infra", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run and verify it passes**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts lib/__tests__/smoke.test.ts
git commit -m "test: add Vitest infrastructure"
```

---

## Task 2: Types and constants

**Files:**

- Create: `lib/types.ts`
- Create: `lib/constants.ts`

- [ ] **Step 1: Write `lib/types.ts`**

```ts
export type ViewMode = "inside" | "dollhouse" | "floorplan";

export type Vec3 = [number, number, number];

export interface Floor {
  id: number;
  name: string;
  yMin: number;
  yMax: number;
}

export interface Sweep {
  id: string;
  position: Vec3;
  floor: number;
  neighbors: string[];
}

export interface SpaceData {
  modelUrl: string;
  up: "y" | "z";
  floors: Floor[];
  sweeps: Sweep[];
}
```

- [ ] **Step 2: Write `lib/constants.ts`**

```ts
import type { ViewMode } from "./types";

export const INSIDE_FOV = 75;
export const DOLLHOUSE_FOV = 50;

// transition durations (seconds)
export const MODE_TRANSITION_S = 1.0;
export const SWEEP_TRANSITION_S = 0.7;

// sweep generation
export const SWEEP_GRID_SPACING = 1.2; // metres
export const SWEEP_MIN_HEADROOM = 1.4; // metres of clearance to be "walkable"
export const SWEEP_EYE_HEIGHT = 1.5; // camera height above floor in inside mode
export const SWEEP_NEIGHBOR_RADIUS = 2.2; // connect sweeps within this distance

// puck visuals
export const PUCK_COLOR = "#ffffff";
export const PUCK_OPACITY = 0.85;

export const DEFAULT_MODE: ViewMode = "inside";
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/types.ts lib/constants.ts
git commit -m "feat: add core types and constants"
```

---

## Task 3: Sweep graph helpers (TDD)

**Files:**

- Create: `lib/sweepGraph.ts`
- Test: `lib/sweepGraph.test.ts`

- [ ] **Step 1: Write the failing test**

`lib/sweepGraph.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { nearestSweep, neighborsOf, sweepsOnFloor } from "./sweepGraph";
import type { Sweep } from "./types";

const sweeps: Sweep[] = [
  { id: "a", position: [0, 0, 0], floor: 0, neighbors: ["b"] },
  { id: "b", position: [2, 0, 0], floor: 0, neighbors: ["a", "c"] },
  { id: "c", position: [2, 3, 0], floor: 1, neighbors: ["b"] },
];

describe("sweepGraph", () => {
  it("finds the nearest sweep to a point", () => {
    expect(nearestSweep(sweeps, [0.4, 0, 0])?.id).toBe("a");
    expect(nearestSweep(sweeps, [1.9, 0.1, 0])?.id).toBe("b");
  });

  it("returns undefined for an empty list", () => {
    expect(nearestSweep([], [0, 0, 0])).toBeUndefined();
  });

  it("resolves neighbor objects from ids", () => {
    expect(neighborsOf(sweeps, "b").map((s) => s.id)).toEqual(["a", "c"]);
  });

  it("filters sweeps by floor", () => {
    expect(sweepsOnFloor(sweeps, 0).map((s) => s.id)).toEqual(["a", "b"]);
    expect(sweepsOnFloor(sweeps, 1).map((s) => s.id)).toEqual(["c"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/sweepGraph.test.ts`
Expected: FAIL — cannot find module './sweepGraph'.

- [ ] **Step 3: Implement `lib/sweepGraph.ts`**

```ts
import type { Sweep, Vec3 } from "./types";

function dist2(a: Vec3, b: Vec3): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}

export function nearestSweep(sweeps: Sweep[], point: Vec3): Sweep | undefined {
  let best: Sweep | undefined;
  let bestD = Infinity;
  for (const s of sweeps) {
    const d = dist2(s.position, point);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

export function neighborsOf(sweeps: Sweep[], id: string): Sweep[] {
  const sweep = sweeps.find((s) => s.id === id);
  if (!sweep) return [];
  return sweep.neighbors
    .map((nid) => sweeps.find((s) => s.id === nid))
    .filter((s): s is Sweep => Boolean(s));
}

export function sweepsOnFloor(sweeps: Sweep[], floor: number): Sweep[] {
  return sweeps.filter((s) => s.floor === floor);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/sweepGraph.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/sweepGraph.ts lib/sweepGraph.test.ts
git commit -m "feat: add sweep graph helpers"
```

---

## Task 4: Transition math (TDD)

**Files:**

- Create: `lib/transitions.ts`
- Test: `lib/transitions.test.ts`

- [ ] **Step 1: Write the failing test**

`lib/transitions.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { easeInOutCubic, lerp, lerpVec3 } from "./transitions";

describe("transitions", () => {
  it("easeInOutCubic hits endpoints and midpoint", () => {
    expect(easeInOutCubic(0)).toBeCloseTo(0);
    expect(easeInOutCubic(1)).toBeCloseTo(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
  });

  it("easeInOutCubic is symmetric around 0.5", () => {
    expect(easeInOutCubic(0.25) + easeInOutCubic(0.75)).toBeCloseTo(1);
  });

  it("lerp interpolates scalars", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it("lerpVec3 interpolates vectors component-wise", () => {
    expect(lerpVec3([0, 0, 0], [2, 4, 6], 0.5)).toEqual([1, 2, 3]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/transitions.test.ts`
Expected: FAIL — cannot find module './transitions'.

- [ ] **Step 3: Implement `lib/transitions.ts`**

```ts
import type { Vec3 } from "./types";

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/transitions.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/transitions.ts lib/transitions.test.ts
git commit -m "feat: add transition math helpers"
```

---

## Task 5: Space data load + validate (TDD)

**Files:**

- Create: `lib/space.ts`
- Test: `lib/space.test.ts`

- [ ] **Step 1: Write the failing test**

`lib/space.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { validateSpace, fallbackSpace } from "./space";

describe("space validation", () => {
  it("accepts a well-formed space", () => {
    const data = {
      modelUrl: "/m.glb",
      up: "y",
      floors: [{ id: 0, name: "F1", yMin: 0, yMax: 3 }],
      sweeps: [{ id: "s0", position: [0, 0, 0], floor: 0, neighbors: [] }],
    };
    expect(validateSpace(data)).toEqual(data);
  });

  it("throws when modelUrl is missing", () => {
    expect(() => validateSpace({ sweeps: [], floors: [] })).toThrow();
  });

  it("throws when there are no sweeps", () => {
    expect(() =>
      validateSpace({ modelUrl: "/m.glb", up: "y", floors: [], sweeps: [] }),
    ).toThrow();
  });

  it("fallbackSpace builds a single center sweep", () => {
    const fb = fallbackSpace("/m.glb", [1, 0, 1]);
    expect(fb.sweeps).toHaveLength(1);
    expect(fb.sweeps[0].position).toEqual([1, 0, 1]);
    expect(fb.modelUrl).toBe("/m.glb");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/space.test.ts`
Expected: FAIL — cannot find module './space'.

- [ ] **Step 3: Implement `lib/space.ts`**

```ts
import type { SpaceData, Vec3 } from "./types";

export function validateSpace(data: unknown): SpaceData {
  if (!data || typeof data !== "object") {
    throw new Error("space.json: not an object");
  }
  const d = data as Record<string, unknown>;
  if (typeof d.modelUrl !== "string" || d.modelUrl.length === 0) {
    throw new Error("space.json: missing modelUrl");
  }
  if (!Array.isArray(d.sweeps) || d.sweeps.length === 0) {
    throw new Error("space.json: no sweeps");
  }
  if (!Array.isArray(d.floors)) {
    throw new Error("space.json: missing floors");
  }
  return data as SpaceData;
}

export function fallbackSpace(modelUrl: string, center: Vec3): SpaceData {
  return {
    modelUrl,
    up: "y",
    floors: [
      { id: 0, name: "Floor 1", yMin: center[1] - 2, yMax: center[1] + 2 },
    ],
    sweeps: [{ id: "s0", position: center, floor: 0, neighbors: [] }],
  };
}

export async function loadSpace(url = "/data/space.json"): Promise<SpaceData> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`space.json: HTTP ${res.status}`);
  return validateSpace(await res.json());
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/space.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/space.ts lib/space.test.ts
git commit -m "feat: add space.json load + validation"
```

---

## Task 6: Sweep generation script

**Files:**

- Create: `scripts/generate-sweeps.mjs`
- Create (generated output): `public/data/space.json`

- [ ] **Step 1: Install headless GLTF loader deps**

Run:

```bash
npm install -D three@^0.170.0 node-three-gltf@^1.4.0
```

Expected: installed (three is already a dep; node-three-gltf provides a Node GLTFLoader).

- [ ] **Step 2: Write `scripts/generate-sweeps.mjs`**

```js
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import * as THREE from "three";
import { loadGltf } from "node-three-gltf";

const MODEL_FILE = "public/hm3d-example-glb/00770-NBg5UqG3di3/NBg5UqG3di3.glb";
const MODEL_URL = "/hm3d-example-glb/00770-NBg5UqG3di3/NBg5UqG3di3.glb";
const OUT = "public/data/space.json";

const SPACING = 1.2;
const EYE = 1.5;
const HEADROOM = 1.4;
const NEIGHBOR_R = 2.2;

const gltf = await loadGltf(resolve(MODEL_FILE));
const scene = gltf.scene;
const meshes = [];
scene.updateMatrixWorld(true);
scene.traverse((o) => o.isMesh && meshes.push(o));

const box = new THREE.Box3().setFromObject(scene);
const ray = new THREE.Raycaster();
const down = new THREE.Vector3(0, -1, 0);
const up = new THREE.Vector3(0, 1, 0);

function hit(origin, dir) {
  ray.set(origin, dir);
  const hits = ray.intersectObjects(meshes, true);
  return hits.length ? hits[0] : null;
}

const sweeps = [];
let i = 0;
for (let x = box.min.x; x <= box.max.x; x += SPACING) {
  for (let z = box.min.z; z <= box.max.z; z += SPACING) {
    // cast down from above to find floor
    const floorHit = hit(new THREE.Vector3(x, box.max.y + 1, z), down);
    if (!floorHit) continue;
    const fy = floorHit.point.y;
    // cast up from eye height to check headroom
    const ceilHit = hit(new THREE.Vector3(x, fy + 0.1, z), up);
    const clearance = ceilHit ? ceilHit.point.y - fy : Infinity;
    if (clearance < HEADROOM) continue;
    sweeps.push({
      id: `s${i++}`,
      position: [round(x), round(fy + EYE), round(z)],
      floor: 0,
      neighbors: [],
    });
  }
}

// connect neighbors within radius
for (const a of sweeps) {
  for (const b of sweeps) {
    if (a === b) continue;
    const dx = a.position[0] - b.position[0];
    const dz = a.position[2] - b.position[2];
    if (Math.hypot(dx, dz) <= NEIGHBOR_R) a.neighbors.push(b.id);
  }
}

const space = {
  modelUrl: MODEL_URL,
  up: "y",
  floors: [
    { id: 0, name: "Floor 1", yMin: round(box.min.y), yMax: round(box.max.y) },
  ],
  sweeps,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(space, null, 2));
console.log(`Wrote ${sweeps.length} sweeps to ${OUT}`);

function round(n) {
  return Math.round(n * 1000) / 1000;
}
```

- [ ] **Step 3: Add npm script**

In `package.json` `"scripts"`:

```json
"sweeps": "node scripts/generate-sweeps.mjs"
```

- [ ] **Step 4: Run the generator**

Run: `npm run sweeps`
Expected: prints `Wrote N sweeps to public/data/space.json` with N > 0; file exists.

- [ ] **Step 5: Sanity-check the output**

Run: `node -e "const s=require('./public/data/space.json'); console.log(s.sweeps.length, s.floors.length)"`
Expected: a positive sweep count and 1 floor. If sweep count is 0, lower `HEADROOM` or check the model's up-axis; if it's huge (>2000), raise `SPACING`. Hand-curate the JSON if some sweeps sit in odd spots.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-sweeps.mjs package.json package-lock.json public/data/space.json
git commit -m "feat: add offline sweep generator and generated space.json"
```

---

## Task 7: GLB optimization

**Files:**

- Create: `scripts/optimize-glb.mjs`
- Create (generated): `public/model/space.glb` (compressed)

- [ ] **Step 1: Install gltf-transform**

Run:

```bash
npm install -D @gltf-transform/cli@^4.0.0
```

- [ ] **Step 2: Write `scripts/optimize-glb.mjs`**

```js
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const IN = "public/hm3d-example-glb/00770-NBg5UqG3di3/NBg5UqG3di3.glb";
const OUT = "public/model/space.glb";

mkdirSync("public/model", { recursive: true });
// draco geometry + webp texture compression + prune unused
execSync(
  `npx gltf-transform optimize "${IN}" "${OUT}" --compress draco --texture-compress webp`,
  { stdio: "inherit" },
);
console.log(`Wrote ${OUT}`);
```

- [ ] **Step 3: Add npm script**

In `package.json` `"scripts"`:

```json
"optimize": "node scripts/optimize-glb.mjs"
```

- [ ] **Step 4: Run optimization**

Run: `npm run optimize`
Expected: writes `public/model/space.glb`; printed size noticeably smaller than 64MB.

- [ ] **Step 5: Point space.json at the compressed model**

In `scripts/generate-sweeps.mjs` change `MODEL_URL` to `/model/space.glb` and `MODEL_FILE` stays the original (generation uses full-detail geometry). Re-run `npm run sweeps`.
Run: `npm run sweeps`
Expected: regenerated `space.json` now references `/model/space.glb`.

- [ ] **Step 6: Commit**

```bash
git add scripts/optimize-glb.mjs package.json package-lock.json public/model/space.glb public/data/space.json
git commit -m "feat: compress GLB with gltf-transform and serve optimized model"
```

---

## Task 8: View store (zustand)

**Files:**

- Create: `stores/viewStore.ts`

- [ ] **Step 1: Implement the store**

```ts
import { create } from "zustand";
import type { SpaceData, ViewMode } from "@/lib/types";
import { DEFAULT_MODE } from "@/lib/constants";

interface ViewState {
  space: SpaceData | null;
  mode: ViewMode;
  currentSweepId: string | null;
  floorId: number;
  isTransitioning: boolean;
  setSpace: (s: SpaceData) => void;
  setMode: (m: ViewMode) => void;
  goToSweep: (id: string) => void;
  setFloor: (id: number) => void;
  setTransitioning: (v: boolean) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  space: null,
  mode: DEFAULT_MODE,
  currentSweepId: null,
  floorId: 0,
  isTransitioning: false,
  setSpace: (space) =>
    set({
      space,
      currentSweepId: space.sweeps[0]?.id ?? null,
      floorId: space.floors[0]?.id ?? 0,
    }),
  setMode: (mode) => set({ mode }),
  goToSweep: (currentSweepId) => set({ currentSweepId, mode: "inside" }),
  setFloor: (floorId) => set({ floorId }),
  setTransitioning: (isTransitioning) => set({ isTransitioning }),
}));
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (Confirm `@/*` path alias resolves to project root in `tsconfig.json`; it does in the existing scaffold.)

- [ ] **Step 3: Commit**

```bash
git add stores/viewStore.ts
git commit -m "feat: add zustand view store"
```

---

## Task 9: SpaceModel component

**Files:**

- Create: `components/canvas/SpaceModel.tsx`

- [ ] **Step 1: Implement the component**

```tsx
"use client";
import { useGLTF } from "@react-three/drei";

export function SpaceModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

// preloading is triggered from TourViewer once the url is known
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/canvas/SpaceModel.tsx
git commit -m "feat: add SpaceModel GLB loader"
```

---

## Task 10: SweepPucks component

**Files:**

- Create: `components/canvas/SweepPucks.tsx`

- [ ] **Step 1: Implement the component**

```tsx
"use client";
import { useViewStore } from "@/stores/viewStore";
import { sweepsOnFloor } from "@/lib/sweepGraph";
import { PUCK_COLOR, PUCK_OPACITY } from "@/lib/constants";

export function SweepPucks() {
  const space = useViewStore((s) => s.space);
  const mode = useViewStore((s) => s.mode);
  const floorId = useViewStore((s) => s.floorId);
  const currentSweepId = useViewStore((s) => s.currentSweepId);
  const goToSweep = useViewStore((s) => s.goToSweep);

  if (!space || mode !== "inside") return null;
  const visible = sweepsOnFloor(space.sweeps, floorId);

  return (
    <group>
      {visible.map((sweep) => {
        const isCurrent = sweep.id === currentSweepId;
        // place ring slightly below eye height, flat on the floor
        const [x, y, z] = sweep.position;
        return (
          <mesh
            key={sweep.id}
            position={[x, y - 1.4, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              goToSweep(sweep.id);
            }}
            onPointerOver={() => (document.body.style.cursor = "pointer")}
            onPointerOut={() => (document.body.style.cursor = "default")}
          >
            <ringGeometry args={[0.18, 0.26, 32]} />
            <meshBasicMaterial
              color={PUCK_COLOR}
              transparent
              opacity={isCurrent ? 0.3 : PUCK_OPACITY}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/canvas/SweepPucks.tsx
git commit -m "feat: add clickable sweep pucks"
```

---

## Task 11: CameraController

**Files:**

- Create: `components/canvas/CameraController.tsx`

- [ ] **Step 1: Implement the controller**

```tsx
"use client";
import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useViewStore } from "@/stores/viewStore";
import { INSIDE_FOV, DOLLHOUSE_FOV } from "@/lib/constants";

// computes the desired camera position + look target for the active mode
function desiredPose(
  mode: string,
  sweepPos: THREE.Vector3,
  center: THREE.Vector3,
  size: THREE.Vector3,
): { pos: THREE.Vector3; target: THREE.Vector3; fov: number } {
  const radius = Math.max(size.x, size.z);
  if (mode === "dollhouse") {
    return {
      pos: new THREE.Vector3(
        center.x + radius,
        center.y + radius * 0.9,
        center.z + radius,
      ),
      target: center.clone(),
      fov: DOLLHOUSE_FOV,
    };
  }
  if (mode === "floorplan") {
    return {
      pos: new THREE.Vector3(
        center.x,
        center.y + radius * 1.6,
        center.z + 0.001,
      ),
      target: center.clone(),
      fov: DOLLHOUSE_FOV,
    };
  }
  // inside: sit at sweep, look toward center horizontally
  const look = center.clone();
  look.y = sweepPos.y;
  return { pos: sweepPos.clone(), target: look, fov: INSIDE_FOV };
}

export function CameraController() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const space = useViewStore((s) => s.space);
  const mode = useViewStore((s) => s.mode);
  const currentSweepId = useViewStore((s) => s.currentSweepId);
  const setTransitioning = useViewStore((s) => s.setTransitioning);

  const targetRef = useRef(new THREE.Vector3());
  const bounds = useRef({
    center: new THREE.Vector3(),
    size: new THREE.Vector3(10, 3, 10),
  });

  // recompute bounds when the space (model) changes
  useEffect(() => {
    if (!space) return;
    const xs = space.sweeps.map((s) => s.position[0]);
    const zs = space.sweeps.map((s) => s.position[2]);
    const ys = space.sweeps.map((s) => s.position[1]);
    const center = new THREE.Vector3(
      (Math.min(...xs) + Math.max(...xs)) / 2,
      (Math.min(...ys) + Math.max(...ys)) / 2,
      (Math.min(...zs) + Math.max(...zs)) / 2,
    );
    const size = new THREE.Vector3(
      Math.max(...xs) - Math.min(...xs) || 10,
      3,
      Math.max(...zs) - Math.min(...zs) || 10,
    );
    bounds.current = { center, size };
  }, [space]);

  useFrame((_, delta) => {
    if (!space) return;
    const sweep =
      space.sweeps.find((s) => s.id === currentSweepId) ?? space.sweeps[0];
    const sweepPos = new THREE.Vector3(...sweep.position);
    const { pos, target, fov } = desiredPose(
      mode,
      sweepPos,
      bounds.current.center,
      bounds.current.size,
    );

    const k = 1 - Math.pow(0.001, delta); // frame-rate independent damping
    camera.position.lerp(pos, k);
    targetRef.current.lerp(target, k);
    camera.lookAt(targetRef.current);

    if (Math.abs(camera.fov - fov) > 0.1) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, fov, k);
      camera.updateProjectionMatrix();
    }

    const settled = camera.position.distanceTo(pos) < 0.02;
    setTransitioning(!settled);
  });

  return null;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/canvas/CameraController.tsx
git commit -m "feat: add camera controller with mode/sweep tweening"
```

---

## Task 12: Scene assembly

**Files:**

- Create: `components/canvas/Scene.tsx`

- [ ] **Step 1: Implement the scene**

```tsx
"use client";
import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";
import { useViewStore } from "@/stores/viewStore";
import { SpaceModel } from "./SpaceModel";
import { SweepPucks } from "./SweepPucks";
import { CameraController } from "./CameraController";

export function Scene() {
  const space = useViewStore((s) => s.space);
  const mode = useViewStore((s) => s.mode);
  if (!space) return null;

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={0.6} />
      <Suspense fallback={null}>
        <SpaceModel url={space.modelUrl} />
      </Suspense>
      <SweepPucks />
      <CameraController />
      {/* free-look in inside mode; orbit in dollhouse; pan-locked in floorplan */}
      <OrbitControls
        enablePan={mode === "floorplan"}
        enableZoom={mode !== "inside"}
        enableRotate={mode !== "floorplan"}
        makeDefault
      />
    </>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/canvas/Scene.tsx
git commit -m "feat: assemble 3D scene"
```

---

## Task 13: LoadingScreen

**Files:**

- Create: `components/ui/LoadingScreen.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useProgress } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const { active, progress } = useProgress();
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-900 text-white"
        >
          <div className="text-sm tracking-widest uppercase opacity-70">
            Loading tour
          </div>
          <div className="mt-4 h-1 w-48 overflow-hidden rounded bg-white/20">
            <div
              className="h-full bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs opacity-50">{Math.round(progress)}%</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/LoadingScreen.tsx
git commit -m "feat: add loading screen with GLB progress"
```

---

## Task 14: ModeToggle

**Files:**

- Create: `components/ui/ModeToggle.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useViewStore } from "@/stores/viewStore";
import type { ViewMode } from "@/lib/types";

const MODES: { id: ViewMode; label: string }[] = [
  { id: "inside", label: "Inside" },
  { id: "dollhouse", label: "Dollhouse" },
  { id: "floorplan", label: "Floorplan" },
];

export function ModeToggle() {
  const mode = useViewStore((s) => s.mode);
  const setMode = useViewStore((s) => s.setMode);
  return (
    <div className="absolute bottom-4 left-1/2 z-40 -translate-x-1/2">
      <div className="flex gap-1 rounded-full bg-black/50 p-1 backdrop-blur">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              mode === m.id
                ? "bg-white text-neutral-900"
                : "text-white hover:bg-white/10"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/ModeToggle.tsx
git commit -m "feat: add mode toggle"
```

---

## Task 15: ViewControls (zoom + fullscreen)

**Files:**

- Create: `components/ui/ViewControls.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
}

// dispatches a wheel event so OrbitControls dolly zoom responds
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/ViewControls.tsx
git commit -m "feat: add zoom and fullscreen controls"
```

---

## Task 16: FloorSelector

**Files:**

- Create: `components/ui/FloorSelector.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useViewStore } from "@/stores/viewStore";

export function FloorSelector() {
  const space = useViewStore((s) => s.space);
  const floorId = useViewStore((s) => s.floorId);
  const setFloor = useViewStore((s) => s.setFloor);

  // only render when the scene actually has multiple floors
  if (!space || space.floors.length < 2) return null;

  return (
    <div className="absolute right-4 top-32 z-40 flex flex-col gap-1.5">
      {space.floors.map((f) => (
        <button
          key={f.id}
          onClick={() => setFloor(f.id)}
          className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold ${
            floorId === f.id
              ? "bg-white text-neutral-900"
              : "bg-black/50 text-white"
          }`}
        >
          {f.id + 1}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/FloorSelector.tsx
git commit -m "feat: add conditional floor selector"
```

---

## Task 17: Minimap

**Files:**

- Create: `components/ui/Minimap.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useMemo } from "react";
import { useViewStore } from "@/stores/viewStore";
import { sweepsOnFloor } from "@/lib/sweepGraph";

const SIZE = 128;
const PAD = 10;

export function Minimap() {
  const space = useViewStore((s) => s.space);
  const floorId = useViewStore((s) => s.floorId);
  const currentSweepId = useViewStore((s) => s.currentSweepId);
  const goToSweep = useViewStore((s) => s.goToSweep);

  const data = useMemo(() => {
    if (!space) return null;
    const sweeps = sweepsOnFloor(space.sweeps, floorId);
    if (sweeps.length === 0) return null;
    const xs = sweeps.map((s) => s.position[0]);
    const zs = sweeps.map((s) => s.position[2]);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs);
    const minZ = Math.min(...zs),
      maxZ = Math.max(...zs);
    const span = Math.max(maxX - minX, maxZ - minZ) || 1;
    const project = (x: number, z: number) => ({
      cx: PAD + ((x - minX) / span) * (SIZE - 2 * PAD),
      cy: PAD + ((z - minZ) / span) * (SIZE - 2 * PAD),
    });
    return { sweeps, project };
  }, [space, floorId]);

  if (!data) return null;

  return (
    <div
      className="absolute right-4 top-4 z-40 rounded-lg border border-white/20 bg-black/50 backdrop-blur"
      style={{ width: SIZE, height: SIZE }}
    >
      <svg width={SIZE} height={SIZE}>
        {data.sweeps.map((s) => {
          const { cx, cy } = data.project(s.position[0], s.position[2]);
          const isCurrent = s.id === currentSweepId;
          return (
            <circle
              key={s.id}
              cx={cx}
              cy={cy}
              r={isCurrent ? 5 : 3}
              fill={isCurrent ? "#ffffff" : "rgba(255,255,255,0.5)"}
              style={{ cursor: "pointer" }}
              onClick={() => goToSweep(s.id)}
            />
          );
        })}
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/Minimap.tsx
git commit -m "feat: add minimap with clickable sweep dots"
```

---

## Task 18: TourViewer + page wiring

**Files:**

- Create: `components/TourViewer.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css` (ensure full-viewport canvas)

- [ ] **Step 1: Implement `components/TourViewer.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useViewStore } from "@/stores/viewStore";
import { loadSpace } from "@/lib/space";
import { INSIDE_FOV } from "@/lib/constants";
import { Scene } from "./canvas/Scene";
import { LoadingScreen } from "./ui/LoadingScreen";
import { ModeToggle } from "./ui/ModeToggle";
import { ViewControls } from "./ui/ViewControls";
import { FloorSelector } from "./ui/FloorSelector";
import { Minimap } from "./ui/Minimap";

export function TourViewer() {
  const setSpace = useViewStore((s) => s.setSpace);
  const space = useViewStore((s) => s.space);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSpace()
      .then((s) => {
        setSpace(s);
        useGLTF.preload(s.modelUrl);
      })
      .catch((e) => setError(String(e)));
  }, [setSpace]);

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-neutral-900 text-white">
        <p>Could not load the tour.</p>
        <button
          className="rounded bg-white px-4 py-2 text-neutral-900"
          onClick={() => location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-neutral-900">
      <Canvas
        camera={{
          fov: INSIDE_FOV,
          position: [0, 1.5, 0],
          near: 0.05,
          far: 1000,
        }}
      >
        <Scene />
      </Canvas>
      {space && (
        <>
          <div className="absolute left-4 top-4 z-40 rounded-md bg-black/45 px-3 py-1.5 text-sm text-white">
            Virtual Tour
          </div>
          <Minimap />
          <FloorSelector />
          <ModeToggle />
          <ViewControls />
        </>
      )}
      <LoadingScreen />
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/page.tsx`**

```tsx
import dynamic from "next/dynamic";

// R3F must run client-side only
const TourViewer = dynamic(
  () => import("@/components/TourViewer").then((m) => m.TourViewer),
  { ssr: false },
);

export default function Home() {
  return <TourViewer />;
}
```

- [ ] **Step 3: Ensure full-viewport styles in `app/globals.css`**

Append:

```css
html,
body {
  margin: 0;
  height: 100%;
  background: #171717;
}
canvas {
  display: block;
  touch-action: none;
}
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 5: Manual smoke test**

Start the dev server **yourself in a terminal** (do not run it from the agent): `npm run dev`, open `http://localhost:3000`.
Expected: loading screen → model appears in Inside mode, pucks visible on floor, mode toggle / minimap / controls render.

- [ ] **Step 6: Commit**

```bash
git add components/TourViewer.tsx app/page.tsx app/globals.css
git commit -m "feat: wire TourViewer into the app"
```

---

## Task 19: Robustness — WebGL guard + sweep fallback

**Files:**

- Modify: `components/TourViewer.tsx`
- Create: `lib/webgl.ts`
- Test: `lib/webgl.test.ts`

- [ ] **Step 1: Write the failing test**

`lib/webgl.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { isWebGLAvailable } from "./webgl";

describe("webgl detection", () => {
  it("returns false when document is undefined (node)", () => {
    expect(isWebGLAvailable()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/webgl.test.ts`
Expected: FAIL — cannot find module './webgl'.

- [ ] **Step 3: Implement `lib/webgl.ts`**

```ts
export function isWebGLAvailable(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/webgl.test.ts`
Expected: PASS.

- [ ] **Step 5: Use the guard in `TourViewer`**

In `components/TourViewer.tsx`, add after the `error` early-return, before the main return:

```tsx
if (typeof window !== "undefined" && !isWebGLAvailable()) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-neutral-900 text-white">
      Your browser does not support WebGL.
    </div>
  );
}
```

And add the import at the top:

```tsx
import { isWebGLAvailable } from "@/lib/webgl";
```

- [ ] **Step 6: Build + test**

Run: `npm test && npm run build`
Expected: all unit tests pass; build succeeds.

- [ ] **Step 7: Commit**

```bash
git add lib/webgl.ts lib/webgl.test.ts components/TourViewer.tsx
git commit -m "feat: add WebGL availability guard"
```

---

## Task 20: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full unit test run**

Run: `npm test`
Expected: all suites pass (sweepGraph, transitions, space, webgl, smoke).

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: succeeds, no type errors.

- [ ] **Step 3: Manual checklist (dev server run by you, not the agent)**

Verify in the browser:

- [ ] Loading screen shows progress, then disappears.
- [ ] Inside mode: free-look drag works; clicking a puck flies the camera to it.
- [ ] Dollhouse mode: smooth transition; orbit + zoom work.
- [ ] Floorplan mode: top-down ortho-style view; rotation locked.
- [ ] Minimap shows sweeps; current sweep highlighted; clicking a dot navigates.
- [ ] Zoom +/- and fullscreen buttons work.
- [ ] Floor selector appears only if the scene reports >1 floor.

- [ ] **Step 4: Update README**

Add a short "Run locally" section to `README.md` documenting: `npm install`, `npm run optimize`, `npm run sweeps`, `npm run dev`. Commit:

```bash
git add README.md
git commit -m "docs: add run instructions"
```

---

## Self-Review Notes

- **Spec coverage:** Inside (Tasks 9–12), Dollhouse + Floorplan + transitions (Task 11), Minimap (Task 17), mode toggle (Task 14), sweep generation hybrid C (Task 6), asset compression (Task 7), error handling (Tasks 5, 18, 19), testing (Tasks 1, 3, 4, 5, 19). All v1 spec items map to tasks.
- **Type consistency:** `SpaceData`/`Sweep`/`Floor`/`ViewMode` defined in Task 2 are used unchanged throughout; store actions (`setSpace`, `setMode`, `goToSweep`, `setFloor`, `setTransitioning`) match their call sites.
- **Out of scope (v2):** measurement, tags/hotspots, highlight reel, VR — intentionally excluded.
