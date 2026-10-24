// Gap check: make sure nothing exam-relevant is missed.
//   npm run news:gaps        (also runs automatically at the end of news:fetch)
//
// Drishti's and Adda247's daily headlines are an exam-focused checklist. For each headline that none of our
// recent stories or fetched government items covers, search AIR's archive for an official report of
// the same event and add it to the candidates, so the routine writes the story from government text.
// Coaching text is never used: only the headline, to know the event happened.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { INBOX_DIR, readDays, seenUrls, tokens } from "../src/lib/publish";

const UA = process.env.CK_USER_AGENT ?? "CurrentKoshReader/0.1 (current-affairs study aid; +https://github.com/currentkosh)";
// Exam-focused publishers whose headlines (never text) we may read: Drishti (UPSC topics) and Adda247 (one-liners).
const CHECKLIST = new Set(["drishti", "adda247"]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Item = { sourceId: string; url: string; title: string; publishedAt: string | null; text?: string | null; gapFor?: string };
type Candidates = { generatedAt: string; report: unknown[]; government: Item[]; coverage: Item[]; gaps?: Gap[] };
type Gap = { headline: string; source: string; url: string; official: string[] };

const overlap = (a: Set<string>, b: Set<string>) => {
  const shared = [...a].filter((w) => b.has(w)).length;
  return { shared, score: shared / Math.min(a.size || 1, b.size || 1) };
};
const covers = (a: Set<string>, b: Set<string>) => {
  const { shared, score } = overlap(a, b);
  return (shared >= 2 && score >= 0.5) || (shared >= 1 && score >= 0.99 && Math.min(a.size, b.size) <= 2);
};

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

async function searchAir(query: string, since: string): Promise<{ link: string; title: string; date_gmt: string; content: string }[]> {
  const url = `https://newsonair.gov.in/wp-json/wp/v2/posts?search=${encodeURIComponent(query)}&after=${since}&per_page=5&_fields=link,title,date_gmt,content`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(45_000) });
  if (!res.ok) return [];
  const posts = (await res.json()) as { link: string; title: { rendered: string }; date_gmt: string; content: { rendered: string } }[];
  return posts.map((p) => ({ link: p.link, title: text(p.title.rendered), date_gmt: p.date_gmt, content: text(p.content.rendered) }));
}

/**
 * AIR's search needs every word to match, so long queries miss. Try a few short ones: the two most
 * distinctive words, names/acronyms on their own, and pairs of names.
 */
const COMMON = new Set(
  "high highest court bench national international global world first new develops launch launched inaugurated inaugurates relations strikes mission agreement accession scheme yojana pradhan mantri day week summit report index policy bill act challenge development production material maritime bilateral exercise naval joint oil infrastructure trade energy security".split(" "),
);

const distinctive = (headline: string) =>
  [...new Set(headline.match(/\b(?:[A-Z]{2,}[A-Za-z0-9-]*|[A-Z][a-z]{2,})\b/g) ?? [])]
    .map((w) => w.toLowerCase())
    .filter((w) => w.length > 2 && !COMMON.has(w) && tokens(w).size > 0);

async function searchVariants(headline: string, t: Set<string>, since: string) {
  const longest = [...t].sort((a, b) => b.length - a.length);
  // Capitalised words and acronyms, distinctive ones (not everyday headline words) first.
  const names = [...new Set(headline.match(/\b(?:[A-Z]{2,}[A-Za-z0-9-]*|[A-Z][a-z]{2,})\b/g) ?? [])]
    .filter((w) => t.has(w.toLowerCase()))
    .sort((a, b) => Number(COMMON.has(a.toLowerCase())) - Number(COMMON.has(b.toLowerCase())));
  const queries = [...new Set([longest.slice(0, 2).join(" "), ...names.slice(0, 3), names.slice(0, 2).join(" "), longest.slice(0, 3).join(" ")])].filter(Boolean).slice(0, 6);
  const out: Awaited<ReturnType<typeof searchAir>> = [];
  for (const q of queries) {
    out.push(...(await searchAir(q, since)));
    await sleep(500);
  }
  return out;
}

export async function findGaps() {
  const file = path.join(INBOX_DIR, "candidates.json");
  if (!fs.existsSync(file)) return console.log("gaps: no candidates.json; run news:fetch first");
  const c = JSON.parse(fs.readFileSync(file, "utf8")) as Candidates;
  const seen = seenUrls();

  const known = [
    ...readDays()
      .slice(-5)
      .flatMap((d) => d.stories.map((s) => tokens(`${s.title.en} ${s.key_facts.map((f) => f.en).join(" ")}`))),
    ...c.government.map((g) => tokens(g.title)),
  ];
  const checklist = c.coverage.filter((i) => CHECKLIST.has(i.sourceId));
  const missing = checklist.filter((i) => {
    const t = tokens(i.title);
    return t.size > 0 && !known.some((k) => covers(t, k));
  });

  const since = new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 19);
  const have = new Set(c.government.map((g) => g.url));
  const gaps: Gap[] = [];
  for (const it of missing) {
    const t = tokens(it.title);
    const found: string[] = [];
    try {
      for (const p of await searchVariants(it.title, t, since)) {
        // Confirm it is the same event: most of the headline's words appear in the official title or opening text.
        const body = tokens(`${p.title} ${p.content.slice(0, 2500)}`);
        const { shared, score } = overlap(t, body);
        if (!(score >= 0.6 && shared >= Math.min(2, t.size)) || p.content.length < 120) continue;
        // ...and the headline's distinctive names (SIMBEX, Samajik, Leh) must appear too, not just generic words.
        const key = distinctive(it.title);
        if (key.length && !key.some((w) => body.has(w))) continue;
        const acronyms = (it.title.match(/\b[A-Z]{3,}\b/g) ?? []).map((a) => a.toLowerCase());
        if (acronyms.length && !acronyms.some((a) => body.has(a))) continue;
        if (found.includes(p.link)) continue;
        found.push(p.link);
        if (have.has(p.link) || seen.has(p.link) || found.length > 2) continue;
        have.add(p.link);
        c.government.push({ sourceId: "air", url: p.link, title: p.title, publishedAt: `${p.date_gmt}Z`, text: p.content.slice(0, 12_000), gapFor: it.title });
      }
    } catch {
      // search is best-effort
    }
    gaps.push({ headline: it.title, source: it.sourceId, url: it.url, official: found });
    await sleep(700);
  }

  c.gaps = gaps;
  fs.writeFileSync(file, JSON.stringify(c, null, 2));
  const filled = gaps.filter((g) => g.official.length).length;
  console.log(`\nGap check: ${checklist.length} checklist topics, ${missing.length} not yet covered, ${filled} matched to an official source.`);
  for (const g of gaps) console.log(`  ${g.official.length ? "✓" : "·"} ${g.headline}${g.official.length ? "" : "  (no official source found)"}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await findGaps();
