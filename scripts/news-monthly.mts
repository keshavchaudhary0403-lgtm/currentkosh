// Downloads PRS Monthly Policy Review issues that have no summary in content/monthly yet
// (from April 2026 on) into content/inbox/monthly/prs-<month>-<year>.txt, for the routine to
// summarise following docs/MONTHLY.md. PRS content is CC BY 4.0; robots.txt asks for a 10s crawl delay.
import fs from "node:fs";
import path from "node:path";

const UA = "CurrentKoshReader/0.1 (current-affairs study aid; +https://github.com/currentkosh)";
const OUT = path.join(process.cwd(), "content", "inbox", "monthly");
const DONE = path.join(process.cwd(), "content", "monthly");
const NAMES = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const FIRST = "2026-04";

const months: string[] = [];
const now = new Date();
for (let d = new Date(`${FIRST}-01T00:00:00Z`); d < new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)); d.setUTCMonth(d.getUTCMonth() + 1)) {
  months.push(d.toISOString().slice(0, 7));
}
const missing = months.filter((m) => !fs.existsSync(path.join(DONE, `prs-${m}.json`)));

const text = (html: string) => {
  const body = html.replace(/<(script|style|nav|header|footer)[\s\S]*?<\/\1>/g, "");
  const t = body
    .replace(/<(br|\/p|\/h[1-6]|\/li|\/div)[^>]*>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n");
  const i = t.indexOf("Highlights of this Issue");
  const j = t.indexOf("DISCLAIMER");
  return i >= 0 ? t.slice(i, j > i ? j : undefined).trim() : "";
};

fs.mkdirSync(OUT, { recursive: true });
const ready: string[] = [];
for (const [n, m] of missing.entries()) {
  if (n) await new Promise((r) => setTimeout(r, 10_000));
  const slug = `${NAMES[Number(m.slice(5)) - 1]}-${m.slice(0, 4)}`;
  const url = `https://prsindia.org/policy/monthly-policy-review/${slug}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } }).catch(() => null);
  if (!res?.ok) {
    console.log(`${m}: not published yet (${res?.status ?? "network error"})`);
    continue;
  }
  const body = text(await res.text());
  if (body.split(/\s+/).length < 500) {
    console.log(`${m}: page found but text looks incomplete; skipped`);
    continue;
  }
  fs.writeFileSync(path.join(OUT, `prs-${slug}.txt`), body);
  ready.push(`${m} → content/inbox/monthly/prs-${slug}.txt (write content/monthly/prs-${m}.json, url ${url})`);
}
console.log(ready.length ? `New PRS issues to summarise:\n${ready.join("\n")}` : "No new PRS monthly issues.");
