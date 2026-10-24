"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Brain, CalendarDays, Check, Flame, Newspaper, Target, Waypoints } from "lucide-react";
import { dueCount, streak, useProgress } from "@/lib/progress-store";
import type { StoryCardData as Story } from "@/lib/store";
import { istDate } from "@/lib/dates";
import { t } from "@/lib/i18n";
import { categoryById, pick, type Bi, type Lang } from "@/lib/taxonomy";
import { catStyle } from "./category-icon";
import { FeaturedStory, StoryCard, StoryRow, StoryRows } from "./story-card";
import { ProgressRing, cx, fmtDate } from "./ui";

type Item = { story: Story; relevance: number };

function useMission(briefIds: string[], isLatest = true) {
  const p = useProgress();
  const read = briefIds.filter((id) => p.reads[id]).length;
  // A daily quiz records only when it was taken, so "done" applies to the latest day's mission.
  const quizDone = isLatest && p.attempts.some((a) => a.kind === "daily" && istDate(new Date(a.finishedAt)) === istDate());
  const due = dueCount(p);
  return { p, read, quizDone, due };
}

/** Edition line, big serif title and the date strip. */
export function TodayHeader({ date, lang, isLatest = true, edition, exams, picker }: { date: string; lang: Lang; isLatest?: boolean; edition: number; exams: string; picker?: React.ReactNode }) {
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  return (
    <header className="rise grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-end">
      <div className="min-w-0">
        <div className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-3">
          <span className="inline-flex items-center gap-1.5 text-good-ink">
            <span className="live-dot" /> {isLatest ? (hi ? "ताज़ा" : "Live") : hi ? "पुराना अंक" : "Archive"}
          </span>
          <span>{fmtDate(date, ui, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
          <span>
            {hi ? "अंक" : "Edition"} {edition}
          </span>
        </div>
        <h1 className="mt-2 font-display text-[46px] sm:text-[68px]">
          {isLatest ? (
            hi ? (
              "आज का सार"
            ) : (
              <>
                Today&apos;s <span className="italic">brief</span>
              </>
            )
          ) : hi ? (
            `${fmtDate(date, ui, { day: "numeric", month: "long" })} का सार`
          ) : (
            <>
              Brief · <span className="italic">{fmtDate(date, ui, { day: "numeric", month: "long" })}</span>
            </>
          )}
        </h1>
        <p className="mt-1 text-sm text-ink-2">{hi ? `${exams} के लिए क्रमबद्ध` : `Ranked for ${exams}`}</p>
      </div>
      {picker && <div className="min-w-0">{picker}</div>}
    </header>
  );
}

/** Dark mission card: reading ring and the three steps of a study day. */
export function MissionCard({ date, briefIds, lang, isLatest = true, countdown }: { date: string; briefIds: string[]; lang: Lang; isLatest?: boolean; countdown: number | null }) {
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  const { p, read, quizDone, due } = useMission(briefIds, isLatest);
  const total = briefIds.length;
  const nextUnread = briefIds.find((id) => !p.reads[id]);
  const days = streak(p);
  const steps = [
    {
      done: total > 0 && read === total,
      icon: Newspaper,
      label: hi ? "सार पढ़ें" : "Read the brief",
      meta: `${read}/${total}`,
      href: nextUnread ? `/story/${nextUnread}` : "#brief",
    },
    {
      done: quizDone,
      icon: Target,
      label: hi ? "डेली क्विज़" : "Daily quiz",
      meta: hi ? "10 प्रश्न" : "10 Qs",
      href: `/practice/run?kind=daily&from=${date}&to=${date}`,
    },
    {
      done: due === 0 && read > 0,
      icon: Brain,
      label: hi ? "दोहराव" : "Revise",
      meta: due ? `${due} ${hi ? "बाकी" : "due"}` : hi ? "पूरा" : "clear",
      href: "/revise",
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  return (
    <section className="relative flex flex-col overflow-hidden rounded-[24px] bg-[#10110e] p-5 text-[#f3f2ec] dark:bg-card dark:shadow-[inset_0_0_0_1px_var(--line-2)] sm:p-6" aria-label={hi ? "आज का मिशन" : "Today's mission"}>
      <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-[#c8f135] opacity-20 blur-3xl" />
      <div className="relative flex items-center gap-4">
        <ProgressRing value={read} max={total || 1} size={84} stroke={9} color="#c8f135" track="rgb(255 255 255 / 0.1)" label={`${read} of ${total} read`}>
          <span className="font-display text-[28px] leading-none tnum">
            {read}
            <span className="text-base text-white/50">/{total}</span>
          </span>
        </ProgressRing>
        <div className="min-w-0">
          <div className="eyebrow text-white/50">{hi ? "आज का मिशन" : "Today's mission"}</div>
          <div className="mt-1 font-display text-[28px] leading-tight">
            {doneCount === 3 ? (hi ? "सब पूरा!" : "All done!") : hi ? `${doneCount}/3 पूरे` : `${doneCount} of 3 done`}
          </div>
        </div>
      </div>
      <ol className="relative mt-5 space-y-1.5">
        {steps.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className={cx("group flex min-h-12 items-center gap-3 rounded-2xl px-3 transition", s.done ? "bg-white/5" : "bg-white/8 hover:bg-white/14")}>
              <span className={cx("grid size-7 shrink-0 place-items-center rounded-full transition", s.done ? "pop bg-[#c8f135] text-[#10110e]" : "ring-1 ring-white/25")}>
                {s.done ? <Check className="size-4" strokeWidth={3} /> : <s.icon className="size-3.5 text-white/70" />}
              </span>
              <span className={cx("flex-1 text-sm font-semibold", s.done && "text-white/55 line-through decoration-white/30")}>{s.label}</span>
              <span className="font-mono text-[11px] text-white/55 tnum">{s.meta}</span>
              <ArrowRight className="size-4 text-white/40 transition group-hover:translate-x-0.5 group-hover:text-white" />
            </Link>
          </li>
        ))}
      </ol>
      <div className="relative mt-auto flex items-center gap-4 pt-5 text-sm">
        <span className="inline-flex items-center gap-1.5 text-white/75">
          <Flame className={cx("size-4 text-[#c8f135]", days > 0 && "flicker")} /> <b className="tnum">{days}</b> {hi ? "दिन" : days === 1 ? "day streak" : "day streak"}
        </span>
        {countdown !== null && countdown >= 0 && (
          <span className="inline-flex items-center gap-1.5 text-white/75">
            <CalendarDays className="size-4 text-[#c8f135]" /> <b className="tnum">{countdown}</b> {hi ? "दिन परीक्षा तक" : "days to exam"}
          </span>
        )}
      </div>
    </section>
  );
}

/** Topic chips, the top story beside the mission card, then the rest as tiles. */
export function Brief({ items, lang, aside }: { items: Item[]; lang: Lang; aside?: React.ReactNode }) {
  const p = useProgress();
  const ui = lang === "bi" ? "en" : lang;
  const [topic, setTopic] = useState<string | null>(null);
  const counts = new Map<string, number>();
  for (const { story } of items) counts.set(story.category, (counts.get(story.category) ?? 0) + 1);
  const shown = topic ? items.filter((i) => i.story.category === topic) : items;
  const [first, ...rest] = shown;

  return (
    <div id="brief" className="scroll-mt-24 space-y-4">
      {counts.size > 1 && (
        <div className="no-scrollbar max-sm:fade-x -mx-4 flex gap-2 overflow-x-auto px-4 py-0.5 sm:mx-0 sm:flex-wrap sm:px-0" role="toolbar" aria-label={ui === "hi" ? "विषय" : "Topics"}>
          <button className="chip" aria-pressed={!topic} onClick={() => setTopic(null)}>
            {ui === "hi" ? "सभी" : "All"} <span className="font-mono text-[11px] opacity-60">{items.length}</span>
          </button>
          {[...counts.entries()].map(([id, n]) => (
            <button key={id} className="chip cat" style={catStyle(id)} aria-pressed={topic === id} onClick={() => setTopic(topic === id ? null : id)}>
              <span className="size-2 rounded-full bg-(--cat-solid)" />
              {pick(categoryById(id)?.label, ui)} <span className="font-mono text-[11px] opacity-60">{n}</span>
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-3 lg:grid-cols-12">
        {first && <FeaturedStory key={first.story.id} story={first.story} lang={lang} relevance={first.relevance} read={!!p.reads[first.story.id]} className={cx("rise", aside ? "lg:col-span-8" : "lg:col-span-12")} />}
        {aside && <div className="rise lg:col-span-4 [&>section]:h-full">{aside}</div>}
      </div>
      {rest.length > 0 && (
        <StoryRows>
          {rest.map(({ story, relevance }, i) => (
            <StoryCard key={story.id} story={story} lang={lang} relevance={relevance} read={!!p.reads[story.id]} index={i + 2} />
          ))}
        </StoryRows>
      )}
    </div>
  );
}

/** Stories as tiles (Library, Saved) or as compact rows in one card. */
export function StoryList({ items, lang, showDate, variant = "grid" }: { items: Item[]; lang: Lang; showDate?: boolean; variant?: "grid" | "rows" }) {
  const p = useProgress();
  if (variant === "rows")
    return (
      <div className="card divide-y divide-line overflow-hidden">
        {items.map(({ story, relevance }) => (
          <StoryRow key={story.id} story={story} lang={lang} relevance={relevance} read={!!p.reads[story.id]} showDate={showDate} />
        ))}
      </div>
    );
  return (
    <StoryRows>
      {items.map(({ story, relevance }) => (
        <StoryCard key={story.id} story={story} lang={lang} relevance={relevance} read={!!p.reads[story.id]} showDate={showDate} />
      ))}
    </StoryRows>
  );
}

/** Lower-priority stories for the day, always shown under the main brief. */
export function MoreStories({ items, lang }: { items: Item[]; lang: Lang }) {
  const hi = lang === "hi";
  return (
    <section className="reveal space-y-3 pt-4">
      <div>
        <div className="eyebrow mb-1 text-ink-3">{hi ? "आपकी परीक्षाओं के लिए कम प्राथमिकता" : "Lower priority for your exams"}</div>
        <h2 className="font-display text-[32px] sm:text-[40px]">{hi ? "और भी आज" : <>Also <span className="italic">today</span></>}</h2>
      </div>
      <StoryList items={items} lang={lang} variant="rows" />
    </section>
  );
}

/** After the brief: a big lime nudge to lock it in with the quiz. */
export function NextSteps({ date, lang }: { date: string; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  return (
    <Link href={`/practice/run?kind=daily&from=${date}&to=${date}`} className="reveal lift group relative flex items-center gap-4 overflow-hidden rounded-[24px] bg-signal p-5 text-on-signal sm:p-7">
      <span aria-hidden className="absolute -right-10 -bottom-16 size-48 rounded-full border-[18px] border-black/5 transition duration-700 group-hover:scale-125" />
      <span className="grid size-14 shrink-0 place-items-center rounded-[18px] bg-[#10110e] text-[#c8f135] transition duration-500 group-hover:rotate-12">
        <Target className="size-7" strokeWidth={2} />
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block font-display text-[28px] leading-tight sm:text-[36px]">{hi ? "पढ़ लिया? अब क्विज़ दें" : "Done reading? Lock it in."}</span>
        <span className="mt-0.5 block text-sm font-medium opacity-70">{hi ? "10 प्रश्न · लगभग 5 मिनट" : "Today's quiz · 10 questions · about 5 min"}</span>
      </span>
      <span className="relative hidden h-12 items-center gap-2 rounded-full bg-[#10110e] px-5 text-sm font-semibold text-[#f3f2ec] sm:inline-flex">
        {hi ? "शुरू करें" : "Start"} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

/** Ongoing storylines as a swipeable row of cards. */
export function Storylines({ threads, lang }: { threads: { key: string; title: Bi; count: number; lastDate: string }[]; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  if (!threads.length) return null;
  return (
    <section className="reveal space-y-3 pt-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-1 text-ink-3">{hi ? "पूरा संदर्भ, क्रम से" : "The whole context, in order"}</div>
          <h2 className="font-display text-[32px] sm:text-[40px]">{t("threads", ui)}</h2>
        </div>
        <Link href="/threads" className="btn btn-ghost h-11 px-4 text-sm">
          {hi ? "सभी" : "See all"} <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {threads.map((th, i) => (
          <Link
            key={th.key}
            href={`/thread/${th.key}`}
            className="card lift group flex w-[260px] shrink-0 snap-start flex-col p-4 sm:w-[280px]"
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className="flex items-center justify-between">
              <span className="grid size-9 place-items-center rounded-xl bg-amber-soft text-amber-ink">
                <Waypoints className="size-[18px]" />
              </span>
              <span className="font-mono text-[11px] text-ink-3 uppercase">{fmtDate(th.lastDate, ui, { day: "numeric", month: "short" })}</span>
            </span>
            <span lang={hi ? "hi" : undefined} className="mt-3 line-clamp-2 text-[15px] leading-snug font-semibold">
              {pick(th.title, ui)}
            </span>
            <span className="mt-auto flex items-center gap-2 pt-4">
              <span className="flex -space-x-1">
                {Array.from({ length: Math.min(4, th.count) }, (_, j) => (
                  <span key={j} className="size-2.5 rounded-full bg-amber ring-2 ring-card" style={{ opacity: 1 - j * 0.2 }} />
                ))}
              </span>
              <span className="text-xs font-semibold text-ink-2">
                {th.count} {hi ? "अपडेट" : "updates"}
              </span>
              <ArrowUpRight className="ml-auto size-4 text-ink-3 transition group-hover:rotate-45 group-hover:text-ink" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
