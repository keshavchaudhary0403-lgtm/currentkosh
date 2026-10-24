// Merge near-duplicate storyline keys created by parallel writers into one canonical key.
//   npm run threads:merge
import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIR, readDays, readThreads, writeDay } from "../src/lib/publish";

const ALIASES: Record<string, string> = {
  "agri-exports-gi": "agri-exports",
  "bhojshala-dhar-dispute": "bhojshala-dispute",
  "civil-aviation": "civil-aviation-india",
  "cooperative-sector-reforms": "cooperative-sector",
  "upi-digital-payments": "digital-payments-upi",
  "electoral-roll-revision": "electoral-rolls-sir",
  "electoral-roll-revision-sir": "electoral-rolls-sir",
  "europe-migration-crisis": "europe-migration",
  "fih-hockey-world-cup-2026": "hockey-world-cup-2026",
  "football-india": "football",
  "gem-public-procurement": "public-procurement-gem",
  "handloom-textiles": "handloom-and-textiles",
  "panchayati-raj-local-governance": "panchayati-raj",
  "china-russia-relations": "russia-china-relations",
  "jharkhand-recruitment-exam-protest": "recruitment-exam-integrity",
  "jharkhand-recruitment-exam-row": "recruitment-exam-integrity",
  "jharkhand-recruitment-exams": "recruitment-exam-integrity",
  "recruitment-exam-reforms": "recruitment-exam-integrity",
  "sports-policy": "sports-policy-india",
  "urban-development-schemes": "urban-development",
  "vande-mataram-150-years": "vande-mataram-150",
  "water-resources-projects": "water-resources",
};

let changed = 0;
for (const day of readDays()) {
  let touched = false;
  for (const s of day.stories) {
    const to = ALIASES[s.thread_key];
    if (to) {
      s.thread_key = to;
      touched = true;
      changed++;
    }
  }
  if (touched) writeDay(day);
}
const used = new Set(readDays().flatMap((d) => d.stories.map((s) => s.thread_key)));
const threads = readThreads().filter((t) => used.has(t.key) && !ALIASES[t.key]);
fs.writeFileSync(path.join(CONTENT_DIR, "threads.json"), JSON.stringify(threads, null, 2) + "\n");
console.log(`Re-keyed ${changed} stories; ${threads.length} storylines remain.`);
