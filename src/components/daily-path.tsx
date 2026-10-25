"use client";

import Link from "next/link";
import { Brain, Check, Flame, Newspaper, Target } from "lucide-react";
import { istDate } from "@/lib/dates";
import { useLang } from "./lang-context";
import { cx } from "./ui";
import { LEVEL_SIZE, useXp } from "./xp";

/**
 * The daily loop as a path: Read the deck → Daily quiz → Revise. Each node lights up when
 * done; the header shows today's XP, the streak and progress to the next level.
 */
export function DailyPath({ current }: { current?: "read" | "quiz" | "revise" }) {
  const lang = useLang();
  const hi = lang === "hi";
  const xp = useXp();
  const today = istDate();
  const readToday = Object.values(xp.p.reads).filter((at) => istDate(new Date(at)) === today).length;
  const quizDone = xp.p.attempts.some((a) => a.kind === "daily" && istDate(new Date(a.finishedAt)) === today);
  const steps = [
    { id: "read", href: "/", icon: Newspaper, label: hi ? "डेक पढ़ें" : "Read the deck", meta: `${Math.min(readToday, 10)}/10`, done: readToday >= 10 },
    { id: "quiz", href: "/practice/run?kind=daily", icon: Target, label: hi ? "डेली क्विज़" : "Daily quiz", meta: hi ? "10 प्रश्न" : "10 Qs", done: quizDone },
    { id: "revise", href: xp.due ? "/revise/session" : "/revise", icon: Brain, label: hi ? "दोहराएँ" : "Revise", meta: xp.due ? `${xp.due} ${hi ? "बाकी" : "due"}` : hi ? "पूरा" : "clear", done: xp.due === 0 && readToday > 0 },
  ] as const;
  const doneN = steps.filter((s) => s.done).length;
  const lead = steps.findIndex((s) => !s.done) === -1 ? 3 : steps.findIndex((s) => !s.done);

  return (
    <section className="rise relative overflow-hidden rounded-[28px] bg-[#10110e] p-5 text-[#f3f2ec] dark:bg-card dark:shadow-[inset_0_0_0_1px_var(--line-2)] sm:p-6" aria-label={hi ? "आज का रास्ता" : "Today's path"}>
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-[#c8f135] opacity-15 blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow text-white/55 dark:text-ink-3">{hi ? "आज का रास्ता" : "Today's path"}</div>
          <div className="mt-1 font-display text-[23px] leading-none sm:text-[28px]">
            {doneN === 3 ? (hi ? "सब पूरा!" : "Path complete.") : hi ? `${doneN}/3 कदम` : `${doneN} of 3 steps`}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3 dark:bg-card-2">
            <Flame className={cx("size-4 text-[#c8f135]", xp.streak > 0 && "flicker")} /> <b className="tnum">{xp.streak}</b>
          </span>
          <span className="inline-flex h-9 items-center rounded-full bg-[#c8f135] px-3 font-mono text-xs font-semibold text-[#10110e]">+{xp.today} XP</span>
        </div>
      </div>

      <ol className="relative mt-6 grid grid-cols-3 gap-2">
        {/* Track behind the nodes */}
        <span aria-hidden className="absolute top-7 right-[16.6%] left-[16.6%] h-1 rounded-full bg-white/10 dark:bg-line-2" />
        <span aria-hidden className="grow-x absolute top-7 left-[16.6%] h-1 rounded-full bg-[#c8f135] transition-all duration-700" style={{ width: `${(Math.min(2, lead) / 2) * 66.8}%` }} />
        {steps.map((s) => (
          <li key={s.id} className="relative">
            <Link href={s.href} aria-current={current === s.id ? "step" : undefined} className="group flex flex-col items-center gap-2 rounded-2xl p-1 text-center">
              <span
                className={cx(
                  "relative grid size-14 place-items-center rounded-full transition duration-300 group-hover:scale-105 group-active:scale-95",
                  s.done ? "pop bg-[#c8f135] text-[#10110e]" : current === s.id ? "bg-white text-[#10110e] ring-4 ring-[#c8f135]/40 dark:bg-ink dark:text-bg" : "bg-white/10 text-white/80 ring-1 ring-white/20 dark:bg-card-2 dark:text-ink-2 dark:ring-line-2",
                )}
              >
                {s.done ? <Check className="size-6" strokeWidth={3} /> : <s.icon className="size-6" />}
              </span>
              <span className="text-xs leading-tight font-semibold sm:text-sm">{s.label}</span>
              <span className="font-mono text-[10px] text-white/50 dark:text-ink-3">{s.meta}</span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="relative mt-5 flex items-center gap-3">
        <span className="font-mono text-xs text-white/60 dark:text-ink-3">L{xp.level}</span>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10 dark:bg-line-2">
          <span className="grow-x block h-full rounded-full bg-[#c8f135]" style={{ width: `${(xp.into / LEVEL_SIZE) * 100}%` }} />
        </span>
        <span className="font-mono text-xs text-white/60 dark:text-ink-3">
          {xp.into}/{LEVEL_SIZE}
        </span>
      </div>
    </section>
  );
}
