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
      <PageHeader eyebrow={L("Saved privately in this browser", "इसी ब्राउज़र में निजी रूप से सहेजा")} title={ui === "hi" ? "प्रगति" : <>Progress<span className="text-signal-ink italic">.</span></>} />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rise relative col-span-2 row-span-2 flex min-h-[260px] flex-col overflow-hidden rounded-[28px] bg-[#10110e] p-6 text-[#f3f2ec] dark:bg-card dark:shadow-[inset_0_0_0_1px_var(--line-2)]">
          <div aria-hidden className="pointer-events-none absolute -right-16 -bottom-24 size-72 rounded-full bg-[#c8f135] opacity-20 blur-3xl" />
          <span className="grid size-14 place-items-center rounded-[18px] bg-[#c8f135] text-[#10110e]">
            <Flame className={cx("size-7", run > 0 && "flicker")} strokeWidth={2.2} />
          </span>
          <div className="relative mt-auto pt-6">
            <div className="font-display text-[110px] leading-[0.8] sm:text-[140px]">
              <Count to={run} />
            </div>
            <div className="mt-3 text-sm text-white/70 dark:text-ink-2">{L("day streak · small daily steps add up", "दिन लगातार · रोज़ के छोटे कदम")}</div>
          </div>
        </div>
        <Tile value={tot.read} label={L("Stories read", "ख़बरें पढ़ीं")} cls="bg-signal text-on-signal" />
        <Tile value={tot.answered} label={L("Questions answered", "प्रश्न हल किए")} cls="card" />
        <div className="card rise flex items-center gap-4 p-4 sm:p-5">
          <ProgressRing value={accuracy} max={100} size={72} stroke={8} color="var(--good)" label={`${accuracy}%`}>
            <span className="font-mono text-sm font-semibold tnum">{tot.answered ? `${accuracy}%` : "—"}</span>
          </ProgressRing>
          <div className="text-xs font-semibold">{L("Accuracy", "सटीकता")}</div>
        </div>
        <Tile value={tot.mastered} label={L("Facts mastered", "पक्के तथ्य")} hint={L("interval ≥ 21 days", "अंतराल ≥ 21 दिन")} cls="bg-cobalt-soft text-cobalt-ink" />
      </section>

      <div className="space-y-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
        <section>
          <SectionTitle title={L("Your consistency", "आपकी नियमितता")} eyebrow={L(`Last 18 weeks · ${activeDays} active days`, `पिछले 18 सप्ताह · ${activeDays} सक्रिय दिन`)} />
          <div className="card p-5 sm:p-6">
            <div className="no-scrollbar overflow-x-auto">
              <div className="flex w-max gap-1">
                {weeks.map((w, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    {w.map((d) => {
                      const l = d > today ? -1 : level(days.get(d) ?? 0);
                      return (
                        <div
                          key={d}
                          title={`${d}: ${days.get(d) ?? 0} actions`}
                          className={cx("pop size-4 rounded-[5px] sm:size-[18px]", d === today && "ring-2 ring-ink ring-offset-1 ring-offset-card")}
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

function Tile({ value, label, hint, cls }: { value: number; label: string; hint?: string; cls: string }) {
  return (
    <div className={cx("rise flex flex-col justify-end rounded-[24px] p-4 sm:p-5", cls)}>
      <div className="font-display text-[48px] leading-none">
        <Count to={value} />
      </div>
      <div className="mt-2 text-xs font-semibold">{label}</div>
      {hint && <div className="text-[11px] opacity-70">{hint}</div>}
    </div>
  );
}
