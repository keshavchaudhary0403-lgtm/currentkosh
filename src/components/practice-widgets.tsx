"use client";

import Link from "next/link";
import { ArrowRight, Crosshair } from "lucide-react";
import { useProgress, weakCategories } from "@/lib/progress-store";
import { categoryById, pick } from "@/lib/taxonomy";
import { useLang } from "./lang-context";
import { ProgressRing, SectionTitle } from "./ui";

export function WeakDrillCard() {
  const p = useProgress();
  const lang = useLang();
  const weak = weakCategories(p);
  const href = weak.length ? `/practice/run?kind=weak&cats=${weak.join(",")}` : "/practice/run?kind=weak";
  const ui = lang === "bi" ? "en" : lang;
  return (
    <Link id="weak" href={href} className="lift group col-span-2 flex scroll-mt-24 items-center gap-4 rounded-[24px] bg-flare-soft p-5">
      <span className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-flare text-white transition group-hover:rotate-90">
        <Crosshair className="size-6" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[26px] leading-tight text-flare-ink">{ui === "hi" ? "कमज़ोर विषय अभ्यास" : "Weak-area drill"}</span>
        <span className="mt-0.5 line-clamp-2 block text-xs font-medium text-ink-2">
          {weak.length ? `15 ${ui === "hi" ? "प्रश्न" : "Qs"} · ${weak.map((c) => pick(categoryById(c)?.label, ui)).join(", ")}` : ui === "hi" ? "कुछ टेस्ट के बाद खुलेगा" : "Unlocks after a few tests"}
        </span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-flare-ink transition group-hover:translate-x-1" />
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
    <section className="reveal">
      <SectionTitle
        title={hi ? "मेरे टेस्ट" : "My tests"}
        eyebrow={hi ? `${attempts.length} टेस्ट · ${Math.round((correct / Math.max(1, answered)) * 100)}% सटीकता` : `${attempts.length} taken · ${Math.round((correct / Math.max(1, answered)) * 100)}% accuracy`}
        right={
          <Link href="/tests" className="btn btn-ghost h-11 px-4 text-sm">
            {hi ? "सभी" : "See all"} <ArrowRight className="size-4" />
          </Link>
        }
      />
      <div className="card divide-y divide-line overflow-hidden">
        {attempts.slice(0, 3).map((a) => {
          const pct = Math.round((a.correct / Math.max(1, a.mcqIds.length)) * 100);
          const color = pct >= 70 ? "var(--good)" : pct >= 40 ? "var(--amber)" : "var(--bad)";
          return (
            <Link key={a.id} href={`/practice/result?id=${a.id}`} className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-card-2 sm:px-5">
              <ProgressRing value={pct} max={100} size={44} stroke={5} color={color} label={`${pct}%`}>
                <span className="font-mono text-[11px] font-semibold tnum">{pct}</span>
              </ProgressRing>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">{a.title}</span>
                <span className="block font-mono text-[11px] text-ink-3 uppercase">{new Date(a.finishedAt).toLocaleString(hi ? "hi-IN" : "en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              </span>
              <ArrowRight className="size-4 text-ink-3" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
