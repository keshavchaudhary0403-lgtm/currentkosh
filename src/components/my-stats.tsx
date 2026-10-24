"use client";

import { Brain, Flame, Newspaper, Target } from "lucide-react";
import { dueCount, streak, totals, useProgress } from "@/lib/progress-store";
import { useLang } from "./lang-context";

export function MyStats() {
  const p = useProgress();
  const ui = useLang() === "hi" ? "hi" : "en";
  const tot = totals(p);
  const stats = [
    { icon: Flame, cls: "bg-accent-2-soft text-accent-2", value: streak(p), label: ui === "hi" ? "दिन लगातार" : "day streak" },
    { icon: Newspaper, cls: "bg-accent-soft text-accent", value: tot.read, label: ui === "hi" ? "ख़बरें पढ़ीं" : "stories read" },
    { icon: Target, cls: "bg-good-soft text-good", value: tot.answered ? `${Math.round((tot.correct / tot.answered) * 100)}%` : "—", label: ui === "hi" ? "सटीकता" : "accuracy" },
    { icon: Brain, cls: "bg-violet-soft text-violet", value: dueCount(p), label: ui === "hi" ? "दोहराने हैं" : "due to revise" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map(({ icon: Icon, cls, value, label }) => (
        <div key={label} className={`rounded-2xl px-2 py-3 text-center ${cls}`}>
          <Icon className="mx-auto size-5" strokeWidth={2.4} />
          <div className="mt-1 font-display text-2xl leading-none">{value}</div>
          <div className="mt-1 text-[10px] leading-tight font-bold opacity-80">{label}</div>
        </div>
      ))}
    </div>
  );
}
