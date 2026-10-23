import "server-only";
import { cookies } from "next/headers";
import { EXAM_IDS, STATES, type ExamId, type Lang } from "./taxonomy";

// No accounts yet: the aspirant's choices live in a cookie (so the server can rank the feed),
// and their reading/test/revision history lives in the browser (see progress-store.ts).
export const PROFILE_COOKIE = "ck_profile";

export type Profile = {
  exams: ExamId[];
  state: string | null;
  lang: Lang;
  examDate: string | null;
  dailyGoal: number;
};

export function sanitizeProfile(input: Partial<Record<keyof Profile, unknown>>): Profile | null {
  const exams = Array.isArray(input.exams) ? input.exams.filter((e): e is ExamId => (EXAM_IDS as string[]).includes(e as string)) : [];
  if (!exams.length) return null;
  const state = typeof input.state === "string" && STATES.some((s) => s.id === input.state) ? input.state : null;
  const lang: Lang = input.lang === "hi" || input.lang === "bi" ? input.lang : "en";
  const examDate = typeof input.examDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.examDate) ? input.examDate : null;
  const goal = Number(input.dailyGoal);
  return { exams, state, lang, examDate, dailyGoal: Number.isFinite(goal) && goal >= 5 && goal <= 30 ? Math.round(goal) : 10 };
}

export const encodeProfile = (p: Profile) => Buffer.from(JSON.stringify(p)).toString("base64url");

export async function currentProfile(): Promise<Profile | null> {
  const raw = (await cookies()).get(PROFILE_COOKIE)?.value;
  if (!raw) return null;
  try {
    return sanitizeProfile(JSON.parse(Buffer.from(raw, "base64url").toString("utf8")));
  } catch {
    return null;
  }
}
