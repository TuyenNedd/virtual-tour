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

export interface Tag {
  id: string;
  position: Vec3; // world position (Y-up, same space as sweeps)
  title: string;
  body: string;
  color?: string;
}

export interface RoomLabel {
  id: string;
  position: Vec3; // world position (Y-up)
  name: string;
}
