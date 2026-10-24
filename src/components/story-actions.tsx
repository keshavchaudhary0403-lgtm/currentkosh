"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Bookmark, BookmarkCheck, Check, CheckCircle2 } from "lucide-react";
import type { McqContent } from "@/lib/content";
import { answerQuestion, markRead, toggleBookmark, useProgress } from "@/lib/progress-store";
import type { Lang } from "@/lib/taxonomy";
import { McqView } from "./mcq";
import { Confetti } from "./ui";

/** Mark as read; once read, it becomes the way on to the next story of the day. */
export function ReadButton({
  storyId,
  cardIds,
  labels,
  nextHref,
  className = "",
}: {
  storyId: string;
  cardIds: string[];
  labels: { mark: string; done: string; next?: string };
  nextHref?: string | null;
  className?: string;
}) {
  const read = !!useProgress().reads[storyId];
  const [celebrate, setCelebrate] = useState(false);
  if (read && nextHref)
    return (
      <Link href={nextHref} className={`btn relative px-4 py-2.5 text-sm ${celebrate ? "pop" : ""} ${className}`}>
        {celebrate && <Confetti />}
        <CheckCircle2 className="size-5 text-white/80" strokeWidth={2.6} /> {labels.next ?? "Next story"} <ArrowRight className="size-4" strokeWidth={2.6} />
      </Link>
    );
  if (read)
    return (
      <span className={`pop relative inline-flex items-center justify-center gap-2 rounded-[14px] bg-good-soft px-4 py-2.5 text-sm font-extrabold whitespace-nowrap text-good ${className}`}>
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
      className={`btn btn-green px-4 py-2.5 text-sm ${className}`}
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

export function QuickCheck({ mcqs, category, lang }: { mcqs: { id: string; content: McqContent }[]; category: string; lang: Lang }) {
  const [picked, setPicked] = useState<(number | null)[]>(mcqs.map(() => null));
  return (
    <div className="space-y-6">
      {mcqs.map((m, i) => (
        <div key={m.id} className="rounded-3xl border border-line bg-surface p-4 sm:p-5">
          <McqView
            mcq={m.content}
            lang={lang}
            selected={picked[i]}
            reveal={picked[i] !== null}
            onSelect={(a) => {
              setPicked((p) => p.map((x, j) => (j === i ? a : x)));
              answerQuestion(m.id, category, a === m.content.answer);
            }}
            number={i + 1}
          />
        </div>
      ))}
      {picked.every((x) => x !== null) && (
        <p className="rise rounded-2xl bg-surface-2 px-4 py-3 text-sm font-semibold text-ink-2">
          {picked.filter((x, i) => x === mcqs[i].content.answer).length}/{mcqs.length} correct. Missed questions are added to Revise.
        </p>
      )}
    </div>
  );
}
