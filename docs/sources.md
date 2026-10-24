# Source audit (checked live 2026-10-23)

| Source | Access | robots / licence | Mode in CurrentKosh |
|---|---|---|---|
| **PIB** | RSS `pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3` (redirects to Hindi from some IPs); listing page `allRel.aspx?reg=3&lang=1`; release pages `PressReleaseDetail.aspx?PRID=` | PIB copyright policy allows reuse with credit and accurate reproduction. Its Akamai edge returns 403 to bursts of automated requests. | **ai** (full text) |
| **AIR (newsonair.gov.in)** | `/category/{national,international,business,sports}/feed/`, with full text in `content:encoded` | robots allows all; public broadcaster | **ai** |
| **DD News** | `/en/category/{national,…}/feed/`, full text | robots allows all; public broadcaster | **ai** |
| **RBI** | `rbi.org.in/pressreleases_rss.xml`, full text in description | official regulator releases | **ai** |
| **PRS India** | no RSS; `prsindia.org/billtrack` (Crawl-delay 10) | **CC BY 4.0** | reference (ingestion planned) |
| **Yojana / Kurukshetra** | old PDFs at predictable URLs; the 2025–26 URL scheme is unknown | government; articles have external authors | reference (planned) |
| **The Hindu** | `/<section>/feeder/default.rss` | robots **disallows ClaudeBot, GPTBot and other AI crawlers** | **link** (headline + URL only, never sent to AI) |
| **Indian Express** | `/section/<name>/feed/` | robots **disallows ClaudeBot, anthropic-ai and others** | **link** |
| **Drishti IAS** | `/rss` (mostly site links) | copyrighted | **link** |
| **AffairsCloud** | `/feed/` | copyrighted | **link** |
| Vision IAS, Adda247, Testbook, Jagran Josh, GKToday (feed is 410), IndiaBix, Oliveboard (robots disallows feeds), BYJU'S, Unacademy, StudyIQ (robots disallows CA crawling) | listing pages only | copyrighted | **reference** (curated link-out) |

**Gap fill (since 24 Oct 2026).** For an exam topic that no official source covers, the routine may use:

- **`primary`**: the announcing body's own site, such as an award committee, sports federation, UN agency, court or company release. It gets a full story.
- **`press`**: a short one-liner, written fresh from facts that **2+ independent outlets** confirm. `news:publish` rejects a press-only story with fewer than 2 different outlet domains, and rejects any press URL on a `link`/`reference` domain above. The story page lists these under "Press reports (facts cross-checked)" with a matching note.

Rules enforced in code (`src/lib/ingest/fetch.ts`):

- Items from `link` sources are stored with **headline and URL only**: no snippet, no body.
- Only items from government and publication sources go to triage and story writing.
- `reference` sources are never fetched.
- Requests send an honest User-Agent, with delays between requests.
