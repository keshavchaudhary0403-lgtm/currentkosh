// Step 3 of the daily update: validate what the routine wrote, merge it into content/, link coverage.
//   npm run news:publish
// Reads content/inbox/new-stories.json (NewStory[]) and content/inbox/skipped.json (string[] of URLs),
// then removes the inbox files. Exits non-zero, without changing anything, if the stories are invalid.
import fs from "node:fs";
import path from "node:path";
import { INBOX_DIR, linkCoverage, publishNewStories, recordSkipped } from "../src/lib/publish";

const read = <T,>(name: string, fallback: T): T => {
  const file = path.join(INBOX_DIR, name);
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as T) : fallback;
};

const newStories = read<unknown[]>("new-stories.json", []);
const skipped = read<string[]>("skipped.json", []);
const candidates = read<{ coverage?: { sourceId: string; url: string; title: string; publishedAt: string | null }[] }>("candidates.json", {});

let result;
try {
  result = publishNewStories(newStories);
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
recordSkipped(skipped);
const linked = linkCoverage(candidates.coverage ?? []);

for (const s of result.added) console.log(`  + [${s.category}] ${s.title.en}  (${s.mcqs.length} MCQs, ${s.cards.length} cards)`);
for (const w of result.warnings) console.warn(`  ! ${w}`);
console.log(`\nPublished ${result.added.length} stories, recorded ${skipped.length} skipped items, linked ${linked} coverage articles.`);

for (const f of ["new-stories.json", "skipped.json", "candidates.json"]) fs.rmSync(path.join(INBOX_DIR, f), { force: true });
