"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, CheckCircle2, Circle } from "lucide-react";
import type { McqContent } from "@/lib/content";
import { markRead, toggleBookmark, useProgress } from "@/lib/progress-store";
import type { Lang } from "@/lib/taxonomy";
import { McqView } from "./mcq";

export function ReadButton({ storyId, cardIds, labels }: { storyId: string; cardIds: string[]; labels: { mark: string; done: string } }) {
  const read = !!useProgress().reads[storyId];
  if (read)
    return (
      <span className="inline-flex items-center gap-2 rounded-xl bg-good/10 px-4 py-2.5 text-sm font-semibold text-good">
        <CheckCircle2 className="size-4" /> {labels.done}
      </span>
    );
  return (
    <button
      onClick={() => markRead(storyId, cardIds)}
      className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90 active:scale-[.98]"
    >
      <Circle className="size-4" /> {labels.mark}
    </button>
  );
}

export function BookmarkButton({ storyId }: { storyId: string }) {
  const saved = useProgress().bookmarks.includes(storyId);
  const Icon = saved ? BookmarkCheck : Bookmark;
  return (
    <button
      onClick={() => toggleBookmark(storyId)}
      aria-label={saved ? "Remove bookmark" : "Save for later"}
      className={`grid size-10 place-items-center rounded-xl border transition ${saved ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink-2 hover:text-ink"}`}
    >
      <Icon className="size-4" />
    </button>
  );
}

export function QuickCheck({ mcqs, lang }: { mcqs: McqContent[]; lang: Lang }) {
  const [picked, setPicked] = useState<(number | null)[]>(mcqs.map(() => null));
  return (
    <div className="space-y-6">
      {mcqs.map((m, i) => (
        <div key={i} className="rounded-xl border border-line bg-surface p-4 sm:p-5">
          <McqView mcq={m} lang={lang} selected={picked[i]} reveal={picked[i] !== null} onSelect={(a) => setPicked((p) => p.map((x, j) => (j === i ? a : x)))} number={i + 1} />
        </div>
      ))}
    </div>
  );
}
