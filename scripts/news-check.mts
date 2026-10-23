// Validate a stories file without publishing anything.
//   npm run news:check -- content/inbox/new-stories.json
import fs from "node:fs";
import { z } from "zod";
import { NewStorySchema } from "../src/lib/content";

const file = process.argv[2] ?? "content/inbox/new-stories.json";
const raw = JSON.parse(fs.readFileSync(file, "utf8"));
const parsed = z.array(NewStorySchema).safeParse(raw);
if (!parsed.success) {
  for (const i of parsed.error.issues.slice(0, 40)) console.error(`  [${i.path.join(".")}] ${i.message}`);
  console.error(`${file}: INVALID (${parsed.error.issues.length} issues)`);
  process.exit(1);
}
const problems: string[] = [];
parsed.data.forEach((s, n) => {
  const tag = `#${n} "${s.pack.title.en.slice(0, 50)}"`;
  if (s.pack.mcqs.length !== 3) problems.push(`${tag}: ${s.pack.mcqs.length} MCQs (want 3)`);
  s.pack.mcqs.forEach((m, k) => {
    if (m.options.en.length !== 4 || m.options.hi.length !== 4) problems.push(`${tag}: MCQ ${k + 1} needs 4 options per language`);
    if (m.answer < 0 || m.answer > 3) problems.push(`${tag}: MCQ ${k + 1} answer out of range`);
  });
  if (s.pack.cards.length < 2) problems.push(`${tag}: fewer than 2 flashcards`);
  if (!/[ऀ-ॿ]/.test(s.pack.summary.hi)) problems.push(`${tag}: Hindi summary has no Devanagari`);
});
for (const p of problems) console.error(`  ! ${p}`);
console.log(`${file}: ${parsed.data.length} stories, ${problems.length} problems`);
process.exit(problems.length ? 1 : 0);
