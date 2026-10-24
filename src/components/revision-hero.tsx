"use client";

import Link from "next/link";
import { ArrowRight, Brain, Check } from "lucide-react";
import { dueCount, forecast, useProgress } from "@/lib/progress-store";
import { useLang } from "./lang-context";
import { fmtDate } from "./ui";

export function RevisionHero() {
  const p = useProgress();
  const lang = useLang();
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  const due = dueCount(p);
  const days = forecast(p, 7);
  const max = Math.max(1, ...days.map((f) => f.count));
  const soon = days.slice(0, 4).reduce((n, f) => n + f.count, 0);
  return (
    <section className="rounded-3xl bg-violet p-5 text-white sm:p-6">
      <div className="flex items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20">
          {due > 0 ? <Brain className="size-7" strokeWidth={2.2} /> : <Check className="size-7" strokeWidth={3} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-display text-3xl leading-none tabular-nums">{due}</div>
          <div className="mt-1 text-sm font-bold text-white/85">{hi ? "आज दोहराने हैं" : due === 1 ? "card due today" : "cards due today"}</div>
        </div>
      </div>
      {due > 0 ? (
        <Link href="/revise/session" className="btn btn-white mt-5 w-full py-3.5 text-[15px] [--bt:var(--violet)]">
          {hi ? "दोहराव शुरू करें" : "Start revising"} <ArrowRight className="size-5" strokeWidth={2.6} />
        </Link>
      ) : (
        <>
          <p className="mt-4 rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold">{hi ? "सब पूरा! पढ़ी हर ख़बर कल यहाँ लौटेगी।" : "All caught up! Every story you read comes back here tomorrow."}</p>
          {soon > 0 && (
            <Link href="/revise/session?ahead=1" className="btn btn-white mt-3 w-full py-3 text-sm [--bt:var(--violet)]">
              {hi ? `आगे का दोहराव करें (${soon})` : `Revise ahead · ${soon} coming up`}
            </Link>
          )}
        </>
      )}
      <div className="mt-5 flex h-16 items-end gap-1.5">
        {days.map((f, i) => (
          <div key={f.date} className="flex flex-1 flex-col items-center gap-1">
            {f.count > 0 && <span className="text-[10px] font-extrabold text-white/90 tabular-nums">{f.count}</span>}
            <div className={`w-full rounded-md ${i === 0 ? "bg-white" : "bg-white/30"}`} style={{ height: `${Math.max(4, (f.count / max) * 36)}px` }} />
            <span className="text-[10px] font-bold text-white/75">{i === 0 ? (hi ? "आज" : "Today") : fmtDate(f.date, ui, { weekday: "narrow" })}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
