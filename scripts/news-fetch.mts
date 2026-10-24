// Step 1 of the daily update: fetch every allowed source and write content/inbox/candidates.json.
//   npm run news:fetch
// Government items carry full text (the routine writes notes from these). Newspaper / coaching
// items carry only headline + URL and are used for "Also covered by" links, never as source text.
import fs from "node:fs";
import path from "node:path";
import Parser from "rss-parser";
import { INBOX_DIR, seenUrls } from "../src/lib/publish";
import { SOURCES, type Source } from "../src/lib/sources";

const UA = process.env.CK_USER_AGENT ?? "CurrentKoshReader/0.1 (current-affairs study aid; +https://github.com/currentkosh)";
const parser = new Parser({ customFields: { item: [["content:encoded", "contentEncoded"]] } });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const MAX_AGE_DAYS = 3;

// Government sites are often slow; give each request time and one retry before giving up.
async function get(url: string, accept = "application/rss+xml, application/xml, text/html;q=0.9"): Promise<string> {
  let last: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: accept }, redirect: "follow", signal: AbortSignal.timeout(45_000) });
      if (res.status === 403) throw new Error("HTTP 403 (site blocks automated readers)");
      // Some servers (RBI from cloud networks) answer 406 to a specific Accept list; ask again accepting anything.
      if (res.status === 406 && accept !== "*/*") return await get(url, "*/*");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      last = e as Error;
      if (last.message.includes("403")) break;
      await sleep(3000);
    }
  }
  throw last!;
}

/** AIR's RSS often times out; its WordPress API is reliable and gives full text. English posts only. */
async function fromAirApi(since: Date): Promise<Item[]> {
  const latinShare = (t: string) => (t.match(/[A-Za-z]/g)?.length ?? 0) / Math.max(1, t.replace(/[\s\d\p{P}]/gu, "").length);
  const items: Item[] = [];
  for (let page = 1; page <= 5; page++) {
    const url = `https://newsonair.gov.in/wp-json/wp/v2/posts?per_page=100&page=${page}&after=${since.toISOString().slice(0, 19)}&_fields=link,title,content,date_gmt&orderby=date&order=desc`;
    let posts: { link: string; title: { rendered: string }; content: { rendered: string }; date_gmt: string }[];
    try {
      posts = JSON.parse(await get(url, "application/json"));
    } catch (e) {
      if (page === 1) throw e;
      break;
    }
    for (const p of posts) {
      const title = htmlToText(p.title.rendered);
      const text = htmlToText(p.content.rendered);
      if (latinShare(title) < 0.6 || text.length < 120) continue;
      items.push({ sourceId: "air", url: normalizeUrl(p.link), title, publishedAt: `${p.date_gmt}Z`, text: text.slice(0, 12_000) });
    }
    if (posts.length < 100) break;
    await sleep(700);
  }
  return items;
}

function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|nav|header|footer|form)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|li|tr|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#8217;|&#8216;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8211;|&#8212;/g, "–")
    .replace(/&#8230;|\[…\]|\[&#8230;\]/g, "…")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&[a-z]+;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

function normalizeUrl(u: string): string {
  try {
    const url = new URL(u);
    for (const k of [...url.searchParams.keys()]) if (k.startsWith("utm_")) url.searchParams.delete(k);
    url.hash = "";
    return url.toString();
  } catch {
    return u;
  }
}

// Some feeds use non-standard dates, e.g. SEBI's "23 Oct, 2026 +0530".
function parseDate(raw?: string): string | null {
  if (!raw) return null;
  const d = new Date(raw.replace(/(\d{1,2} \w{3}),/, "$1"));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

type Item = { sourceId: string; url: string; title: string; publishedAt: string | null; text: string | null };

async function fromFeed(source: Source, url: string): Promise<Item[]> {
  const feed = await parser.parseString(await get(url));
  return feed.items.map((it) => {
    const text = htmlToText((it as { contentEncoded?: string }).contentEncoded ?? it.content ?? "");
    return {
      sourceId: source.id,
      url: normalizeUrl(it.link ?? it.guid ?? ""),
      title: htmlToText(it.title ?? ""),
      publishedAt: it.isoDate ?? parseDate(it.pubDate),
      text: text.length > 200 ? text.slice(0, 12_000) : null,
    };
  });
}

/**
 * Drishti's date-wise "News Analysis" page: we read ONLY the topic headlines (h1), never the article
 * text. They serve as a checklist of exam topics (see news-gaps) and as "Also covered by" links.
 */
async function fromDrishtiDays(days: number): Promise<Item[]> {
  const items: Item[] = [];
  for (let back = 0; back < days; back++) {
    const ist = new Date(Date.now() + 5.5 * 3600_000 - back * 86400_000).toISOString().slice(0, 10);
    const [y, m, d] = ist.split("-");
    const url = `https://www.drishtiias.com/current-affairs-news-analysis-editorials/news-analysis/${d}-${m}-${y}`;
    let html: string;
    try {
      html = await get(url, "text/html");
    } catch {
      continue; // the day's page may not be up yet
    }
    for (const m2 of html.replace(/<script[\s\S]*?<\/script>/gi, "").matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)) {
      const title = htmlToText(m2[1]);
      if (title.length < 6 || title.length > 160) continue;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
      items.push({ sourceId: "drishti", url: `${url}#${slug}`, title, publishedAt: `${ist}T06:00:00.000Z`, text: null });
    }
    await sleep(1000);
  }
  return items;
}

/**
 * Adda247's current-affairs home page: article headlines only (their robots.txt allows it). Used as a
 * checklist of exam one-liners (awards, appointments, days, sports) and as "Also covered by" links.
 */
async function fromAdda247(url: string): Promise<Item[]> {
  const html = (await get(url, "text/html")).replace(/<script[\s\S]*?<\/script>/gi, "");
  const items = new Map<string, Item>();
  for (const m of html.matchAll(/<a[^>]+href="(https:\/\/currentaffairs\.adda247\.com\/[a-z0-9-]{20,}\/)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const title = htmlToText(m[2]);
    if (title.length < 25 || /\b(pdf|quiz|download|mock test|one liner)\b/i.test(title)) continue;
    if (!items.has(m[1])) items.set(m[1], { sourceId: "adda247", url: m[1], title, publishedAt: new Date().toISOString(), text: null });
  }
  return [...items.values()].slice(0, 40);
}

/** PIB's "all releases" page lists the day's releases grouped by ministry. */
async function fromPibListing(url: string): Promise<Item[]> {
  const html = await get(url);
  const items: Item[] = [];
  for (const block of html.split("<h3 class='font104'>").slice(1)) {
    for (const m of block.matchAll(/<a title='([^']+)' href='(\/PressRelease(?:Detail|Page)\.aspx\?PRID=\d+)'/g)) {
      items.push({ sourceId: "pib", url: `https://pib.gov.in${m[2]}`, title: htmlToText(m[1]), publishedAt: new Date().toISOString(), text: null });
    }
  }
  return items;
}

async function pibBody(url: string): Promise<string | null> {
  try {
    const html = await get(url);
    const start = html.search(/<div[^>]+(innner-page-main-about-us-content-right-part|ReleaseContent|pressrelease)/i);
    const text = htmlToText(html.slice(Math.max(start, 0)));
    return text.length > 200 ? text.slice(0, 12_000) : null;
  } catch {
    return null;
  }
}

const seen = seenUrls();
const cutoff = Date.now() - MAX_AGE_DAYS * 86400_000;
const government: Item[] = [];
const coverage: Omit<Item, "text">[] = [];
const report: { source: string; fresh: number; errors: string[] }[] = [];

for (const source of SOURCES) {
  if (source.mode === "reference") continue;
  const errors: string[] = [];
  const items: Item[] = [];
  for (const url of source.feeds ?? []) {
    try {
      items.push(...(await fromFeed(source, url)));
    } catch (e) {
      errors.push(`${new URL(url).pathname}: ${(e as Error).message}`);
    }
    await sleep(700);
  }
  if (source.id === "air") {
    try {
      items.push(...(await fromAirApi(new Date(Date.now() - MAX_AGE_DAYS * 86400_000))));
    } catch (e) {
      errors.push(`api: ${(e as Error).message}`);
    }
  }
  if (source.id === "drishti") {
    try {
      items.push(...(await fromDrishtiDays(2)));
    } catch (e) {
      errors.push(`day pages: ${(e as Error).message}`);
    }
  }
  for (const url of source.listings ?? []) {
    try {
      items.push(...(source.id === "adda247" ? await fromAdda247(url) : await fromPibListing(url)));
    } catch (e) {
      errors.push(`listing: ${(e as Error).message}`);
    }
  }
  // SEBI's feed is mostly enforcement orders and recovery notices; keep press releases, circulars and regulations.
  const kept = source.id === "sebi" ? items.filter((i) => /\/(media-and-notifications\/press-releases|legal\/circulars|legal\/regulations)\//.test(i.url)) : items;
  const unique = [...new Map(kept.filter((i) => i.url && i.title).map((i) => [i.url, i])).values()];
  const fresh = unique.filter((i) => !seen.has(i.url) && (!i.publishedAt || new Date(i.publishedAt).getTime() >= cutoff));
  if (source.mode === "ai") {
    if (source.id === "pib") {
      for (const it of fresh.filter((i) => !i.text).slice(0, 40)) {
        it.text = await pibBody(it.url);
        await sleep(1500);
      }
    }
    government.push(...fresh);
  } else {
    // Copyrighted publishers: keep headline + URL only.
    coverage.push(...fresh.map((i) => ({ sourceId: i.sourceId, url: i.url, title: i.title, publishedAt: i.publishedAt })));
  }
  report.push({ source: source.short, fresh: fresh.length, errors });
  console.log(`  ${source.short.padEnd(16)} ${String(fresh.length).padStart(4)} new  ${errors.join("; ")}`);
}

fs.mkdirSync(INBOX_DIR, { recursive: true });
const out = path.join(INBOX_DIR, "candidates.json");
fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), report, government, coverage }, null, 2));
console.log(`\n${government.length} government items, ${coverage.length} coverage links → ${path.relative(process.cwd(), out)}`);
// Make sure nothing exam-relevant is missed: find official coverage for any topic on the checklist we lack.
await import("./news-gaps.mjs").then((m) => m.findGaps());

if (!government.length && report.filter((r) => SOURCES.find((s) => s.short === r.source)?.mode === "ai").every((r) => r.errors.length)) {
  console.error("Every government source failed. Check network access before writing stories.");
  process.exit(2);
}
