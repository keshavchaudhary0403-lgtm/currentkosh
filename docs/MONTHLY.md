# Brief: PRS Monthly Policy Review → CurrentKosh monthly summary

You turn one PRS Monthly Policy Review (MPR) issue into a study summary for Indian government-exam aspirants
(UPSC, State PSC, SSC, Banking, Railways, Defence, Teaching), in **English and Hindi**.

Input: `content/inbox/monthly/prs-MONTH.txt` (downloaded by `npm run news:monthly`) (plain text of the PRS page; MONTH like `september-2026`).
Output: `content/monthly/prs-YYYY-MM.json` (e.g. `prs-2026-09.json`), exactly this shape:

```json
{
  "id": "prs-2026-09",
  "source": "prs",
  "month": "2026-09",
  "url": "https://prsindia.org/policy/monthly-policy-review/september-2026",
  "title": { "en": "September 2026", "hi": "सितंबर 2026" },
  "intro": { "en": "2–3 sentences on the month's main policy themes.", "hi": "..." },
  "highlights": [ { "title": { "en": "...", "hi": "..." }, "summary": { "en": "1–2 sentences", "hi": "..." } } ],
  "sections": [
    {
      "sector": { "en": "Finance", "hi": "वित्त" },
      "items": [
        {
          "title": { "en": "short headline", "hi": "..." },
          "summary": { "en": "40–70 words: what changed, who, key numbers", "hi": "..." },
          "key_points": [ { "en": "one memorisable fact", "hi": "..." } ],
          "exams": ["upsc", "banking"]
        }
      ]
    }
  ],
  "mcqs": [
    {
      "question": { "en": "...", "hi": "..." },
      "options": { "en": ["A", "B", "C", "D"], "hi": ["क", "ख", "ग", "घ"] },
      "answer": 0,
      "explanation": { "en": "...", "hi": "..." }
    }
  ],
  "cards": [ { "front": { "en": "...", "hi": "..." }, "back": { "en": "...", "hi": "..." } } ]
}
```

Rules
- Use **only facts in the PRS text**. Never invent numbers, names or dates. Summarise in your own words; don't copy paragraphs.
- `highlights`: the issue's "Highlights of this Issue" (usually 8–10).
- `sections`: keep PRS's sector order. Include every substantive item (bills, rules, schemes, regulator decisions, reports, data releases, summits). Skip pure tables. 2–4 `key_points` per item.
- `exams`: any of upsc, state_psc, ssc, banking, railways, defence, teaching that would ask about the item.
- `mcqs`: exactly 10, mixing direct and UPSC-style statement questions; spread correct answers evenly over 0–3.
- `cards`: 8–12 flashcards on the most testable facts.
- Hindi must read natively (standard UPSC/SSC Hindi register: राजकोषीय घाटा, अधिसूचना), not transliteration; keep acronyms/scheme names recognisable, e.g. "कर्मचारी भविष्य निधि संगठन (EPFO)".
- Write valid JSON (UTF-8). Validate with: `node -e "JSON.parse(require('fs').readFileSync('content/monthly/prs-YYYY-MM.json','utf8'))"`.
- Keep scratch files only in `content/inbox/work/monthly-MONTH/`. Don't touch anything else.

Final reply, one line: `PRS MONTH: N sections, M items, 10 MCQs, K cards, JSON OK`.
