"use client";
import { useViewStore } from "@/stores/viewStore";

export function TagPanel() {
  const tags = useViewStore((s) => s.tags);
  const selectedTagId = useViewStore((s) => s.selectedTagId);
  const selectTag = useViewStore((s) => s.selectTag);

  const tag = tags.find((t) => t.id === selectedTagId);
  if (!tag) return null;

  return (
    <div className="absolute bottom-20 left-4 z-40 max-w-xs rounded-lg bg-black/70 p-4 text-white backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold" style={{ color: tag.color }}>
          {tag.title}
        </h3>
        <button
          onClick={() => selectTag(null)}
          aria-label="Close"
          className="-mt-1 text-lg leading-none text-white/60 hover:text-white"
        >
          ×
        </button>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-white/80">{tag.body}</p>
    </div>
  );
}
