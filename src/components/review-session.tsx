"use client";

import Link from "next/link";
import { useState } from "react";
import { Layers, PartyPopper, RotateCw, X } from "lucide-react";
import { gradeReview } from "@/lib/progress-store";
import type { CardContent, McqContent } from "@/lib/content";
import type { Grade } from "@/lib/srs";
import type { Lang } from "@/lib/taxonomy";
import { Bar, BiText, Confetti } from "./ui";
import { McqView } from "./mcq";

export type SessionItem =
  | { type: "card"; id: string; storyId: string; category: string; content: CardContent }
  | { type: "mcq"; id: string; storyId: string; category: string; content: McqContent };

const GRADES: { g: Grade; label: string; hint: string; cls: string }[] = [
  { g: "again", label: "Again", hint: "tomorrow", cls: "btn-red" },
  { g: "hard", label: "Hard", hint: "soon", cls: "btn-orange" },
  { g: "good", label: "Good", hint: "later", cls: "btn-green" },
  { g: "easy", label: "Easy", hint: "much later", cls: "" },
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
      <div className="pop relative mx-auto max-w-md overflow-hidden rounded-3xl bg-violet p-8 text-center text-white">
        <Confetti pieces={44} />
        <PartyPopper className="mx-auto mb-3 size-12" strokeWidth={2} />
        <h2 className="font-display text-3xl">Session complete!</h2>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/15 p-3">
            <div className="font-display text-3xl">{tally.good}</div>
            <div className="text-xs font-bold text-white/80">remembered</div>
          </div>
          <div className="rounded-2xl bg-white/15 p-3">
            <div className="font-display text-3xl">{tally.again}</div>
            <div className="text-xs font-bold text-white/80">back tomorrow</div>
          </div>
        </div>
        <Link href="/revise" className="btn btn-white mt-6 w-full py-3 text-sm [--bt:var(--violet)]">
          Back to Revise
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/revise" className="grid size-10 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink" aria-label="End session">
          <X className="size-6" strokeWidth={2.6} />
        </Link>
        <Bar value={i} max={items.length} color="bg-violet" className="h-4 flex-1" />
        <span className="text-sm font-extrabold text-ink-2 tabular-nums">
          {i + 1}/{items.length}
        </span>
      </div>
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-violet-soft px-3 py-1 text-xs font-extrabold text-violet">
        {item.type === "card" ? <Layers className="size-3.5" /> : <RotateCw className="size-3.5" />}
        {item.type === "card" ? "Flashcard" : "Question you missed"}
      </div>

      {item.type === "card" ? (
        <div key={`c${item.id}`} className="rise">
          <button onClick={() => setFlipped((f) => !f)} className="flip block w-full text-center" aria-label={flipped ? "Show question" : "Reveal answer"}>
            <div className={`flip-inner min-h-72 ${flipped ? "flipped" : ""}`}>
              <div className="flip-face flex min-h-72 flex-col items-center justify-center rounded-3xl border-2 border-line bg-surface p-7 shadow-[0_5px_0_0_var(--line)]">
                <BiText v={item.content.front} lang={lang} as="div" className="font-display text-2xl leading-snug" hiClassName="font-sans text-lg mt-3" />
                <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-violet-soft px-3 py-1.5 text-sm font-bold text-violet">
                  <RotateCw className="size-4" /> Tap to flip
                </span>
              </div>
              <div className="flip-face flip-back flex flex-col items-center justify-center rounded-3xl bg-violet p-7 text-white shadow-[0_5px_0_0_var(--violet-press)]">
                <div className="mb-3 text-xs font-extrabold tracking-widest text-white/70 uppercase">Answer</div>
                <BiText v={item.content.back} lang={lang} as="div" className="font-display text-2xl leading-snug" hiClassName="font-sans text-lg font-semibold text-white/85" />
              </div>
            </div>
          </button>
          {flipped ? (
            <div className="rise mt-5">
              <div className="mb-2 text-center text-sm font-bold text-ink-2">How well did you remember?</div>
              <div className="grid grid-cols-4 gap-2">
                {GRADES.map((g) => (
                  <button key={g.g} onClick={() => next(g.g)} className={`btn flex-col gap-0 py-2.5 text-sm ${g.cls}`}>
                    {g.label}
                    <span className="text-[11px] font-semibold opacity-80">{g.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button onClick={() => setFlipped(true)} className="btn btn-violet mt-5 w-full py-3.5 text-[15px]">
              Show answer
            </button>
          )}
          <Link href={`/story/${item.storyId}`} className="mt-4 inline-block text-sm font-bold text-ink-3 hover:text-violet">
            Open the story →
          </Link>
        </div>
      ) : (
        <div key={`m${item.id}`} className="rise rounded-3xl border-2 border-line bg-surface p-4 sm:p-6">
          <McqView mcq={item.content} lang={lang} selected={picked} reveal={picked !== null} onSelect={setPicked} />
          {picked !== null && (
            <button
              onClick={() => next(picked === item.content.answer ? "good" : "again", picked === item.content.answer)}
              className={`btn mt-4 w-full py-3.5 text-[15px] ${picked === item.content.answer ? "btn-green" : "btn-red"}`}
            >
              Continue
            </button>
          )}
        </div>
      )}
    </div>
  );
}
