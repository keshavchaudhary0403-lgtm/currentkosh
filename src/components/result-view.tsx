"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, MinusCircle, RotateCcw, Timer, XCircle } from "lucide-react";
import type { Attempt } from "@/lib/progress-store";
import { categoryById, pick, type Lang } from "@/lib/taxonomy";
import { McqReview } from "./mcq-review";
import type { Question } from "./quiz-runner";
import { Bar, Confetti, ProgressRing } from "./ui";

export function ResultView({ attempt, questions, lang }: { attempt: Attempt; questions: Question[]; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const byId = new Map(questions.map((q) => [q.id, q]));
  const rows = attempt.mcqIds
    .map((id, i) => ({ q: byId.get(id), picked: attempt.answers[i] ?? null }))
    .filter((r): r is { q: Question; picked: number | null } => !!r.q);
  const correct = rows.filter((r) => r.picked === r.q.content.answer).length;
  const wrong = rows.filter((r) => r.picked !== null && r.picked !== r.q.content.answer).length;
  const skipped = rows.length - correct - wrong;
  const byCat = new Map<string, { total: number; correct: number }>();
  for (const r of rows) {
    const c = byCat.get(r.q.category) ?? { total: 0, correct: 0 };
    c.total++;
    if (r.picked === r.q.content.answer) c.correct++;
    byCat.set(r.q.category, c);
  }
  const minutes = Math.max(1, Math.round((new Date(attempt.finishedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000));

  const pct = Math.round((correct / Math.max(1, rows.length)) * 100);
  const tier =
    pct >= 70
      ? {
          bg: "bg-good",
          press: "var(--good-press)",
          msg: "Outstanding! 🏆",
          sub: "You're exam-ready on these topics.",
        }
      : pct >= 40
        ? {
            bg: "bg-accent-2",
            press: "var(--accent-2-press)",
            msg: "Good effort! 💪",
            sub: "A little revision and you'll own these.",
          }
        : {
            bg: "bg-accent",
            press: "var(--accent-press)",
            msg: "Every attempt counts! 🌱",
            sub: "Missed questions are now queued for revision.",
          };
  const tiles = [
    {
      icon: CheckCircle2,
      value: correct,
      label: "Correct",
      cls: "bg-good-soft text-good",
    },
    {
      icon: XCircle,
      value: wrong,
      label: "Wrong",
      cls: "bg-bad-soft text-bad",
    },
    {
      icon: MinusCircle,
      value: skipped,
      label: "Skipped",
      cls: "bg-surface-2 text-ink-2",
    },
    {
      icon: Timer,
      value: `${minutes}m`,
      label: "Time",
      cls: "bg-accent-soft text-accent",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 lg:grid lg:max-w-none lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0">
      <div className="space-y-6">
        <Link
          href="/practice"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-surface px-3 py-1 text-sm font-bold text-ink-2 hover:text-ink"
        >
          <ArrowLeft className="size-4" /> Practice
        </Link>
        <section className={`pop relative overflow-hidden rounded-3xl p-6 text-center text-white sm:p-8 ${tier.bg}`}>
          {pct >= 70 && <Confetti pieces={44} />}
          <div className="text-xs font-bold text-white/80">{attempt.title}</div>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl">{tier.msg}</h1>
          <div className="mx-auto mt-5 w-fit">
            <ProgressRing value={correct} max={rows.length || 1} size={140} stroke={14} color="#fff" track={tier.press}>
              <div>
                <div className="font-display text-4xl leading-none">{pct}%</div>
                <div className="mt-1 text-xs font-bold text-white/80">accuracy</div>
              </div>
            </ProgressRing>
          </div>
          <div className="mt-4 font-display text-xl">
            Score {attempt.score.toFixed(attempt.config.negative ? 2 : 0)} <span className="text-white/70">/ {rows.length}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-white/85">{tier.sub}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/practice#weak" className="btn btn-white px-5 py-3 text-sm">
              <RotateCcw className="size-4" strokeWidth={2.6} /> More practice
            </Link>
            {wrong + skipped > 0 && (
              <Link href="/revise" className="btn px-5 py-3 text-sm [--b:rgb(255_255_255/0.18)]">
                Revise missed
              </Link>
            )}
          </div>
        </section>

        <section className="grid grid-cols-4 gap-2">
          {tiles.map(({ icon: Icon, value, label, cls }) => (
            <div key={label} className={`rounded-2xl px-2 py-3 text-center ${cls}`}>
              <Icon className="mx-auto size-5" strokeWidth={2.4} />
              <div className="mt-1 font-display text-xl leading-none">{value}</div>
              <div className="mt-1 text-[11px] font-bold opacity-80">{label}</div>
            </div>
          ))}
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg">By topic</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {[...byCat.entries()].map(([cat, v]) => (
              <div key={cat} className="rounded-2xl border-2 border-line bg-surface p-3.5">
                <div className="flex justify-between text-sm font-bold">
                  <span>{pick(categoryById(cat)?.label, ui)}</span>
                  <span className="tabular-nums">
                    {v.correct}/{v.total}
                  </span>
                </div>
                <Bar
                  value={v.correct}
                  max={v.total}
                  color={v.correct / v.total >= 0.7 ? "bg-good" : v.correct / v.total >= 0.4 ? "bg-warn" : "bg-bad"}
                  className="mt-2 h-2.5"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
      <section>
        <h2 className="mb-3 font-display text-lg">Review answers</h2>
        <McqReview
          items={rows.map((r) => ({
            id: r.q.id,
            storyId: r.q.storyId,
            content: r.q.content,
            selected: r.picked,
          }))}
          lang={lang}
        />
      </section>
    </div>
  );
}
