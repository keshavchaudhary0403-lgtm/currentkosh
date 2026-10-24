import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { CardContent, DayFile, McqContent, SourceRef, StoredStory, StoryContent } from "./content";
import type { Bi, ExamId } from "./taxonomy";

// Content lives in content/ as JSON committed to git. It changes only when the daily routine
// pushes (which triggers a redeploy), so it is read once per server process in production.

export type Story = {
  id: string;
  date: string;
  content: StoryContent;
  category: string;
  gsPaper: string;
  scope: "national" | "international" | "state";
  states: string[];
  relevance: Record<ExamId, number>;
  importance: number;
  threadKey: string | null;
  sources: SourceRef[];
  mcqIds: string[];
  cardIds: string[];
};

export type Mcq = { id: string; storyId: string; category: string; storyDate: string; exams: ExamId[]; content: McqContent };
export type Card = { id: string; storyId: string; category: string; content: CardContent };
type ThreadRow = { key: string; title: Bi; updatedAt: string };

type Library = { stories: Story[]; byId: Map<string, Story>; mcqs: Map<string, Mcq>; cards: Map<string, Card>; threads: Map<string, ThreadRow> };

const CONTENT_DIR = path.join(process.cwd(), "content");
let cache: { lib: Library; stamp: string } | null = null;

function load(): Library {
  if (cache && process.env.NODE_ENV === "production") return cache.lib;
  const dir = path.join(CONTENT_DIR, "stories");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)) : [];
  // In development, re-read only when a content file has changed.
  const stamp = files.map((f) => `${f}:${fs.statSync(path.join(dir, f)).mtimeMs}`).join("|") + (fs.existsSync(path.join(CONTENT_DIR, "threads.json")) ? fs.statSync(path.join(CONTENT_DIR, "threads.json")).mtimeMs : 0);
  if (cache && cache.stamp === stamp) return cache.lib;
  const stories: Story[] = [];
  const mcqs = new Map<string, Mcq>();
  const cards = new Map<string, Card>();
  for (const f of files) {
    const day = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as DayFile;
    for (const s of day.stories) stories.push(toStory(s, mcqs, cards));
  }
  stories.sort((a, b) => (a.date === b.date ? b.importance - a.importance : b.date.localeCompare(a.date)));
  const threadsFile = path.join(CONTENT_DIR, "threads.json");
  const threads = new Map<string, ThreadRow>(
    (fs.existsSync(threadsFile) ? (JSON.parse(fs.readFileSync(threadsFile, "utf8")) as ThreadRow[]) : []).map((t) => [t.key, t]),
  );
  const lib = { stories, byId: new Map(stories.map((s) => [s.id, s])), mcqs, cards, threads };
  cache = { lib, stamp };
  return lib;
}

function toStory(s: StoredStory, mcqs: Map<string, Mcq>, cards: Map<string, Card>): Story {
  const mcqIds = s.mcqs.map((m, i) => {
    const id = `${s.id}~m${i}`;
    mcqs.set(id, { id, storyId: s.id, category: s.category, storyDate: s.date, exams: m.exams, content: m });
    return id;
  });
  const cardIds = s.cards.map((c, i) => {
    const id = `${s.id}~c${i}`;
    cards.set(id, { id, storyId: s.id, category: s.category, content: c });
    return id;
  });
  return {
    id: s.id,
    date: s.date,
    content: { title: s.title, summary: s.summary, key_facts: s.key_facts, why_it_matters: s.why_it_matters, mains_angle: s.mains_angle, static_link: s.static_link, glossary: s.glossary },
    category: s.category,
    gsPaper: s.gs_paper,
    scope: s.scope,
    states: s.states,
    relevance: s.relevance,
    importance: s.importance,
    threadKey: s.thread_key || null,
    sources: s.sources,
    mcqIds,
    cardIds,
  };
}

type Aspirant = { exams: ExamId[]; state: string | null };

/** How much a story matters to this aspirant (0-3), given their exams and home state. */
export function relevanceFor(story: Story, p: Aspirant): number {
  let score = Math.max(0, ...p.exams.map((e) => story.relevance[e] ?? 0));
  if (p.state && story.states.includes(p.state)) {
    // Home-state news is must-know for State PSC, and still useful for everyone else.
    score = p.exams.includes("state_psc") ? 3 : Math.max(score, 2);
  } else if (story.scope === "state" && story.states.length) {
    // Another state's local news: only keep it if it is nationally significant.
    score = Math.min(score, 1);
  }
  return score;
}

const rank = (s: Story, p: Aspirant) => relevanceFor(s, p) * 10 + s.importance;

export const getStory = (id: string) => load().byId.get(id) ?? null;
export const storiesByIds = (ids: string[]) => ids.map((id) => load().byId.get(id)).filter((s): s is Story => !!s);
export const storiesBetween = (from: string, to: string) => load().stories.filter((s) => s.date >= from && s.date <= to);
export const latestStoryDate = () => load().stories[0]?.date ?? null;

export function feedFor(p: Aspirant, date: string): Story[] {
  return storiesBetween(date, date)
    .filter((s) => relevanceFor(s, p) > 0)
    .sort((a, b) => rank(b, p) - rank(a, p));
}

export function recap(p: Aspirant, from: string, to: string, limit = 40): Story[] {
  return storiesBetween(from, to)
    .filter((s) => relevanceFor(s, p) >= 2)
    .sort((a, b) => rank(b, p) - rank(a, p))
    .slice(0, limit);
}

export function storyDates(limit = 21): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of load().stories) counts.set(s.date, (counts.get(s.date) ?? 0) + 1);
  return [...counts.entries()].map(([date, count]) => ({ date, count })).slice(0, limit);
}

export const storyMonths = () => [...new Set(load().stories.map((s) => s.date.slice(0, 7)))];

export function getThread(key: string): { title: Bi; stories: Story[] } | null {
  const t = load().threads.get(key);
  if (!t) return null;
  return { title: t.title, stories: load().stories.filter((s) => s.threadKey === key).sort((a, b) => a.date.localeCompare(b.date)) };
}

export function activeThreads(limit = 12): { key: string; title: Bi; count: number; lastDate: string }[] {
  const lib = load();
  const groups = new Map<string, Story[]>();
  for (const s of lib.stories) if (s.threadKey) groups.set(s.threadKey, [...(groups.get(s.threadKey) ?? []), s]);
  return [...groups.entries()]
    .filter(([key]) => lib.threads.has(key))
    .map(([key, ss]) => ({ key, title: lib.threads.get(key)!.title, count: ss.length, lastDate: ss[0].date }))
    .sort((a, b) => b.lastDate.localeCompare(a.lastDate) || b.count - a.count)
    .slice(0, limit);
}

export type ArchiveFilter = { q?: string; category?: string; month?: string; state?: string; exam?: ExamId };

export function searchStories(f: ArchiveFilter, limit = 60): Story[] {
  const q = f.q?.toLowerCase();
  return load()
    .stories.filter(
      (s) =>
        (!q || JSON.stringify(s.content).toLowerCase().includes(q)) &&
        (!f.category || inTopic(s, f.category)) &&
        (!f.month || s.date.startsWith(f.month)) &&
        (!f.state || s.states.includes(f.state)) &&
        (!f.exam || (s.relevance[f.exam] ?? 0) >= 2),
    )
    .slice(0, limit);
}

// ── Questions & flashcards ─────────────────────────────────────────────────

export const mcqsByIds = (ids: string[]) => ids.map((id) => load().mcqs.get(id)).filter((m): m is Mcq => !!m);
export const cardsByIds = (ids: string[]) => ids.map((id) => load().cards.get(id)).filter((c): c is Card => !!c);
export const mcqsForStory = (id: string) => mcqsByIds(getStory(id)?.mcqIds ?? []);

/** Small deterministic PRNG so a test link always produces the same paper. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export type QuizSpec = { from: string; to: string; categories?: string[]; count: number; storyIds?: string[]; seed: number };

// ── Topic matching ─────────────────────────────────────────────────────────

// Observances (World X Day, Diwas, Jayanti, anniversaries, Foundation Days) are often filed under the
// subject they are about (Environment, Culture…). They also belong to "Important Days" for revision and tests.
const OBSERVANCE =
  /\b(?:World|International|National|Global)\b[^.;:]{0,60}?\bDay\b|\b(?:Diwas|Divas|Dibas|Jayanti|Purnima|Utsav)\b|\b(?:Foundation|Formation|Raising|Martyrdom|Independence|Republic|Statehood|Liberation|Accord) Day\b|\b(?:birth|death|martyrdom) anniversary\b/;

const isObservance = (s: Story) => OBSERVANCE.test(s.content.title.en);

/** Does a story belong to a topic? Its own category, plus "days" for observances filed elsewhere. */
export const inTopic = (s: Story, topic: string) => s.category === topic || (topic === "days" && isObservance(s));

// An Important Days question should test the day itself: its date, theme, occasion or who/what it honours.
const MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December";
const DAY_QUESTION = new RegExp(
  `\\b(?:observed|observes|celebrated|commemorat\\w*|theme|Day|Diwas|Divas|Jayanti|anniversary|founded|founder|birth|born|honour\\w*|tribute|marks?|marked)\\b|\\b\\d{1,2}(?:st|nd|rd|th)? (?:${MONTHS})\\b|\\b(?:${MONTHS}) \\d{1,2}\\b`,
);
const DATE_OPTION = new RegExp(`^\\s*\\d{1,2}(?:st|nd|rd|th)? (?:${MONTHS})\\b`);
const isDayQuestion = (m: Mcq) => DAY_QUESTION.test(m.content.question.en) || m.content.options.en.some((o) => DATE_OPTION.test(o));

/** Pick MCQs for a test, preferring questions written for the aspirant's exams and stories that matter to them. */
export function pickMcqs(p: Aspirant, spec: QuizSpec): string[] {
  const rand = rng(spec.seed);
  const topics = spec.categories ?? [];
  const pool = storiesBetween(spec.from, spec.to).filter(
    (s) => (!topics.length || topics.some((t) => inTopic(s, t))) && (!spec.storyIds?.length || spec.storyIds.includes(s.id)),
  );
  // In an Important Days-only test, keep questions about the observance itself and drop side details
  // (statistics, speeches) that happen to be in the same story. Fall back to all if that leaves too few.
  const daysOnly = topics.length > 0 && topics.every((t) => t === "days");
  const scored = pool.flatMap((s) => {
    const rel = relevanceFor(s, p);
    if (rel === 0 && !spec.storyIds?.length) return [];
    return mcqsByIds(s.mcqIds).map((m) => ({ m, score: rel * 3 + (m.exams.some((e) => p.exams.includes(e)) ? 2 : 0) + rand() * 2 }));
  });
  const focused = daysOnly ? scored.filter((x) => isDayQuestion(x.m)) : scored;
  const chosen = focused.length >= Math.min(spec.count, 5) ? focused : scored;
  return chosen
    .sort((a, b) => b.score - a.score)
    .slice(0, spec.count)
    .map((x) => x.m.id);
}
