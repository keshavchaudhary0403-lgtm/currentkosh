# CurrentKosh · करंट कोश

Current affairs for Indian government exam aspirants (UPSC, State PSC, SSC, Banking, Railways, Defence): one calm, source-cited daily brief in English and Hindi, exam-style tests, and spaced-repetition revision.

## What's inside

| Area | What it does |
|---|---|
| **Today** | A fixed, finishable brief (10 stories) ranked by relevance to *your* exams and home state, plus lower-priority stories. A date strip to go back in time. |
| **Story** | 80–120 word summary, key facts, "why it matters", Mains angle, static-GK link, Hindi glossary, official sources + "Also covered by" links, 3 exam-style MCQs, storyline timeline. EN / हिं / bilingual. |
| **Practice** | Daily quiz, weekly test, monthly tests, timed mock (−⅓), weak-area drill, custom test builder. Results by topic, full review, history. |
| **Revise** | Spaced repetition (≈1 → 3 → 7 → 21 → 60 days). Reading a story queues its flashcards; wrong answers queue the question. Weekly and monthly one-liner recaps, exam countdown. |
| **Storylines** | Every update on one issue on a single timeline, with a storyline test. |
| **Archive** | Search in English or Hindi; filter by month, topic, exam importance, state. |
| **Progress** | Streak, 18-week heatmap, accuracy by topic, facts mastered. |

## How it works

```
Claude routine (daily, cloud)                     GitHub                 Vercel
  npm run news:fetch   ── PIB · AIR · DD · RBI      │                      │
  write story packs (ROUTINE.md)                    │                      │
  npm run news:publish ── validate, merge ───────▶ content/*.json ──push──▶ redeploy ──▶ site
```

- **Content** is JSON in `content/`: one file per day in `content/stories/`, plus `threads.json` and `skipped.json`. No database and no API key: a scheduled Claude routine writes the stories, using your Claude plan, by following [`ROUTINE.md`](ROUTINE.md).
- **Your profile** (exams, state, language) is stored in a cookie. **Your progress** (stories read, tests, revision schedule) is stored in your browser's localStorage. It doesn't sync across devices until accounts are added.
- **Notes and questions come from official text** (PIB, AIR, DD News, RBI, ministry sites) or from the announcing body's own site (award committee, sports federation, UN agency, court). For an exam topic with neither, the routine writes a short one-liner from facts that at least 2 independent outlets confirm, written fresh and marked "Press reports" in the app. The Hindu, Indian Express and coaching sites block AI crawlers or are copyrighted, so they appear only as headline links and are never used as a source. See [`docs/sources.md`](docs/sources.md).

## Run locally

Requires Node 22.5+.

```bash
npm install
npm run dev          # http://localhost:3000
```

Run a content update by hand. The `news:fetch` and `news:publish` steps are what the routine runs:

```bash
npm run news:fetch   # → content/inbox/candidates.json
# write content/inbox/new-stories.json (+ skipped.json) as described in ROUTINE.md
npm run news:publish # validate + merge into content/
```

## Deploy

1. Import the GitHub repo in Vercel. Use the Next.js preset and default settings.
2. Each push to `main`, including the routine's daily content commits, redeploys the site.

## Code map

```
content/                 published stories (JSON), storylines, skipped URLs
ROUTINE.md               instructions the daily Claude routine follows
scripts/news-fetch.mts   fetch allowed sources → inbox
scripts/news-publish.mts validate + merge inbox → content/
src/lib/content.ts       zod schema for a story pack
src/lib/store.ts         reads content/, feed ranking, test selection
src/lib/progress-store.ts browser-side progress + spaced repetition
src/lib/sources.ts       allowed sources and how each may be used
src/app/(app)/           Today, story, practice, revise, storylines, archive, progress, saved, sources, settings
```

## Known gaps / next steps

- **PIB returns HTTP 403 to automated requests** from some networks (Akamai). The fetch carries on with the other sources.
- PRS (CC-BY bill tracker) and Yojana/Kurukshetra monthly issues are listed but not ingested yet.
- Accounts (phone OTP) and cloud sync for progress.
- Planned: "Ask this story", Mains answer evaluation, PDF monthly compilations, an audio brief, offline/PWA.

Research behind the design: [`docs/research.md`](docs/research.md).
