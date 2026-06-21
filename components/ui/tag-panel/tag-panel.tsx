"use client";
import { useViewStore } from "@/stores/view-store";

export function TagPanel() {
  const tags = useViewStore((s) => s.tags);
  const selectedTagId = useViewStore((s) => s.selectedTagId);
  const selectTag = useViewStore((s) => s.selectTag);

  const tag = tags.find((t) => t.id === selectedTagId);
  if (!tag) return null;

  return (
    <div className="absolute bottom-24 left-4 z-40 max-w-xs rounded-xl border border-white/10 bg-black/65 p-4 text-white shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold" style={{ color: tag.color }}>
          {tag.title}
        </h3>
        <button
          onClick={() => selectTag(null)}
          aria-label="Close"
          className="-mt-1 rounded text-lg leading-none text-white/60 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          ×
        </button>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-white/80">{tag.body}</p>
    </div>
  );
}
