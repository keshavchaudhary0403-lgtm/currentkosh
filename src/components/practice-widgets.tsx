"use client";

import Link from "next/link";
import { Crosshair } from "lucide-react";
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
    <Link id="weak" href={href} className="group scroll-mt-24 rounded-3xl bg-pink-soft p-4 transition active:scale-[.97]">
      <span className="grid size-12 place-items-center rounded-2xl bg-pink text-white transition group-hover:-rotate-6">
        <Crosshair className="size-6" strokeWidth={2.4} />
      </span>
      <span className="mt-3 block font-display text-[17px] leading-tight text-pink">{ui === "hi" ? "कमज़ोर विषय अभ्यास" : "Weak-area drill"}</span>
      <span className="mt-0.5 line-clamp-2 block text-xs font-semibold text-ink-2">{weak.length ? `15 ${ui === "hi" ? "प्रश्न" : "Qs"} · ${weak.map((c) => pick(categoryById(c)?.label, ui)).join(", ")}` : ui === "hi" ? "कुछ टेस्ट के बाद खुलेगा" : "Unlocks after a few tests"}</span>
    </Link>
  );
}

/** Practice page entry into "My tests": the latest few results and a link to the full history. */
export function RecentAttempts() {
  const lang = useLang();
  const hi = lang === "hi";
  const attempts = useProgress().attempts;
  if (!attempts.length) return null;
  const answered = attempts.reduce((n, a) => n + a.answers.filter((x) => x !== null).length, 0);
  const correct = attempts.reduce((n, a) => n + a.correct, 0);
  return (
    <section>
      <SectionTitle
        title={hi ? "मेरे टेस्ट" : "My tests"}
        eyebrow={hi ? `${attempts.length} टेस्ट · ${Math.round((correct / Math.max(1, answered)) * 100)}% सटीकता` : `${attempts.length} taken · ${Math.round((correct / Math.max(1, answered)) * 100)}% accuracy`}
        right={
          <Link href="/tests" className="text-sm font-extrabold text-accent-2">
            {hi ? "सभी देखें →" : "See all →"}
          </Link>
        }
      />
      <div className="divide-y-2 divide-line overflow-hidden rounded-3xl border-2 border-line bg-surface">
        {attempts.slice(0, 3).map((a) => {
          const pct = Math.round((a.correct / Math.max(1, a.mcqIds.length)) * 100);
          return (
            <Link key={a.id} href={`/practice/result?id=${a.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-surface-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{a.title}</span>
                <span className="block text-xs text-ink-3">{new Date(a.finishedAt).toLocaleString(hi ? "hi-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              </span>
              <span className={`rounded-full px-3 py-1 font-display text-sm tabular-nums ${pct >= 70 ? "bg-good-soft text-good" : pct >= 40 ? "bg-accent-2-soft text-accent-2" : "bg-bad-soft text-bad"}`}>{pct}%</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
