"use client";
import { X } from "lucide-react";
import { refractive } from "@hashintel/refractive";
import { useViewStore } from "@/stores/view-store";
import { LIQUID_GLASS } from "@/lib/constants";

export function TagPanel() {
  const tags = useViewStore((s) => s.tags);
  const selectedTagId = useViewStore((s) => s.selectedTagId);
  const selectTag = useViewStore((s) => s.selectTag);

  const tag = tags.find((t) => t.id === selectedTagId);
  if (!tag) return null;

  return (
    <refractive.div
      refraction={{ ...LIQUID_GLASS, radius: 14, bezelWidth: 10 }}
      className="absolute bottom-24 left-4 z-40 max-w-xs border border-white/10 bg-black/45 p-4 text-white shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold" style={{ color: tag.color }}>
          {tag.title}
        </h3>
        <button
          onClick={() => selectTag(null)}
          aria-label="Close"
          className="-mr-1 -mt-1 flex h-6 w-6 items-center justify-center rounded text-white/60 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <X size={15} />
        </button>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-white/80">{tag.body}</p>
    </refractive.div>
  );
}
