"use client";

import { useLang } from "@/components/lang-context";
import { Bar, Card, Empty, SectionTitle } from "@/components/ui";
import { addDays, istDate } from "@/lib/dates";
import { accuracyByCategory, activityDays, streak, totals, useProgress } from "@/lib/progress-store";
import { categoryById, pick } from "@/lib/taxonomy";

export default function Progress() {
  const p = useProgress();
  const lang = useLang();
  const ui = lang === "bi" ? "en" : lang;
  const L = (en: string, hi: string) => (ui === "hi" ? hi : en);
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
    { label: L("Day streak", "दिन लगातार"), value: streak(p), cls: "bg-accent-2-soft text-accent-2" },
    { label: L("Stories read", "ख़बरें पढ़ीं"), value: tot.read, cls: "bg-accent-soft text-accent" },
    { label: L("Questions answered", "प्रश्न हल किए"), value: tot.answered, cls: "bg-teal-soft text-teal" },
    { label: L("Accuracy", "सटीकता"), value: tot.answered ? `${Math.round((tot.correct / tot.answered) * 100)}%` : "—", cls: "bg-good-soft text-good" },
    { label: L("Facts mastered", "पक्के तथ्य"), value: tot.mastered, hint: L("interval ≥ 21 days", "अंतराल ≥ 21 दिन"), cls: "bg-violet-soft text-violet" },
  ];

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-3xl sm:text-5xl">{ui === "hi" ? "प्रगति" : "Progress"}</h1>
        <p className="mt-2 text-sm text-ink-3">{L("Saved privately in this browser.", "इसी ब्राउज़र में निजी रूप से सहेजा।")}</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((x) => (
          <div key={x.label} className={`rounded-3xl p-4 ${x.cls}`}>
            <div className="font-display text-3xl leading-none">{x.value}</div>
            <div className="mt-2 text-xs font-bold">{x.label}</div>
            {x.hint && <div className="text-xs font-semibold opacity-70">{x.hint}</div>}
          </div>
        ))}
      </section>

      <div className="space-y-7 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
        <section>
          <SectionTitle title={L("Your consistency", "आपकी नियमितता")} eyebrow={L("Last 18 weeks", "पिछले 18 सप्ताह")} />
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
                        style={{ background: l < 0 ? "transparent" : l === 0 ? "var(--line)" : `color-mix(in oklab, var(--good) ${l * 25}%, var(--line))` }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section>
          <SectionTitle title={L("Accuracy by topic", "विषयवार सटीकता")} eyebrow={L("Red bars are where to focus", "लाल पट्टियों पर ध्यान दें")} />
          {acc.length ? (
            <Card className="divide-y divide-line">
              {acc.map((a) => {
                const pct = Math.round((a.correct / a.total) * 100);
                return (
                  <div key={a.category} className="flex items-center gap-4 px-5 py-3.5">
                    <span className="w-32 shrink-0 text-sm font-bold sm:w-56">{pick(categoryById(a.category)?.label, ui)}</span>
                    <Bar value={pct} max={100} color={pct >= 70 ? "bg-good" : pct >= 40 ? "bg-warn" : "bg-bad"} className="h-2.5 flex-1" />
                    <span className="w-20 text-right text-sm tabular-nums">
                      {pct}% <span className="text-ink-3">· {a.total}</span>
                    </span>
                  </div>
                );
              })}
            </Card>
          ) : (
            <Empty title={L("No test data yet", "अभी कोई टेस्ट डेटा नहीं")}>
              {L("Take the daily quiz and your topic-wise accuracy will show up here.", "डेली क्विज़ दें, विषयवार सटीकता यहाँ दिखेगी।")}
            </Empty>
          )}
        </section>
      </div>
    </div>
  );
}
