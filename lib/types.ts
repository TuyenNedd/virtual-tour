export interface Sweep {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  neighbors: string[];
  panoramaUrl: string;
  floor: number;
}

export interface Floor {
  id: string;
  name: string;
  number: number;
  sweeps: string[];
}

export interface SpaceData {
  id: string;
  name: string;
  floors: Floor[];
  sweeps: Sweep[];
  modelUrl: string | null;
}

export enum ViewMode {
  Panorama = 1,
  Dollhouse = 2,
  Floorplan = 3,
  Transition = -1,
}

export interface TransitionState {
  active: boolean;
  progress: number;
  from: ViewMode;
  to: ViewMode;
}

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  zoom: number;
}
