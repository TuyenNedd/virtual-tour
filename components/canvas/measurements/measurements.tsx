"use client";
import { Line, Html } from "@react-three/drei";
import { useViewStore } from "@/stores/view-store";
import { segments, formatLength } from "@/lib/measure";

export function Measurements() {
  const measureMode = useViewStore((s) => s.measureMode);
  const points = useViewStore((s) => s.measurePoints);

  if (!measureMode || points.length === 0) return null;
  const segs = segments(points);

  return (
    <>
      {points.map((p, i) => (
        <mesh key={i} position={p} renderOrder={1000}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color="#22d3ee" depthTest={false} />
        </mesh>
      ))}
      {points.length >= 2 && (
        <Line points={points} color="#22d3ee" lineWidth={2} />
      )}
      {segs.map((s, i) => (
        <Html key={i} position={s.mid} center style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "rgba(0,0,0,0.75)",
              color: "#fff",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 12,
              whiteSpace: "nowrap",
            }}
          >
            {formatLength(s.length)}
          </div>
        </Html>
      ))}
    </>
  );
}
