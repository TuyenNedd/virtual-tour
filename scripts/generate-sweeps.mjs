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
    const floorHit = hit(new THREE.Vector3(x, box.max.y + 1, z), down);
    if (!floorHit) continue;
    const fy = floorHit.point.y;
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

const LOS_EPSILON = 0.15;
const losRay = new THREE.Raycaster();

function hasLineOfSight(a, b) {
  const origin = new THREE.Vector3(a.position[0], a.position[1], a.position[2]);
  const target = new THREE.Vector3(b.position[0], b.position[1], b.position[2]);
  const dir = new THREE.Vector3().subVectors(target, origin);
  const dist = dir.length();
  if (dist === 0) return true;
  dir.normalize();
  losRay.set(origin, dir);
  losRay.far = dist;
  const hits = losRay.intersectObjects(meshes, true);
  // Occluded if geometry is hit before reaching B (minus epsilon tolerance).
  if (hits.length && hits[0].distance < dist - LOS_EPSILON) return false;
  return true;
}

for (const a of sweeps) {
  for (const b of sweeps) {
    if (a === b) continue;
    const dx = a.position[0] - b.position[0];
    const dz = a.position[2] - b.position[2];
    if (Math.hypot(dx, dz) > NEIGHBOR_R) continue;
    if (!hasLineOfSight(a, b)) continue;
    a.neighbors.push(b.id);
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
