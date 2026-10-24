"use client";

import Link from "next/link";
import { ArrowRight, Brain, Check } from "lucide-react";
import { dueCount, forecast, useProgress } from "@/lib/progress-store";
import { useLang } from "./lang-context";
import { fmtDate } from "./ui";

/** Revision status in one horizontal band: what's due, the action, and the week ahead. */
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
    <section className="grid gap-4 rounded-3xl border border-line bg-surface p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-8">
      <div className="flex items-center gap-4">
        <span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${due ? "bg-violet text-white" : "bg-violet-soft text-violet"}`}>
          {due ? <Brain className="size-7" strokeWidth={2} /> : <Check className="size-7" strokeWidth={2.4} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl leading-none tabular-nums">{due}</span>
            <span className="text-sm text-ink-2">{hi ? "कार्ड आज दोहराने हैं" : due === 1 ? "card due today" : "cards due today"}</span>
          </div>
          <p className="mt-1 text-xs text-ink-3">
            {due ? (hi ? "लगभग 3 मिनट" : `About ${Math.max(1, Math.round(due / 5))} min`) : hi ? "सब पूरा। पढ़ी हर ख़बर कल लौटेगी।" : "All caught up. Every story you read returns tomorrow."}
            {countdown != null && countdown > 0 && <> · {hi ? `परीक्षा में ${countdown} दिन` : `${countdown} days to your exam`}</>}
          </p>
          <div className="mt-3">
            {due > 0 ? (
              <Link href="/revise/session" className="btn btn-violet h-10 w-full px-5 text-sm sm:w-auto">
                {hi ? "दोहराव शुरू करें" : "Start revising"} <ArrowRight className="size-4" />
              </Link>
            ) : soon > 0 ? (
              <Link href="/revise/session?ahead=1" className="btn btn-ghost h-10 w-full px-5 text-sm sm:w-auto">
                {hi ? `आगे का दोहराव (${soon})` : `Revise ahead · ${soon} coming up`}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold text-ink-3">{hi ? "अगले 7 दिन" : "Next 7 days"}</div>
        <div className="flex h-20 items-end gap-2">
          {days.map((f, i) => (
            <div key={f.date} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-ink-3 tabular-nums">{f.count || ""}</span>
              <div className={`w-full rounded-md ${i === 0 ? "bg-violet" : f.count ? "bg-violet/35" : "bg-line"}`} style={{ height: `${Math.max(4, (f.count / max) * 48)}px` }} />
              <span className="text-[10px] text-ink-3">{i === 0 ? (hi ? "आज" : "Today") : fmtDate(f.date, ui, { weekday: "narrow" })}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
