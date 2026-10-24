"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, pick, type Lang } from "@/lib/taxonomy";

const RANGES = [
  { id: "7", label: "Last 7 days", hi: "पिछले 7 दिन", days: 7 },
  { id: "30", label: "Last 30 days", hi: "पिछले 30 दिन", days: 30 },
  { id: "90", label: "Last 3 months", hi: "पिछले 3 महीने", days: 90 },
  { id: "180", label: "Last 6 months", hi: "पिछले 6 महीने", days: 183 },
];

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
  const router = useRouter();

  const go = () => {
    const r = RANGES.find((x) => x.id === range)!;
    const from = new Date(new Date(`${latest}T00:00:00Z`).getTime() - (r.days - 1) * 86400_000).toISOString().slice(0, 10);
    const qs = new URLSearchParams({
      kind: "custom",
      from,
      to: latest,
      count: String(count),
      timed: timed ? "1" : "0",
      neg: String(negative),
      title: hi ? `अपना टेस्ट · ${r.hi}` : `Custom test · ${r.label}`,
    });
    if (cats.length) qs.set("cats", cats.join(","));
    router.push(`/practice/run?${qs}`);
  };

  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-[13px] font-semibold transition active:scale-95 ${on ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink-2 hover:border-line-strong"}`;

  return (
    <div className="space-y-4">
      <Row label={hi ? "अवधि" : "Period"}>
        {RANGES.map((r) => (
          <button key={r.id} className={chip(range === r.id)} onClick={() => setRange(r.id)}>
            {hi ? r.hi : r.label}
          </button>
        ))}
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
        <button onClick={go} className="btn btn-orange h-11 w-full px-6 text-[15px] sm:w-auto">
          {hi ? "टेस्ट शुरू करें" : "Start test"}
        </button>
      </div>
    </div>
  );
}
