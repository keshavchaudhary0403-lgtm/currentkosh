"use client";

import { Brain, Flame, Newspaper, Target } from "lucide-react";
import { dueCount, streak, totals, useProgress } from "@/lib/progress-store";
import { useLang } from "./lang-context";

export function MyStats() {
  const p = useProgress();
  const ui = useLang() === "hi" ? "hi" : "en";
  const tot = totals(p);
  const stats = [
    { icon: Flame, cls: "text-accent-2", value: streak(p), label: ui === "hi" ? "दिन लगातार" : "day streak" },
    { icon: Newspaper, cls: "text-accent", value: tot.read, label: ui === "hi" ? "ख़बरें पढ़ीं" : "stories read" },
    { icon: Target, cls: "text-good", value: tot.answered ? `${Math.round((tot.correct / tot.answered) * 100)}%` : "—", label: ui === "hi" ? "सटीकता" : "accuracy" },
    { icon: Brain, cls: "text-warn", value: dueCount(p), label: ui === "hi" ? "दोहराने हैं" : "due to revise" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map(({ icon: Icon, cls, value, label }) => (
        <div key={label} className="rounded-xl border border-line bg-surface px-2 py-3 text-center">
          <Icon className={`mx-auto size-4 ${cls}`} />
          <div className="mt-1 font-display text-xl leading-none">{value}</div>
          <div className="mt-1 text-[10px] leading-tight text-ink-3">{label}</div>
        </div>
      ))}
    </div>
  );
}
