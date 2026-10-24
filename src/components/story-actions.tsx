"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, BookmarkCheck, Target } from "lucide-react";
import type { McqContent } from "@/lib/content";
import { answerQuestion, markRead, toggleBookmark, useProgress } from "@/lib/progress-store";
import type { Lang } from "@/lib/taxonomy";
import { McqView } from "./mcq";
import { Confetti } from "./ui";

/**
 * "Read" and "Next", always side by side. Read is indigo until tapped, then green
 * (the story's facts go into Revise). Next is greyed out on the day's last story.
 */
export function ReadButton({
  storyId,
  cardIds,
  labels,
  nextHref,
  className = "",
}: {
  storyId: string;
  cardIds: string[];
  labels: { mark: string; next: string; doneHint: string };
  nextHref?: string | null;
  className?: string;
}) {
  const read = !!useProgress().reads[storyId];
  const [celebrate, setCelebrate] = useState(false);
  return (
    <span className={`flex min-w-0 items-center gap-2 ${className}`}>
      <button
        onClick={() => {
          if (read) return;
          setCelebrate(true);
          markRead(storyId, cardIds);
        }}
        aria-pressed={read}
        title={read ? labels.doneHint : undefined}
        className={`btn relative h-10 flex-1 px-4 text-[15px] lg:flex-none ${read ? "btn-green" : ""} ${celebrate ? "pop" : ""}`}
      >
        {celebrate && <Confetti />}
        {labels.mark}
      </button>
      {nextHref ? (
        <Link href={nextHref} className="btn btn-ghost h-10 flex-1 px-4 text-[15px] lg:flex-none">
          {labels.next}
        </Link>
      ) : (
        <button disabled className="btn h-10 flex-1 px-4 text-[15px] lg:flex-none">
          {labels.next}
        </button>
      )}
    </span>
  );
}

/** Jump to the story's quiz. */
export function QuizButton({ label }: { storyId?: string; label: string }) {
  return (
    <a href="#quick-check" aria-label={label} className="btn h-10 shrink-0 px-3 text-[15px] [--b:var(--accent-2-soft)] [--bt:var(--accent-2)]">
      <Target className="size-4" strokeWidth={2} />
      <span>{label}</span>
    </a>
  );
}

export function BookmarkButton({ storyId, label }: { storyId: string; label?: string }) {
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
        className={`btn h-10 min-w-10 shrink-0 px-2.5 text-[15px] ${saved ? "pop border border-accent bg-accent-soft [--b:var(--accent-soft)] [--bt:var(--accent)]" : "btn-ghost"}`}
      >
        <Icon className="size-[18px]" strokeWidth={2} />
        {label && <span className="hidden pr-1 lg:inline">{label}</span>}
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
