// Publish backfilled days: content/inbox/backfill/stories-<date>.json (+ skipped-<date>.json).
//   npm run backfill:publish
// Days are published in date order; a day whose file is invalid is reported and left in place.
import fs from "node:fs";
import path from "node:path";
import { INBOX_DIR, publishNewStories, recordSkipped } from "../src/lib/publish";

const DIR = path.join(INBOX_DIR, "backfill");
const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => /^stories-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort() : [];
let total = 0;
for (const f of files) {
  const day = f.slice(8, 18);
  try {
    const { added, warnings } = publishNewStories(JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")));
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
