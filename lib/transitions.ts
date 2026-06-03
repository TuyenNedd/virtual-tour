import * as THREE from 'three';

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVector3(
  from: THREE.Vector3,
  to: THREE.Vector3,
  t: number
): THREE.Vector3 {
  return new THREE.Vector3().lerpVectors(from, to, t);
}

export function slerpQuaternion(
  from: THREE.Quaternion,
  to: THREE.Quaternion,
  t: number
): THREE.Quaternion {
  return new THREE.Quaternion().slerpQuaternions(from, to, t);
}
