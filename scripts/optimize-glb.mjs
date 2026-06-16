import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const IN = "public/hm3d-example-glb/00770-NBg5UqG3di3/NBg5UqG3di3.glb";
const OUT = "public/model/space.glb";

mkdirSync("public/model", { recursive: true });
execSync(
  `npx gltf-transform optimize "${IN}" "${OUT}" --compress draco --texture-compress webp`,
  { stdio: "inherit" },
);
console.log(`Wrote ${OUT}`);
