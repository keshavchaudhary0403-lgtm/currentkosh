"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpenCheck, Brain, CalendarDays, Check, Target, Waypoints } from "lucide-react";
import { dueCount, useProgress } from "@/lib/progress-store";
import type { Story } from "@/lib/store";
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

/** Today's study plan: read and understand, recall with a short quiz, revise. A guide, not a race. */
export function TodayHeader({
  date,
  briefIds,
  focus = [],
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
  const { p, read, quizDone, due, steps, done } = useMission(date, briefIds, isLatest);
  const total = briefIds.length;
  const nextUnread = briefIds.find((id) => !p.reads[id]);
  const quizHref = `/practice/run?kind=daily&from=${date}&to=${date}`;
  const rows = [
    {
      icon: BookOpenCheck,
      title: hi ? "पढ़ें और समझें" : "Read & understand",
      short: hi ? "पढ़ें" : "Read",
      hint: hi ? `${total} ख़बरें` : `${total} stories`,
      status: read > 0 && !steps[0] ? `${read}/${total}` : null,
      href: nextUnread ? `/story/${nextUnread}` : "#brief",
      done: steps[0],
    },
    {
      icon: Target,
      title: hi ? "क्विज़ से परखें" : "Recall with a quiz",
      short: hi ? "क्विज़" : "Quiz",
      hint: hi ? "10 प्रश्न" : "10 questions",
      status: null,
      href: quizHref,
      done: steps[1],
    },
    {
      icon: Brain,
      title: hi ? "पढ़ी ख़बरें दोहराएँ" : "Revise what you learned",
      short: hi ? "दोहराएँ" : "Revise",
      hint: due ? (hi ? `${due} कार्ड` : `${due} cards`) : hi ? "कल से" : "From tomorrow",
      status: null,
      href: "/revise",
      done: steps[2],
    },
  ];
  const cta = !steps[0] && nextUnread
    ? { href: `/story/${nextUnread}`, label: read ? (hi ? "जारी रखें" : "Continue reading") : hi ? "पढ़ना शुरू करें" : "Start reading" }
    : !quizDone
      ? { href: quizHref, label: hi ? "क्विज़ से परखें" : "Check your recall" }
      : due
        ? { href: "/revise/session", label: hi ? "दोहराव शुरू करें" : "Start revising" }
        : null;

  return (
    <header className="rounded-3xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-xl leading-tight sm:text-2xl">
            {done === 3 ? (hi ? "आज की पढ़ाई पूरी 🌱" : "Today's essentials covered 🌱") : isLatest ? (hi ? "आज की पढ़ाई" : "Today's study plan") : hi ? "इस दिन की पढ़ाई" : "Study this day"}
          </h1>
          {focus.length > 0 && (
            <p className="mt-0.5 truncate text-sm text-ink-2">
              {hi ? "फ़ोकस: " : "Focus: "}
              <span className="font-semibold text-ink">{focus.join(" · ")}</span>
            </p>
          )}
        </div>
        {picker}
      </div>

      <div className="mt-3 flex items-stretch gap-2">
        <ol className="grid min-w-0 flex-1 grid-cols-3 gap-2">
          {rows.map((r, i) => (
            <li key={i}>
              <Link
                href={r.href}
                title={r.title}
                className={cx(
                  "flex h-full flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center transition hover:brightness-[.97] sm:flex-row sm:justify-start sm:gap-2.5 sm:px-3 sm:text-left",
                  r.done ? "bg-good-soft" : "bg-surface-2",
                )}
              >
                <span className={cx("grid size-8 shrink-0 place-items-center rounded-xl", r.done ? "bg-good text-white" : "bg-accent-soft text-accent")}>
                  {r.done ? <Check className="size-4" strokeWidth={2.8} /> : <r.icon className="size-4" strokeWidth={2.2} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{r.short}</span>
                  <span className="hidden truncate text-[11px] text-ink-3 sm:block">{r.done ? (hi ? "हो गया" : "Done") : (r.status ?? r.hint)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        {cta && (
          <Link href={cta.href} className="btn hidden shrink-0 px-5 text-sm sm:inline-flex">
            {cta.label} <ArrowRight className="size-4" />
          </Link>
        )}
      </div>

      {cta && (
        <Link href={cta.href} className="btn mt-2 w-full py-2.5 text-sm sm:hidden">
          {cta.label} <ArrowRight className="size-4" />
        </Link>
      )}
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
      <button onClick={() => setOpen(true)} className="btn btn-ghost w-full py-3 text-sm">
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
    <section className="flex items-center gap-4 rounded-3xl bg-accent-2-soft p-5">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-2 text-white">
        <Target className="size-6" strokeWidth={2.4} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-lg leading-tight">{hi ? "पढ़ लिया? अब परखें!" : "Read it? Now lock it in!"}</div>
        <div className="text-sm text-ink-2">{hi ? "आज की ख़बरों पर 10 प्रश्न" : "10 quick questions on today's news"}</div>
      </div>
      <Link href={`/practice/run?kind=daily&from=${date}&to=${date}`} className="btn btn-orange shrink-0 px-4 py-2.5 text-sm">
        {hi ? "शुरू" : "Start"} <ArrowRight className="size-4" strokeWidth={2.6} />
      </Link>
    </section>
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
                  <span className="shrink-0 rounded-full bg-pink-soft px-2 py-0.5 text-[11px] font-extrabold text-pink">{th.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
