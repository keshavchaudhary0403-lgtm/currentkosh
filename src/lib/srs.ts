// Spaced repetition (SM-2 family, tuned for current affairs):
// a fact you miss comes back tomorrow, then the gaps stretch out (≈1 → 3 → 7 → 21 → 60 days).

export type Grade = "again" | "hard" | "good" | "easy";

export type SrsState = { interval_days: number; ease: number; reps: number; lapses: number };

export const NEW_STATE: SrsState = { interval_days: 0, ease: 2.5, reps: 0, lapses: 0 };

export function schedule(prev: SrsState, grade: Grade): SrsState & { dueInDays: number } {
  let { interval_days, ease, reps, lapses } = prev;
  if (grade === "again") {
    lapses += 1;
    reps = 0;
    ease = Math.max(1.3, ease - 0.2);
    interval_days = 1;
  } else {
    reps += 1;
    if (grade === "hard") ease = Math.max(1.3, ease - 0.15);
    if (grade === "easy") ease += 0.15;
    if (reps === 1) interval_days = grade === "easy" ? 4 : grade === "hard" ? 1 : 3;
    else if (reps === 2) interval_days = grade === "hard" ? 4 : 7;
    else interval_days = Math.round(interval_days * (grade === "hard" ? 1.2 : ease) * (grade === "easy" ? 1.3 : 1));
    interval_days = Math.min(interval_days, 180);
  }
  return { interval_days, ease, reps, lapses, dueInDays: interval_days };
}
