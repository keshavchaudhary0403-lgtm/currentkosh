"use client";

import Link from "next/link";
import { useState } from "react";
import { Brain, CalendarDays, ChevronRight, Flame, Target, Waypoints } from "lucide-react";
import { dueCount, streak, useProgress } from "@/lib/progress-store";
import type { Story } from "@/lib/store";
import { t } from "@/lib/i18n";
import { categoryById, pick, type Bi, type Lang } from "@/lib/taxonomy";
import { FeaturedStory, StoryCard, StoryRows } from "./story-card";
import { ProgressRing, cx, fmtDate } from "./ui";

type Item = { story: Story; relevance: number };

/** Date, title and today's reading progress. */
export function TodayHeader({ date, briefIds, lang }: { date: string; briefIds: string[]; lang: Lang }) {
  const p = useProgress();
  const ui = lang === "bi" ? "en" : lang;
  const read = briefIds.filter((id) => p.reads[id]).length;
  const total = briefIds.length;
  const done = total > 0 && read === total;
  return (
    <header className="mb-5">
      <div className="text-[13px] text-ink-3">
        {fmtDate(date, ui, { weekday: "long", day: "numeric", month: "long" })}
        {total > 0 && <> · {ui === "hi" ? `${total} ख़बरें · ${total * 2} मिनट` : `${total} stories · ${total * 2} min`}</>}
      </div>
      <h1 className="mt-1 font-display text-[28px] leading-tight sm:text-4xl">{done ? t("done", ui) : t("todaysBrief", ui)}</h1>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${total ? (read / total) * 100 : 0}%` }} />
        </div>
        <span className="text-sm text-ink-2 tabular-nums">
          {read}/{total} {ui === "hi" ? "पढ़े" : "read"}
        </span>
        <span className="inline-flex items-center gap-1 text-sm text-ink-2 lg:hidden" title={t("streak", ui)}>
          <Flame className="size-4 text-accent-2" />
          {streak(p)}
        </span>
      </div>
    </header>
  );
}

/** Topic filter (desktop), the top story, then the rest as rows. */
export function Brief({ items, lang }: { items: Item[]; lang: Lang }) {
  const p = useProgress();
  const ui = lang === "bi" ? "en" : lang;
  const [topic, setTopic] = useState<string | null>(null);
  const counts = new Map<string, number>();
  for (const { story } of items) counts.set(story.category, (counts.get(story.category) ?? 0) + 1);
  const shown = topic ? items.filter((i) => i.story.category === topic) : items;
  const [first, ...rest] = shown;

  return (
    <div className="space-y-3">
      {counts.size > 1 && (
        <div className="hidden flex-wrap gap-1.5 sm:flex">
          <Chip active={!topic} onClick={() => setTopic(null)}>
            {ui === "hi" ? "सभी" : "All"} <span className="text-ink-3">{items.length}</span>
          </Chip>
          {[...counts.entries()].map(([id, n]) => (
            <Chip key={id} active={topic === id} onClick={() => setTopic(topic === id ? null : id)}>
              {pick(categoryById(id)?.label, ui)} <span className="text-ink-3">{n}</span>
            </Chip>
          ))}
        </div>
      )}
      {first && <FeaturedStory story={first.story} lang={lang} relevance={first.relevance} read={!!p.reads[first.story.id]} />}
      {rest.length > 0 && (
        <StoryRows>
          {rest.map(({ story, relevance }) => (
            <StoryCard key={story.id} story={story} lang={lang} relevance={relevance} read={!!p.reads[story.id]} />
          ))}
        </StoryRows>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[13px] font-medium whitespace-nowrap transition",
        active ? "border-ink bg-ink text-bg [&_span]:text-bg/70" : "border-line bg-surface text-ink-2 hover:border-line-strong",
      )}
    >
      {children}
    </button>
  );
}

/** Rows used by Archive, Saved and "Also today". */
export function StoryList({ items, lang }: { items: Item[]; lang: Lang; compact?: boolean; grid?: boolean }) {
  const p = useProgress();
  return (
    <StoryRows>
      {items.map(({ story, relevance }) => (
        <StoryCard key={story.id} story={story} lang={lang} relevance={relevance} read={!!p.reads[story.id]} />
      ))}
    </StoryRows>
  );
}

function ActionRow({ href, icon, title, hint, badge }: { href: string; icon: React.ReactNode; title: string; hint: string; badge?: number }) {
  return (
    <Link href={href} className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-surface-2">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium">{title}</span>
        <span className="block text-xs text-ink-3">{hint}</span>
      </span>
      {badge ? <span className="rounded-md bg-accent px-1.5 py-0.5 text-xs font-semibold text-white">{badge}</span> : null}
      <ChevronRight className="size-4 text-ink-3" />
    </Link>
  );
}

/** Quiz + revision, shown under the brief. */
export function NextSteps({ date, lang }: { date: string; lang: Lang }) {
  const due = dueCount(useProgress());
  const ui = lang === "bi" ? "en" : lang;
  return (
    <section className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface lg:hidden">
      <ActionRow
        href={`/practice/run?kind=daily&from=${date}&to=${date}`}
        icon={<Target className="size-[18px]" />}
        title={t("startQuiz", ui)}
        hint={ui === "hi" ? "10 प्रश्न · आपकी परीक्षा शैली में" : "10 questions in your exam's style"}
      />
      <ActionRow
        href="/revise"
        icon={<Brain className="size-[18px]" />}
        title={ui === "hi" ? "दोहराव" : "Revise"}
        hint={due > 0 ? (ui === "hi" ? `${due} कार्ड बाकी` : `${due} cards due`) : ui === "hi" ? "पढ़ी ख़बरें कल यहाँ आएँगी" : "What you read comes back tomorrow"}
        badge={due}
      />
    </section>
  );
}

/** Desktop side panel: progress, quiz, revision, storylines. */
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
  const due = dueCount(p);
  return (
    <aside className="sticky top-20 hidden space-y-4 lg:block">
      <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
        <ProgressRing value={read} max={briefIds.length || 1} size={64} stroke={6}>
          <span className="text-sm font-semibold tabular-nums">
            {read}/{briefIds.length}
          </span>
        </ProgressRing>
        <div className="space-y-1 text-sm text-ink-2">
          <div className="flex items-center gap-1.5">
            <Flame className="size-4 text-accent-2" /> <b className="text-ink">{streak(p)}</b> {t("streak", ui)}
          </div>
          {countdown !== null && countdown >= 0 && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-4 text-ink-3" /> <b className="text-ink">{countdown}</b> {ui === "hi" ? "दिन परीक्षा तक" : "days to exam"}
            </div>
          )}
        </div>
      </div>
      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        <ActionRow href={`/practice/run?kind=daily&from=${date}&to=${date}`} icon={<Target className="size-[18px]" />} title={t("startQuiz", ui)} hint={ui === "hi" ? "10 प्रश्न" : "10 questions"} />
        <ActionRow href="/revise" icon={<Brain className="size-[18px]" />} title={ui === "hi" ? "दोहराव" : "Revise"} hint={due > 0 ? `${due} ${ui === "hi" ? "बाकी" : "due"}` : ui === "hi" ? "सब पूरा" : "All caught up"} badge={due} />
      </div>
      {threads.length > 0 && (
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.1em] text-ink-3 uppercase">
              <Waypoints className="size-3.5" /> {t("threads", ui)}
            </span>
            <Link href="/threads" className="text-xs font-medium text-accent">
              {ui === "hi" ? "सभी" : "All"}
            </Link>
          </div>
          <ul>
            {threads.slice(0, 6).map((th) => (
              <li key={th.key}>
                <Link href={`/thread/${th.key}`} className="-mx-2 flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink">
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
