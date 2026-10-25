"use client";

import Link from "next/link";
import { ArrowLeft, Brain, CheckCircle2, MinusCircle, RotateCcw, Target, Timer, XCircle } from "lucide-react";
import type { Attempt } from "@/lib/progress-store";
import { categoryById, pick, type Lang } from "@/lib/taxonomy";
import { McqReview } from "./mcq-review";
import type { Question } from "./quiz-runner";
import { catStyle } from "./category-icon";
import { Bar, Confetti, Count, ProgressRing, cx } from "./ui";

export function ResultView({ attempt, questions, lang }: { attempt: Attempt; questions: Question[]; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const L = (en: string, hi: string) => (ui === "hi" ? hi : en);
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
      ? { ring: "#c8f135", msg: L("Outstanding.", "शानदार।"), sub: L("You're exam-ready on these topics.", "इन विषयों पर आप परीक्षा के लिए तैयार हैं।") }
      : pct >= 40
        ? { ring: "#ffc044", msg: L("Good effort.", "अच्छा प्रयास।"), sub: L("A little revision and you'll own these.", "थोड़ा दोहराव और ये आपके पक्के।") }
        : { ring: "#ff5a97", msg: L("Every attempt counts.", "हर प्रयास मायने रखता है।"), sub: L("Missed questions are now queued for revision.", "छूटे प्रश्न अब दोहराव में जुड़ गए हैं।") };
  const tiles = [
    { icon: CheckCircle2, value: correct, label: L("Correct", "सही"), cls: "bg-good-soft text-good-ink" },
    { icon: XCircle, value: wrong, label: L("Wrong", "ग़लत"), cls: "bg-bad-soft text-bad-ink" },
    { icon: MinusCircle, value: skipped, label: L("Skipped", "छोड़े"), cls: "bg-card text-ink-2 shadow-[inset_0_0_0_1px_var(--line)]" },
    { icon: Timer, value: `${minutes}m`, label: L("Time", "समय"), cls: "bg-cobalt-soft text-cobalt-ink" },
  ];
  const retryHref = `/practice/run?kind=${attempt.kind}&mcqs=${rows
    .filter((r) => r.picked !== r.q.content.answer)
    .map((r) => r.q.id)
    .join(",")}&title=${encodeURIComponent(`${L("Mistakes", "ग़लतियाँ")} · ${attempt.title}`)}`;

  return (
    <div className="space-y-6 lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0">
      <div className="space-y-4 lg:sticky lg:top-6">
        <Link href="/tests" className="group inline-flex h-11 items-center gap-2 rounded-full bg-card pr-4 pl-2 text-sm font-semibold text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] hover:text-ink">
          <span className="grid size-7 place-items-center rounded-full bg-card-2 transition group-hover:-translate-x-0.5">
            <ArrowLeft className="size-4" />
          </span>
          {L("My tests", "मेरे टेस्ट")}
        </Link>
        <section className="pop relative overflow-hidden rounded-[28px] bg-[#10110e] p-6 text-center text-[#f3f2ec] dark:bg-card dark:shadow-[inset_0_0_0_1px_var(--line-2)] sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full opacity-25 blur-3xl" style={{ background: tier.ring }} />
          {pct >= 70 && <Confetti pieces={44} />}
          <div className="eyebrow relative text-white/55 dark:text-ink-3">{attempt.title}</div>
          <h1 className="relative mt-2 font-display text-[31px] leading-none">{tier.msg}</h1>
          <div className="relative mx-auto mt-6 w-fit">
            <ProgressRing value={correct} max={rows.length || 1} size={176} stroke={14} color={tier.ring} track="rgb(255 255 255 / 0.08)" label={`${pct}% accuracy`}>
              <div>
                <div className="font-display text-[44px] leading-none">
                  <Count to={pct} />
                  <span className="text-2xl text-white/50 dark:text-ink-3">%</span>
                </div>
                <div className="eyebrow mt-1 text-white/55 dark:text-ink-3">{L("accuracy", "सटीकता")}</div>
              </div>
            </ProgressRing>
          </div>
          <div className="relative mt-5 font-mono text-sm text-white/75 dark:text-ink-2">
            {L("Score", "अंक")} <b className="text-lg text-white dark:text-ink">{attempt.score.toFixed(attempt.config.negative ? 2 : 0)}</b> / {rows.length}
          </div>
          <p className="relative mt-1 text-sm text-white/65 dark:text-ink-2">{tier.sub}</p>
          <div className="relative mt-6 grid gap-2">
            <Link href="/practice#weak" className="btn h-12 text-[15px]">
              <RotateCcw className="size-4" strokeWidth={2.4} /> {L("More practice", "और अभ्यास")}
            </Link>
            {wrong + skipped > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <Link href={retryHref} className="btn btn-glass h-12 text-sm text-white dark:text-ink dark:[--b:var(--card-2)]">
                  <Target className="size-4" /> {L("Retry mistakes", "ग़लतियाँ दोबारा")}
                </Link>
                <Link href="/revise" className="btn btn-glass h-12 text-sm text-white dark:text-ink dark:[--b:var(--card-2)]">
                  <Brain className="size-4" /> {L("Revise missed", "छूटे दोहराएँ")}
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="stagger grid grid-cols-4 gap-2">
          {tiles.map(({ icon: Icon, value, label, cls }) => (
            <div key={label} className={cx("rounded-[20px] px-2 py-3.5 text-center", cls)}>
              <Icon className="mx-auto size-5" strokeWidth={2} />
              <div className="mt-1.5 font-display text-[22px] leading-none tnum">{value}</div>
              <div className="mt-1 text-[11px] font-semibold opacity-80">{label}</div>
            </div>
          ))}
        </section>

        <section className="card p-5">
          <h2 className="eyebrow mb-4 text-ink-3">{L("By topic", "विषयवार")}</h2>
          <div className="space-y-3.5">
            {[...byCat.entries()].map(([cat, v]) => (
              <div key={cat} className="cat" style={catStyle(cat)}>
                <div className="flex justify-between gap-3 text-sm font-semibold">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="size-2 shrink-0 rounded-full bg-(--cat-solid)" />
                    <span className="truncate">{pick(categoryById(cat)?.label, ui)}</span>
                  </span>
                  <span className="font-mono text-xs tnum">
                    {v.correct}/{v.total}
                  </span>
                </div>
                <Bar value={v.correct} max={v.total} color={v.correct / v.total >= 0.7 ? "bg-good" : v.correct / v.total >= 0.4 ? "bg-amber" : "bg-bad"} className="mt-2 h-2" />
              </div>
            ))}
          </div>
        </section>
      </div>
      <section>
        <div className="mb-4">
          <div className="eyebrow mb-1 text-ink-3">{rows.length} {L("questions", "प्रश्न")}</div>
          <h2 className="font-display text-[27px] sm:text-[33px]">{L("Review answers", "उत्तर देखें")}</h2>
        </div>
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
