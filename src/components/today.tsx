"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Brain, CalendarDays, Flame, Sparkles, Target, Waypoints } from "lucide-react";
import { dueCount, streak, useProgress } from "@/lib/progress-store";
import type { Story } from "@/lib/store";
import { t } from "@/lib/i18n";
import { categoryById, pick, type Bi, type Lang } from "@/lib/taxonomy";
import { catStyle } from "./category-icon";
import { FeaturedStory, StoryCard } from "./story-card";
import { ProgressRing, cx, fmtDate } from "./ui";

type Item = { story: Story; relevance: number };

/** Compact header: greeting, date and a progress bar for the day's brief. */
export function TodayHeader({ date, briefIds, lang }: { date: string; briefIds: string[]; lang: Lang }) {
  const p = useProgress();
  const ui = lang === "bi" ? "en" : lang;
  const read = briefIds.filter((id) => p.reads[id]).length;
  const total = briefIds.length;
  const done = total > 0 && read === total;
  const days = streak(p);
  return (
    <header className="mb-5 sm:mb-6">
      <div className="flex items-center gap-2 text-[13px] text-ink-3">
        <span className="live-dot" />
        {fmtDate(date, ui, { weekday: "short", day: "numeric", month: "short" })}
        {total > 0 && (
          <>
            <span>·</span>
            {ui === "hi" ? `${total} ख़बरें · ${total * 2} मिनट` : `${total} stories · ${total * 2} min`}
          </>
        )}
      </div>
      <h1 className="mt-1 font-display text-[32px] leading-tight sm:text-5xl">
        {done ? (
          t("done", ui)
        ) : (
          <>
            {ui === "hi" ? "आज का " : "Today's "}
            <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">{ui === "hi" ? "सार" : "brief"}</span>
          </>
        )}
      </h1>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-strong">
          <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-700" style={{ width: `${total ? (read / total) * 100 : 0}%` }} />
        </div>
        <span className="text-sm font-semibold tabular-nums">
          {read}/{total}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold lg:hidden" title={t("streak", ui)}>
          <Flame className="size-4 text-accent-2" />
          {days}
        </span>
      </div>
    </header>
  );
}

/** The brief: topic filter chips, the featured top story, then the rest. */
export function Brief({ items, lang }: { items: Item[]; lang: Lang }) {
  const p = useProgress();
  const ui = lang === "bi" ? "en" : lang;
  const [topic, setTopic] = useState<string | null>(null);
  const counts = new Map<string, number>();
  for (const { story } of items) counts.set(story.category, (counts.get(story.category) ?? 0) + 1);
  const shown = topic ? items.filter((i) => i.story.category === topic) : items;
  const [first, ...rest] = shown;

  return (
    <div>
      {counts.size > 1 && (
        <div className="mb-4 hidden flex-wrap gap-2 sm:flex">
          <Chip active={!topic} onClick={() => setTopic(null)}>
            {ui === "hi" ? "सभी" : "All"} <span className="opacity-60">{items.length}</span>
          </Chip>
          {[...counts.entries()].map(([id, n]) => (
            <Chip key={id} active={topic === id} onClick={() => setTopic(topic === id ? null : id)} hueOf={id}>
              {pick(categoryById(id)?.label, ui)} <span className="opacity-60">{n}</span>
            </Chip>
          ))}
        </div>
      )}
      {first && (
        <div className="rise">
          <FeaturedStory story={first.story} lang={lang} relevance={first.relevance} read={!!p.reads[first.story.id]} />
        </div>
      )}
      <div className="mt-3 space-y-2.5 sm:space-y-3">
        {rest.map(({ story, relevance }, i) => (
          <div key={story.id} className="rise" style={{ animationDelay: `${Math.min(i + 1, 10) * 40}ms` }}>
            <StoryCard story={story} lang={lang} relevance={relevance} read={!!p.reads[story.id]} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children, hueOf }: { active: boolean; onClick: () => void; children: React.ReactNode; hueOf?: string }) {
  return (
    <button
      onClick={onClick}
      style={hueOf ? catStyle(hueOf) : undefined}
      className={cx(
        "cat inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition",
        active ? (hueOf ? "border-transparent bg-(--cat-tint) text-(--cat-ink)" : "border-ink bg-ink text-bg") : "border-line bg-surface text-ink-2 hover:border-line-strong",
      )}
    >
      {children}
    </button>
  );
}

/** Simple list used by Archive, Saved and "Also today". */
export function StoryList({ items, lang, compact, grid }: { items: Item[]; lang: Lang; compact?: boolean; grid?: boolean }) {
  const p = useProgress();
  return (
    <div className={grid ? "grid gap-3 md:grid-cols-2" : "space-y-3"}>
      {items.map(({ story, relevance }, i) => (
        <div key={story.id} className="rise" style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}>
          <StoryCard story={story} lang={lang} relevance={relevance} read={!!p.reads[story.id]} compact={compact} />
        </div>
      ))}
    </div>
  );
}

function QuizCta({ date, ui }: { date: string; ui: "en" | "hi" }) {
  return (
    <Link
      href={`/practice/run?kind=daily&from=${date}&to=${date}`}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-accent-2 p-5 text-white shadow-card transition hover:shadow-xl active:scale-[.99]"
    >
      <Target className="size-9 shrink-0 opacity-90" strokeWidth={1.6} />
      <span className="flex-1">
        <span className="block font-display text-lg">{t("startQuiz", ui)}</span>
        <span className="block text-sm opacity-85">{ui === "hi" ? "10 प्रश्न · आपकी परीक्षा शैली में" : "10 questions in your exam's style"}</span>
      </span>
      <ArrowRight className="size-5 transition group-hover:translate-x-1" />
    </Link>
  );
}

function ReviseCta({ ui }: { ui: "en" | "hi" }) {
  const due = dueCount(useProgress());
  return (
    <Link href="/revise" className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:border-line-strong">
      <span className="relative">
        <Brain className="size-9 text-accent" strokeWidth={1.6} />
        {due > 0 && <span className="absolute -top-1 -right-2 grid min-w-5 place-items-center rounded-full bg-accent-2 px-1 text-[11px] leading-5 font-bold text-white">{due}</span>}
      </span>
      <span className="flex-1">
        <span className="block font-semibold">{due > 0 ? (ui === "hi" ? `${due} कार्ड दोहराने हैं` : `${due} cards ${t("dueNow", ui)}`) : ui === "hi" ? "दोहराव" : "Revision"}</span>
        <span className="block text-sm text-ink-2">{ui === "hi" ? "पढ़ी गई ख़बरें यहाँ याद रखने लायक बनती हैं" : "What you read comes back here tomorrow"}</span>
      </span>
      <ArrowRight className="size-5 text-ink-3 transition group-hover:translate-x-1" />
    </Link>
  );
}

/** Quiz + revision prompts below the brief on phones. */
export function NextSteps({ date, lang }: { date: string; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:hidden">
      <QuizCta date={date} ui={ui} />
      <ReviseCta ui={ui} />
    </section>
  );
}

/** Desktop side panel: progress, today's quiz, revision, countdown, storylines. */
export function TodayRail({
  date,
  briefIds,
  countdown,
  threads,
  lang,
}: {
  date: string;
  briefIds: string[];
  countdown: number | null;
  threads: { key: string; title: Bi; count: number; lastDate: string }[];
  lang: Lang;
}) {
  const p = useProgress();
  const ui = lang === "bi" ? "en" : lang;
  const read = briefIds.filter((id) => p.reads[id]).length;
  return (
    <aside className="sticky top-20 hidden space-y-4 lg:block">
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <div className="flex items-center gap-4">
          <ProgressRing value={read} max={briefIds.length || 1} size={76} stroke={7}>
            <span className="font-display text-xl">
              {read}
              <span className="text-sm text-ink-3">/{briefIds.length}</span>
            </span>
          </ProgressRing>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-1.5">
              <Flame className="size-4 text-accent-2" /> <b>{streak(p)}</b> <span className="text-ink-3">{t("streak", ui)}</span>
            </div>
            {countdown !== null && countdown >= 0 && (
              <div className="flex items-center gap-1.5">
                <CalendarDays className="size-4 text-accent" /> <b>{countdown}</b> <span className="text-ink-3">{ui === "hi" ? "दिन परीक्षा तक" : "days to exam"}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-4 text-good" /> <b>{Object.keys(p.reads).length}</b> <span className="text-ink-3">{ui === "hi" ? "कुल पढ़ी" : "stories read"}</span>
            </div>
          </div>
        </div>
      </div>
      <QuizCta date={date} ui={ui} />
      <ReviseCta ui={ui} />
      {threads.length > 0 && (
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-ink-3 uppercase">
              <Waypoints className="size-4" /> {t("threads", ui)}
            </span>
            <Link href="/threads" className="text-xs font-semibold text-accent">
              {ui === "hi" ? "सभी" : "All"} →
            </Link>
          </div>
          <ul className="space-y-1">
            {threads.slice(0, 6).map((th) => (
              <li key={th.key}>
                <Link href={`/thread/${th.key}`} className="-mx-2 flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2">
                  <span lang={ui === "hi" ? "hi" : undefined} className="truncate">
                    {pick(th.title, ui)}
                  </span>
                  <span className="shrink-0 text-xs text-ink-3">{th.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
