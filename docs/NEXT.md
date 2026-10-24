# Where we left off (24 Oct 2026)

Start the next session from this file.

## State of the app

- Live at currentkosh.vercel.app from `main`. The theme is the first-version look: violet #5a48f5 → orange #ff7a3d gradients, Bricolage Grotesque headings, Geist body, Noto Sans Devanagari for Hindi. Older designs are kept as git tags: `theme-v1-gradient`, `theme-v2-calm`, `theme-v4-matched`.
- Favicon and app icons use the gradient book. The service worker cache is `ck-v2`, so bump it whenever the icons change.
- Daily content routines run on the other Claude account at 8:15 AM and 11:00 AM IST (crons `45 2 * * *` and `30 5 * * *`). Both follow `ROUTINE.md`.
- Built in the last session:
  - Monthly PRS summaries: `/monthly`, `content/monthly/prs-2026-04..09.json`, with tests. The brief is `docs/MONTHLY.md` and the fetch script is `npm run news:monthly`.
  - 22 one-liners on rankings, appointments and awards.
  - 9 global-index stories (`sourceId: "intl"`), limited to the list in `docs/GLOBAL-INDICES.md`.

## Ground rules (don't break these)

- Ask the user before any design change that isn't clear, and change only what was asked.
- Use official sources only. Coaching and newspaper headlines may serve only as a checklist, and their text is never copied or paraphrased.
- Don't get around bot blocking: no faked user agents, and no browser automation for PIB or other blocked sites.
- Never ask for the Supabase service_role key.

## Check after the next routine runs

- [ ] The RBI 406 fix works (RBI items come through).
- [ ] The gap check uses the Adda247 and Drishti headlines as its checklist.
- [ ] Early November: `news:monthly` picks up the PRS October 2026 issue and writes `content/monthly/prs-2026-10.json`.
- [ ] New global-index releases follow the `intl` rule.

## Remaining work (pick up when the user asks)

1. **E: Quality audit.** Review existing stories for errors, duplicates, weak MCQs and wrong exam tags.
2. **A: DD News backfill.** Fill older days from DD News.
3. **C: State government feeds.** Add official state sources for State PSC aspirants.
4. **Yojana and Kurukshetra.** Blocked: the Publications Division site is being revamped, it shows only old issues with no PDFs, and the content is government copyright. Look again later, or ask the publisher for permission.
5. **Global indices still missing.** Fill these from AIR or DD coverage when it appears:
   - WEF Gender Gap: the site returns 403.
   - IMD Competitiveness: the table loads by script.
   - Henley Passport: no India rank on the page.
   - World Bank LPI: the site returns 403.
   - Not yet released, so the daily routine should cover them: HDR 2026, UN E-Gov, ITU GCI.
6. **Offered, waiting on the user:**
   - Cold-start speed-up: load stories per day instead of all at once.
   - Supabase login and sync: the user provides the project URL and anon key only.
