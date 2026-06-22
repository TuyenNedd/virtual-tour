"use client";
import dynamic from "next/dynamic";

const TourViewer = dynamic(
  () =>
    import("@/components/tour-viewer/tour-viewer").then((m) => m.TourViewer),
  { ssr: false },
);

export default function Home() {
  return <TourViewer />;
}
