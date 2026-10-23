// Publish backfilled days: content/inbox/backfill/stories-<date>.json (+ skipped-<date>.json).
//   npm run backfill:publish
// Days are published in date order; a day whose file is invalid is reported and left in place.
import fs from "node:fs";
import path from "node:path";
import { INBOX_DIR, publishNewStories, recordSkipped } from "../src/lib/publish";

const DIR = path.join(INBOX_DIR, "backfill");
// Only publish the days named on the command line (days whose writer has finished).
const only = new Set(process.argv.slice(2));
if (!only.size) {
  console.error("Usage: npm run backfill:publish -- <YYYY-MM-DD> [...]  (only days whose agent has finished)");
  process.exit(1);
}
const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => /^stories-\d{4}-\d{2}-\d{2}\.json$/.test(f) && only.has(f.slice(8, 18))).sort() : [];
let total = 0;
for (const f of files) {
  const day = f.slice(8, 18);
  try {
    const stories = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as { date: string; sources: { url: string }[] }[];
    // Parallel writers: make sure this file really holds this day's stories, built from this day's sources.
    const candFile = path.join(DIR, `candidates-${day}.json`);
    const allowed = fs.existsSync(candFile) ? new Set((JSON.parse(fs.readFileSync(candFile, "utf8")).government as { url: string }[]).map((g) => g.url)) : null;
    const wrongDate = stories.filter((s) => s.date !== day).length;
    const foreign = allowed ? stories.flatMap((s) => s.sources).filter((src) => !allowed.has(src.url)).length : 0;
    if (wrongDate || foreign) throw new Error(`${wrongDate} stories with another date, ${foreign} sources not in this day's candidates`);
    const { added, warnings } = publishNewStories(stories);
    const skippedFile = path.join(DIR, `skipped-${day}.json`);
    if (fs.existsSync(skippedFile)) recordSkipped(JSON.parse(fs.readFileSync(skippedFile, "utf8")));
    for (const w of warnings) console.warn(`  ! ${w}`);
    for (const name of [f, `skipped-${day}.json`, `candidates-${day}.json`]) fs.rmSync(path.join(DIR, name), { force: true });
    total += added.length;
    console.log(`  ${day}: published ${added.length}`);
  } catch (e) {
    console.error(`  ${day}: NOT published — ${(e as Error).message.split("\n").slice(0, 4).join(" | ")}`);
  }
}
console.log(`Published ${total} stories from ${files.length} day files.`);
