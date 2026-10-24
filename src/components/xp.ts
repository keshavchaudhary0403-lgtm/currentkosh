"use client";

import { istDate } from "@/lib/dates";
import { dueCount, streak, useProgress } from "@/lib/progress-store";

// XP is derived from the progress already stored in this browser; nothing new is saved.
//   reading a story 15 · a correct answer 10 · a wrong answer 2 · a revision review 3
export const XP = { read: 15, right: 10, wrong: 2, review: 3 } as const;
export const LEVEL_SIZE = 300;

type P = ReturnType<typeof useProgress>;

export function xpOf(p: P, day?: string) {
  const on = (iso: string | null | undefined) => !!iso && (!day || istDate(new Date(iso)) === day);
  let xp = 0;
  for (const at of Object.values(p.reads)) if (on(at)) xp += XP.read;
  for (const a of p.answers) if (on(a.at)) xp += a.correct ? XP.right : XP.wrong;
  for (const r of Object.values(p.reviews)) if (r.reps + r.lapses > 0 && on(r.last)) xp += XP.review;
  return xp;
}

/** Total XP, today's XP, level, progress to the next level, streak and cards due. */
export function useXp() {
  const p = useProgress();
  const total = xpOf(p);
  const today = xpOf(p, istDate());
  const level = Math.floor(total / LEVEL_SIZE) + 1;
  return { p, total, today, level, into: total % LEVEL_SIZE, streak: streak(p), due: dueCount(p) };
}
