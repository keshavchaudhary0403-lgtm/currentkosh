"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, BookmarkCheck, Check, CheckCircle2 } from "lucide-react";
import type { McqContent } from "@/lib/content";
import { markRead, toggleBookmark, useProgress } from "@/lib/progress-store";
import type { Lang } from "@/lib/taxonomy";
import { McqView } from "./mcq";
import { Confetti } from "./ui";

export function ReadButton({ storyId, cardIds, labels }: { storyId: string; cardIds: string[]; labels: { mark: string; done: string } }) {
  const read = !!useProgress().reads[storyId];
  const [celebrate, setCelebrate] = useState(false);
  if (read)
    return (
      <span className="pop relative inline-flex items-center gap-2 rounded-[14px] bg-good-soft px-4 py-2.5 text-sm font-extrabold whitespace-nowrap text-good">
        {celebrate && <Confetti />}
        <CheckCircle2 className="size-5" strokeWidth={2.6} /> {labels.done}
      </span>
    );
  return (
    <button
      onClick={() => {
        setCelebrate(true);
        markRead(storyId, cardIds);
      }}
      className="btn btn-green px-4 py-2.5 text-sm"
    >
      <Check className="size-5" strokeWidth={3} /> {labels.mark}
    </button>
  );
}

export function BookmarkButton({ storyId }: { storyId: string }) {
  const saved = useProgress().bookmarks.includes(storyId);
  const [toast, setToast] = useState(0);
  const Icon = saved ? BookmarkCheck : Bookmark;
  return (
    <>
      <button
        onClick={() => {
          toggleBookmark(storyId);
          if (!saved) {
            const id = Date.now();
            setToast(id);
            setTimeout(() => setToast((t) => (t === id ? 0 : t)), 3500);
          } else setToast(0);
        }}
        aria-label={saved ? "Remove from saved" : "Save for later"}
        className={`btn size-11 ${saved ? "btn-violet pop" : "btn-ghost"}`}
      >
        <Icon className="size-5" strokeWidth={2.4} />
      </button>
      {toast > 0 && (
        <div className="rise fixed inset-x-4 top-16 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-bg shadow-xl">
          <BookmarkCheck className="size-5 shrink-0 text-violet" />
          Saved for revision
          <Link href="/saved" className="ml-auto font-extrabold text-violet">
            View saved →
          </Link>
        </div>
      )}
    </>
  );
}

export function QuickCheck({ mcqs, lang }: { mcqs: McqContent[]; lang: Lang }) {
  const [picked, setPicked] = useState<(number | null)[]>(mcqs.map(() => null));
  return (
    <div className="space-y-6">
      {mcqs.map((m, i) => (
        <div key={i} className="rounded-3xl border-2 border-line bg-surface p-4 sm:p-5">
          <McqView mcq={m} lang={lang} selected={picked[i]} reveal={picked[i] !== null} onSelect={(a) => setPicked((p) => p.map((x, j) => (j === i ? a : x)))} number={i + 1} />
        </div>
      ))}
    </div>
  );
}
