"use client";

import { Brain, Flame, Newspaper, Target } from "lucide-react";
import { dueCount, streak, totals, useProgress } from "@/lib/progress-store";
import { useLang } from "./lang-context";
import { cx } from "./ui";

export function MyStats() {
  const p = useProgress();
  const ui = useLang() === "hi" ? "hi" : "en";
  const tot = totals(p);
  const stats = [
    { icon: Flame, cls: "bg-signal text-on-signal", value: streak(p), label: ui === "hi" ? "दिन लगातार" : "day streak" },
    { icon: Newspaper, cls: "card", value: tot.read, label: ui === "hi" ? "ख़बरें पढ़ीं" : "stories read" },
    { icon: Target, cls: "bg-good-soft text-good-ink", value: tot.answered ? `${Math.round((tot.correct / tot.answered) * 100)}%` : "—", label: ui === "hi" ? "सटीकता" : "accuracy" },
    { icon: Brain, cls: "bg-cobalt-soft text-cobalt-ink", value: dueCount(p), label: ui === "hi" ? "दोहराने हैं" : "due to revise" },
  ];
  return (
    <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ icon: Icon, cls, value, label }) => (
        <div key={label} className={cx("rounded-[22px] p-4", cls)}>
          <Icon className="size-5" strokeWidth={2} />
          <div className="mt-4 font-display text-[40px] leading-none tnum">{value}</div>
          <div className="mt-1 text-xs font-semibold opacity-80">{label}</div>
        </div>
      ))}
    </div>
  );
}
