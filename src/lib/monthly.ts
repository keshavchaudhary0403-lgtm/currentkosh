import "server-only";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { McqContent } from "./content";
import { EXAM_IDS } from "./taxonomy";

// Monthly policy summaries (content/monthly/<source>-YYYY-MM.json), written from PRS Legislative
// Research's Monthly Policy Review (CC BY 4.0, credited on every page).

const bi = z.object({ en: z.string(), hi: z.string() });

const MonthlySchema = z.object({
  id: z.string(),
  source: z.enum(["prs"]),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  url: z.string().url(),
  title: bi,
  intro: bi,
  highlights: z.array(z.object({ title: bi, summary: bi })),
  sections: z.array(
    z.object({
      sector: bi,
      items: z.array(z.object({ title: bi, summary: bi, key_points: z.array(bi), exams: z.array(z.string()) })),
    }),
  ),
  mcqs: z.array(z.object({ question: bi, options: z.object({ en: z.array(z.string()), hi: z.array(z.string()) }), answer: z.number(), explanation: bi })),
  cards: z.array(z.object({ front: bi, back: bi })),
});
export type Monthly = z.infer<typeof MonthlySchema>;

const DIR = path.join(process.cwd(), "content", "monthly");
let cache: Monthly[] | null = null;

export function allMonthly(): Monthly[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => /^[a-z]+-\d{4}-\d{2}\.json$/.test(f)) : [];
  cache = files.map((f) => MonthlySchema.parse(JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")))).sort((a, b) => b.month.localeCompare(a.month));
  return cache;
}

export const getMonthly = (id: string) => allMonthly().find((m) => m.id === id) ?? null;

export const itemCount = (m: Monthly) => m.sections.reduce((n, s) => n + s.items.length, 0);

// Monthly questions aren't filed under a story, so their topic (for the tag and weak-area stats) is read from the wording.
const TOPICS: [string, RegExp][] = [
  ["economy", /\b(GDP|RBI|repo|inflation|bank|UPI|tax|GST|deficit|fiscal|SEBI|IRDAI|EPFO|insurance|export|import|MSP|rupee|loan|credit|insolvency|IBBI)\b/i],
  ["international", /\b(summit|BRICS|G20|visit|bilateral|treaty|UN|foreign)\b/i],
  ["environment", /\b(climate|forest|wildlife|pollution|emission|renewable|green energy)\b/i],
  ["science_tech", /\b(space|ISRO|AI|digital|telecom|semiconductor|cyber)\b/i],
  ["defence", /\b(defence|army|navy|air force|military)\b/i],
  ["social", /\b(health|education|school|labour|women|child|welfare)\b/i],
];
const topicOf = (text: string) => TOPICS.find(([, re]) => re.test(text))?.[0] ?? "polity";

/** The issue's MCQs in the shape the quiz runner expects. */
export function monthlyQuestions(m: Monthly) {
  return m.mcqs.map((q, i) => ({
    id: `${m.id}-q${i + 1}`,
    storyId: "",
    category: topicOf(`${q.question.en} ${q.options.en.join(" ")}`),
    content: { style: "direct", exams: [...EXAM_IDS], difficulty: 2, ...q } satisfies McqContent,
  }));
}
