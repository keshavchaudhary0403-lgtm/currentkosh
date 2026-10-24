"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import type { Attempt } from "@/lib/progress-store";
import { categoryById, pick, type Lang } from "@/lib/taxonomy";
import { McqReview } from "./mcq-review";
import type { Question } from "./quiz-runner";
import { ProgressRing } from "./ui";

export function ResultView({ attempt, questions, lang }: { attempt: Attempt; questions: Question[]; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const byId = new Map(questions.map((q) => [q.id, q]));
  const rows = attempt.mcqIds.map((id, i) => ({ q: byId.get(id), picked: attempt.answers[i] ?? null })).filter((r): r is { q: Question; picked: number | null } => !!r.q);
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

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href="/practice" className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" /> Practice
      </Link>
      <section className="relative overflow-hidden rounded-xl border border-line bg-surface p-6 sm:p-8">
        <div className="relative flex flex-col items-center gap-6 sm:flex-row">
          <ProgressRing value={correct} max={rows.length || 1} size={120} stroke={9}>
            <div>
              <div className="font-display text-4xl leading-none">{Math.round((correct / Math.max(1, rows.length)) * 100)}%</div>
              <div className="mt-1 text-[10px] font-semibold tracking-wider text-ink-3 uppercase">accuracy</div>
            </div>
          </ProgressRing>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-xs font-semibold tracking-wider text-ink-3 uppercase">{attempt.title}</div>
            <h1 className="mt-1 font-display text-4xl">
              Score {attempt.score.toFixed(attempt.config.negative ? 2 : 0)} <span className="text-ink-3">/ {rows.length}</span>
            </h1>
            <p className="mt-2 text-sm text-ink-2">
              <span className="text-good">{correct} correct</span> · <span className="text-bad">{wrong} wrong</span> · {skipped} skipped · {minutes} min
            </p>
            {wrong + skipped > 0 && <p className="mt-1 text-sm text-ink-2">Questions you missed are now in your revision queue for tomorrow.</p>}
          </div>
          <Link href="/practice#weak" className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold">
            <RotateCcw className="size-4" /> More practice
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold tracking-[0.14em] text-ink-3 uppercase">By topic</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {[...byCat.entries()].map(([cat, v]) => (
            <div key={cat} className="rounded-xl border border-line bg-surface p-3">
              <div className="flex justify-between text-sm">
                <span>{pick(categoryById(cat)?.label, ui)}</span>
                <span className="font-semibold tabular-nums">
                  {v.correct}/{v.total}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line-strong">
                <div className={`h-full rounded-full ${v.correct / v.total >= 0.7 ? "bg-good" : v.correct / v.total >= 0.4 ? "bg-warn" : "bg-bad"}`} style={{ width: `${(v.correct / v.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl sm:text-2xl">Review</h2>
        <McqReview items={rows.map((r) => ({ id: r.q.id, storyId: r.q.storyId, content: r.q.content, selected: r.picked }))} lang={lang} />
      </section>
    </div>
  );
}
