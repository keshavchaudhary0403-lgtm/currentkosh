"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { McqContent } from "@/lib/content";
import type { Lang } from "@/lib/taxonomy";
import { McqView } from "./mcq";

type Item = { id: string; storyId: string; content: McqContent; selected: number | null };

export function McqReview({ items, lang }: { items: Item[]; lang: Lang }) {
  const [filter, setFilter] = useState<"all" | "wrong">("wrong");
  const shown = items.map((it, i) => ({ ...it, n: i + 1 })).filter((it) => filter === "all" || it.selected !== it.content.answer);
  const missed = items.filter((it) => it.selected !== it.content.answer).length;
  return (
    <div>
      <div className="mb-4 flex gap-2" role="tablist">
        {(["wrong", "all"] as const).map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className="chip" data-on={filter === f}>
            {f === "wrong" ? (lang === "hi" ? "छूटे" : "Missed") : lang === "hi" ? "सभी प्रश्न" : "All questions"}
            <span className="font-mono text-[11px] opacity-60">{f === "wrong" ? missed : items.length}</span>
          </button>
        ))}
      </div>
      {shown.length === 0 && <p className="card p-6 text-center font-display text-2xl">{lang === "hi" ? "कुछ नहीं छूटा। शानदार!" : "Nothing missed. Clean sweep!"}</p>}
      <div className="space-y-4">
        {shown.map((it) => (
          <div key={it.id} className="card reveal p-5 sm:p-6">
            <McqView mcq={it.content} lang={lang} selected={it.selected} reveal number={it.n} />
            {it.storyId && (
              <Link href={`/story/${it.storyId}`} className="mt-3 inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink">
                {lang === "hi" ? "ख़बर पढ़ें" : "Read the story"} <ArrowUpRight className="size-4" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
