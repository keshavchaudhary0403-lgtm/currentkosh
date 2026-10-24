"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, Clock, Flag, Flame, LayoutGrid, X } from "lucide-react";
import type { McqContent } from "@/lib/content";
import { saveAttempt, type Attempt } from "@/lib/progress-store";
import { categoryById, pick, type Lang } from "@/lib/taxonomy";
import { McqView } from "./mcq";
import { ResultView } from "./result-view";
import { catStyle } from "./category-icon";
import { Confetti, cx } from "./ui";

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
  const [quitAsk, setQuitAsk] = useState(false);
  const router = useRouter();

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
  const hi = ui === "hi";
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
  const segState = (j: number) =>
    revealed[j] ? (isRight(j) ? "bg-good" : "bg-bad") : answers[j] !== null ? "bg-ink" : j === i ? "bg-ink-3" : "bg-line-2";
  const segmented = questions.length <= 30;
  const timeFrac = timed && seconds ? remaining / seconds : 1;

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <div className="sticky top-0 z-30 -mx-4 mb-6 px-4 pt-1 pb-3 sm:-mx-6 sm:px-6">
        <div className="glass absolute inset-0 -z-10 border-b border-line [mask-image:linear-gradient(#000_70%,transparent)]" />
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => (answered ? setQuitAsk(true) : router.push("/practice"))}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-card text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] transition hover:text-ink active:scale-90"
            aria-label="Quit test"
          >
            <X className="size-5" strokeWidth={2.4} />
          </button>
          {segmented ? (
            <div className="flex flex-1 gap-1" aria-label={`Question ${i + 1} of ${questions.length}`}>
              {questions.map((_, j) => (
                <span key={j} className={cx("h-2 flex-1 rounded-full transition-colors duration-500", segState(j), j === i && "ring-2 ring-signal ring-offset-1 ring-offset-bg")} />
              ))}
            </div>
          ) : (
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-line-2" role="progressbar" aria-valuenow={i + 1} aria-valuemax={questions.length}>
              <div className="h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${((i + (answers[i] !== null ? 1 : 0)) / questions.length) * 100}%` }} />
            </div>
          )}
          {timed ? (
            <div
              className={cx("relative flex h-11 items-center gap-1.5 overflow-hidden rounded-full px-3.5 font-mono text-sm font-semibold tnum", remaining < 60 ? "bg-bad text-white" : "bg-card shadow-[inset_0_0_0_1px_var(--line-2)]")}
              aria-live="off"
            >
              <span aria-hidden className="absolute inset-y-0 left-0 bg-signal-soft transition-[width] duration-1000 ease-linear" style={{ width: `${timeFrac * 100}%` }} />
              <Clock className="relative size-4" />
              <span className="relative">
                {String(Math.floor(remaining / 60)).padStart(2, "0")}:{String(remaining % 60).padStart(2, "0")}
              </span>
            </div>
          ) : (
            <span key={combo} className={cx("pop flex h-11 items-center gap-1 rounded-full px-3.5 text-sm font-bold tnum", combo >= 2 ? "bg-signal text-on-signal" : "bg-card text-ink-3 shadow-[inset_0_0_0_1px_var(--line-2)]")}>
              <Flame className={cx("size-4", combo >= 2 && "flicker")} strokeWidth={2.4} /> {combo}
            </span>
          )}
        </div>
      </div>

      {quitAsk && (
        <div className="popover mb-5 flex flex-wrap items-center gap-2 rounded-[22px] bg-bad-soft p-3 pl-4">
          <span className="flex-1 text-sm font-semibold text-bad-ink">{hi ? `छोड़ें? आपके ${answered} उत्तर सहेजे नहीं जाएँगे।` : `Quit? Your ${answered} answers won't be saved.`}</span>
          <button onClick={() => setQuitAsk(false)} className="btn btn-ghost px-4 text-sm">
            {hi ? "जारी रखें" : "Keep going"}
          </button>
          <button onClick={finish} className="btn btn-ink px-4 text-sm">
            {hi ? "अभी जमा करें" : "Submit now"}
          </button>
          <button onClick={() => router.push("/practice")} className="btn btn-bad px-4 text-sm">
            {hi ? "छोड़ें" : "Quit"}
          </button>
        </div>
      )}

      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="eyebrow truncate text-ink-3">{title}</div>
          <div className="mt-1 font-display text-[40px] leading-none sm:text-[52px]">
            <span className="tnum">{String(i + 1).padStart(2, "0")}</span>
            <span className="text-ink-3 italic"> / {questions.length}</span>
          </div>
        </div>
        <button
          onClick={() => setFlags((f) => f.map((x, j) => (j === i ? !x : x)))}
          aria-pressed={flags[i]}
          className={cx(
            "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition active:scale-95",
            flags[i] ? "bg-amber text-[#10110e]" : "bg-card text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] hover:text-ink",
          )}
        >
          <Flag className={cx("size-4", flags[i] && "fill-current")} strokeWidth={2} /> {flags[i] ? (hi ? "चिह्नित" : "Flagged") : hi ? "चिह्नित करें" : "Flag"}
        </button>
      </div>

      {combo >= 3 && revealed[i] && (
        <div key={`c${i}`} className="pop mb-4 flex items-center justify-center gap-2 rounded-full bg-[#10110e] px-4 py-2.5 text-sm font-semibold text-[#c8f135]">
          <Flame className="flicker size-4" /> {hi ? `लगातार ${combo} सही! जारी रखें!` : `${combo} in a row! Keep going!`}
        </div>
      )}

      <div key={q.id} className="card rise relative p-5 sm:p-7">
        {revealed[i] && isRight(i) && <Confetti key={`f${i}`} pieces={22} />}
        <div className="cat mb-4 inline-flex h-7 items-center gap-1.5 rounded-full bg-(--cat-tint) px-2.5 text-xs font-semibold text-(--cat-ink)" style={catStyle(q.category)}>
          <span className="size-1.5 rounded-full bg-(--cat-solid)" />
          {pick(categoryById(q.category)?.label, ui)}
        </div>
        <McqView mcq={q.content} lang={lang} selected={answers[i]} reveal={revealed[i]} onSelect={revealed[i] ? undefined : select} />
        {revealed[i] && (
          <Link href={`/story/${q.storyId}`} className="mt-4 inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-ink-2 hover:text-ink">
            {hi ? "ख़बर पढ़ें" : "Read the story"} <ArrowUpRight className="size-4" />
          </Link>
        )}
      </div>

      <details className="group card mt-5 p-4 sm:p-5">
        <summary className="flex min-h-8 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-ink-2">
          <LayoutGrid className="size-4" /> {hi ? `सभी प्रश्न · ${answered}/${questions.length} हल` : `All questions · ${answered}/${questions.length} answered`}
          <ChevronDown className="ml-auto size-4 transition group-open:rotate-180" />
        </summary>
        <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-10">
          {questions.map((_, j) => (
            <button
              key={j}
              onClick={() => setI(j)}
              aria-label={`Question ${j + 1}`}
              className={cx(
                "aspect-square min-h-11 rounded-2xl font-mono text-xs font-semibold transition active:scale-90",
                j === i && "ring-2 ring-ink ring-offset-2 ring-offset-card",
                flags[j]
                  ? "bg-amber text-[#10110e]"
                  : revealed[j]
                    ? isRight(j)
                      ? "bg-good text-white"
                      : "bg-bad text-white"
                    : answers[j] !== null
                      ? "bg-solid text-on-solid"
                      : "bg-card-2 text-ink-2",
              )}
            >
              {j + 1}
            </button>
          ))}
        </div>
        {answered < questions.length && (
          <button onClick={finish} className="mt-4 text-sm font-semibold text-ink-3 underline underline-offset-4 hover:text-ink">
            {hi ? `${questions.length - answered} बिना उत्तर के अभी जमा करें` : `Submit now with ${questions.length - answered} unanswered`}
          </button>
        )}
      </details>

      <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(10px+env(safe-area-inset-bottom))]">
        <div className="glass mx-auto flex max-w-3xl items-center gap-2 rounded-full p-1.5 shadow-float ring-1 ring-line-2">
          <button onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0} className="btn btn-ghost size-12 shrink-0 px-0" aria-label="Previous question">
            <ArrowLeft className="size-5" strokeWidth={2.4} />
          </button>
          {!timed && !revealed[i] ? (
            <button onClick={next} className="btn btn-ghost h-12 flex-1 text-[15px]">
              {last ? (hi ? "टेस्ट जमा करें" : "Submit test") : hi ? "छोड़ें" : "Skip"}
            </button>
          ) : (
            <button onClick={next} className={cx("btn h-12 flex-1 text-[15px]", timed ? (last ? "btn-ink" : "") : isRight(i) ? "btn-good" : "btn-ink")}>
              {last ? (hi ? "टेस्ट जमा करें" : "Submit test") : hi ? "आगे" : "Continue"} <ArrowRight className="size-5" strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
