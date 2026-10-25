"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import type { ThreadSummary } from "@/lib/store";
import { CATEGORIES, pick, type Lang } from "@/lib/taxonomy";
import { CategoryIcon, catStyle } from "./category-icon";
import { Select } from "./form";
import { Empty, fmtDate } from "./ui";

type Sort = "latest" | "updates" | "az";

/** Search, filter and sort every timeline. */
export function TimelineBrowser({ threads, lang }: { threads: ThreadSummary[]; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState<Sort>("latest");
  // Render a page at a time; search and filters still cover every timeline.
  const [limit, setLimit] = useState(24);

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
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_220px]">
        <label className="flex h-12 items-center gap-2.5 rounded-full bg-card px-5 shadow-[inset_0_0_0_1px_var(--line-2)] transition focus-within:shadow-[inset_0_0_0_2px_var(--ink)]">
          <Search className="size-4 text-ink-3" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setLimit(24);
            }}
            placeholder={hi ? "खोजें: भारत-चीन, चुनाव, RBI, चक्रवात…" : "Search: India–China, elections, RBI, cyclone…"}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-3"
            aria-label="Search timelines"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search" className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-card-2 hover:text-ink">
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

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {[{ id: "", label: hi ? "सभी विषय" : "All topics", n: threads.length }, ...topics].map((t) => (
          <button
            key={t.id || "all"}
            onClick={() => {
              setCat(t.id);
              setLimit(24);
            }}
            aria-pressed={cat === t.id}
            className={t.id ? "chip cat shrink-0" : "chip shrink-0"}
            style={t.id ? catStyle(t.id) : undefined}
          >
            {t.id && <span className="size-1.5 rounded-full bg-(--cat-solid)" />}
            {t.label} <span className="font-mono text-[11px] opacity-60">{t.n}</span>
          </button>
        ))}
      </div>

      <div className="eyebrow text-ink-3">
        {shown.length} {hi ? "घटनाक्रम" : shown.length === 1 ? "timeline" : "timelines"}
      </div>

      {shown.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.slice(0, limit).map((t) => (
            <Link key={t.key} href={`/thread/${t.key}`} className="card lift group flex flex-col p-4 sm:p-5">
              <span className="flex items-center gap-3">
                <CategoryIcon id={t.category} size="sm" />
                <span className="font-mono text-[11px] text-ink-3 uppercase">
                  {fmtDate(t.firstDate, ui, { day: "numeric", month: "short" })} → {fmtDate(t.lastDate, ui, { day: "numeric", month: "short" })}
                </span>
                <ArrowUpRight className="ml-auto size-4 text-ink-3 transition group-hover:rotate-45 group-hover:text-ink" />
              </span>
              <span lang={hi ? "hi" : undefined} className="mt-3 block text-[16px] leading-snug font-semibold">
                {pick(t.title, ui)}
              </span>
              <span lang={hi ? "hi" : undefined} className="mt-1.5 line-clamp-2 block text-sm text-ink-2">
                {pick(t.latest, ui)}
              </span>
              <span className="mt-auto flex items-center gap-2 pt-4">
                <span className="flex -space-x-1">
                  {Array.from({ length: Math.min(5, t.count) }, (_, j) => (
                    <span key={j} className="size-2.5 rounded-full bg-amber ring-2 ring-card" style={{ opacity: 1 - j * 0.16 }} />
                  ))}
                </span>
                <span className="text-xs font-semibold text-ink-2">
                  {t.count} {hi ? "अपडेट" : t.count === 1 ? "update" : "updates"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
      {shown.length > limit && (
        <button onClick={() => setLimit((n) => n + 24)} className="btn btn-ghost mx-auto flex w-full px-8 text-[15px] sm:w-auto">
          {hi ? `और दिखाएँ · ${shown.length - limit} बाकी` : `Show more · ${shown.length - limit} left`}
        </button>
      )}
      {shown.length === 0 && <Empty title={hi ? "कुछ नहीं मिला" : "No timelines match"}>{hi ? "दूसरा शब्द या विषय आज़माएँ।" : "Try another word or topic."}</Empty>}
    </div>
  );
}
