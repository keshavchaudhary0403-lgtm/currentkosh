"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Clock, Flag, Flame, LayoutGrid, X } from "lucide-react";
import type { McqContent } from "@/lib/content";
import { saveAttempt, type Attempt } from "@/lib/progress-store";
import { categoryById, pick, type Lang } from "@/lib/taxonomy";
import { McqView } from "./mcq";
import { ResultView } from "./result-view";
import { catStyle } from "./category-icon";
import { Bar, Confetti } from "./ui";

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
  const last = i === questions.length - 1;
  const isRight = (j: number) => answers[j] === questions[j].content.answer;
  // Correct answers in a row, counting back from the current question (practice mode only).
  let combo = 0;
  if (!timed) for (let j = i; j >= 0 && revealed[j] && isRight(j); j--) combo++;

  const select = (a: number) => {
    setAnswers((xs) => xs.map((x, j) => (j === i ? a : x)));
    if (!timed) setRevealed((xs) => xs.map((x, j) => (j === i ? true : x)));
  };
  const next = () => (last ? finish() : setI((x) => x + 1));

  return (
    <div className="mx-auto max-w-2xl pb-16">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/practice" className="grid size-10 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink" aria-label="Quit test">
          <X className="size-6" strokeWidth={2.6} />
        </Link>
        <Bar value={i + (revealed[i] || answers[i] !== null ? 1 : 0)} max={questions.length} color="bg-accent-2" className="h-4 flex-1" />
        {timed ? (
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm font-bold tabular-nums ${remaining < 60 ? "bg-bad-soft text-bad" : "bg-surface-2 text-ink-2"}`}>
            <Clock className="size-4" />
            {String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}
          </div>
        ) : (
          <span key={combo} className={`pop flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-extrabold ${combo >= 2 ? "bg-accent-2-soft text-accent-2" : "text-ink-3"}`}>
            <Flame className="size-4" strokeWidth={2.6} /> {combo}
          </span>
        )}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="min-w-0">
          <div className="truncate text-xs font-bold text-ink-3">{title}</div>
          <div className="font-display text-lg">
            {ui === "hi" ? "प्रश्न" : "Question"} {i + 1}
            <span className="text-ink-3"> / {questions.length}</span>
          </div>
        </div>
        <button
          onClick={() => setFlags((f) => f.map((x, j) => (j === i ? !x : x)))}
          className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-bold transition ${flags[i] ? "border-warn bg-warn-soft text-warn" : "border-line text-ink-3 hover:text-ink"}`}
        >
          <Flag className="size-3.5" strokeWidth={2.5} /> {flags[i] ? "Flagged" : "Flag"}
        </button>
      </div>

      {combo >= 3 && revealed[i] && (
        <div key={`c${i}`} className="pop mb-3 rounded-2xl bg-accent-2 px-4 py-2 text-center text-sm font-extrabold text-white">
          🔥 {combo} in a row! Keep going!
        </div>
      )}

      <div key={q.id} className="rise relative rounded-3xl border-2 border-line bg-surface p-4 sm:p-6">
        {revealed[i] && isRight(i) && <Confetti key={`f${i}`} pieces={18} />}
        <div className="cat mb-3 inline-flex rounded-full bg-(--cat-tint) px-2.5 py-0.5 text-xs font-bold text-(--cat-ink)" style={catStyle(q.category)}>
          {pick(categoryById(q.category)?.label, ui)}
        </div>
        <McqView mcq={q.content} lang={lang} selected={answers[i]} reveal={revealed[i]} onSelect={revealed[i] ? undefined : select} />
        {revealed[i] && (
          <Link href={`/story/${q.storyId}`} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-accent">
            Read the story <ArrowRight className="size-4" />
          </Link>
        )}
      </div>

      <details className="group mt-6">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-ink-2">
          <LayoutGrid className="size-4" /> All questions · {answered}/{questions.length} answered
          <ChevronDown className="size-4 transition group-open:rotate-180" />
        </summary>
        <div className="mt-3 grid grid-cols-8 gap-1.5 sm:grid-cols-10">
          {questions.map((_, j) => (
            <button
              key={j}
              onClick={() => setI(j)}
              className={`aspect-square rounded-xl border-2 text-xs font-extrabold transition active:scale-90 ${j === i ? "border-accent" : "border-transparent"} ${
                flags[j]
                  ? "bg-warn-soft text-warn"
                  : revealed[j]
                    ? isRight(j)
                      ? "bg-good text-white"
                      : "bg-bad text-white"
                    : answers[j] !== null
                      ? "bg-accent text-white"
                      : "bg-surface-2 text-ink-2"
              }`}
            >
              {j + 1}
            </button>
          ))}
        </div>
        {answered < questions.length && (
          <button onClick={finish} className="mt-3 text-sm font-semibold text-ink-3 underline hover:text-ink">
            Submit now with {questions.length - answered} unanswered
          </button>
        )}
      </details>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-line bg-surface px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] lg:pl-68">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <button onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0} className="btn btn-ghost size-12 shrink-0" aria-label="Previous question">
            <ArrowLeft className="size-5" strokeWidth={2.6} />
          </button>
          {!timed && !revealed[i] ? (
            <button onClick={next} className="btn btn-ghost h-12 flex-1 text-[15px]">
              {last ? "Submit test" : "Skip"}
            </button>
          ) : (
            <button onClick={next} className={`btn h-12 flex-1 text-[15px] ${timed ? (last ? "btn-orange" : "") : isRight(i) ? "btn-green" : "btn-red"}`}>
              {last ? "Submit test" : "Continue"} <ArrowRight className="size-5" strokeWidth={2.6} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
