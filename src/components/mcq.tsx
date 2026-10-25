"use client";

import { Check, X } from "lucide-react";
import type { McqContent } from "@/lib/content";
import type { Lang } from "@/lib/taxonomy";
import { cx } from "./ui";

const LETTERS = ["A", "B", "C", "D"];
const PRAISE = ["Correct!", "Spot on!", "Nailed it!", "Great recall!"];
const PRAISE_HI = ["सही!", "बिल्कुल सही!", "शाबाश!", "बढ़िया याद!"];

function Text({ en, hi, lang, className }: { en: string; hi: string; lang: Lang; className?: string }) {
  const lines = (s: string) =>
    s.split("\n").map((l, i) => (
      <span key={i} className="block">
        {l}
      </span>
    ));
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
 * One MCQ. Pass `selected` + `reveal` to show the result, or leave `reveal` false during a
 * timed test so nothing is given away. Correct answers fill green with a burst; wrong ones shake.
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
  const hi = lang === "hi";
  return (
    <div>
      {number !== undefined && <div className="eyebrow mb-2 text-ink-3">Q{String(number).padStart(2, "0")}</div>}
      <Text en={mcq.question.en} hi={mcq.question.hi} lang={lang} className="text-[17px] leading-relaxed font-semibold tracking-[-0.005em] sm:text-lg" />
      <div className="mt-5 grid gap-2.5" role="radiogroup">
        {mcq.options.en.map((opt, i) => {
          const isAnswer = i === mcq.answer;
          const isPicked = i === selected;
          const state = reveal ? (isAnswer ? "right" : isPicked ? "wrong" : "idle") : isPicked ? "picked" : "idle";
          const locked = reveal || !onSelect;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isPicked}
              disabled={locked}
              onClick={() => onSelect?.(i)}
              className={cx(
                "group relative flex min-h-14 items-start gap-3 rounded-[18px] px-3.5 py-3 text-left text-[15px] font-medium transition duration-200",
                state === "right" && "burst pop bg-good text-white shadow-[0_10px_30px_-12px_var(--good)]",
                state === "wrong" && "shake bg-bad-soft text-ink shadow-[inset_0_0_0_2px_var(--bad)]",
                state === "picked" && "bg-solid text-on-solid",
                state === "idle" && (locked ? "bg-card-2 text-ink-2 opacity-60" : "bg-card-2 shadow-[inset_0_0_0_1px_var(--line)] hover:-translate-y-px hover:bg-card hover:shadow-[inset_0_0_0_1.5px_var(--ink)] active:scale-[.98]"),
              )}
            >
              <span
                className={cx(
                  "grid size-8 shrink-0 place-items-center rounded-full font-mono text-xs font-semibold transition",
                  state === "right" && "bg-white text-good-ink",
                  state === "wrong" && "bg-bad text-white",
                  state === "picked" && "bg-solid-accent text-solid",
                  state === "idle" && "bg-card text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] group-hover:bg-ink group-hover:text-bg",
                )}
              >
                {state === "right" ? <Check className="size-4" strokeWidth={3.5} /> : state === "wrong" ? <X className="size-4" strokeWidth={3.5} /> : LETTERS[i]}
              </span>
              <Text en={opt} hi={mcq.options.hi[i] ?? opt} lang={lang} className={cx("pt-1", state === "right" && "[&_div]:text-white/80", state === "picked" && "[&_div]:text-on-solid/70")} />
            </button>
          );
        })}
      </div>
      {reveal && (
        <div className={cx("rise mt-4 rounded-[18px] p-4 text-sm leading-relaxed", selected === null ? "bg-card-2" : right ? "bg-good-soft" : "bg-bad-soft")}>
          <div className={cx("mb-1.5 flex items-center gap-2 font-display text-[17px]", selected === null ? "text-ink-2" : right ? "text-good-ink" : "text-bad-ink")}>
            {hi
              ? selected === null
                ? "छोड़ा"
                : right
                  ? PRAISE_HI[(number ?? mcq.answer) % PRAISE_HI.length]
                  : "सही नहीं। कारण:"
              : selected === null
                ? "Skipped"
                : right
                  ? PRAISE[(number ?? mcq.answer) % PRAISE.length]
                  : "Not quite. Here's why:"}
          </div>
          <Text en={mcq.explanation.en} hi={mcq.explanation.hi} lang={lang} className="text-ink" />
        </div>
      )}
    </div>
  );
}
