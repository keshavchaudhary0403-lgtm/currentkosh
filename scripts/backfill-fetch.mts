// Fetch past days from the All India Radio archive (WordPress REST API) for a one-off backfill.
//   npm run backfill:fetch -- 2026-07-23 2026-10-23
// Writes content/inbox/backfill/candidates-<date>.json (one file per IST day), skipping URLs
// that are already published or skipped. AIR carries the government's daily news in full text.
import fs from "node:fs";
import path from "node:path";
import { INBOX_DIR, seenUrls } from "../src/lib/publish";

const [from, to] = process.argv.slice(2);
if (!/^\d{4}-\d{2}-\d{2}$/.test(from ?? "") || !/^\d{4}-\d{2}-\d{2}$/.test(to ?? "")) {
  console.error("Usage: npm run backfill:fetch -- <from YYYY-MM-DD> <to YYYY-MM-DD>");
  process.exit(1);
}

const UA = process.env.CK_USER_AGENT ?? "CurrentKoshReader/0.1 (current-affairs study aid; +https://github.com/keshavchaudhary0403-lgtm/currentkosh)";
const API = "https://newsonair.gov.in/wp-json/wp/v2";
const OUT = path.join(INBOX_DIR, "backfill");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson<T>(url: string): Promise<{ data: T; totalPages: number }> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(40_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { data: (await res.json()) as T, totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1) };
    } catch (e) {
      if (attempt >= 4) throw e;
      await sleep(3000 * attempt);
    }
  }
}

function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|figure|iframe)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|li|tr|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#8217;|&#8216;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8211;|&#8212;/g, "–")
    .replace(/&#8230;/g, "…")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&[a-z]+;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

type Post = { id: number; date: string; link: string; title: { rendered: string }; content: { rendered: string }; categories: number[] };

const catName = new Map<number, string>();
for (let page = 1, pages = 1; page <= pages; page++) {
  const res = await getJson<{ id: number; name: string }[]>(`${API}/categories?per_page=100&page=${page}&_fields=id,name`);
  pages = res.totalPages;
  for (const c of res.data) catName.set(c.id, c.name);
}
// AIR also posts Hindi, Urdu and regional-language bulletins that repeat the English ones.
const latinShare = (s: string) => (s.match(/[A-Za-z]/g)?.length ?? 0) / Math.max(1, s.replace(/[\s\d\p{P}]/gu, "").length);
const seen = seenUrls();
fs.mkdirSync(OUT, { recursive: true });

for (let d = new Date(`${from}T00:00:00Z`); d <= new Date(`${to}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
  const day = d.toISOString().slice(0, 10);
  const file = path.join(OUT, `candidates-${day}.json`);
  if (fs.existsSync(file)) {
    console.log(`  ${day} already fetched`);
    continue;
  }
  const items: { sourceId: string; url: string; title: string; publishedAt: string; section: string; text: string }[] = [];
  // `date` in the AIR API is Indian time, which is the calendar day we file stories under.
  const base = `${API}/posts?per_page=100&after=${day}T00:00:00&before=${day}T23:59:59&_fields=id,date,link,title,content,categories&orderby=date&order=asc`;
  let page = 1;
  let pages = 1;
  do {
    const { data, totalPages } = await getJson<Post[]>(`${base}&page=${page}`);
    pages = totalPages;
    for (const p of data) {
      if (seen.has(p.link)) continue;
      const text = htmlToText(p.content.rendered);
      if (text.length < 120 || latinShare(p.title.rendered) < 0.6) continue;
      items.push({
        sourceId: "air",
        url: p.link,
        title: htmlToText(p.title.rendered),
        publishedAt: `${p.date}+05:30`,
        section: p.categories.map((c) => catName.get(c) ?? String(c)).join(", "),
        text: text.slice(0, 6000),
      });
    }
    page++;
    await sleep(800);
  } while (page <= pages);
  fs.writeFileSync(file, JSON.stringify({ date: day, government: items }, null, 1));
  console.log(`  ${day} ${String(items.length).padStart(4)} items`);
}
