"use client";

import { Check, X } from "lucide-react";
import type { McqContent } from "@/lib/content";
import type { Lang } from "@/lib/taxonomy";

const LETTERS = ["A", "B", "C", "D"];
const PRAISE = ["Correct! 🎯", "Spot on! ✨", "Nailed it! 💪", "Great recall! 🧠"];

function Text({ en, hi, lang, className }: { en: string; hi: string; lang: Lang; className?: string }) {
  const lines = (s: string) => s.split("\n").map((l, i) => <span key={i} className="block">{l}</span>);
  if (lang === "bi")
    return (
      <div className={className}>
        {lines(en)}
        <div lang="hi" className="mt-2 text-ink-2">
          {lines(hi)}
        </div>
      </div>
    );
  return (
    <div lang={lang === "hi" ? "hi" : undefined} className={className}>
      {lines(lang === "hi" ? hi || en : en)}
    </div>
  );
}

/**
 * One MCQ. Uncontrolled reveal: pass `selected` + `reveal` to show the result,
 * or leave `reveal` false during a timed test so nothing is given away.
 */
export function McqView({
  mcq,
  lang,
  selected,
  reveal,
  onSelect,
  number,
}: {
  mcq: McqContent;
  lang: Lang;
  selected: number | null;
  reveal: boolean;
  onSelect?: (i: number) => void;
  number?: number;
}) {
  const right = selected === mcq.answer;
  return (
    <div>
      <Text en={mcq.question.en} hi={mcq.question.hi} lang={lang} className="text-base leading-relaxed font-semibold sm:text-[17px]" />
      <div className="mt-4 grid gap-2.5">
        {mcq.options.en.map((opt, i) => {
          const isAnswer = i === mcq.answer;
          const isPicked = i === selected;
          const state = reveal ? (isAnswer ? "right" : isPicked ? "wrong" : "idle") : isPicked ? "picked" : "idle";
          return (
            <button
              key={i}
              type="button"
              disabled={reveal || !onSelect}
              onClick={() => onSelect?.(i)}
              className={`flex items-start gap-3 rounded-2xl border-2 px-3.5 py-3 text-left text-[15px] font-medium transition ${
                state === "right"
                  ? "pop border-good bg-good-soft"
                  : state === "wrong"
                    ? "shake border-bad bg-bad-soft"
                    : state === "picked"
                      ? "border-accent bg-accent-soft"
                      : reveal || !onSelect
                        ? "border-line bg-surface opacity-70"
                        : "border-line bg-surface hover:border-line-strong active:scale-[.98]"
              }`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 text-xs font-extrabold ${
                  state === "right"
                    ? "border-good bg-good text-white"
                    : state === "wrong"
                      ? "border-bad bg-bad text-white"
                      : state === "picked"
                        ? "border-accent bg-accent text-white"
                        : "border-line-strong text-ink-3"
                }`}
              >
                {state === "right" ? <Check className="size-4" strokeWidth={3.5} /> : state === "wrong" ? <X className="size-4" strokeWidth={3.5} /> : LETTERS[i]}
              </span>
              <Text en={opt} hi={mcq.options.hi[i] ?? opt} lang={lang} className="pt-0.5" />
            </button>
          );
        })}
      </div>
      {reveal && (
        <div className={`rise mt-4 rounded-2xl p-4 text-sm leading-relaxed ${selected === null ? "bg-surface-2" : right ? "bg-good-soft" : "bg-bad-soft"}`}>
          <div className={`mb-1.5 flex items-center gap-2 font-display text-base ${selected === null ? "text-ink-2" : right ? "text-good" : "text-bad"}`}>
            {selected === null ? "Skipped" : right ? PRAISE[(number ?? mcq.answer) % PRAISE.length] : "Not quite. Here's why:"}
            {number !== undefined && <span className="text-xs font-bold text-ink-3">Q{number}</span>}
          </div>
          <Text en={mcq.explanation.en} hi={mcq.explanation.hi} lang={lang} className="text-ink" />
        </div>
      )}
    </div>
  );
}
