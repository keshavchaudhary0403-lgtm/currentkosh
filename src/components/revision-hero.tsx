"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    <section className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="font-display text-4xl leading-none tabular-nums">{due}</div>
          <div className="mt-1 text-sm text-ink-2">{ui === "hi" ? "आज दोहराने हैं" : due === 1 ? "item due today" : "items due today"}</div>
        </div>
        {due > 0 ? (
          <Link href="/revise/session" className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-bg">
            {ui === "hi" ? "शुरू करें" : "Start"} <ArrowRight className="size-4" />
          </Link>
        ) : (
          <span className="text-sm text-ink-3">{ui === "hi" ? "सब पूरा" : "All caught up"}</span>
        )}
      </div>
      <div className="mt-5 flex h-16 items-end gap-1.5">
        {days.map((f, i) => (
          <div key={f.date} className="flex flex-1 flex-col items-center gap-1">
            <div className={`w-full rounded-sm ${i === 0 ? "bg-accent" : "bg-line-strong"}`} style={{ height: `${Math.max(3, (f.count / max) * 44)}px` }} title={`${f.count}`} />
            <span className="text-[10px] text-ink-3">{i === 0 ? (ui === "hi" ? "आज" : "Today") : fmtDate(f.date, ui, { weekday: "narrow" })}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
