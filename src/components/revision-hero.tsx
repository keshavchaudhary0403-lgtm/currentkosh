"use client";

import Link from "next/link";
import { ArrowRight, Brain } from "lucide-react";
import { dueCount, forecast, useProgress } from "@/lib/progress-store";
import { useLang } from "./lang-context";
import { fmtDate } from "./ui";

export function RevisionHero() {
  const p = useProgress();
  const lang = useLang();
  const ui = lang === "bi" ? "en" : lang;
  const due = dueCount(p);
  const days = forecast(p, 7);
  const max = Math.max(1, ...days.map((f) => f.count));
  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
      <div className="aurora opacity-50" />
      <div className="relative grid gap-8 sm:grid-cols-[1fr_1.1fr] sm:items-center">
        <div>
          <Brain className="mb-3 size-8 text-accent" strokeWidth={1.6} />
          <div className="font-display text-6xl leading-none">{due}</div>
          <div className="mt-1 text-ink-2">{due === 1 ? "item" : "items"} due for revision</div>
          {due > 0 ? (
            <Link href="/revise/session" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-bg">
              Start session <ArrowRight className="size-4" />
            </Link>
          ) : (
            <p className="mt-4 max-w-xs text-sm text-ink-3">All caught up. Read stories or take tests and their facts will queue up here.</p>
          )}
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold tracking-wider text-ink-3 uppercase">Next 7 days</div>
          <div className="flex h-32 items-end gap-2">
            {days.map((f, i) => (
              <div key={f.date} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-xs text-ink-3 tabular-nums">{f.count || ""}</span>
                <div className={`w-full rounded-lg ${i === 0 ? "bg-gradient-to-t from-accent to-accent-2" : "bg-line-strong"}`} style={{ height: `${Math.max(4, (f.count / max) * 88)}px` }} />
                <span className="text-[11px] text-ink-3">{i === 0 ? "Today" : fmtDate(f.date, ui, { weekday: "short" })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
