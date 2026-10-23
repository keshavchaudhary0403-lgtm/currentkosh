"use client";

import { useLang } from "@/components/lang-context";
import { Card, Empty, SectionTitle } from "@/components/ui";
import { addDays, istDate } from "@/lib/dates";
import { accuracyByCategory, activityDays, streak, totals, useProgress } from "@/lib/progress-store";
import { categoryById, pick } from "@/lib/taxonomy";

export default function Progress() {
  const p = useProgress();
  const lang = useLang();
  const ui = lang === "bi" ? "en" : lang;
  const tot = totals(p);
  const acc = accuracyByCategory(p);
  const days = activityDays(p);

  // 18-week activity heatmap, columns = weeks (Mon-Sun)
  const today = istDate();
  const dow = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
  const start = addDays(today, -(17 * 7 + dow));
  const weeks = Array.from({ length: 18 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)));
  const level = (n: number) => (n === 0 ? 0 : n < 5 ? 1 : n < 15 ? 2 : n < 30 ? 3 : 4);

  const stats = [
    { label: "Day streak", value: streak(p) },
    { label: "Stories read", value: tot.read },
    { label: "Questions answered", value: tot.answered },
    { label: "Accuracy", value: tot.answered ? `${Math.round((tot.correct / tot.answered) * 100)}%` : "—" },
    { label: "Facts mastered", value: tot.mastered, hint: "interval ≥ 21 days" },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-5xl">{ui === "hi" ? "प्रगति" : "Progress"}</h1>
        <p className="mt-2 text-sm text-ink-3">Saved privately in this browser.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((x) => (
          <Card key={x.label} className="p-4">
            <div className="font-display text-4xl leading-none">{x.value}</div>
            <div className="mt-2 text-xs text-ink-2">{x.label}</div>
            {x.hint && <div className="text-[11px] text-ink-3">{x.hint}</div>}
          </Card>
        ))}
      </section>

      <section>
        <SectionTitle eyebrow="Consistency" title="Last 18 weeks" />
        <Card className="overflow-x-auto p-5">
          <div className="flex gap-1">
            {weeks.map((w, i) => (
              <div key={i} className="flex flex-col gap-1">
                {w.map((d) => {
                  const l = d > today ? -1 : level(days.get(d) ?? 0);
                  return (
                    <div
                      key={d}
                      title={`${d}: ${days.get(d) ?? 0} actions`}
                      className="size-3.5 rounded-[4px]"
                      style={{ background: l < 0 ? "transparent" : l === 0 ? "var(--line-strong)" : `color-mix(in oklab, var(--accent) ${l * 25}%, transparent)` }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <SectionTitle eyebrow="Where to focus" title="Accuracy by topic" />
        {acc.length ? (
          <Card className="divide-y divide-line">
            {acc.map((a) => {
              const pct = Math.round((a.correct / a.total) * 100);
              return (
                <div key={a.category} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-36 shrink-0 text-sm sm:w-56">{pick(categoryById(a.category)?.label, ui)}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-line-strong">
                    <div className={`h-full rounded-full ${pct >= 70 ? "bg-good" : pct >= 40 ? "bg-warn" : "bg-bad"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-20 text-right text-sm tabular-nums">
                    {pct}% <span className="text-ink-3">· {a.total}</span>
                  </span>
                </div>
              );
            })}
          </Card>
        ) : (
          <Empty title="No test data yet">Take the daily quiz and your topic-wise accuracy will show up here.</Empty>
        )}
      </section>
    </div>
  );
}
