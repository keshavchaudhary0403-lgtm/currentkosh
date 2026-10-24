"use client";

import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Bookmark, BookmarkCheck, Check, Target } from "lucide-react";
import type { McqContent } from "@/lib/content";
import { answerQuestion, markRead, toggleBookmark, useProgress } from "@/lib/progress-store";
import type { Lang } from "@/lib/taxonomy";
import { McqView } from "./mcq";
import { Confetti, cx } from "./ui";

/**
 * "Read" and "Next", side by side. Read is lime until tapped, then turns green with a burst
 * (the story's facts go into Revise). Next is disabled on the day's last story.
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
    <span className={`flex min-w-0 items-center gap-1.5 ${className}`}>
      <button
        onClick={() => {
          if (read) return;
          setCelebrate(true);
          markRead(storyId, cardIds);
        }}
        aria-pressed={read}
        title={read ? labels.doneHint : undefined}
        className={cx("btn h-11 flex-1 px-4 text-[15px] lg:flex-none lg:px-6", read && "btn-good", celebrate && "pop")}
      >
        {celebrate && <Confetti />}
        {read && <Check className="size-4" strokeWidth={3} />}
        {labels.mark}
      </button>
      {nextHref === undefined ? null : nextHref ? (
        <Link href={nextHref} className="btn btn-ink h-11 flex-1 px-4 text-[15px] lg:flex-none lg:px-6">
          {labels.next} <ArrowRight className="size-4" />
        </Link>
      ) : (
        <button disabled className="btn h-11 flex-1 px-4 text-[15px] lg:flex-none">
          {labels.next}
        </button>
      )}
    </span>
  );
}

/** Jump to the story's quiz. */
export function QuizButton({ label }: { storyId?: string; label: string }) {
  return (
    <a href="#quick-check" aria-label={label} title={label} className="btn btn-flare size-11 shrink-0 px-0 lg:w-auto lg:px-4">
      <Target className="size-[18px]" strokeWidth={2} />
      <span className="hidden lg:inline">{label}</span>
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
        aria-pressed={saved}
        className={cx("btn h-11 min-w-11 shrink-0 px-0 text-[15px] lg:px-4", saved ? "btn-cobalt pop" : "btn-ghost")}
      >
        <Icon className="size-[18px]" strokeWidth={2} />
        {label && <span className="hidden lg:inline">{label}</span>}
      </button>
      {toast > 0 &&
        createPortal(
        <div role="status" className="popover fixed inset-x-4 top-20 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-full bg-[#10110e] py-2 pr-2 pl-4 text-sm font-semibold text-[#f3f2ec] shadow-float">
          <BookmarkCheck className="size-5 shrink-0 text-[#c8f135]" />
          Saved for revision
          <Link href="/saved" className="ml-auto inline-flex h-9 items-center rounded-full bg-[#c8f135] px-3.5 text-[#10110e]">
            View
          </Link>
        </div>,
          document.body,
        )}
    </>
  );
}

export function QuickCheck({ mcqs, category, lang }: { mcqs: { id: string; content: McqContent }[]; category: string; lang: Lang }) {
  const [picked, setPicked] = useState<(number | null)[]>(mcqs.map(() => null));
  const done = picked.every((x) => x !== null);
  const right = picked.filter((x, i) => x === mcqs[i].content.answer).length;
  return (
    <div className="space-y-4">
      {mcqs.map((m, i) => (
        <div key={m.id} className="card reveal p-4 sm:p-6">
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
      {done && (
        <p className={cx("pop flex items-center gap-3 rounded-[20px] px-4 py-3.5 text-sm font-semibold", right === mcqs.length ? "bg-good-soft text-good-ink" : "bg-card-2 text-ink-2")}>
          <span className="font-display text-[28px] leading-none text-ink tnum">
            {right}/{mcqs.length}
          </span>
          {lang === "hi" ? "सही। छूटे प्रश्न दोहराव में जुड़ गए हैं।" : "correct. Missed questions are added to Revise."}
        </p>
      )}
    </div>
  );
}
