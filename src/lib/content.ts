import { z } from "zod";
import { CATEGORY_IDS, EXAM_IDS, GS_PAPERS, MCQ_STYLES } from "./taxonomy";

// The exam-ready "story pack" generated for every news event. One schema is used
// for the AI's structured output, the demo seed, and what the UI reads back.

const bi = z.object({ en: z.string(), hi: z.string() });

export const McqSchema = z.object({
  style: z.enum(MCQ_STYLES),
  exams: z.array(z.enum(EXAM_IDS)),
  difficulty: z.number().describe("1 easy, 2 medium, 3 hard"),
  question: bi,
  options: z.object({ en: z.array(z.string()), hi: z.array(z.string()) }).describe("Exactly 4 options in each language, same order"),
  answer: z.number().describe("0-based index of the correct option"),
  explanation: bi,
});
export type McqContent = z.infer<typeof McqSchema>;

export const CardSchema = z.object({ front: bi, back: bi });
export type CardContent = z.infer<typeof CardSchema>;

export const StoryPackSchema = z.object({
  title: bi,
  summary: bi.describe("80-120 words each, plain and exam-focused"),
  key_facts: z.array(bi).describe("3-6 crisp facts: numbers, names, places, dates"),
  why_it_matters: bi,
  mains_angle: bi.nullable().describe("A GS Mains answer angle, or null for pure one-liner news"),
  static_link: bi.describe("Background static-GK/syllabus concept this news connects to"),
  glossary: z.array(bi).describe("Technical terms with Hindi equivalents"),
  category: z.enum(CATEGORY_IDS),
  gs_paper: z.enum(GS_PAPERS),
  scope: z.enum(["national", "international", "state"]),
  states: z.array(z.string()).describe("Two-letter state/UT codes the story is specifically about; empty if none"),
  relevance: z.object(
    Object.fromEntries(EXAM_IDS.map((id) => [id, id === "teaching" ? z.number().optional() : z.number()])) as Record<(typeof EXAM_IDS)[number], z.ZodNumber>,
  )
    .describe("0 = skip, 1 = low, 2 = likely, 3 = must-know, per exam"),
  importance: z.number().describe("1-5 overall importance"),
  thread_key: z.string().describe("kebab-case key for the ongoing storyline, reused across days"),
  thread_title: bi,
  mcqs: z.array(McqSchema).describe("3 MCQs in the styles real exams use"),
  cards: z.array(CardSchema).describe("2-4 recall flashcards, one fact each"),
});
export type StoryPack = z.infer<typeof StoryPackSchema>;

/** The reading part of a story (what the story page renders). */
export type StoryContent = Pick<
  StoryPack,
  "title" | "summary" | "key_facts" | "why_it_matters" | "mains_angle" | "static_link" | "glossary"
>;

// ── Files in content/ ──────────────────────────────────────────────────────

export const SourceRefSchema = z.object({ sourceId: z.string(), url: z.string(), title: z.string().nullable() });
export type SourceRef = z.infer<typeof SourceRefSchema>;

/** One entry the daily routine writes to content/inbox/new-stories.json. */
export const NewStorySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sources: z.array(SourceRefSchema).min(1),
  pack: StoryPackSchema,
});
export type NewStory = z.infer<typeof NewStorySchema>;

/** A published story as stored in content/stories/YYYY-MM-DD.json. */
export type StoredStory = Omit<StoryPack, "thread_title"> & { id: string; date: string; createdAt: string; sources: SourceRef[] };
export type DayFile = { date: string; stories: StoredStory[] };
