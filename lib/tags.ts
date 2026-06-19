import type { Tag } from "./types";

// Load optional Mattertag-style hotspots. Missing/invalid file -> no tags.
export async function loadTags(url = "/data/tags.json"): Promise<Tag[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.filter(
      (t): t is Tag =>
        t &&
        typeof t.id === "string" &&
        Array.isArray(t.position) &&
        t.position.length === 3 &&
        typeof t.title === "string",
    );
  } catch {
    return [];
  }
}
