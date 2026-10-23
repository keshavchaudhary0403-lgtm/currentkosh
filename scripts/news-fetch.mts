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

async function get(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/html;q=0.9" }, redirect: "follow", signal: AbortSignal.timeout(25_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
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

type Item = { sourceId: string; url: string; title: string; publishedAt: string | null; text: string | null };

async function fromFeed(source: Source, url: string): Promise<Item[]> {
  const feed = await parser.parseString(await get(url));
  return feed.items.map((it) => {
    const text = htmlToText((it as { contentEncoded?: string }).contentEncoded ?? it.content ?? "");
    return {
      sourceId: source.id,
      url: normalizeUrl(it.link ?? it.guid ?? ""),
      title: htmlToText(it.title ?? ""),
      publishedAt: it.isoDate ?? (it.pubDate ? new Date(it.pubDate).toISOString() : null),
      text: text.length > 200 ? text.slice(0, 12_000) : null,
    };
  });
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
  for (const url of source.listings ?? []) {
    try {
      items.push(...(await fromPibListing(url)));
    } catch (e) {
      errors.push(`listing: ${(e as Error).message}`);
    }
  }
  const unique = [...new Map(items.filter((i) => i.url && i.title).map((i) => [i.url, i])).values()];
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
if (!government.length && report.filter((r) => SOURCES.find((s) => s.short === r.source)?.mode === "ai").every((r) => r.errors.length)) {
  console.error("Every government source failed. Check network access before writing stories.");
  process.exit(2);
}
