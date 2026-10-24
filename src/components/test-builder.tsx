"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, pick, type Lang } from "@/lib/taxonomy";
import { DateInput } from "./form";

// "Today" is the latest day with news; "Yesterday" the day before it.
const RANGES = [
  { id: "today", label: "Today", hi: "आज", days: 1, offset: 0 },
  { id: "yesterday", label: "Yesterday", hi: "कल", days: 1, offset: 1 },
  { id: "7", label: "Last 7 days", hi: "पिछले 7 दिन", days: 7 },
  { id: "30", label: "Last 30 days", hi: "पिछले 30 दिन", days: 30 },
  { id: "90", label: "Last 3 months", hi: "पिछले 3 महीने", days: 90 },
  { id: "180", label: "Last 6 months", hi: "पिछले 6 महीने", days: 183 },
  { id: "custom", label: "Custom dates", hi: "अपनी तारीख़ें", days: 0 },
];

const shift = (date: string, days: number) => new Date(new Date(`${date}T00:00:00Z`).getTime() + days * 86400_000).toISOString().slice(0, 10);
const FIRST_DAY = "2026-04-23";

// Each setting is one row: label on the left on larger screens, above the options on phones.
function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[112px_minmax(0,1fr)] sm:items-start sm:gap-4">
      <div className="text-sm font-semibold text-ink sm:pt-1.5">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function TestBuilder({ latest, lang }: { latest: string; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  const [range, setRange] = useState("30");
  const [cats, setCats] = useState<string[]>([]);
  const [count, setCount] = useState(25);
  const [timed, setTimed] = useState(false);
  const [negative, setNegative] = useState(0);
  const [customFrom, setCustomFrom] = useState(() => shift(latest, -6));
  const [customTo, setCustomTo] = useState(latest);
  const router = useRouter();
  const customBad = range === "custom" && (!customFrom || !customTo || customFrom > customTo);

  const go = () => {
    const r = RANGES.find((x) => x.id === range)!;
    if (customBad) return;
    const to = r.id === "custom" ? customTo : shift(latest, -("offset" in r ? (r.offset ?? 0) : 0));
    const from = r.id === "custom" ? customFrom : shift(to, -(r.days - 1));
    const label = r.id === "custom" ? `${customFrom} – ${customTo}` : hi ? r.hi : r.label;
    const qs = new URLSearchParams({
      kind: "custom",
      from,
      to,
      count: String(count),
      timed: timed ? "1" : "0",
      neg: String(negative),
      title: hi ? `अपना टेस्ट · ${label}` : `Custom test · ${label}`,
    });
    if (cats.length) qs.set("cats", cats.join(","));
    router.push(`/practice/run?${qs}`);
  };

  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-[13px] font-semibold transition active:scale-95 ${on ? "border-accent-2 bg-accent-2-soft text-accent-2" : "border-line bg-surface text-ink-2 hover:border-line-strong"}`;

  return (
    <div className="space-y-4">
      <Row label={hi ? "अवधि" : "Period"}>
        {RANGES.map((r) => (
          <button key={r.id} className={chip(range === r.id)} onClick={() => setRange(r.id)}>
            {hi ? r.hi : r.label}
          </button>
        ))}
        {range === "custom" && (
          <div className="grid w-full grid-cols-2 gap-2 pt-1">
            <label className="block">
              <span className="mb-1 block text-xs text-ink-3">{hi ? "से" : "From"}</span>
              <DateInput value={customFrom} min={FIRST_DAY} max={latest} onChange={(e) => setCustomFrom(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-ink-3">{hi ? "तक" : "To"}</span>
              <DateInput value={customTo} min={FIRST_DAY} max={latest} onChange={(e) => setCustomTo(e.target.value)} />
            </label>
            {customBad && <p className="col-span-2 text-xs text-bad">{hi ? "'से' की तारीख़ 'तक' से पहले होनी चाहिए।" : "The 'From' date must be on or before the 'To' date."}</p>}
          </div>
        )}
      </Row>
      <Row
        label={
          <>
            {hi ? "विषय" : "Topics"} {cats.length === 0 && <span className="font-normal text-ink-3">· {hi ? "सभी" : "all"}</span>}
          </>
        }
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={chip(cats.includes(c.id))}
            onClick={() => setCats((xs) => (xs.includes(c.id) ? xs.filter((x) => x !== c.id) : [...xs, c.id]))}
          >
            {pick(c.label, ui)}
          </button>
        ))}
      </Row>
      <Row label={hi ? "प्रश्न" : "Questions"}>
        {[10, 25, 50, 100].map((n) => (
          <button key={n} className={chip(count === n)} onClick={() => setCount(n)}>
            {n}
          </button>
        ))}
      </Row>
      <Row label={hi ? "मोड" : "Mode"}>
        <button className={chip(!timed)} onClick={() => setTimed(false)}>
          {hi ? "अभ्यास" : "Practice"}
        </button>
        <button className={chip(timed)} onClick={() => setTimed(true)}>
          {hi ? "समयबद्ध" : "Timed"}
        </button>
      </Row>
      <Row label={hi ? "नेगेटिव मार्किंग" : "Negative marking"}>
        {(
          [
            [0, hi ? "नहीं" : "None"],
            [0.25, "−¼"],
            [1 / 3, "−⅓"],
          ] as const
        ).map(([v, l]) => (
          <button key={l} className={chip(negative === v)} onClick={() => setNegative(v)}>
            {l}
          </button>
        ))}
      </Row>
      <div className="flex justify-end border-t border-line pt-4">
        <button onClick={go} disabled={customBad} className="btn btn-orange h-11 w-full px-6 text-[15px] sm:w-auto">
          {hi ? "टेस्ट शुरू करें" : "Start test"}
        </button>
      </div>
    </div>
  );
}
