"use client";

import Link from "next/link";
import { ArrowRight, Brain, CalendarDays, Check } from "lucide-react";
import { dueCount, forecast, useProgress } from "@/lib/progress-store";
import { useLang } from "./lang-context";
import { Count, cx, fmtDate } from "./ui";

/** Revision status as a bento pair: what's due with the action, and the week ahead. */
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
    <section className="grid gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className={cx("rise relative flex min-h-[240px] flex-col overflow-hidden rounded-[28px] p-6 sm:p-7", due ? "bg-cobalt text-white" : "card")}>
        <div aria-hidden className={cx("pointer-events-none absolute -top-24 -right-24 size-72 rounded-full blur-3xl", due ? "bg-white/20" : "bg-signal-soft")} />
        <div className="relative flex items-center justify-between">
          <span className={cx("grid size-12 place-items-center rounded-[16px]", due ? "bg-white/15" : "bg-signal text-on-signal")}>
            {due ? <Brain className="size-6" strokeWidth={1.9} /> : <Check className="size-6" strokeWidth={2.4} />}
          </span>
          {countdown != null && countdown > 0 && (
            <span className={cx("eyebrow inline-flex h-8 items-center gap-1.5 rounded-full px-3", due ? "bg-white/15" : "bg-card-2 text-ink-2")}>
              <CalendarDays className="size-3.5" /> {hi ? `परीक्षा में ${countdown} दिन` : `${countdown} days to exam`}
            </span>
          )}
        </div>
        <div className="relative mt-auto pt-6">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-[66px] leading-[0.85] sm:text-[81px]">
              <Count to={due} />
            </span>
            <span className={cx("text-sm", due ? "text-white/80" : "text-ink-2")}>{hi ? "कार्ड आज दोहराने हैं" : due === 1 ? "card due today" : "cards due today"}</span>
          </div>
          <p className={cx("mt-2 text-sm", due ? "text-white/70" : "text-ink-3")}>
            {due ? (hi ? "लगभग 3 मिनट" : `About ${Math.max(1, Math.round(due / 5))} min`) : hi ? "सब पूरा। पढ़ी हर ख़बर कल लौटेगी।" : "All caught up. Every story you read returns tomorrow."}
          </p>
          <div className="mt-5">
            {due > 0 ? (
              <Link href="/revise/session" className="btn group h-12 w-full px-6 text-[15px] sm:w-auto">
                {hi ? "दोहराव शुरू करें" : "Start revising"} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
            ) : soon > 0 ? (
              <Link href="/revise/session?ahead=1" className="btn btn-ghost h-12 w-full px-6 text-[15px] sm:w-auto">
                {hi ? `आगे का दोहराव (${soon})` : `Revise ahead · ${soon} coming up`}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="card rise flex flex-col p-6 sm:p-7" style={{ animationDelay: "80ms" }}>
        <div className="eyebrow text-ink-3">{hi ? "अगले 7 दिन" : "Next 7 days"}</div>
        <div className="mt-1 font-display text-[22px] leading-tight">{hi ? "आगे क्या लौटेगा" : <>What&apos;s coming <span>back</span></>}</div>
        <div className="mt-auto flex h-36 items-end gap-2 pt-6">
          {days.map((f, i) => (
            <div key={f.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="font-mono text-[11px] text-ink-3 tnum">{f.count || ""}</span>
              <div
                className={cx("grow-y w-full rounded-t-xl rounded-b-md", i === 0 ? "bg-cobalt" : f.count ? "bg-cobalt/35" : "bg-line-2")}
                style={{ height: `${Math.max(6, (f.count / max) * 100)}%`, "--i": i } as React.CSSProperties}
              />
              <span className={cx("font-mono text-[10px] uppercase", i === 0 ? "font-semibold text-cobalt-ink" : "text-ink-3")}>{i === 0 ? (hi ? "आज" : "Tdy") : fmtDate(f.date, ui, { weekday: "short" }).slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
