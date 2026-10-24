"use client";

import Link from "next/link";
import { useState } from "react";
import { BookmarkCheck, CalendarRange, ClipboardList, Clock, Crosshair, Eye, RotateCcw, Target, Timer, Waypoints, Wrench, Zap, type LucideIcon } from "lucide-react";
import { useLang } from "@/components/lang-context";
import { Bar, Empty, SectionTitle, cx } from "@/components/ui";
import { accuracyByCategory, useProgress, type Attempt } from "@/lib/progress-store";
import { categoryById, pick } from "@/lib/taxonomy";

type Kind = { label: string; hi: string; icon: LucideIcon; tone: string };

const KINDS: Record<string, Kind> = {
  daily: { label: "Daily quiz", hi: "डेली क्विज़", icon: Zap, tone: "bg-accent-soft text-accent" },
  weekly: { label: "Weekly", hi: "साप्ताहिक", icon: CalendarRange, tone: "bg-teal-soft text-teal" },
  monthly: { label: "Monthly", hi: "मासिक", icon: CalendarRange, tone: "bg-violet-soft text-violet" },
  mock: { label: "Timed mock", hi: "टाइम्ड मॉक", icon: Timer, tone: "bg-accent-2-soft text-accent-2" },
  weak: { label: "Weak-area drill", hi: "कमज़ोर विषय", icon: Crosshair, tone: "bg-pink-soft text-pink" },
  thread: { label: "Timeline", hi: "घटनाक्रम", icon: Waypoints, tone: "bg-pink-soft text-pink" },
  saved: { label: "Saved", hi: "सहेजे गए", icon: BookmarkCheck, tone: "bg-violet-soft text-violet" },
  custom: { label: "Custom", hi: "अपना टेस्ट", icon: Wrench, tone: "bg-surface-2 text-ink-2" },
};

// Saved-story tests are stored as "custom"; tell them apart by title so they get their own filter.
const kindOf = (a: Attempt) => (a.kind === "custom" && /saved/i.test(a.title) ? "saved" : (KINDS[a.kind] ? a.kind : "custom"));

const pct = (a: Attempt) => Math.round((a.correct / Math.max(1, a.mcqIds.length)) * 100);
const seconds = (a: Attempt) => Math.max(1, Math.round((new Date(a.finishedAt).getTime() - new Date(a.startedAt).getTime()) / 1000));
const answeredCount = (a: Attempt) => a.answers.filter((x) => x !== null && x !== undefined).length;
const tone = (p: number) => (p >= 70 ? "text-good" : p >= 40 ? "text-accent-2" : "text-bad");
const barTone = (p: number) => (p >= 70 ? "bg-good" : p >= 40 ? "bg-accent-2" : "bg-bad");

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
      <div className="space-y-5">
        <h1 className="font-display text-2xl sm:text-[28px]">{L("My tests", "मेरे टेस्ट")}</h1>
        <Empty title={L("No tests yet", "अभी कोई टेस्ट नहीं")} icon={<ClipboardList className="size-7" />}>
          {L("Every test you take (daily quiz, mocks, your own tests) is listed here with its score, accuracy, time and review.", "आपका हर टेस्ट यहाँ अंक, सटीकता, समय और समीक्षा के साथ दिखेगा।")}
          <div className="mt-4">
            <Link href="/practice/run?kind=daily" className="btn px-5 py-2.5 text-sm">
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
    { label: L("Tests taken", "टेस्ट दिए"), value: attempts.length, cls: "bg-accent-soft text-accent" },
    { label: L("Accuracy", "सटीकता"), value: `${Math.round((totalCorrect / Math.max(1, totalAnswered)) * 100)}%`, cls: "bg-good-soft text-good" },
    { label: L("Questions", "प्रश्न"), value: totalQs, cls: "bg-teal-soft text-teal" },
    { label: L("Avg time / Q", "औसत समय / प्रश्न"), value: `${Math.round(totalSecs / Math.max(1, totalAnswered))}s`, cls: "bg-accent-2-soft text-accent-2" },
  ];

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-[28px]">{L("My tests", "मेरे टेस्ट")}</h1>
          <p className="mt-1 text-sm font-medium text-ink-2">{L("Every test you've taken, with scores, analysis and retries.", "आपके सभी टेस्ट: अंक, विश्लेषण और दोबारा प्रयास।")}</p>
        </div>
        <Link href="/practice" className="btn btn-orange px-4 py-2.5 text-sm">
          <Target className="size-4" strokeWidth={2.6} /> {L("Take a test", "टेस्ट दें")}
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-3xl p-4 ${s.cls}`}>
            <div className="font-display text-3xl leading-none">{s.value}</div>
            <div className="mt-1.5 text-xs font-bold">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-3xl border border-line bg-surface p-5">
          <SectionTitle title={L("Accuracy trend", "सटीकता का रुझान")} eyebrow={L(`Last ${recent.length} tests · best ${pct(best)}%`, `पिछले ${recent.length} टेस्ट · सर्वश्रेष्ठ ${pct(best)}%`)} />
          <div className="flex h-36 items-end gap-1.5">
            {recent.map((a) => (
              <Link key={a.id} href={`/practice/result?id=${a.id}`} title={`${a.title}: ${pct(a)}%`} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] font-extrabold text-ink-3 tabular-nums">{pct(a)}</span>
                <span className={`w-full rounded-md transition group-hover:opacity-80 ${barTone(pct(a))}`} style={{ height: `${Math.max(4, pct(a))}%` }} />
              </Link>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-bold text-ink-3">
            <span>{L("older", "पुराने")}</span>
            <span>{L("latest", "ताज़ा")}</span>
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-5">
          <SectionTitle title={L("Topics", "विषय")} eyebrow={L("From all your answers", "आपके सभी उत्तरों से")} />
          {topics.length ? (
            <div className="space-y-3">
              {[
                { title: L("Needs work", "सुधार चाहिए"), list: weak, cls: "text-bad" },
                { title: L("Strongest", "सबसे मज़बूत"), list: strong, cls: "text-good" },
              ].map((g) => (
                <div key={g.title}>
                  <div className={`mb-1.5 text-xs font-extrabold ${g.cls}`}>{g.title}</div>
                  {g.list.map((t) => {
                    const v = Math.round((t.correct / t.total) * 100);
                    return (
                      <div key={t.category} className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
                        <span className="w-32 shrink-0 truncate sm:w-40">{pick(categoryById(t.category)?.label, hi ? "hi" : "en")}</span>
                        <Bar value={v} max={100} color={barTone(v)} className="h-2 flex-1" />
                        <span className="w-9 text-right text-xs tabular-nums">{v}%</span>
                      </div>
                    );
                  })}
                </div>
              ))}
              {weak.length > 0 && (
                <Link href={`/practice/run?kind=weak&cats=${weak.map((w) => w.category).join(",")}`} className="btn btn-ghost mt-1 w-full py-2.5 text-sm">
                  <Crosshair className="size-4" /> {L("Drill weak topics", "कमज़ोर विषयों का अभ्यास")}
                </Link>
              )}
            </div>
          ) : (
            <p className="text-sm font-medium text-ink-2">{L("Answer a few more questions and your strong and weak topics will show here.", "कुछ और प्रश्न हल करें, आपके मज़बूत और कमज़ोर विषय यहाँ दिखेंगे।")}</p>
          )}
        </div>
      </section>

      <section>
        <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {[["all", L("All", "सभी"), attempts.length] as const, ...[...counts.entries()].map(([k, n]) => [k, hi ? KINDS[k].hi : KINDS[k].label, n] as const)].map(([k, label, n]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={cx(
                "shrink-0 rounded-full border-2 px-3.5 py-1.5 text-sm font-bold whitespace-nowrap transition active:scale-95",
                filter === k ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink-2",
              )}
            >
              {label} · {n}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {[...byMonth.entries()].map(([month, list]) => (
            <div key={month}>
              <h2 className="mb-2.5 text-sm font-extrabold text-ink-3">{month}</h2>
              <div className="grid gap-2.5 lg:grid-cols-2">
                {list.map((a) => {
                  const k = KINDS[kindOf(a)];
                  const v = pct(a);
                  const wrong = answeredCount(a) - a.correct;
                  const skipped = a.mcqIds.length - answeredCount(a);
                  return (
                    <article key={a.id} className="rounded-3xl border border-line bg-surface p-4">
                      <div className="flex items-start gap-3">
                        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${k.tone}`}>
                          <k.icon className="size-5" strokeWidth={2.4} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[15px] font-bold">{a.title}</div>
                          <div className="text-xs font-semibold text-ink-3">
                            {new Date(a.finishedAt).toLocaleString(hi ? "hi-IN" : "en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} · {hi ? k.hi : k.label}
                            {a.config.timed && ` · ${L("timed", "समयबद्ध")}`}
                            {a.config.negative > 0 && ` · −${Math.abs(a.config.negative - 1 / 3) < 0.01 ? "⅓" : a.config.negative}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-display text-2xl leading-none ${tone(v)}`}>{v}%</div>
                          <div className="mt-1 text-[11px] font-bold text-ink-3 tabular-nums">
                            {a.score.toFixed(a.config.negative ? 2 : 0)}/{a.mcqIds.length}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-line">
                        <span className="bg-good" style={{ width: `${(a.correct / a.mcqIds.length) * 100}%` }} />
                        <span className="bg-bad" style={{ width: `${(wrong / a.mcqIds.length) * 100}%` }} />
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-ink-2">
                        <span className="text-good">
                          {a.correct} {L("correct", "सही")}
                        </span>
                        <span className="text-bad">
                          {wrong} {L("wrong", "ग़लत")}
                        </span>
                        <span>
                          {skipped} {L("skipped", "छोड़े")}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" /> {fmtDuration(seconds(a))}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link href={`/practice/result?id=${a.id}`} className="btn btn-ghost px-3 py-2 text-xs">
                          <Eye className="size-4" /> {L("Review & analysis", "समीक्षा व विश्लेषण")}
                        </Link>
                        <Link href={retryHref(a, a.mcqIds, hi ? "दोबारा" : "Retry")} className="btn btn-ghost px-3 py-2 text-xs">
                          <RotateCcw className="size-4" /> {L("Retry", "दोबारा दें")}
                        </Link>
                        {a.missedIds && a.missedIds.length > 0 && (
                          <Link href={retryHref(a, a.missedIds, hi ? "ग़लतियाँ" : "Mistakes")} className="btn btn-red px-3 py-2 text-xs">
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

      <p className="text-xs font-medium text-ink-3">{L("Test history is stored on this device (last 100 tests).", "टेस्ट इतिहास इसी डिवाइस पर सहेजा है (पिछले 100 टेस्ट)।")}</p>
    </div>
  );
}
