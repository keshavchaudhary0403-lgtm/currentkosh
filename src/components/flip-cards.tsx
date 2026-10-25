"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCw } from "lucide-react";
import type { Bi, Lang } from "@/lib/taxonomy";
import { BiText, cx } from "./ui";

/** One card at a time: tap to flip and see the answer, then move to the next card. */
export function FlipCards({ cards, lang }: { cards: { front: Bi; back: Bi }[]; lang: Lang }) {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const hi = lang === "hi";
  const c = cards[i];
  const go = (to: number) => {
    setI((to + cards.length) % cards.length);
    setShown(false);
  };
  if (!c) return null;
  return (
    <div className="mx-auto max-w-2xl">
      <button key={i} onClick={() => setShown((s) => !s)} aria-pressed={shown} className="flip rise group block w-full text-left">
        <div className={cx("flip-inner grid min-h-[200px]", shown && "flipped")}>
          <div className="flip-face card flex flex-col p-6 transition group-hover:shadow-card [grid-area:1/1]">
            <span className="eyebrow mb-3 text-ink-3">{hi ? "प्रश्न" : "Prompt"}</span>
            <BiText v={c.front} lang={lang} as="p" className="text-[17px] leading-snug font-semibold" hiClassName="text-sm" />
            <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-medium text-ink-3">
              <RotateCw className="size-3.5 transition group-hover:rotate-90" /> {hi ? "उत्तर देखने के लिए टैप करें" : "Tap to flip"}
            </span>
          </div>
          <div className="flip-face flip-back static! flex flex-col rounded-[24px] bg-cobalt p-6 text-white [grid-area:1/1]">
            <span className="eyebrow mb-3 text-white/70">{hi ? "उत्तर" : "Answer"}</span>
            <BiText v={c.back} lang={lang} as="p" className="font-display text-[19px] leading-snug" hiClassName="font-sans text-sm text-white/80" />
          </div>
        </div>
      </button>
      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => go(i - 1)} disabled={cards.length < 2} className="btn btn-ghost h-11 px-4 text-sm" aria-label={hi ? "पिछला कार्ड" : "Previous card"}>
          <ArrowLeft className="size-4" />
        </button>
        <span className="flex-1 text-center font-mono text-sm text-ink-3 tnum">
          {i + 1} / {cards.length}
        </span>
        {shown ? (
          <button onClick={() => go(i + 1)} disabled={cards.length < 2} className="btn h-11 px-5 text-sm">
            {hi ? "अगला कार्ड" : "Next card"} <ArrowRight className="size-4" />
          </button>
        ) : (
          <button onClick={() => setShown(true)} className="btn btn-cobalt h-11 px-5 text-sm">
            {hi ? "उत्तर देखें" : "Show answer"}
          </button>
        )}
      </div>
    </div>
  );
}
