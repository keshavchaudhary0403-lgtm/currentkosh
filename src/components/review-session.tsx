"use client";

import Link from "next/link";
import { useState } from "react";
import { PartyPopper, RotateCw } from "lucide-react";
import { gradeReview } from "@/lib/progress-store";
import type { CardContent, McqContent } from "@/lib/content";
import type { Grade } from "@/lib/srs";
import type { Lang } from "@/lib/taxonomy";
import { BiText } from "./ui";
import { McqView } from "./mcq";

export type SessionItem =
  | { type: "card"; id: string; storyId: string; category: string; content: CardContent }
  | { type: "mcq"; id: string; storyId: string; category: string; content: McqContent };

const GRADES: { g: Grade; label: string; hint: string; cls: string }[] = [
  { g: "again", label: "Again", hint: "tomorrow", cls: "border-bad/40 text-bad hover:bg-bad/10" },
  { g: "hard", label: "Hard", hint: "soon", cls: "border-warn/40 text-warn hover:bg-warn/10" },
  { g: "good", label: "Good", hint: "later", cls: "border-good/40 text-good hover:bg-good/10" },
  { g: "easy", label: "Easy", hint: "much later", cls: "border-accent/40 text-accent hover:bg-accent-soft" },
];

export function ReviewSession({ items, lang }: { items: SessionItem[]; lang: Lang }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [tally, setTally] = useState({ good: 0, again: 0 });

  const item = items[i];
  const next = (grade: Grade, mcqCorrect?: boolean) => {
    gradeReview(item.type, item.id, grade, mcqCorrect === undefined ? undefined : { category: item.category, correct: mcqCorrect });
    setTally((t) => (grade === "again" ? { ...t, again: t.again + 1 } : { ...t, good: t.good + 1 }));
    setFlipped(false);
    setPicked(null);
    setI((x) => x + 1);
  };

  if (!item) {
    return (
      <div className="rise mx-auto max-w-md rounded-xl border border-line bg-surface p-8 text-center">
        <PartyPopper className="mx-auto mb-3 size-10 text-accent-2" />
        <h2 className="font-display text-3xl">Session complete</h2>
        <p className="mt-2 text-ink-2">
          {tally.good} remembered · {tally.again} coming back tomorrow
        </p>
        <Link href="/revise" className="mt-6 inline-block rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-bg">
          Back to Revise
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between text-sm text-ink-3">
        <span>
          {i + 1} / {items.length}
        </span>
        <span>{item.type === "card" ? "Flashcard" : "Question you missed"}</span>
      </div>
      <div className="mb-6 h-1 overflow-hidden rounded-full bg-line-strong">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(i / items.length) * 100}%` }} />
      </div>

      {item.type === "card" ? (
        <div key={`c${item.id}`} className="rise">
          <button
            onClick={() => setFlipped(true)}
            className="flex min-h-64 w-full flex-col items-center justify-center rounded-xl border border-line bg-surface p-8 text-center"
          >
            <BiText v={item.content.front} lang={lang} as="div" className="font-display text-2xl leading-snug" hiClassName="font-sans text-lg mt-3" />
            {flipped ? (
              <div className="mt-6 w-full border-t border-line pt-6">
                <BiText v={item.content.back} lang={lang} as="div" className="text-xl font-semibold text-accent" hiClassName="text-base font-medium" />
              </div>
            ) : (
              <span className="mt-6 inline-flex items-center gap-2 text-sm text-ink-3">
                <RotateCw className="size-4" /> Tap to reveal
              </span>
            )}
          </button>
          {flipped && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {GRADES.map((g) => (
                <button key={g.g} onClick={() => next(g.g)} className={`rounded-xl border bg-surface py-3 text-sm font-semibold transition ${g.cls}`}>
                  {g.label}
                  <span className="block text-[11px] font-normal opacity-70">{g.hint}</span>
                </button>
              ))}
            </div>
          )}
          <Link href={`/story/${item.storyId}`} className="mt-4 inline-block text-sm text-ink-3 hover:text-accent">
            Open the story →
          </Link>
        </div>
      ) : (
        <div key={`m${item.id}`} className="rise rounded-xl border border-line bg-surface p-5 sm:p-7">
          <McqView mcq={item.content} lang={lang} selected={picked} reveal={picked !== null} onSelect={setPicked} />
          {picked !== null && (
            <button
              onClick={() => next(picked === item.content.answer ? "good" : "again", picked === item.content.answer)}
              className="mt-4 w-full rounded-xl bg-ink py-3 text-sm font-semibold text-bg"
            >
              Continue
            </button>
          )}
        </div>
      )}
    </div>
  );
}
