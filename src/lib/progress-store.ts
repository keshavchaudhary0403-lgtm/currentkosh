"use client";

import { useSyncExternalStore } from "react";
import { addDays, istDate } from "./dates";
import { NEW_STATE, schedule, type Grade, type SrsState } from "./srs";

// Everything the aspirant does — reading, tests, revision — is kept in this browser.
// It is per-device until accounts exist; the shape is versioned so it can be uploaded later.

export type AttemptConfig = { timed: boolean; seconds: number; negative: number };
export type Attempt = {
  id: string;
  kind: string;
  title: string;
  config: AttemptConfig;
  mcqIds: string[];
  answers: (number | null)[];
  correct: number;
  score: number;
  startedAt: string;
  finishedAt: string;
};
export type AnswerLog = { mcqId: string; category: string; correct: boolean; at: string };
export type ReviewState = SrsState & { due: string; last: string | null };
export type ItemType = "card" | "mcq";

type State = {
  v: 1;
  reads: Record<string, string>;
  bookmarks: string[];
  answers: AnswerLog[];
  attempts: Attempt[];
  reviews: Record<string, ReviewState>; // key: "card:<id>" | "mcq:<id>"
};

const KEY = "currentkosh.progress.v1";
const EMPTY: State = { v: 1, reads: {}, bookmarks: [], answers: [], attempts: [], reviews: {} };

let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...EMPTY, ...(JSON.parse(raw) as State) };
  } catch {
    // Private mode or blocked storage: run in memory for this tab.
  }
}

function commit(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  ensureLoaded();
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      loaded = false;
      ensureLoaded();
      listeners.forEach((x) => x());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => {
  ensureLoaded();
  return state;
};
const getServerSnapshot = () => EMPTY;

/** Reactive view of the stored progress. Renders the empty state on the server and first paint. */
export function useProgress(): State {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ── Mutations ──────────────────────────────────────────────────────────────

/** Wipes reading, test and revision history stored in this browser. */
export function resetProgress() {
  ensureLoaded();
  try {
    localStorage.removeItem(KEY);
  } catch {}
  commit(EMPTY);
}

const reviewKey = (type: ItemType, id: string) => `${type}:${id}`;
const inDays = (days: number) => new Date(Date.now() + days * 86400_000 - 4 * 3600_000).toISOString();

/** Reading a story queues its flashcards for tomorrow. */
export function markRead(storyId: string, cardIds: string[]) {
  ensureLoaded();
  if (state.reads[storyId]) return;
  const reviews = { ...state.reviews };
  for (const id of cardIds) {
    const k = reviewKey("card", id);
    if (!reviews[k]) reviews[k] = { ...NEW_STATE, due: inDays(1), last: null };
  }
  commit({ ...state, reads: { ...state.reads, [storyId]: new Date().toISOString() }, reviews });
}

export function toggleBookmark(storyId: string) {
  ensureLoaded();
  const has = state.bookmarks.includes(storyId);
  commit({ ...state, bookmarks: has ? state.bookmarks.filter((b) => b !== storyId) : [storyId, ...state.bookmarks] });
}

function graded(reviews: Record<string, ReviewState>, type: ItemType, id: string, grade: Grade) {
  const k = reviewKey(type, id);
  const next = schedule(reviews[k] ?? NEW_STATE, grade);
  reviews[k] = { interval_days: next.interval_days, ease: next.ease, reps: next.reps, lapses: next.lapses, due: inDays(next.dueInDays), last: new Date().toISOString() };
}

/** Save a finished test. Wrong or skipped questions go into the revision queue for tomorrow. */
export function saveAttempt(a: Omit<Attempt, "id" | "correct" | "score" | "finishedAt">, questions: { id: string; category: string; answer: number }[]): Attempt {
  ensureLoaded();
  const now = new Date().toISOString();
  const reviews = { ...state.reviews };
  const logs: AnswerLog[] = [];
  let correct = 0;
  let score = 0;
  questions.forEach((q, i) => {
    const picked = a.answers[i] ?? null;
    const ok = picked === q.answer;
    if (ok) correct++;
    if (picked !== null) {
      score += ok ? 1 : -a.config.negative;
      logs.push({ mcqId: q.id, category: q.category, correct: ok, at: now });
    }
    if (!ok) graded(reviews, "mcq", q.id, "again");
  });
  const attempt: Attempt = { ...a, id: `${Date.now().toString(36)}`, correct, score, finishedAt: now };
  commit({ ...state, reviews, answers: [...state.answers, ...logs].slice(-5000), attempts: [attempt, ...state.attempts].slice(0, 100) });
  return attempt;
}

export function gradeReview(type: ItemType, id: string, grade: Grade, log?: { category: string; correct: boolean }) {
  ensureLoaded();
  const reviews = { ...state.reviews };
  graded(reviews, type, id, grade);
  const answers = log ? [...state.answers, { mcqId: id, ...log, at: new Date().toISOString() }].slice(-5000) : state.answers;
  commit({ ...state, reviews, answers });
}

/** A one-off answer (e.g. a story's quick check): counts toward accuracy; a miss comes back in Revise. */
export function answerQuestion(mcqId: string, category: string, correct: boolean) {
  ensureLoaded();
  const reviews = { ...state.reviews };
  if (!correct) graded(reviews, "mcq", mcqId, "again");
  commit({ ...state, reviews, answers: [...state.answers, { mcqId, category, correct, at: new Date().toISOString() }].slice(-5000) });
}

/** Forget items whose content no longer exists (e.g. after a correction). */
export function pruneReviews(validKeys: Set<string>) {
  ensureLoaded();
  const reviews = Object.fromEntries(Object.entries(state.reviews).filter(([k]) => validKeys.has(k)));
  if (Object.keys(reviews).length !== Object.keys(state.reviews).length) commit({ ...state, reviews });
}

// ── Derived views ──────────────────────────────────────────────────────────

/** Items due now; `aheadDays` also pulls in what is coming up, for revising early. */
export function dueItems(s: State, limit = 30, aheadDays = 0): { type: ItemType; id: string }[] {
  const now = new Date(Date.now() + aheadDays * 86400_000).toISOString();
  return Object.entries(s.reviews)
    .filter(([, r]) => r.due <= now)
    .sort((a, b) => a[1].due.localeCompare(b[1].due))
    .slice(0, limit)
    .map(([k]) => ({ type: k.slice(0, k.indexOf(":")) as ItemType, id: k.slice(k.indexOf(":") + 1) }));
}

export const dueCount = (s: State) => {
  const now = new Date().toISOString();
  return Object.values(s.reviews).filter((r) => r.due <= now).length;
};

export function forecast(s: State, days = 7): { date: string; count: number }[] {
  const today = istDate();
  const byDay = new Map<string, number>();
  for (const r of Object.values(s.reviews)) {
    const d = istDate(new Date(r.due));
    const key = d < today ? today : d;
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(today, i);
    return { date, count: byDay.get(date) ?? 0 };
  });
}

export function activityDays(s: State): Map<string, number> {
  const days = new Map<string, number>();
  const bump = (iso: string | null) => {
    if (!iso) return;
    const d = istDate(new Date(iso));
    days.set(d, (days.get(d) ?? 0) + 1);
  };
  Object.values(s.reads).forEach(bump);
  s.answers.forEach((a) => bump(a.at));
  Object.values(s.reviews).forEach((r) => bump(r.last));
  return days;
}

export function streak(s: State): number {
  const days = activityDays(s);
  let d = istDate();
  if (!days.has(d)) d = addDays(d, -1); // today not done yet doesn't break the streak
  let n = 0;
  while (days.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function accuracyByCategory(s: State): { category: string; total: number; correct: number }[] {
  const m = new Map<string, { total: number; correct: number }>();
  for (const a of s.answers) {
    const c = m.get(a.category) ?? { total: 0, correct: 0 };
    c.total++;
    if (a.correct) c.correct++;
    m.set(a.category, c);
  }
  return [...m.entries()].map(([category, v]) => ({ category, ...v })).sort((a, b) => b.total - a.total);
}

/** The three weakest topics with enough attempts to judge. */
export const weakCategories = (s: State) =>
  accuracyByCategory(s)
    .filter((c) => c.total >= 3)
    .sort((a, b) => a.correct / a.total - b.correct / b.total)
    .slice(0, 3)
    .map((c) => c.category);

export function totals(s: State) {
  const correct = s.answers.filter((a) => a.correct).length;
  const mastered = Object.values(s.reviews).filter((r) => r.interval_days >= 21).length;
  return { read: Object.keys(s.reads).length, answered: s.answers.length, correct, mastered };
}
