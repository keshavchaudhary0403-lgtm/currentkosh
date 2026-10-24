"use client";

import Link from "next/link";
import { ChevronRight, Crosshair } from "lucide-react";
import { useProgress, weakCategories } from "@/lib/progress-store";
import { categoryById, pick } from "@/lib/taxonomy";
import { useLang } from "./lang-context";
import { SectionTitle } from "./ui";

export function WeakDrillCard() {
  const p = useProgress();
  const lang = useLang();
  const weak = weakCategories(p);
  const href = weak.length ? `/practice/run?kind=weak&cats=${weak.join(",")}` : "/practice/run?kind=weak";
  const ui = lang === "bi" ? "en" : lang;
  return (
    <Link id="weak" href={href} className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-surface-2 sm:px-5">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
        <Crosshair className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium">Weak-area drill</span>
        <span className="block text-xs text-ink-3">{weak.length ? `15 Qs · ${weak.map((c) => pick(categoryById(c)?.label, ui)).join(", ")}` : "Unlocks after a few tests"}</span>
      </span>
      <ChevronRight className="size-4 text-ink-3" />
    </Link>
  );
}

export function RecentAttempts() {
  const attempts = useProgress().attempts.slice(0, 8);
  if (!attempts.length) return null;
  return (
    <section>
      <SectionTitle eyebrow="History · saved in this browser" title="Recent tests" />
      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {attempts.map((a) => (
          <Link key={a.id} href={`/practice/result?id=${a.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-surface-2">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{a.title}</span>
              <span className="block text-xs text-ink-3">{new Date(a.finishedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
            </span>
            <span className="font-display text-2xl tabular-nums">
              {a.score.toFixed(a.config.negative ? 1 : 0)}
              <span className="text-base text-ink-3">/{a.mcqIds.length}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
