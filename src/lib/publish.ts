// Node-only helpers used by the content scripts (never imported by the web app).
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { NewStorySchema, type DayFile, type McqContent, type NewStory, type SourceRef, type StoredStory } from "./content";
import { EXAM_IDS, STATES, type Bi } from "./taxonomy";

export const CONTENT_DIR = path.join(process.cwd(), "content");
export const STORIES_DIR = path.join(CONTENT_DIR, "stories");
export const INBOX_DIR = path.join(CONTENT_DIR, "inbox");
const THREADS_FILE = path.join(CONTENT_DIR, "threads.json");
const SKIPPED_FILE = path.join(CONTENT_DIR, "skipped.json");

export type Thread = { key: string; title: Bi; updatedAt: string };
export type Skipped = { url: string; at: string };

const readJson = <T>(file: string, fallback: T): T => (fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as T) : fallback);
const writeJson = (file: string, data: unknown) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
};

export function readDays(): DayFile[] {
  if (!fs.existsSync(STORIES_DIR)) return [];
  return fs
    .readdirSync(STORIES_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
    .map((f) => readJson<DayFile>(path.join(STORIES_DIR, f), { date: f.slice(0, 10), stories: [] }));
}

export const writeDay = (day: DayFile) => writeJson(path.join(STORIES_DIR, `${day.date}.json`), day);
export const readThreads = () => readJson<Thread[]>(THREADS_FILE, []);
export const readSkipped = () => readJson<Skipped[]>(SKIPPED_FILE, []);

/** Every URL we have already published or deliberately skipped, so a run never re-processes it. */
export function seenUrls(): Set<string> {
  const urls = new Set<string>();
  for (const d of readDays()) for (const s of d.stories) for (const src of s.sources) urls.add(src.url);
  for (const s of readSkipped()) urls.add(s.url);
  return urls;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n)));

function slugify(s: string): string {
  const full = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (full.length <= 60) return full;
  const cut = full.slice(0, 61);
  return cut.slice(0, cut.lastIndexOf("-"));
}

/** Writers (human or AI) cluster correct answers; shuffle one-liner options so position gives nothing away.
 *  Statement / assertion questions keep the conventional exam order of options. */
function shuffleOptions(m: McqContent): McqContent {
  if (m.style !== "direct") return m;
  const order = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...m, options: { en: order.map((i) => m.options.en[i]), hi: order.map((i) => m.options.hi[i]) }, answer: order.indexOf(m.answer) };
}

/** Validate and normalise one new story; returns the stored form plus any problems found. */
function toStored(n: NewStory, takenIds: Set<string>): { story: StoredStory; warnings: string[] } {
  const warnings: string[] = [];
  const p = n.pack;
  const validStates = new Set<string>(STATES.map((s) => s.id));
  const mcqs = p.mcqs.flatMap((m, i) => {
    const answer = Math.round(m.answer);
    if (m.options.en.length !== 4 || m.options.hi.length !== 4 || answer < 0 || answer > 3) {
      warnings.push(`MCQ ${i + 1} dropped: needs 4 options per language and answer 0-3`);
      return [];
    }
    return [shuffleOptions({ ...m, answer, difficulty: clamp(m.difficulty, 1, 3) })];
  });
  if (mcqs.length < 2) warnings.push(`only ${mcqs.length} valid MCQs`);
  let id = `${n.date}-${slugify(p.title.en) || "story"}`;
  for (let k = 2; takenIds.has(id); k++) id = `${n.date}-${slugify(p.title.en)}-${k}`;
  takenIds.add(id);
  const threadKey = p.thread_key.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const rest: Omit<typeof p, "thread_title"> & { thread_title?: unknown } = { ...p };
  delete rest.thread_title;
  return {
    warnings,
    story: {
      ...rest,
      id,
      date: n.date,
      createdAt: new Date().toISOString(),
      sources: n.sources,
      thread_key: threadKey,
      states: p.states.filter((s) => validStates.has(s)),
      relevance: Object.fromEntries(EXAM_IDS.map((e) => [e, clamp(p.relevance[e] ?? 0, 0, 3)])) as StoredStory["relevance"],
      importance: clamp(p.importance, 1, 5),
      mcqs,
    },
  };
}

/** Merge new stories into their day files. Throws with every validation error if the inbox is malformed. */
export function publishNewStories(raw: unknown): { added: StoredStory[]; warnings: string[] } {
  const parsed = z.array(NewStorySchema).safeParse(raw);
  if (!parsed.success) {
    throw new Error(`new-stories.json is invalid:\n${parsed.error.issues.map((i) => `  [${i.path.join(".")}] ${i.message}`).join("\n")}`);
  }
  const days = new Map(readDays().map((d) => [d.date, d]));
  const taken = new Set([...days.values()].flatMap((d) => d.stories.map((s) => s.id)));
  const threads = new Map(readThreads().map((t) => [t.key, t]));
  const added: StoredStory[] = [];
  const warnings: string[] = [];
  for (const n of parsed.data) {
    const { story, warnings: w } = toStored(n, taken);
    warnings.push(...w.map((x) => `${story.id}: ${x}`));
    const day = days.get(n.date) ?? { date: n.date, stories: [] };
    day.stories.push(story);
    days.set(n.date, day);
    if (story.thread_key) threads.set(story.thread_key, { key: story.thread_key, title: n.pack.thread_title, updatedAt: new Date().toISOString() });
    added.push(story);
  }
  for (const d of days.values()) if (added.some((s) => s.date === d.date)) writeDay(d);
  writeJson(THREADS_FILE, [...threads.values()].sort((a, b) => a.key.localeCompare(b.key)));
  return { added, warnings };
}

export function recordSkipped(urls: string[]) {
  const now = new Date().toISOString();
  const cutoff = Date.now() - 21 * 86400_000;
  const kept = readSkipped().filter((s) => new Date(s.at).getTime() > cutoff);
  const have = new Set(kept.map((s) => s.url));
  for (const url of urls) if (!have.has(url)) kept.push({ url, at: now });
  writeJson(SKIPPED_FILE, kept);
}

// ── "Also covered by": match newspaper / coaching headlines to stories locally ──

const STOP = new Set(
  ("a an the of to in on for and or with by at from as is are was be has have its it this that after over into amid says said new india indian govt government minister ministry " +
    "current affairs daily quiz today news update updates analysis editorial explained upsc ssc exam questions answers " +
    "january february march april may june july august september october november december week year").split(" "),
);
const tokens = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)));

/** Attach headline-only links to the best matching recent story. Precision over recall: a wrong link misleads. */
export function linkCoverage(items: { sourceId: string; url: string; title: string; publishedAt: string | null }[]): number {
  const days = readDays().slice(-5);
  const index = days.flatMap((d) => d.stories.map((s) => ({ day: d, story: s, tok: tokens(`${s.title.en} ${s.key_facts.map((f) => f.en).join(" ")}`) })));
  const touched = new Set<DayFile>();
  let linked = 0;
  for (const it of items) {
    const tok = tokens(it.title);
    let best: { score: number; entry: (typeof index)[number] } | null = null;
    for (const entry of index) {
      if (entry.story.sources.some((s) => s.url === it.url)) {
        best = null;
        break;
      }
      const shared = [...tok].filter((w) => entry.tok.has(w)).length;
      const score = shared / Math.min(tok.size || 1, entry.tok.size || 1);
      if (((score >= 0.6 && shared >= 4) || (score >= 0.75 && shared >= 3)) && (!best || score > best.score)) best = { score, entry };
    }
    if (best) {
      const ref: SourceRef = { sourceId: it.sourceId, url: it.url, title: it.title };
      best.entry.story.sources.push(ref);
      touched.add(best.entry.day);
      linked++;
    }
  }
  for (const d of touched) writeDay(d);
  return linked;
}
