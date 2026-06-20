"use client";
import { Html } from "@react-three/drei";
import { useViewStore } from "@/stores/view-store";

// Floating room name labels, shown in the overview modes (dollhouse / floorplan)
// like Matterport. Loaded from public/data/rooms.json.
export function RoomLabels() {
  const rooms = useViewStore((s) => s.rooms);
  const mode = useViewStore((s) => s.mode);

  if (mode === "inside" || rooms.length === 0) return null;

  return (
    <>
      {rooms.map((r) => (
        <Html
          key={r.id}
          position={r.position}
          center
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.55)",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
              textTransform: "uppercase",
            }}
          >
            {r.name}
          </div>
        </Html>
      ))}
    </>
  );
}
