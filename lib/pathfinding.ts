import type { Sweep } from "./types";

// Breadth-first shortest path (by number of hops) over the sweep neighbor graph.
// Returns the inclusive id sequence from `fromId` to `toId`, or [] if either id
// is unknown or the target is unreachable.
export function findPath(
  sweeps: Sweep[],
  fromId: string,
  toId: string,
): string[] {
  const byId = new Map(sweeps.map((s) => [s.id, s]));
  if (!byId.has(fromId) || !byId.has(toId)) return [];
  if (fromId === toId) return [fromId];

  const prev = new Map<string, string>();
  const visited = new Set<string>([fromId]);
  const queue: string[] = [fromId];

  while (queue.length > 0) {
    const id = queue.shift() as string;
    if (id === toId) {
      const path = [toId];
      let cur = toId;
      while (cur !== fromId) {
        cur = prev.get(cur) as string;
        path.unshift(cur);
      }
      return path;
    }
    for (const nid of byId.get(id)?.neighbors ?? []) {
      if (visited.has(nid) || !byId.has(nid)) continue;
      visited.add(nid);
      prev.set(nid, id);
      queue.push(nid);
    }
  }
  return [];
}
