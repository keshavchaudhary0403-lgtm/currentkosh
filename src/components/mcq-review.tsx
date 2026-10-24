"use client";

import Link from "next/link";
import { useState } from "react";
import type { McqContent } from "@/lib/content";
import type { Lang } from "@/lib/taxonomy";
import { McqView } from "./mcq";

type Item = { id: string; storyId: string; content: McqContent; selected: number | null };

export function McqReview({ items, lang }: { items: Item[]; lang: Lang }) {
  const [filter, setFilter] = useState<"all" | "wrong">("wrong");
  const shown = items.map((it, i) => ({ ...it, n: i + 1 })).filter((it) => filter === "all" || it.selected !== it.content.answer);
  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["wrong", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition ${filter === f ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink-2"}`}>
            {f === "wrong" ? (lang === "hi" ? "छूटे" : "Missed") : lang === "hi" ? "सभी प्रश्न" : "All questions"}
          </button>
        ))}
      </div>
      {shown.length === 0 && <p className="text-sm text-ink-2">{lang === "hi" ? "कुछ नहीं छूटा। शानदार! 🎯" : "Nothing missed. Clean sweep! 🎯"}</p>}
      <div className="space-y-4">
        {shown.map((it) => (
          <div key={it.id} className="rounded-3xl border border-line bg-surface p-4 sm:p-5">
            <McqView mcq={it.content} lang={lang} selected={it.selected} reveal number={it.n} />
            <Link href={`/story/${it.storyId}`} className="mt-3 inline-block text-sm font-bold text-accent">
              {lang === "hi" ? "ख़बर पढ़ें →" : "Read the story →"}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
