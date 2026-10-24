"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import type { Bi, Lang } from "@/lib/taxonomy";
import { BiText, cx } from "./ui";

/** Tap a card to flip it over and see its answer. */
export function FlipCards({ cards, lang }: { cards: { front: Bi; back: Bi }[]; lang: Lang }) {
  const [open, setOpen] = useState<number[]>([]);
  const hi = lang === "hi";
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((c, i) => {
        const shown = open.includes(i);
        return (
          <button
            key={i}
            onClick={() => setOpen((xs) => (shown ? xs.filter((x) => x !== i) : [...xs, i]))}
            aria-pressed={shown}
            className="flip group block text-left"
          >
            <div className={cx("flip-inner grid min-h-[168px]", shown && "flipped")}>
              <div className="flip-face card flex flex-col p-5 transition group-hover:shadow-card [grid-area:1/1]">
                <BiText v={c.front} lang={lang} as="p" className="text-[15px] leading-snug font-semibold" hiClassName="text-sm" />
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs font-medium text-ink-3">
                  <RotateCw className="size-3.5 transition group-hover:rotate-90" /> {hi ? "उत्तर देखने के लिए टैप करें" : "Tap to flip"}
                </span>
              </div>
              <div className="flip-face flip-back static! flex flex-col rounded-[24px] bg-cobalt p-5 text-white [grid-area:1/1]">
                <span className="eyebrow mb-2 text-white/70">{hi ? "उत्तर" : "Answer"}</span>
                <BiText v={c.back} lang={lang} as="p" className="font-display text-[22px] leading-snug" hiClassName="font-sans text-sm text-white/80" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
