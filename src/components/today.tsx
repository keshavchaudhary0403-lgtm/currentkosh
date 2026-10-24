"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Check, Target, Waypoints } from "lucide-react";
import { dueCount, useProgress } from "@/lib/progress-store";
import type { StoryCardData as Story } from "@/lib/store";
import { istDate } from "@/lib/dates";
import { t } from "@/lib/i18n";
import { categoryById, pick, type Bi, type Lang } from "@/lib/taxonomy";
import { catStyle } from "./category-icon";
import { FeaturedStory, StoryCard, StoryRows } from "./story-card";
import { cx } from "./ui";

type Item = { story: Story; relevance: number };

function useMission(date: string, briefIds: string[], isLatest = true) {
  const p = useProgress();
  const read = briefIds.filter((id) => p.reads[id]).length;
  // A daily quiz records only when it was taken, so "done" applies to the latest day's mission.
  const quizDone = isLatest && p.attempts.some((a) => a.kind === "daily" && istDate(new Date(a.finishedAt)) === istDate());
  const due = dueCount(p);
  const steps = [read === briefIds.length && briefIds.length > 0, quizDone, due === 0 && read > 0];
  return { p, read, quizDone, due, steps, done: steps.filter(Boolean).length };
}

/**
 * One slim line above the news: the date control on the left; reading progress, today's quiz
 * and revision as small links on the right. Keeps the stories at the top of the screen.
 */
export function TodayHeader({
  date,
  briefIds,
  lang,
  isLatest = true,
  picker,
}: {
  date: string;
  briefIds: string[];
  focus?: string[];
  lang: Lang;
  isLatest?: boolean;
  picker?: React.ReactNode;
}) {
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  const { p, read, quizDone, due } = useMission(date, briefIds, isLatest);
  const total = briefIds.length;
  const nextUnread = briefIds.find((id) => !p.reads[id]);
  const link = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold transition hover:bg-surface-2";
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <h1 className="sr-only">{isLatest ? (hi ? "आज की ख़बरें" : "Today's news") : hi ? "इस दिन की ख़बरें" : "News for this day"}</h1>
      {picker}
      <nav className="flex w-full flex-nowrap items-center gap-2 sm:w-auto" aria-label={hi ? "आज की प्रगति" : "Today's progress"}>
        <Link href={nextUnread ? `/story/${nextUnread}` : "#brief"} className={cx(link, "mr-auto whitespace-nowrap sm:mr-0", read === total && total > 0 ? "text-good" : "text-ink-2")}>
          {read === total && total > 0 && <Check className="size-4" strokeWidth={2.4} />}
          {read}/{total} {hi ? "पढ़ीं" : "read"}
        </Link>
        <Link
          href={`/practice/run?kind=daily&from=${date}&to=${date}`}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold whitespace-nowrap transition hover:brightness-95 data-[done=true]:bg-good-soft data-[done=true]:text-good bg-accent-2-soft text-accent-2"
          data-done={quizDone}
        >
          {quizDone && <Check className="size-4" strokeWidth={2.4} />}
          {hi ? "क्विज़" : "Quiz"}
        </Link>
        <Link href="/revise" className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-violet-soft whitespace-nowrap px-3.5 text-sm font-semibold text-violet transition hover:brightness-95">
          {hi ? "दोहराएँ" : "Revise"}
          {due > 0 && <span className="rounded-full bg-violet px-1.5 text-xs leading-5 text-white">{due}</span>}
        </Link>
      </nav>
    </header>
  );
}

/** Topic chips, the top story, then the rest as cards. */
export function Brief({ items, lang }: { items: Item[]; lang: Lang }) {
  const p = useProgress();
  const ui = lang === "bi" ? "en" : lang;
  const [topic, setTopic] = useState<string | null>(null);
  const counts = new Map<string, number>();
  for (const { story } of items) counts.set(story.category, (counts.get(story.category) ?? 0) + 1);
  const shown = topic ? items.filter((i) => i.story.category === topic) : items;
  const [first, ...rest] = shown;

  return (
    <div id="brief" className="scroll-mt-20 space-y-3">
      {counts.size > 1 && (
        <div className="hidden flex-wrap gap-2 sm:flex">
          <Chip active={!topic} onClick={() => setTopic(null)}>
            {ui === "hi" ? "सभी" : "All"} · {items.length}
          </Chip>
          {[...counts.entries()].map(([id, n]) => (
            <Chip key={id} active={topic === id} onClick={() => setTopic(topic === id ? null : id)} cat={id}>
              {pick(categoryById(id)?.label, ui)} · {n}
            </Chip>
          ))}
        </div>
      )}
      {first && <FeaturedStory key={first.story.id} story={first.story} lang={lang} relevance={first.relevance} read={!!p.reads[first.story.id]} />}
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

function Chip({ active, onClick, cat, children }: { active: boolean; onClick: () => void; cat?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={cat ? catStyle(cat) : undefined}
      className={cx(
        "cat shrink-0 rounded-full border-2 px-3.5 py-1.5 text-[13px] font-bold whitespace-nowrap transition active:scale-95",
        active ? (cat ? "border-transparent bg-(--cat-solid) text-white" : "border-transparent bg-accent text-white") : "border-line bg-surface text-ink-2 hover:border-line-strong",
      )}
    >
      {children}
    </button>
  );
}

/** Cards used by Library, Saved and "Also today". */
export function StoryList({ items, lang, showDate }: { items: Item[]; lang: Lang; showDate?: boolean }) {
  const p = useProgress();
  return (
    <StoryRows>
      {items.map(({ story, relevance }) => (
        <StoryCard key={story.id} story={story} lang={lang} relevance={relevance} read={!!p.reads[story.id]} showDate={showDate} />
      ))}
    </StoryRows>
  );
}

/** Lower-priority stories, folded away until asked for. */
export function MoreStories({ items, lang }: { items: Item[]; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const hi = lang === "hi";
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="btn btn-ghost w-full py-3 text-[15px] sm:mx-auto sm:flex sm:w-auto sm:px-8">
        {hi ? `${items.length} और ख़बरें देखें (कम प्राथमिकता)` : `Show ${items.length} more stories (lower priority for your exams)`}
      </button>
    );
  return (
    <section>
      <h2 className="mb-3 font-display text-lg">{hi ? "और भी आज" : "Also today"}</h2>
      <StoryList items={items} lang={lang} />
    </section>
  );
}

/** After the brief: nudge to lock it in with the quiz. */
export function NextSteps({ date, lang }: { date: string; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  return (
    <Link
      href={`/practice/run?kind=daily&from=${date}&to=${date}`}
      className="tap flex items-center gap-3 rounded-2xl bg-accent-2-soft px-4 py-3.5 sm:px-5"
    >
      <Target className="size-5 shrink-0 text-accent-2" strokeWidth={2} />
      <span className="min-w-0 flex-1 text-[15px] font-semibold">
        {hi ? "पढ़ लिया? अब आज का क्विज़ दें" : "Done reading? Take today's quiz"}
        <span className="block text-xs font-normal text-ink-2">{hi ? "10 प्रश्न · लगभग 5 मिनट" : "10 questions · about 5 min"}</span>
      </span>
      <span className="text-sm font-semibold text-accent-2">{hi ? "शुरू करें" : "Start"} →</span>
    </Link>
  );
}

/** Desktop side panel: progress, countdown, storylines. */
export function TodayRail({
  countdown,
  threads,
  lang,
}: {
  countdown: number | null;
  threads: { key: string; title: Bi; count: number; lastDate: string }[];
  lang: Lang;
}) {
  const ui = lang === "bi" ? "en" : lang;
  return (
    <aside className="sticky top-20 hidden space-y-4 self-start lg:block">
      {countdown !== null && countdown >= 0 && (
        <div className="flex items-center gap-3 rounded-3xl bg-pink-soft p-4">
          <CalendarDays className="size-5 shrink-0 text-pink" />
          <span className="text-sm font-semibold text-ink-2">
            <b className="font-display text-lg text-pink">{countdown}</b> {ui === "hi" ? "दिन परीक्षा तक" : "days to your exam"}
          </span>
        </div>
      )}
      {threads.length > 0 && (
        <div className="rounded-3xl border border-line bg-surface p-4">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="flex items-center gap-2 font-display text-base">
              <Waypoints className="size-4 text-pink" /> {t("threads", ui)}
            </span>
            <Link href="/threads" className="text-xs font-bold text-accent">
              {ui === "hi" ? "सभी" : "See all"}
            </Link>
          </div>
          <ul>
            {threads.slice(0, 6).map((th) => (
              <li key={th.key}>
                <Link href={`/thread/${th.key}`} className="flex items-center justify-between gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink">
                  <span lang={ui === "hi" ? "hi" : undefined} className="truncate">
                    {pick(th.title, ui)}
                  </span>
                  <span className="shrink-0 rounded-full bg-pink-soft px-2 py-0.5 text-xs font-extrabold text-pink">{th.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
