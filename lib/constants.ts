export const DEFAULT_FOV = 75;
export const DEFAULT_ZOOM = 1;
export const TRANSITION_DURATION = 1.2;
export const MIN_POLAR_ANGLE = 0.1;
export const MAX_POLAR_ANGLE = Math.PI - 0.1;
export const DOLLHOUSE_CAMERA_DISTANCE = 20;
export const FLOORPLAN_CAMERA_HEIGHT = 50;
export const SWEEP_PUCK_RADIUS = 0.3;
export const SWEEP_PUCK_COLOR = '#4fc3f7';

export const ROOM_LABELS = [
  { name: 'Living Room', position: [1.5, 0, -1] as [number, number, number] },
  { name: 'Kitchen', position: [-2, 0, 2] as [number, number, number] },
  { name: 'Hallway', position: [0, 0, 0.5] as [number, number, number] },
];
