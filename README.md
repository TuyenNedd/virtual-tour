# Virtual Tour Viewer

A 3D Virtual Tour Viewer built with Next.js and React Three Fiber, featuring three view modes: Panorama (Inside), Dollhouse, and Floorplan.

## Features

- **Panorama Mode**: 360-degree immersive view from sweep points
- **Dollhouse Mode**: 3D overview of the entire space with orbit controls
- **Floorplan Mode**: Top-down 2D view with sweep positions and connections
- **Smooth Camera Transitions**: Animated camera movement between view modes
- **Sweep Navigation**: Click-based navigation between sweep points
- **Multi-floor Support**: Floor selector for spaces with multiple levels
- **Minimap**: Real-time position indicator

## Tech Stack

- **Next.js 14** - React framework with App Router
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **Three.js** - 3D rendering library
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Leva** - Debug controls panel
- **TypeScript** - Type safety

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
    page.tsx              # Main page (client component)
    globals.css           # Tailwind directives and global styles
  components/
    canvas/               # React Three Fiber 3D components
      Scene.tsx           # Main Canvas wrapper
      PanoramaView.tsx    # 360 sphere with procedural gradient
      DollhouseView.tsx   # Wireframe house placeholder
      FloorplanView.tsx   # Top-down view with connections
      SweepPuck.tsx       # Clickable navigation waypoints
      CameraController.tsx # Camera transition animations
    ui/                   # HTML overlay UI components
      ModeButtons.tsx     # View mode switcher
      FloorSelector.tsx   # Floor level selector
      LoadingScreen.tsx   # Loading overlay
      Minimap.tsx         # Position minimap
  stores/                 # Zustand state stores
    viewModeStore.ts      # View mode and transitions
    sweepStore.ts         # Sweep navigation state
    spaceStore.ts         # Space data and floor state
  hooks/                  # Custom React hooks
    useViewMode.ts        # View mode switching logic
    useSweepNavigation.ts # Sweep navigation logic
    useCameraTransition.ts # Camera transition helpers
  lib/                    # Shared utilities
    types.ts              # TypeScript interfaces and enums
    constants.ts          # Configuration constants
    transitions.ts        # Easing and interpolation functions
  public/
    data/space.json       # Sample space metadata (5 sweeps, 2 floors)
    panoramas/            # Panorama images (placeholder)
    model/                # 3D model files (placeholder)
```

## Architecture

### State Management

Three Zustand stores manage the application state:
- **viewModeStore**: Tracks current view mode and transition state
- **sweepStore**: Manages sweep points and current navigation position
- **spaceStore**: Holds the full space data and floor information

### Rendering Pipeline

1. `Scene.tsx` renders the R3F Canvas
2. View components (Panorama/Dollhouse/Floorplan) conditionally render based on current mode
3. `CameraController` animates camera position/rotation during transitions
4. UI overlays sit on top of the canvas for mode switching and navigation

### Transitions

Camera transitions use cubic easing with configurable duration. The `CameraController` uses `useFrame` to interpolate position, target, and FOV between the source and destination states.

## Adding Real Data

### Panorama Images

Place equirectangular JPEG images (recommended 4096x2048) in `public/panoramas/` and update the `panoramaUrl` fields in `space.json`.

### 3D Model

Export your space model as a GLB file from Blender, place it in `public/model/`, and set the `modelUrl` field in `space.json`.

### Space Configuration

Edit `public/data/space.json` to define your sweep points, floor layout, and neighbor connections.

## Customization

- Edit `lib/constants.ts` to adjust camera distances, transition speed, and puck appearance
- Modify `tailwind.config.ts` for theme customization
- Adjust easing functions in `lib/transitions.ts` for different animation feels

## Known Limitations

- Placeholder procedural textures used by default (gradient sphere for panorama, wireframe for dollhouse)
- No real panorama image loading without actual equirectangular images
- GLB model loading requires a real model file
- Performance with large models may need optimization
