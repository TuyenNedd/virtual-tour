# Virtual Tour Viewer

A Matterport-style 3D virtual tour viewer built with Next.js and React Three Fiber. Navigate immersive 360-degree panoramas, explore a dollhouse wireframe overview, or view a top-down floorplan -- all with smooth animated transitions between modes.

## Features

- **Panorama Mode**: Full 360-degree panorama viewing with real equirectangular image textures. Click-and-drag to look around. Directional sweep pucks appear at the bottom of the view indicating navigable neighbors.
- **Sweep Navigation**: Click sweep pucks to navigate between viewpoints. Transitions use a smooth fade-to-black effect with a loading spinner during texture loads.
- **Dollhouse Mode**: An elevated 3D wireframe visualization of all rooms and sweep positions with orbit controls. Click any sweep puck to jump to that location.
- **Floorplan Mode**: A top-down orthographic-style view showing room outlines and sweep connections as a map. Click sweeps to navigate.
- **Smooth Mode Transitions**: Two-phase camera animations with easing when switching between Panorama, Dollhouse, and Floorplan. The camera flies out/in with a subtle fade overlay to mask view switches.
- **Animated Mode Selector**: A pill-slider UI with framer-motion layout animations, icons for each mode, and disabled state during transitions.
- **Minimap with Orientation**: A real-time minimap in the corner shows sweep positions, connections, and a directional arrow indicating camera facing direction in panorama mode.
- **Multi-floor Support**: Floor selector appears when a space has multiple levels, with animated indicators.
- **Responsive Loading**: A full-screen loading overlay on initial data fetch, plus a centered spinner during sweep navigation.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Helpers for R3F (OrbitControls, etc.)
- **Three.js** - 3D rendering engine
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for UI transitions
- **TypeScript** - Static type checking

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

## Project Structure

```
virtual-tour/
  app/                    # Next.js App Router
    layout.tsx            # Root layout with metadata
    page.tsx              # Main page - data loading, overlays, dynamic Scene import
    globals.css           # Tailwind directives and global styles
  components/
    canvas/               # React Three Fiber 3D components
      Scene.tsx           # R3F Canvas with Suspense boundary
      PanoramaView.tsx    # 360 equirectangular sphere + sweep pucks + yaw tracker
      DollhouseView.tsx   # Multi-room wireframe with orbit controls
      FloorplanView.tsx   # Top-down orthographic room layout
      SweepPuck.tsx       # Clickable 3D navigation waypoints
      CameraController.tsx # Animated camera transitions between modes
    ui/                   # HTML overlay UI components
      ModeButtons.tsx     # Animated mode switcher with pill slider and icons
      FloorSelector.tsx   # Floor level selector with animated indicator
      LoadingScreen.tsx   # Initial loading overlay
      Minimap.tsx         # Position minimap with orientation arrow
  stores/                 # Zustand state stores
    viewModeStore.ts      # View mode, transitions, and camera yaw
    sweepStore.ts         # Sweep navigation state and fade transitions
    spaceStore.ts         # Space data and floor state
  hooks/                  # Custom React hooks
    useViewMode.ts        # View mode switching logic
    useSweepNavigation.ts # Sweep navigation helpers
    useCameraTransition.ts # Camera transition target calculation
  lib/                    # Shared utilities
    types.ts              # TypeScript interfaces and enums
    constants.ts          # Configuration constants (FOV, colors, durations)
    transitions.ts        # Easing and interpolation functions
  public/
    data/space.json       # Space metadata (sweeps, floors, connections)
    panoramas/            # Equirectangular panorama images
    model/                # 3D model files (GLB)
```

## Architecture

### State Management

Three Zustand stores manage application state:
- **viewModeStore**: Current view mode, transition state (active, phase, progress), and camera yaw for the minimap orientation arrow.
- **sweepStore**: Current sweep ID, all sweeps indexed by ID, navigation state (isNavigating, navigationTarget), and neighbor lookup.
- **spaceStore**: Full space data, floor list, current floor, and initial data loading.

### Rendering Pipeline

1. `Scene.tsx` renders the R3F Canvas with a Suspense boundary
2. View components (PanoramaView, DollhouseView, FloorplanView) conditionally render based on `currentMode`
3. `CameraController` uses `useFrame` to interpolate camera position, target, and FOV during mode transitions
4. During transitions, both source and destination views exist briefly; a fade overlay in `page.tsx` masks the switch at the midpoint
5. UI overlays (mode buttons, minimap, floor selector) sit above the canvas as fixed HTML elements

### Transition System

Mode transitions are two-phase:
- **Phase 0**: Camera begins animating from source position. At the midpoint (t=0.5), the fade overlay peaks and `advanceTransitionPhase()` switches `currentMode` to the destination.
- **Phase 1**: Camera continues animating to the destination position. The overlay fades out.

Sweep navigation uses a simpler fade-to-black approach: `isNavigating` triggers full opacity, a timer fires after 400ms to call `completeNavigation()` (which updates `currentSweepId`), and the overlay fades back out revealing the new panorama.

### Camera Yaw Tracking

A `CameraYawTracker` component inside PanoramaView uses `useFrame` to read `camera.rotation.y` and writes it to `viewModeStore.cameraYaw` (throttled to updates > 0.05 rad). The Minimap reads this value to draw an orientation arrow.

## Adding Real Data

### Panorama Images

Place equirectangular JPEG images (recommended 4096x2048 or 8192x4096) in `public/panoramas/` and update the `panoramaUrl` fields in `space.json`.

### 3D Model

Export your space model as a GLB file from Blender or similar tool, place it in `public/model/`, and set the `modelUrl` field in `space.json`.

### Space Configuration

Edit `public/data/space.json` to define sweep points, floor layout, neighbor connections, and panorama URLs.

## Customization

- Edit `lib/constants.ts` to adjust camera distances, transition durations, FOV values, and puck appearance
- Modify easing functions in `lib/transitions.ts` for different animation curves
- Adjust UI styling via Tailwind classes in the `components/ui/` files
