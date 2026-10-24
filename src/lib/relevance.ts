import type { Bi, ExamId } from "./taxonomy";

// Teaching exams (CTET, TETs, KVS/NVS, DSSSB) were added after the archive was written. Stories without
// a teaching score get one: education news is must-know, everything else counts like SSC-level awareness.
const EDUCATION = /\b(education|school|schools|teacher|teachers|NCERT|NCTE|CBSE|UGC|NEP|literacy|scholarship|Samagra Shiksha|PM SHRI|university|universities|student|students|learning|curriculum|exam|examination|child|children|anganwadi|mid-day meal|PM POSHAN|NIPUN)\b/i;
export function teachingRelevance(story: { relevance: Partial<Record<ExamId, number>>; content: { title: Bi; key_facts: Bi[] }; category: string }): number {
  if (story.relevance.teaching !== undefined) return story.relevance.teaching;
  if (EDUCATION.test(`${story.content.title.en} ${story.content.key_facts.map((f) => f.en).join(" ")}`)) return 3;
  return Math.min(story.relevance.ssc ?? 0, 2);
}
