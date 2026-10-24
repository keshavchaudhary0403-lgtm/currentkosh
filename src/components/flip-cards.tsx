"use client";

import { useState } from "react";
import type { Bi, Lang } from "@/lib/taxonomy";
import { BiText, cx } from "./ui";

/** Tap a card to see its answer. */
export function FlipCards({ cards, lang }: { cards: { front: Bi; back: Bi }[]; lang: Lang }) {
  const [open, setOpen] = useState<number[]>([]);
  const hi = lang === "hi";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((c, i) => {
        const shown = open.includes(i);
        return (
          <button
            key={i}
            onClick={() => setOpen((xs) => (shown ? xs.filter((x) => x !== i) : [...xs, i]))}
            className={cx(
              "rounded-2xl border p-4 text-left transition active:scale-[0.99]",
              shown ? "border-violet/40 bg-violet-soft" : "border-line bg-surface hover:border-line-strong",
            )}
          >
            <BiText v={c.front} lang={lang} as="p" className="text-[15px] leading-snug font-semibold" hiClassName="text-sm" />
            {shown ? (
              <BiText v={c.back} lang={lang} as="p" className="mt-2 text-[15px] leading-snug font-bold text-violet" hiClassName="text-sm" />
            ) : (
              <p className="mt-2 text-xs font-semibold text-ink-3">{hi ? "उत्तर देखने के लिए टैप करें" : "Tap to see the answer"}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}
