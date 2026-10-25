"use client";

import Link from "next/link";
import { ArrowRight, Brain, CalendarDays, Check } from "lucide-react";
import { dueCount, forecast, useProgress } from "@/lib/progress-store";
import { useLang } from "./lang-context";
import { Count, cx, fmtDate } from "./ui";

/** Revision status in one strip: what's due, the week ahead, and the action. */
export function RevisionHero({ countdown }: { countdown?: number | null }) {
  const p = useProgress();
  const lang = useLang();
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  const due = dueCount(p);
  const days = forecast(p, 7);
  const max = Math.max(1, ...days.map((f) => f.count));
  const soon = days.slice(0, 4).reduce((n, f) => n + f.count, 0);

  return (
    <section className="card rise flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span className={cx("grid size-14 shrink-0 place-items-center rounded-[18px]", due ? "bg-cobalt text-white" : "bg-signal text-on-signal")}>
          {due ? <Brain className="size-6" strokeWidth={1.9} /> : <Check className="size-6" strokeWidth={2.4} />}
        </span>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[34px] leading-none tnum">
              <Count to={due} />
            </span>
            <span className="text-sm font-medium">{hi ? "कार्ड आज दोहराने हैं" : due === 1 ? "card due today" : "cards due today"}</span>
          </div>
          <p className="mt-1 text-sm text-ink-3">
            {due ? (hi ? "लगभग 3 मिनट" : `About ${Math.max(1, Math.round(due / 5))} min`) : hi ? "सब पूरा। पढ़ी हर ख़बर कल लौटेगी।" : "All caught up. Every story you read returns tomorrow."}
            {countdown != null && countdown > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-ink-2">
                <CalendarDays className="size-3.5" /> {hi ? `परीक्षा में ${countdown} दिन` : `${countdown} days to exam`}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-end gap-1.5 sm:w-56" aria-label={hi ? "अगले 7 दिन" : "Cards due over the next 7 days"}>
        {days.map((f, i) => (
          <div key={f.date} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-12 w-full items-end">
              <div
                className={cx("grow-y w-full rounded-md", i === 0 ? "bg-cobalt" : f.count ? "bg-cobalt/35" : "bg-line-2")}
                style={{ height: `${Math.max(10, (f.count / max) * 100)}%`, "--i": i } as React.CSSProperties}
                title={`${f.count}`}
              />
            </div>
            <span className={cx("font-mono text-[10px] uppercase", i === 0 ? "font-semibold text-cobalt-ink" : "text-ink-3")}>{i === 0 ? (hi ? "आज" : "Tdy") : fmtDate(f.date, ui, { weekday: "short" }).slice(0, 3)}</span>
          </div>
        ))}
      </div>

      {due > 0 ? (
        <Link href="/revise/session" className="btn group h-12 shrink-0 px-6 text-[15px]">
          {hi ? "दोहराव शुरू करें" : "Start revising"} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </Link>
      ) : soon > 0 ? (
        <Link href="/revise/session?ahead=1" className="btn btn-ghost h-12 shrink-0 px-6 text-[15px]">
          {hi ? `आगे का दोहराव (${soon})` : `Revise ahead · ${soon}`}
        </Link>
      ) : null}
    </section>
  );
}
