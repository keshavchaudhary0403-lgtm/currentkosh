"use client";

import { Check, X } from "lucide-react";
import type { McqContent } from "@/lib/content";
import type { Lang } from "@/lib/taxonomy";

const LETTERS = ["A", "B", "C", "D"];

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
  return (
    <div>
      <Text en={mcq.question.en} hi={mcq.question.hi} lang={lang} className="text-[15px] leading-relaxed font-medium sm:text-base" />
      <div className="mt-4 grid gap-2">
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
              className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition ${
                state === "right"
                  ? "border-good bg-good/10"
                  : state === "wrong"
                    ? "border-bad bg-bad/10"
                    : state === "picked"
                      ? "border-accent bg-accent-soft"
                      : "border-line bg-surface hover:border-line-strong disabled:hover:border-line"
              }`}
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                  state === "right" ? "bg-good text-white" : state === "wrong" ? "bg-bad text-white" : state === "picked" ? "bg-accent text-white" : "bg-surface-2 text-ink-2"
                }`}
              >
                {state === "right" ? <Check className="size-3.5" strokeWidth={3} /> : state === "wrong" ? <X className="size-3.5" strokeWidth={3} /> : LETTERS[i]}
              </span>
              <Text en={opt} hi={mcq.options.hi[i] ?? opt} lang={lang} className="pt-0.5" />
            </button>
          );
        })}
      </div>
      {reveal && (
        <div className="mt-4 rounded-xl bg-surface-2 p-4 text-sm leading-relaxed">
          <div className="mb-1 text-xs font-semibold tracking-wider text-ink-3 uppercase">
            {selected === mcq.answer ? "✓ Correct" : selected === null ? "Skipped" : "✗ Not quite"}
            {number !== undefined && ` · Q${number}`}
          </div>
          <Text en={mcq.explanation.en} hi={mcq.explanation.hi} lang={lang} className="text-ink-2" />
        </div>
      )}
    </div>
  );
}
