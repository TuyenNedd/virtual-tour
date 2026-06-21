import type { RoomLabel } from "./types";

// Load optional room labels. Missing/invalid file -> no labels.
export async function loadRooms(url = "/data/rooms.json"): Promise<RoomLabel[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.filter(
      (r): r is RoomLabel =>
        r &&
        typeof r.id === "string" &&
        Array.isArray(r.position) &&
        r.position.length === 3 &&
        typeof r.name === "string",
    );
  } catch {
    return [];
  }
}
