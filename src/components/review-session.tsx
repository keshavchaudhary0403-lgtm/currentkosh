"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Layers, PartyPopper, RotateCw, X } from "lucide-react";
import { gradeReview } from "@/lib/progress-store";
import type { CardContent, McqContent } from "@/lib/content";
import type { Grade } from "@/lib/srs";
import type { Lang } from "@/lib/taxonomy";
import { BiText, Confetti, Count, cx } from "./ui";
import { McqView } from "./mcq";

export type SessionItem =
  | { type: "card"; id: string; storyId: string; category: string; content: CardContent }
  | { type: "mcq"; id: string; storyId: string; category: string; content: McqContent };

const GRADES: { g: Grade; label: string; hint: string; hiLabel: string; hiHint: string; cls: string; key: string }[] = [
  { g: "again", label: "Again", hint: "tomorrow", hiLabel: "फिर से", hiHint: "कल", cls: "btn-bad", key: "1" },
  { g: "hard", label: "Hard", hint: "soon", hiLabel: "कठिन", hiHint: "जल्द", cls: "btn-ghost", key: "2" },
  { g: "good", label: "Good", hint: "later", hiLabel: "ठीक", hiHint: "बाद में", cls: "btn-good", key: "3" },
  { g: "easy", label: "Easy", hint: "much later", hiLabel: "आसान", hiHint: "काफ़ी बाद", cls: "", key: "4" },
];

const SWIPE = 110;

export function ReviewSession({ items, lang }: { items: SessionItem[]; lang: Lang }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [tally, setTally] = useState({ good: 0, again: 0 });
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState<0 | 1 | -1>(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; id: number; moved: boolean } | null>(null);
  const hi = lang === "hi";

  const item = items[i];
  const next = (grade: Grade, mcqCorrect?: boolean) => {
    gradeReview(item.type, item.id, grade, mcqCorrect === undefined ? undefined : { category: item.category, correct: mcqCorrect });
    setTally((t) => (grade === "again" ? { ...t, again: t.again + 1 } : { ...t, good: t.good + 1 }));
    setFlipped(false);
    setPicked(null);
    setDx(0);
    setLeaving(0);
    setI((x) => x + 1);
  };
  // Throw the card off-screen, then grade it.
  const fling = (dir: 1 | -1) => {
    if (leaving) return;
    setLeaving(dir);
    setDx(dir * 700);
    setTimeout(() => next(dir > 0 ? "good" : "again"), 260);
  };

  // Keyboard: space flips, 1–4 grade (cards only).
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    keyRef.current = (e: KeyboardEvent) => {
      if (!item || item.type !== "card" || (e.target as HTMLElement)?.closest?.("input,textarea,select")) return;
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped) {
        const g = GRADES.find((x) => x.key === e.key);
        if (g) next(g.g);
        if (e.key === "ArrowRight") fling(1);
        if (e.key === "ArrowLeft") fling(-1);
      }
    };
  });
  useEffect(() => {
    const h = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (!item) {
    const total = tally.good + tally.again;
    return (
      <div className="pop relative mx-auto max-w-md overflow-hidden rounded-[32px] bg-cobalt p-8 text-center text-white">
        <Confetti pieces={44} />
        <div aria-hidden className="absolute -top-16 -right-16 size-56 rounded-full bg-white/15 blur-2xl" />
        <PartyPopper className="relative mx-auto mb-4 size-12" strokeWidth={1.8} />
        <div className="eyebrow relative text-white/70">{total} {hi ? "कार्ड" : "cards"}</div>
        <h2 className="relative mt-1 font-display text-[44px] leading-none italic">{hi ? "सत्र पूरा!" : "Session complete."}</h2>
        <div className="relative mt-6 grid grid-cols-2 gap-2">
          <div className="rounded-[20px] bg-white/15 p-4">
            <div className="font-display text-[44px] leading-none">
              <Count to={tally.good} />
            </div>
            <div className="mt-1 text-xs font-semibold text-white/80">{hi ? "याद रहे" : "remembered"}</div>
          </div>
          <div className="rounded-[20px] bg-white/15 p-4">
            <div className="font-display text-[44px] leading-none">
              <Count to={tally.again} />
            </div>
            <div className="mt-1 text-xs font-semibold text-white/80">{hi ? "कल फिर" : "back tomorrow"}</div>
          </div>
        </div>
        <Link href="/revise" className="btn btn-ink relative mt-6 h-12 w-full text-[15px] dark:[--b:#10110e] dark:[--bt:#f3f2ec]">
          {hi ? "दोहराव पर लौटें" : "Back to Revise"}
        </Link>
      </div>
    );
  }

  const tilt = dx / 18;
  const hint = Math.min(1, Math.abs(dx) / SWIPE);

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/revise" className="grid size-11 shrink-0 place-items-center rounded-full bg-card text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] transition hover:text-ink active:scale-90" aria-label="End session">
          <X className="size-5" strokeWidth={2.4} />
        </Link>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line-2">
          <div className="h-full rounded-full bg-cobalt transition-[width] duration-500" style={{ width: `${(i / items.length) * 100}%` }} />
        </div>
        <span className="font-mono text-sm font-semibold text-ink-2 tnum">
          {i + 1}/{items.length}
        </span>
      </div>
      <div className="eyebrow mb-4 inline-flex h-7 items-center gap-1.5 rounded-full bg-cobalt-soft px-3 text-cobalt-ink">
        {item.type === "card" ? <Layers className="size-3.5" /> : <RotateCw className="size-3.5" />}
        {item.type === "card" ? (hi ? "फ़्लैशकार्ड" : "Flashcard") : hi ? "छूटा हुआ प्रश्न" : "Question you missed"}
      </div>

      {item.type === "card" ? (
        <div key={`c${item.id}`} className="rise">
          <div className="relative">
            {/* The next card peeks out from under this one. */}
            {i + 1 < items.length && <div aria-hidden className="absolute inset-x-6 -bottom-3 h-full rounded-[28px] bg-card shadow-[inset_0_0_0_1px_var(--line)]" style={{ opacity: 0.6 + hint * 0.4, transform: `scale(${0.96 + hint * 0.04})` }} />}
            <div
              role="button"
              tabIndex={0}
              aria-label={flipped ? "Show question" : "Reveal answer"}
              onPointerDown={(e) => {
                drag.current = { x: e.clientX, id: e.pointerId, moved: false };
              }}
              onPointerMove={(e) => {
                if (!drag.current || !flipped || leaving) return;
                const d = e.clientX - drag.current.x;
                if (Math.abs(d) > 6 && !drag.current.moved) {
                  drag.current.moved = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setDragging(true);
                }
                if (drag.current.moved) setDx(d);
              }}
              onPointerUp={() => {
                const d = drag.current;
                drag.current = null;
                setDragging(false);
                if (!d?.moved) return setFlipped((f) => !f);
                if (Math.abs(dx) > SWIPE) fling(dx > 0 ? 1 : -1);
                else setDx(0);
              }}
              onPointerCancel={() => {
                drag.current = null;
                setDragging(false);
                setDx(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") setFlipped((f) => !f);
              }}
              className="flip relative block w-full cursor-pointer touch-pan-y text-center select-none"
              style={{
                transform: `translateX(${dx}px) rotate(${tilt}deg)`,
                transition: dragging ? "none" : "transform 0.35s cubic-bezier(.2,.8,.2,1)",
              }}
            >
              <div className={cx("flip-inner min-h-[320px] sm:min-h-[360px]", flipped && "flipped")}>
                <div className="flip-face card flex min-h-[320px] flex-col items-center justify-center p-8 shadow-float sm:min-h-[360px]">
                  <div className="eyebrow mb-4 text-ink-3">{hi ? "प्रश्न" : "Prompt"}</div>
                  <BiText v={item.content.front} lang={lang} as="div" className="font-display text-[30px] leading-tight sm:text-[36px]" hiClassName="font-sans text-lg mt-3" />
                  <span className="mt-8 inline-flex h-9 items-center gap-2 rounded-full bg-card-2 px-3.5 text-sm font-semibold text-ink-2">
                    <RotateCw className="size-4" /> {hi ? "पलटने के लिए टैप करें" : "Tap to flip"}
                  </span>
                </div>
                <div className="flip-face flip-back flex flex-col items-center justify-center overflow-hidden rounded-[24px] bg-cobalt p-8 text-white shadow-float">
                  <div aria-hidden className="absolute -top-20 -left-20 size-60 rounded-full bg-white/10 blur-2xl" />
                  <div className="eyebrow relative mb-4 text-white/70">{hi ? "उत्तर" : "Answer"}</div>
                  <BiText v={item.content.back} lang={lang} as="div" className="relative font-display text-[30px] leading-tight sm:text-[36px]" hiClassName="font-sans text-lg font-semibold text-white/85" />
                  <span className="relative mt-8 hidden text-xs font-medium text-white/60 sm:block">{hi ? "← फिर से · ठीक →" : "Swipe ← again · good →  ·  keys 1–4"}</span>
                  <span className="relative mt-8 text-xs font-medium text-white/60 sm:hidden">{hi ? "← फिर से · ठीक →" : "Swipe ← again · good →"}</span>
                </div>
              </div>
              {/* Swipe verdict stamps */}
              <span aria-hidden className="pointer-events-none absolute top-6 left-6 -rotate-12 rounded-xl border-[3px] border-good px-3 py-1 font-mono text-lg font-bold text-good" style={{ opacity: dx > 0 ? hint : 0 }}>
                {hi ? "ठीक" : "GOOD"}
              </span>
              <span aria-hidden className="pointer-events-none absolute top-6 right-6 rotate-12 rounded-xl border-[3px] border-bad px-3 py-1 font-mono text-lg font-bold text-bad" style={{ opacity: dx < 0 ? hint : 0 }}>
                {hi ? "फिर" : "AGAIN"}
              </span>
            </div>
          </div>
          {flipped ? (
            <div className="rise mt-8">
              <div className="eyebrow mb-3 text-center text-ink-3">{hi ? "कितना याद रहा?" : "How well did you remember?"}</div>
              <div className="grid grid-cols-4 gap-2">
                {GRADES.map((g) => (
                  <button key={g.g} onClick={() => next(g.g)} className={cx("btn h-auto min-h-14 flex-col gap-0 rounded-[18px] py-2 text-[15px]", g.cls)}>
                    {hi ? g.hiLabel : g.label}
                    <span className="text-[11px] font-medium opacity-75">{hi ? g.hiHint : g.hint}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex justify-center gap-2 sm:hidden">
                <button onClick={() => fling(-1)} className="btn btn-ghost h-11 px-4 text-sm" aria-label="Again">
                  <ArrowLeft className="size-4" />
                </button>
                <button onClick={() => fling(1)} className="btn btn-ghost h-11 px-4 text-sm" aria-label="Good">
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setFlipped(true)} className="btn btn-cobalt mt-8 h-12 w-full text-[15px] sm:mx-auto sm:flex sm:w-auto sm:px-10">
              {hi ? "उत्तर देखें" : "Show answer"}
            </button>
          )}
          <Link href={`/story/${item.storyId}`} className="mt-4 inline-flex h-11 items-center text-sm font-semibold text-ink-3 hover:text-ink">
            {hi ? "ख़बर खोलें →" : "Open the story →"}
          </Link>
        </div>
      ) : (
        <div key={`m${item.id}`} className="card rise p-5 sm:p-7">
          <McqView mcq={item.content} lang={lang} selected={picked} reveal={picked !== null} onSelect={setPicked} />
          {picked !== null && (
            <button
              onClick={() => next(picked === item.content.answer ? "good" : "again", picked === item.content.answer)}
              className={cx("btn mt-5 h-12 w-full text-[15px] sm:ml-auto sm:flex sm:w-auto sm:px-10", picked === item.content.answer ? "btn-good" : "btn-ink")}
            >
              {hi ? "आगे" : "Continue"} <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
