"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Clock, Flag } from "lucide-react";
import type { McqContent } from "@/lib/content";
import { saveAttempt, type Attempt } from "@/lib/progress-store";
import { categoryById, pick, type Lang } from "@/lib/taxonomy";
import { McqView } from "./mcq";
import { ResultView } from "./result-view";

export type Question = { id: string; storyId: string; category: string; content: McqContent };

export function QuizRunner({
  kind,
  title,
  questions,
  lang,
  timed,
  seconds,
  negative,
}: {
  kind: string;
  title: string;
  questions: Question[];
  lang: Lang;
  timed: boolean;
  seconds: number;
  negative: number;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [flags, setFlags] = useState<boolean[]>(() => questions.map(() => false));
  const [i, setI] = useState(0);
  // Practice mode reveals each answer immediately; timed mocks only at the end.
  const [revealed, setRevealed] = useState<boolean[]>(() => questions.map(() => false));
  const [startedAt] = useState(() => new Date().toISOString());
  const [remaining, setRemaining] = useState(seconds);
  const [result, setResult] = useState<Attempt | null>(null);

  const finish = () => {
    if (result) return;
    setResult(
      saveAttempt(
        { kind, title, config: { timed, seconds, negative }, mcqIds: questions.map((q) => q.id), answers, startedAt },
        questions.map((q) => ({ id: q.id, category: q.category, answer: q.content.answer })),
      ),
    );
    window.scrollTo({ top: 0 });
  };

  // The timer auto-submits through a ref so it always uses the latest answers.
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  });
  useEffect(() => {
    if (!timed || result) return;
    const end = new Date(startedAt).getTime() + seconds * 1000;
    const tick = setInterval(() => {
      const left = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        clearInterval(tick);
        finishRef.current();
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [timed, seconds, startedAt, result]);

  if (result) return <ResultView attempt={result} questions={questions} lang={lang} />;

  const q = questions[i];
  const answered = answers.filter((a) => a !== null).length;
  const ui = lang === "bi" ? "en" : lang;

  const select = (a: number) => {
    setAnswers((xs) => xs.map((x, j) => (j === i ? a : x)));
    if (!timed) setRevealed((xs) => xs.map((x, j) => (j === i ? true : x)));
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/practice" className="grid size-9 place-items-center rounded-xl border border-line bg-surface text-ink-2 hover:text-ink" aria-label="Back">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{title}</div>
          <div className="text-xs text-ink-3">
            {answered}/{questions.length} answered{negative > 0 && ` · −${Math.abs(negative - 1 / 3) < 0.01 ? "⅓" : negative === 0.25 ? "¼" : negative} per wrong answer`}
          </div>
        </div>
        {timed && (
          <div className={`flex items-center gap-1.5 rounded-xl px-3 py-2 font-mono text-sm font-semibold tabular-nums ${remaining < 60 ? "bg-bad/10 text-bad" : "bg-surface-2"}`}>
            <Clock className="size-4" />
            {String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}
          </div>
        )}
      </div>

      <div className="mb-5 h-1 overflow-hidden rounded-full bg-line-strong">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${((i + 1) / questions.length) * 100}%` }} />
      </div>

      <div key={q.id} className="rise rounded-xl border border-line bg-surface p-5 sm:p-7">
        <div className="mb-4 flex items-center justify-between text-xs text-ink-3">
          <span className="font-semibold tracking-wider uppercase">
            Q{i + 1} · {pick(categoryById(q.category)?.label, ui)}
          </span>
          <button onClick={() => setFlags((f) => f.map((x, j) => (j === i ? !x : x)))} className={`inline-flex items-center gap-1 ${flags[i] ? "text-warn" : "hover:text-ink"}`}>
            <Flag className="size-3.5" /> {flags[i] ? "Flagged" : "Flag"}
          </button>
        </div>
        <McqView mcq={q.content} lang={lang} selected={answers[i]} reveal={revealed[i]} onSelect={revealed[i] ? undefined : select} />
        {revealed[i] && (
          <Link href={`/story/${q.storyId}`} className="mt-3 inline-block text-sm font-medium text-accent">
            Read the story →
          </Link>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <button onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0} className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium disabled:opacity-40">
          Previous
        </button>
        {i < questions.length - 1 ? (
          <button onClick={() => setI((x) => x + 1)} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-bg">
            Next <ArrowRight className="size-4" />
          </button>
        ) : (
          <button onClick={finish} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white">
            Submit test
          </button>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-2 text-xs font-semibold tracking-wider text-ink-3 uppercase">Question palette</div>
        <div className="flex flex-wrap gap-1.5">
          {questions.map((_, j) => (
            <button
              key={j}
              onClick={() => setI(j)}
              className={`size-9 rounded-lg text-xs font-semibold transition ${j === i ? "ring-2 ring-accent ring-offset-2 ring-offset-bg" : ""} ${
                flags[j] ? "bg-warn/20 text-warn" : answers[j] !== null ? "bg-ink text-bg" : "border border-line bg-surface text-ink-2"
              }`}
            >
              {j + 1}
            </button>
          ))}
        </div>
        {answered < questions.length && (
          <button onClick={finish} className="mt-4 text-sm text-ink-3 underline hover:text-ink">
            Submit now with {questions.length - answered} unanswered
          </button>
        )}
      </div>
    </div>
  );
}
