"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { ThreadSummary } from "@/lib/store";
import { CATEGORIES, pick, type Lang } from "@/lib/taxonomy";
import { CategoryIcon } from "./category-icon";
import { Select } from "./form";
import { Empty, cx, fmtDate } from "./ui";

type Sort = "latest" | "updates" | "az";

/** Search, filter and sort every timeline. */
export function TimelineBrowser({ threads, lang }: { threads: ThreadSummary[]; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState<Sort>("latest");

  const topics = useMemo(() => {
    const n = new Map<string, number>();
    for (const t of threads) n.set(t.category, (n.get(t.category) ?? 0) + 1);
    return CATEGORIES.filter((c) => n.has(c.id)).map((c) => ({ id: c.id, label: pick(c.label, ui), n: n.get(c.id)! }));
  }, [threads, ui]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return threads
      .filter((t) => (!cat || t.category === cat) && (!needle || `${t.title.en} ${t.title.hi} ${t.latest.en} ${t.latest.hi}`.toLowerCase().includes(needle)))
      .sort((a, b) =>
        sort === "updates" ? b.count - a.count : sort === "az" ? pick(a.title, ui).localeCompare(pick(b.title, ui)) : b.lastDate.localeCompare(a.lastDate) || b.count - a.count,
      );
  }, [threads, q, cat, sort, ui]);

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_200px]">
        <label className="flex h-11 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15">
          <Search className="size-4 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={hi ? "खोजें: भारत-चीन, चुनाव, RBI, चक्रवात…" : "Search: India–China, elections, RBI, cyclone…"}
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-3"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search" className="text-ink-3 hover:text-ink">
              <X className="size-4" />
            </button>
          )}
        </label>
        <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
          <option value="latest">{hi ? "ताज़ा अपडेट पहले" : "Latest update first"}</option>
          <option value="updates">{hi ? "सबसे ज़्यादा अपडेट" : "Most updates"}</option>
          <option value="az">{hi ? "नाम (अ–ज़)" : "Name (A–Z)"}</option>
        </Select>
      </div>

      {/* Topic filter: chips on desktop, a dropdown on phones. */}
      <div className="hidden flex-wrap gap-2 md:flex">
        {[{ id: "", label: hi ? "सभी विषय" : "All topics", n: threads.length }, ...topics].map((t) => (
          <button
            key={t.id || "all"}
            onClick={() => setCat(t.id)}
            className={cx(
              "rounded-full border px-3 py-1.5 text-[13px] font-semibold transition",
              cat === t.id ? "border-pink bg-pink-soft text-pink" : "border-line bg-surface text-ink-2 hover:border-line-strong",
            )}
          >
            {t.label} <span className="font-normal opacity-70">{t.n}</span>
          </button>
        ))}
      </div>
      <Select value={cat} onChange={(e) => setCat(e.target.value)} className="md:hidden" aria-label="Topic">
        <option value="">{hi ? "सभी विषय" : "All topics"}</option>
        {topics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label} ({t.n})
          </option>
        ))}
      </Select>

      <div className="text-xs text-ink-3">
        {shown.length} {hi ? "घटनाक्रम" : shown.length === 1 ? "timeline" : "timelines"}
      </div>

      {shown.length ? (
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((t) => (
            <Link key={t.key} href={`/thread/${t.key}`} className="tap flex gap-3 rounded-2xl bg-surface p-4">
              <CategoryIcon id={t.category} size="sm" />
              <span className="min-w-0 flex-1">
                <span lang={hi ? "hi" : undefined} className="block leading-snug font-semibold">
                  {pick(t.title, ui)}
                </span>
                <span lang={hi ? "hi" : undefined} className="mt-1 line-clamp-1 block text-xs text-ink-2">
                  {pick(t.latest, ui)}
                </span>
                <span className="mt-1.5 block text-[11px] text-ink-3">
                  {t.count} {hi ? "अपडेट" : t.count === 1 ? "update" : "updates"} · {fmtDate(t.firstDate, ui, { day: "numeric", month: "short" })} – {fmtDate(t.lastDate, ui, { day: "numeric", month: "short" })}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <Empty title={hi ? "कुछ नहीं मिला" : "No timelines match"}>{hi ? "दूसरा शब्द या विषय आज़माएँ।" : "Try another word or topic."}</Empty>
      )}
    </div>
  );
}
