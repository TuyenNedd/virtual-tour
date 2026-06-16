import dynamic from "next/dynamic";

const TourViewer = dynamic(
  () => import("@/components/TourViewer").then((m) => m.TourViewer),
  { ssr: false },
);

export default function Home() {
  return <TourViewer />;
}
