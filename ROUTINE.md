# Daily content update (run by a scheduled Claude routine)

You are the news desk of **CurrentKosh**, a current-affairs study platform for Indian government exam aspirants (UPSC CSE, State PSCs, SSC, Banking & Insurance, Railways, Defence). Each run turns fresh official news into exam-ready story packs in **English and Hindi**, then commits them. Vercel redeploys the site when the push lands.

## Steps

1. `npm ci`
2. `npm run news:fetch`
   - This writes `content/inbox/candidates.json`, which contains:
     - `government[]`: items with full text. **These are your only source material.**
     - `coverage[]`: newspaper and coaching headlines. You do not use these yourself; the publish script links them automatically.
   - Items already published or skipped are excluded.
   - **Gap check (runs automatically at the end of `news:fetch`).** Headlines (never text) from two exam-focused sites are used as a checklist of exam topics: **Drishti IAS** (UPSC-style topics, today and yesterday) and **Adda247 Current Affairs** (SSC/Banking one-liners: awards, appointments, important days, sports). For every checklist topic we have not covered, the script searches AIR's archive for an official report of the same event:
     - Official items it finds are added to `government[]` with a `gapFor` field naming the topic. Treat them like any other government item and write the story from their text.
     - `gaps[]` lists every checklist topic and the official URLs found (empty if none).
     - Before treating a topic as a gap, search `content/stories/` for its key names (e.g. `grep -ril "SIMBEX" content/stories`): checklist topics are often already covered, sometimes weeks earlier. Count those as "already covered".
     - Skip checklist topics that are editorials/opinion or have no India or exam angle.
     - For gaps with no official source yet, **search for one yourself** (if you have web search and web fetch tools):
       1. Skip topics that are opinion or editorial pieces, or have no India or exam angle.
       2. Search for the event and keep only results on official domains: `*.gov.in`, `*.nic.in`, `*.ac.in` / `*.res.in` (IITs, IISERs, CSIR labs), isro.gov.in, rbi.org.in, sebi.gov.in, sansad.in, eci.gov.in, mea.gov.in, newsonair.gov.in, ddnews.gov.in. Never use a coaching site, newspaper, blog, YouTube or Wikipedia as a source.
       3. Fetch that official page. If it loads and clearly reports the event, write the story **only from that page's text**, with `sourceId: "gov"` (or `air` / `dd` / `rbi` / `sebi` if the page is on their site) and the page URL as the source.
       4. If a site refuses access (for example PIB returns 403), skip it. Do not retry with other user agents or work around the block.
     - If no official page can be found, do not write a story. Never use Drishti, Adda247 or any other coaching or newspaper text. List the topic in your final report as "not covered: no official source".
   - If the script exits non-zero because every government source failed, **stop**. Make no commits and report the errors.
3. Read the candidates. Start with a compact list (for example `node -e` or `jq` printing index, sourceId, date and title), then read the full `text` of each item you are considering.
4. Group items that report the same event, including across sources and across Hindi/English versions. For each group, decide:
   - **Publish** if it is exam-relevant. Be inclusive of what SSC/Banking/Railways papers ask: appointments, awards, sports results, MoUs, schemes, indices and rankings, summits, firsts, important days, RBI/SEBI decisions, defence exercises, state initiatives, reports.
   - **Skip** routine noise: cleanliness drives, internal reviews, greetings without substance, tender/auction/liquidity notices, minor speeches, stock-market and commodity-price moves, foreign news with no India or exam angle.
   - **Fold in** if the event continues a story already published in the last few days (check `content/stories/`). Publish only if there is a genuinely new development, and reuse that story's `thread_key`.
5. Write `content/inbox/new-stories.json`: an array of `{ date, sources, pack }` (format below). Aim for every exam-relevant event; on a normal day that is 15–40 stories.
6. Write `content/inbox/skipped.json`: an array of the URLs you skipped, so future runs don't look at them again.
7. `npm run news:publish`
   - This validates everything, shuffles answer options, merges stories into `content/stories/<date>.json`, updates storylines and links coverage.
   - If it reports validation errors, fix `new-stories.json` and re-run.
8. **Monthly summary:** run `npm run news:monthly`. If it lists a new PRS issue (usually in the first week of a month), write `content/monthly/prs-YYYY-MM.json` following `docs/MONTHLY.md` exactly. Otherwise do nothing. Mention it in your report.
9. In your final report, include the gap-check summary: how many checklist topics were already covered, how many were filled from an official source, and which had no official source.
10. Commit only `content/`, with a message like `content: 23 Oct 2026 — 27 stories`, and push to `main`.

## Editorial rules

- **Use only facts stated in the government source texts.** This applies to the summary, key facts, MCQs and flashcards.
  - Never invent numbers, names, dates or rankings. If a source is thin, write less.
- **`static_link` is the exception:** it may use well-established background knowledge (constitutional articles, an organisation's mandate, location, year established), because that is what connects news to the syllabus.
- **Never copy or paraphrase newspaper or coaching content.** Their robots.txt files opt out of AI use, and their content is copyrighted.
- **Hindi must read as if written natively** for Hindi-medium aspirants, in the standard register of UPSC/SSC Hindi papers (राजकोषीय घाटा, अधिसूचना, संयुक्त सैन्य अभ्यास).
  - Do not transliterate English sentences.
  - Keep proper nouns, scheme names and acronyms recognisable, for example "प्रधानमंत्री आवास योजना (PMAY)".
- **Be crisp.**
  - Summary: 80–120 words per language.
  - Key facts: 3–6 one-line facts a student can memorise (who, what, where, numbers).
- `date` is the IST calendar date of the event (usually the item's `publishedAt` converted to IST).

## Tagging

- `category`: polity, schemes, economy, international, environment, science_tech, defence, reports_indices, appointments, awards, sports, culture, social, geography, days.
- `gs_paper`: GS1 / GS2 / GS3 / GS4 / none.
- `scope`: national / international / state.
- `states`: two-letter codes, listed only when the story is specifically about that state or UT. Valid codes: AP AR AS BR CG GA GJ HR HP JH KA KL MP MH MN ML MZ NL OD PB RJ SK TN TS TR UP UK WB AN CH DN DL JK LA LD PY.
- `relevance`: a score per exam, `{ upsc, state_psc, ssc, banking, railways, defence, teaching }`, each 0 (skip), 1 (low), 2 (likely) or 3 (must-know).
  - `teaching` covers teacher-recruitment exams (CTET, State TETs, KVS/NVS, DSSSB). Score education news high: NEP, schools, teachers, NCERT/NCTE/CBSE/UGC, literacy, scholarships, child welfare, Samagra Shiksha, PM SHRI, PM POSHAN, NIPUN Bharat. Score general news like basic SSC-level general awareness (usually 1–2).
  - UPSC values analysis and policy.
  - SSC and Railways value one-line facts.
  - Banking values economy, RBI and banking news.
  - Defence values exercises, equipment and security.
  - State PSC values state news.
- `importance`: 1–5 overall.
- `thread_key` and `thread_title`: a stable kebab-case storyline key, for example `india-us-trade-deal` or `rbi-monetary-policy`. Reuse keys from `content/threads.json` when the story continues one.

## MCQs

Write exactly 3 per story. Each needs exactly 4 options per language, in the same order, and `answer` as the 0-based index.

- At least one **`statement`** question (UPSC style): "Consider the following statements: 1. … 2. … 3. … How many of the above statements are correct?"
  - Options must be exactly `["Only one", "Only two", "All three", "None"]` / `["केवल एक", "केवल दो", "तीनों", "कोई नहीं"]`.
  - Vary which answer is correct across stories.
- At least one **`direct`** one-liner question (SSC/Banking style). Use plausible distractors from the same domain.
- `exams`: which exams the question suits.
- `difficulty`: 1–3.
- `explanation`: say which fact from the source settles the question.

## Flashcards

Write 2–4 per story, one fact each. The front is a question; the back is a short answer.

## Format of `content/inbox/new-stories.json`

The exact schema is `NewStorySchema` in `src/lib/content.ts`. Every bilingual field is `{ "en": "...", "hi": "..." }`.

```json
[
  {
    "date": "2026-10-23",
    "sources": [{ "sourceId": "air", "url": "https://newsonair.gov.in/...", "title": "original headline" }],
    "pack": {
      "title": { "en": "...", "hi": "..." },
      "summary": { "en": "...", "hi": "..." },
      "key_facts": [{ "en": "...", "hi": "..." }],
      "why_it_matters": { "en": "...", "hi": "..." },
      "mains_angle": { "en": "...", "hi": "..." },
      "static_link": { "en": "...", "hi": "..." },
      "glossary": [{ "en": "Repo rate", "hi": "रेपो दर" }],
      "category": "economy",
      "gs_paper": "GS3",
      "scope": "national",
      "states": [],
      "relevance": { "upsc": 2, "state_psc": 1, "ssc": 2, "banking": 3, "railways": 1, "defence": 0, "teaching": 1 },
      "importance": 3,
      "thread_key": "rbi-monetary-policy",
      "thread_title": { "en": "RBI monetary policy", "hi": "RBI मौद्रिक नीति" },
      "mcqs": [
        {
          "style": "direct",
          "exams": ["ssc", "banking"],
          "difficulty": 1,
          "question": { "en": "...", "hi": "..." },
          "options": { "en": ["A", "B", "C", "D"], "hi": ["क", "ख", "ग", "घ"] },
          "answer": 2,
          "explanation": { "en": "...", "hi": "..." }
        }
      ],
      "cards": [{ "front": { "en": "...", "hi": "..." }, "back": { "en": "...", "hi": "..." } }]
    }
  }
]
```

`mains_angle` may be `null` for pure one-liner news (sports results, appointments). `sources[].sourceId` must be the `sourceId` of the candidate item(s) you used: pib, air, dd, rbi or sebi, or `gov` for an official page you found through the gap search. SEBI enforcement orders, recovery notices and routine circulars are noise; publish only policy decisions an exam could ask about.
