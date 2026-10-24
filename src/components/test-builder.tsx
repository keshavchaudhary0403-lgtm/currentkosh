"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, pick, type Lang } from "@/lib/taxonomy";
import { catStyle } from "./category-icon";
import { DateInput } from "./form";
import { cx } from "./ui";

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

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="eyebrow mb-2 text-ink-3">{label}</legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

/** Segmented control: one pill slides between options. */
function Segmented<T extends string | number>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  const idx = Math.max(0, options.findIndex(([v]) => v === value));
  return (
    <div className="relative grid w-full rounded-full bg-card-2 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="radiogroup">
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 rounded-full bg-solid shadow-card transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)]"
        style={{ width: `calc((100% - 0.5rem) / ${options.length})`, transform: `translateX(${idx * 100}%)` }}
      />
      {options.map(([v, l]) => (
        <button key={String(v)} role="radio" aria-checked={v === value} onClick={() => onChange(v)} className={cx("relative z-10 h-10 rounded-full text-sm font-semibold transition-colors", v === value ? "text-on-solid" : "text-ink-2 hover:text-ink")}>
          {l}
        </button>
      ))}
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

  return (
    <div className="space-y-5">
      <Row label={hi ? "अवधि" : "Period"}>
        {RANGES.map((r) => (
          <button key={r.id} className="chip" aria-pressed={range === r.id} onClick={() => setRange(r.id)}>
            {hi ? r.hi : r.label}
          </button>
        ))}
        {range === "custom" && (
          <div className="popover grid w-full grid-cols-2 gap-2 pt-1">
            <label className="block">
              <span className="mb-1 block text-xs text-ink-3">{hi ? "से" : "From"}</span>
              <DateInput value={customFrom} min={FIRST_DAY} max={latest} onChange={(e) => setCustomFrom(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-ink-3">{hi ? "तक" : "To"}</span>
              <DateInput value={customTo} min={FIRST_DAY} max={latest} onChange={(e) => setCustomTo(e.target.value)} />
            </label>
            {customBad && <p className="col-span-2 text-xs text-bad-ink">{hi ? "'से' की तारीख़ 'तक' से पहले होनी चाहिए।" : "The 'From' date must be on or before the 'To' date."}</p>}
          </div>
        )}
      </Row>
      <Row
        label={
          <>
            {hi ? "विषय" : "Topics"} <span className="normal-case">· {cats.length === 0 ? (hi ? "सभी" : "all") : cats.length}</span>
          </>
        }
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className="chip cat"
            style={catStyle(c.id)}
            aria-pressed={cats.includes(c.id)}
            onClick={() => setCats((xs) => (xs.includes(c.id) ? xs.filter((x) => x !== c.id) : [...xs, c.id]))}
          >
            <span className="size-1.5 rounded-full bg-(--cat-solid)" />
            {pick(c.label, ui)}
          </button>
        ))}
      </Row>
      <Row label={hi ? "प्रश्न" : "Questions"}>
        <Segmented value={count} onChange={setCount} options={[10, 25, 50, 100].map((n) => [n, String(n)] as [number, string])} />
      </Row>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Row label={hi ? "मोड" : "Mode"}>
          <Segmented
            value={timed ? "t" : "p"}
            onChange={(v) => setTimed(v === "t")}
            options={[
              ["p", hi ? "अभ्यास" : "Practice"],
              ["t", hi ? "समयबद्ध" : "Timed"],
            ]}
          />
        </Row>
        <Row label={hi ? "नेगेटिव मार्किंग" : "Negative marking"}>
          <Segmented
            value={negative}
            onChange={setNegative}
            options={[
              [0, hi ? "नहीं" : "None"],
              [0.25, "−¼"],
              [1 / 3, "−⅓"],
            ]}
          />
        </Row>
      </div>
      <button onClick={go} disabled={customBad} className="btn group h-12 w-full text-[15px]">
        {hi ? "टेस्ट शुरू करें" : "Start test"} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
      </button>
    </div>
  );
}
