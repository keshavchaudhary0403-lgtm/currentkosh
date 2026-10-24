"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, pick, type Lang } from "@/lib/taxonomy";

const RANGES = [
  { id: "7", label: "Last 7 days", days: 7 },
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "90", label: "Last 3 months", days: 90 },
  { id: "180", label: "Last 6 months", days: 183 },
];

export function TestBuilder({ latest, lang }: { latest: string; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const [range, setRange] = useState("30");
  const [cats, setCats] = useState<string[]>([]);
  const [count, setCount] = useState(25);
  const [timed, setTimed] = useState(false);
  const [negative, setNegative] = useState(0);
  const router = useRouter();

  const go = () => {
    const r = RANGES.find((x) => x.id === range)!;
    const from = new Date(new Date(`${latest}T00:00:00Z`).getTime() - (r.days - 1) * 86400_000).toISOString().slice(0, 10);
    const qs = new URLSearchParams({ kind: "custom", from, to: latest, count: String(count), timed: timed ? "1" : "0", neg: String(negative), title: `Custom test · ${r.label}` });
    if (cats.length) qs.set("cats", cats.join(","));
    router.push(`/practice/run?${qs}`);
  };

  const chip = (on: boolean) => `rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition active:scale-95 ${on ? "border-accent-2 bg-accent-2-soft text-accent-2" : "border-line bg-surface text-ink-2 hover:border-line-strong"}`;

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 text-sm font-extrabold text-ink">Period</div>
        <div className="flex flex-wrap gap-2">
          {RANGES.map((r) => (
            <button key={r.id} className={chip(range === r.id)} onClick={() => setRange(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 text-sm font-extrabold text-ink">Topics {cats.length === 0 && <span className="font-semibold text-ink-3">· all</span>}</div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.id} className={chip(cats.includes(c.id))} onClick={() => setCats((xs) => (xs.includes(c.id) ? xs.filter((x) => x !== c.id) : [...xs, c.id]))}>
              {pick(c.label, ui)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <div className="mb-2 text-sm font-extrabold text-ink">Questions</div>
          <div className="flex gap-2">
            {[10, 25, 50, 100].map((n) => (
              <button key={n} className={chip(count === n)} onClick={() => setCount(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-extrabold text-ink">Mode</div>
          <div className="flex gap-2">
            <button className={chip(!timed)} onClick={() => setTimed(false)}>
              Practice
            </button>
            <button className={chip(timed)} onClick={() => setTimed(true)}>
              Timed
            </button>
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-extrabold text-ink">Negative marking</div>
          <div className="flex gap-2">
            {[
              [0, "None"],
              [0.25, "−¼"],
              [1 / 3, "−⅓"],
            ].map(([v, l]) => (
              <button key={String(l)} className={chip(negative === v)} onClick={() => setNegative(v as number)}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button onClick={go} className="btn btn-orange w-full px-6 py-3.5 text-[15px] sm:w-auto">
        Start test
      </button>
    </div>
  );
}
