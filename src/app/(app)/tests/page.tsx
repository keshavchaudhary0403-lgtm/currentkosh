"use client";

import Link from "next/link";
import { useState } from "react";
import { BookmarkCheck, CalendarRange, ClipboardList, Clock, Crosshair, Eye, RotateCcw, Target, Timer, Waypoints, Wrench, Zap, type LucideIcon } from "lucide-react";
import { useLang } from "@/components/lang-context";
import { Bar, Empty, PageHeader, ProgressRing, SectionTitle, cx } from "@/components/ui";
import { accuracyByCategory, useProgress, type Attempt } from "@/lib/progress-store";
import { categoryById, pick } from "@/lib/taxonomy";

type Kind = { label: string; hi: string; icon: LucideIcon; tone: string };

const KINDS: Record<string, Kind> = {
  daily: { label: "Daily quiz", hi: "डेली क्विज़", icon: Zap, tone: "bg-signal text-on-signal" },
  weekly: { label: "Weekly", hi: "साप्ताहिक", icon: CalendarRange, tone: "bg-mint-soft text-mint-ink" },
  monthly: { label: "Monthly", hi: "मासिक", icon: CalendarRange, tone: "bg-cobalt-soft text-cobalt-ink" },
  mock: { label: "Timed mock", hi: "टाइम्ड मॉक", icon: Timer, tone: "bg-solid text-on-solid" },
  weak: { label: "Weak-area drill", hi: "कमज़ोर विषय", icon: Crosshair, tone: "bg-flare-soft text-flare-ink" },
  thread: { label: "Timeline", hi: "घटनाक्रम", icon: Waypoints, tone: "bg-amber-soft text-amber-ink" },
  saved: { label: "Saved", hi: "सहेजे गए", icon: BookmarkCheck, tone: "bg-cobalt-soft text-cobalt-ink" },
  custom: { label: "Custom", hi: "अपना टेस्ट", icon: Wrench, tone: "bg-card-2 text-ink-2" },
};

// Saved-story tests are stored as "custom"; tell them apart by title so they get their own filter.
const kindOf = (a: Attempt) => (a.kind === "custom" && /saved/i.test(a.title) ? "saved" : KINDS[a.kind] ? a.kind : "custom");

const pct = (a: Attempt) => Math.round((a.correct / Math.max(1, a.mcqIds.length)) * 100);
const seconds = (a: Attempt) => Math.max(1, Math.round((new Date(a.finishedAt).getTime() - new Date(a.startedAt).getTime()) / 1000));
const answeredCount = (a: Attempt) => a.answers.filter((x) => x !== null && x !== undefined).length;
const ringTone = (p: number) => (p >= 70 ? "var(--good)" : p >= 40 ? "var(--amber)" : "var(--bad)");
const barTone = (p: number) => (p >= 70 ? "bg-good" : p >= 40 ? "bg-amber" : "bg-bad");

function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  return m ? `${m}m ${s % 60}s` : `${s}s`;
}

const retryHref = (a: Attempt, ids: string[], label: string) =>
  `/practice/run?kind=${a.kind}&mcqs=${ids.join(",")}&timed=${a.config.timed ? 1 : 0}&neg=${a.config.negative}&title=${encodeURIComponent(`${label} · ${a.title}`)}`;

export default function MyTests() {
  const p = useProgress();
  const lang = useLang();
  const hi = lang === "hi";
  const L = (en: string, h: string) => (hi ? h : en);
  const [filter, setFilter] = useState<string>("all");
  const attempts = p.attempts;

  if (!attempts.length)
    return (
      <div className="space-y-6">
        <PageHeader eyebrow={L("Scores · analysis · retries", "अंक · विश्लेषण · दोबारा")} title={L("My tests", "मेरे टेस्ट")} />
        <Empty title={L("No tests yet", "अभी कोई टेस्ट नहीं")} icon={<ClipboardList className="size-7" />}>
          {L("Every test you take (daily quiz, mocks, your own tests) is listed here with its score, accuracy, time and review.", "आपका हर टेस्ट यहाँ अंक, सटीकता, समय और समीक्षा के साथ दिखेगा।")}
          <div className="mt-5">
            <Link href="/practice/run?kind=daily" className="btn px-5 text-[15px]">
              {L("Take today's quiz", "आज का क्विज़ दें")}
            </Link>
          </div>
        </Empty>
      </div>
    );

  const totalQs = attempts.reduce((n, a) => n + a.mcqIds.length, 0);
  const totalCorrect = attempts.reduce((n, a) => n + a.correct, 0);
  const totalAnswered = attempts.reduce((n, a) => n + answeredCount(a), 0);
  const totalSecs = attempts.reduce((n, a) => n + seconds(a), 0);
  const best = attempts.reduce((b, a) => (pct(a) > pct(b) ? a : b), attempts[0]);
  const recent = attempts.slice(0, 12).reverse();
  const topics = accuracyByCategory(p).filter((t) => t.total >= 3);
  const weak = [...topics].sort((a, b) => a.correct / a.total - b.correct / b.total).slice(0, 3);
  const strong = [...topics].sort((a, b) => b.correct / b.total - a.correct / a.total).slice(0, 3);

  const counts = new Map<string, number>();
  for (const a of attempts) counts.set(kindOf(a), (counts.get(kindOf(a)) ?? 0) + 1);
  const shown = filter === "all" ? attempts : attempts.filter((a) => kindOf(a) === filter);
  const byMonth = new Map<string, Attempt[]>();
  for (const a of shown) {
    const m = new Date(a.finishedAt).toLocaleDateString(hi ? "hi-IN" : "en-IN", { month: "long", year: "numeric" });
    byMonth.set(m, [...(byMonth.get(m) ?? []), a]);
  }

  const stats = [
    { label: L("Tests taken", "टेस्ट दिए"), value: attempts.length, cls: "bg-[#10110e] text-[#f3f2ec] dark:bg-card-2 dark:text-ink" },
    { label: L("Accuracy", "सटीकता"), value: `${Math.round((totalCorrect / Math.max(1, totalAnswered)) * 100)}%`, cls: "bg-signal text-on-signal" },
    { label: L("Questions", "प्रश्न"), value: totalQs, cls: "card" },
    { label: L("Avg time / Q", "औसत समय / प्रश्न"), value: `${Math.round(totalSecs / Math.max(1, totalAnswered))}s`, cls: "bg-cobalt-soft text-cobalt-ink" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={L("Scores · analysis · retries", "अंक · विश्लेषण · दोबारा")}
        title={L("My tests", "मेरे टेस्ट")}
        sub={L("Every test you've taken, with scores, analysis and retries.", "आपके सभी टेस्ट: अंक, विश्लेषण और दोबारा प्रयास।")}
        right={
          <Link href="/practice" className="btn px-5 text-[15px]">
            <Target className="size-4" strokeWidth={2.4} /> {L("Take a test", "टेस्ट दें")}
          </Link>
        }
      />

      <section className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={cx("rounded-[22px] p-4 sm:p-5", s.cls)}>
            <div className="font-display text-[44px] leading-none tnum">{s.value}</div>
            <div className="mt-2 text-xs font-semibold opacity-80">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="card p-5 sm:p-6">
          <SectionTitle title={L("Accuracy trend", "सटीकता का रुझान")} eyebrow={L(`Last ${recent.length} tests · best ${pct(best)}%`, `पिछले ${recent.length} टेस्ट · सर्वश्रेष्ठ ${pct(best)}%`)} />
          <div className="flex h-40 items-end gap-1.5">
            {recent.map((a, i) => (
              <Link key={a.id} href={`/practice/result?id=${a.id}`} title={`${a.title}: ${pct(a)}%`} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="font-mono text-[11px] text-ink-3 tnum">{pct(a)}</span>
                <span className={cx("grow-y w-full rounded-t-xl rounded-b-md transition group-hover:brightness-110", barTone(pct(a)))} style={{ height: `${Math.max(4, pct(a))}%`, "--i": i } as React.CSSProperties} />
              </Link>
            ))}
          </div>
          <div className="eyebrow mt-3 flex justify-between text-ink-3">
            <span>{L("older", "पुराने")}</span>
            <span>{L("latest", "ताज़ा")}</span>
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <SectionTitle title={L("Topics", "विषय")} eyebrow={L("From all your answers", "आपके सभी उत्तरों से")} />
          {topics.length ? (
            <div className="space-y-4">
              {[
                { title: L("Needs work", "सुधार चाहिए"), list: weak, cls: "text-bad-ink" },
                { title: L("Strongest", "सबसे मज़बूत"), list: strong, cls: "text-good-ink" },
              ].map((g) => (
                <div key={g.title}>
                  <div className={cx("eyebrow mb-2", g.cls)}>{g.title}</div>
                  {g.list.map((t) => {
                    const v = Math.round((t.correct / t.total) * 100);
                    return (
                      <div key={t.category} className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <span className="w-32 shrink-0 truncate sm:w-40">{pick(categoryById(t.category)?.label, hi ? "hi" : "en")}</span>
                        <Bar value={v} max={100} color={barTone(v)} className="h-2 flex-1" />
                        <span className="w-9 text-right font-mono text-[11px] tnum">{v}%</span>
                      </div>
                    );
                  })}
                </div>
              ))}
              {weak.length > 0 && (
                <Link href={`/practice/run?kind=weak&cats=${weak.map((w) => w.category).join(",")}`} className="btn btn-ghost mt-1 w-full text-sm">
                  <Crosshair className="size-4" /> {L("Drill weak topics", "कमज़ोर विषयों का अभ्यास")}
                </Link>
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-2">{L("Answer a few more questions and your strong and weak topics will show here.", "कुछ और प्रश्न हल करें, आपके मज़बूत और कमज़ोर विषय यहाँ दिखेंगे।")}</p>
          )}
        </div>
      </section>

      <section>
        <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {[["all", L("All", "सभी"), attempts.length] as const, ...[...counts.entries()].map(([k, n]) => [k, hi ? KINDS[k].hi : KINDS[k].label, n] as const)].map(([k, label, n]) => (
            <button key={k} onClick={() => setFilter(k)} className="chip shrink-0" aria-pressed={filter === k}>
              {label} <span className="font-mono text-[11px] opacity-60">{n}</span>
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {[...byMonth.entries()].map(([month, list]) => (
            <div key={month}>
              <h2 className="eyebrow mb-3 text-ink-3">{month}</h2>
              <div className="stagger grid gap-3 lg:grid-cols-2">
                {list.map((a) => {
                  const k = KINDS[kindOf(a)];
                  const v = pct(a);
                  const wrong = answeredCount(a) - a.correct;
                  const skipped = a.mcqIds.length - answeredCount(a);
                  return (
                    <article key={a.id} className="card lift p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <span className={cx("grid size-11 shrink-0 place-items-center rounded-[14px]", k.tone)}>
                          <k.icon className="size-5" strokeWidth={2} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[15px] font-semibold">{a.title}</div>
                          <div className="mt-0.5 text-xs text-ink-3">
                            {new Date(a.finishedAt).toLocaleString(hi ? "hi-IN" : "en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} · {hi ? k.hi : k.label}
                            {a.config.timed && ` · ${L("timed", "समयबद्ध")}`}
                            {a.config.negative > 0 && ` · −${Math.abs(a.config.negative - 1 / 3) < 0.01 ? "⅓" : a.config.negative}`}
                          </div>
                          <div className="mt-1 font-mono text-[11px] text-ink-3 tnum">
                            {L("Score", "अंक")} {a.score.toFixed(a.config.negative ? 2 : 0)}/{a.mcqIds.length}
                          </div>
                        </div>
                        <ProgressRing value={v} max={100} size={52} stroke={5} color={ringTone(v)} label={`${v}%`}>
                          <span className="font-mono text-xs font-semibold tnum">{v}</span>
                        </ProgressRing>
                      </div>

                      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-line">
                        <span className="bg-good" style={{ width: `${(a.correct / a.mcqIds.length) * 100}%` }} />
                        <span className="bg-bad" style={{ width: `${(wrong / a.mcqIds.length) * 100}%` }} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-ink-2">
                        <span className="text-good-ink">
                          {a.correct} {L("correct", "सही")}
                        </span>
                        <span className="text-bad-ink">
                          {wrong} {L("wrong", "ग़लत")}
                        </span>
                        <span>
                          {skipped} {L("skipped", "छोड़े")}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" /> {fmtDuration(seconds(a))}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link href={`/practice/result?id=${a.id}`} className="btn btn-ghost px-4 text-xs">
                          <Eye className="size-4" /> {L("Review & analysis", "समीक्षा व विश्लेषण")}
                        </Link>
                        <Link href={retryHref(a, a.mcqIds, hi ? "दोबारा" : "Retry")} className="btn btn-ghost px-4 text-xs">
                          <RotateCcw className="size-4" /> {L("Retry", "दोबारा दें")}
                        </Link>
                        {a.missedIds && a.missedIds.length > 0 && (
                          <Link href={retryHref(a, a.missedIds, hi ? "ग़लतियाँ" : "Mistakes")} className="btn btn-bad px-4 text-xs">
                            {L(`Retry ${a.missedIds.length} mistakes`, `${a.missedIds.length} ग़लतियाँ दोबारा`)}
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="eyebrow text-ink-3">{L("Test history is stored on this device (last 100 tests).", "टेस्ट इतिहास इसी डिवाइस पर सहेजा है (पिछले 100 टेस्ट)।")}</p>
    </div>
  );
}
