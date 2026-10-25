"use client";

import { Flame } from "lucide-react";
import { useLang } from "@/components/lang-context";
import { catStyle } from "@/components/category-icon";
import { Bar, Count, Empty, PageHeader, ProgressRing, SectionTitle, cx } from "@/components/ui";
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
  const run = streak(p);
  const accuracy = tot.answered ? Math.round((tot.correct / tot.answered) * 100) : 0;

  // 18-week activity heatmap, columns = weeks (Mon-Sun)
  const today = istDate();
  const dow = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
  const start = addDays(today, -(17 * 7 + dow));
  const weeks = Array.from({ length: 18 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)));
  const level = (n: number) => (n === 0 ? 0 : n < 5 ? 1 : n < 15 ? 2 : n < 30 ? 3 : 4);
  const activeDays = [...days.values()].filter((n) => n > 0).length;

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={L("Saved privately in this browser", "इसी ब्राउज़र में निजी रूप से सहेजा")} title={ui === "hi" ? "प्रगति" : <>Progress<span className="text-signal-ink">.</span></>} />

      <section className="card rise grid grid-cols-2 divide-line sm:grid-cols-3 lg:grid-cols-5 lg:divide-x">
        <div className="col-span-2 flex items-center gap-4 p-5 sm:col-span-3 lg:col-span-1">
          <span className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-signal text-on-signal">
            <Flame className={cx("size-6", run > 0 && "flicker")} strokeWidth={2.2} />
          </span>
          <Stat value={<Count to={run} />} label={L("day streak", "दिन लगातार")} />
        </div>
        <div className="p-5">
          <Stat value={<Count to={tot.read} />} label={L("Stories read", "ख़बरें पढ़ीं")} />
        </div>
        <div className="p-5">
          <Stat value={<Count to={tot.answered} />} label={L("Questions answered", "प्रश्न हल किए")} />
        </div>
        <div className="flex items-center gap-3 p-5">
          <ProgressRing value={accuracy} max={100} size={48} stroke={6} color="var(--good)" label={`${accuracy}%`}>
            <span className="sr-only">{accuracy}%</span>
          </ProgressRing>
          <Stat value={tot.answered ? `${accuracy}%` : "—"} label={L("Accuracy", "सटीकता")} />
        </div>
        <div className="p-5">
          <Stat value={<Count to={tot.mastered} />} label={L("Facts mastered", "पक्के तथ्य")} hint={L("interval ≥ 21 days", "अंतराल ≥ 21 दिन")} />
        </div>
      </section>

      <div className="space-y-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
        <section>
          <SectionTitle title={L("Your consistency", "आपकी नियमितता")} eyebrow={L(`Last 18 weeks · ${activeDays} active days`, `पिछले 18 सप्ताह · ${activeDays} सक्रिय दिन`)} />
          <div className="card p-5 sm:p-6">
            <div className="no-scrollbar overflow-x-auto">
              <div className="flex min-w-[400px] gap-1">
                {weeks.map((w, i) => (
                  <div key={i} className="flex flex-1 flex-col gap-1">
                    {w.map((d) => {
                      const l = d > today ? -1 : level(days.get(d) ?? 0);
                      return (
                        <div
                          key={d}
                          title={`${d}: ${days.get(d) ?? 0} actions`}
                          className={cx("pop aspect-square w-full rounded-[5px]", d === today && "ring-2 ring-ink ring-offset-1 ring-offset-card")}
                          style={{
                            animationDelay: `${i * 18}ms`,
                            background: l < 0 ? "transparent" : l === 0 ? "var(--line)" : `color-mix(in oklab, var(--signal) ${30 + l * 17}%, var(--good) ${l * 8}%)`,
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="eyebrow mt-4 flex items-center justify-end gap-1.5 text-ink-3">
              {L("Less", "कम")}
              {[0, 1, 2, 3, 4].map((l) => (
                <span key={l} className="size-3 rounded-[4px]" style={{ background: l === 0 ? "var(--line)" : `color-mix(in oklab, var(--signal) ${30 + l * 17}%, var(--good) ${l * 8}%)` }} />
              ))}
              {L("More", "ज़्यादा")}
            </div>
          </div>
        </section>

        <section>
          <SectionTitle title={L("Accuracy by topic", "विषयवार सटीकता")} eyebrow={L("Red bars are where to focus", "लाल पट्टियों पर ध्यान दें")} />
          {acc.length ? (
            <div className="card divide-y divide-line">
              {acc.map((a) => {
                const pct = Math.round((a.correct / a.total) * 100);
                return (
                  <div key={a.category} className="cat flex items-center gap-4 px-5 py-3.5" style={catStyle(a.category)}>
                    <span className="flex w-32 shrink-0 items-center gap-2 text-sm font-semibold sm:w-56">
                      <span className="size-2 shrink-0 rounded-full bg-(--cat-solid)" />
                      <span className="truncate">{pick(categoryById(a.category)?.label, ui)}</span>
                    </span>
                    <Bar value={pct} max={100} color={pct >= 70 ? "bg-good" : pct >= 40 ? "bg-amber" : "bg-bad"} className="h-2 flex-1" />
                    <span className="w-16 text-right font-mono text-xs tnum">
                      {pct}% <span className="text-ink-3">· {a.total}</span>
                    </span>
                  </div>
                );
              })}
            </div>
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

function Stat({ value, label, hint }: { value: React.ReactNode; label: string; hint?: string }) {
  return (
    <div>
      <div className="font-display text-[30px] leading-none tnum">{value}</div>
      <div className="mt-1.5 text-xs font-semibold text-ink-2">{label}</div>
      {hint && <div className="text-[11px] text-ink-3">{hint}</div>}
    </div>
  );
}
