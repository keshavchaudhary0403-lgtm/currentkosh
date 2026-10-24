"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpenCheck, Brain, CalendarDays, Check, Flame, PartyPopper, Target, Waypoints } from "lucide-react";
import { dueCount, streak, useProgress } from "@/lib/progress-store";
import type { Story } from "@/lib/store";
import { istDate } from "@/lib/dates";
import { t } from "@/lib/i18n";
import { categoryById, pick, type Bi, type Lang } from "@/lib/taxonomy";
import { catStyle } from "./category-icon";
import { FeaturedStory, StoryCard, StoryRows } from "./story-card";
import { Confetti, ProgressRing, cx, fmtDate } from "./ui";

type Item = { story: Story; relevance: number };

function useMission(date: string, briefIds: string[]) {
  const p = useProgress();
  const read = briefIds.filter((id) => p.reads[id]).length;
  const quizDone = p.attempts.some((a) => a.kind === "daily" && istDate(new Date(a.finishedAt)) === istDate());
  const due = dueCount(p);
  const steps = [read === briefIds.length && briefIds.length > 0, quizDone, due === 0 && read > 0];
  return { p, read, quizDone, due, steps, done: steps.filter(Boolean).length };
}

/** The daily mission: read the brief, take the quiz, clear revision. */
export function TodayHeader({ date, briefIds, lang }: { date: string; briefIds: string[]; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const { p, read, quizDone, due, steps, done } = useMission(date, briefIds);
  const total = briefIds.length;
  const days = streak(p);
  const hi = ui === "hi";
  const rows = [
    {
      href: "#brief",
      icon: BookOpenCheck,
      short: hi ? "पढ़ें" : "Read",
      hint: `${read}/${total} ${hi ? "पढ़ीं" : "done"}`,
      done: steps[0],
    },
    {
      href: `/practice/run?kind=daily&from=${date}&to=${date}`,
      icon: Target,
      short: hi ? "क्विज़" : "Quiz",
      hint: quizDone ? (hi ? "पूरा" : "Done") : hi ? "10 प्रश्न" : "10 questions",
      done: steps[1],
    },
    {
      href: "/revise",
      icon: Brain,
      short: hi ? "दोहराएँ" : "Revise",
      hint: due ? `${due} ${hi ? "बाकी" : "due"}` : read ? (hi ? "सब पूरा" : "All clear") : hi ? "पढ़ने के बाद" : "After reading",
      done: steps[2],
    },
  ];

  return (
    <header className="relative mb-5 overflow-hidden rounded-3xl bg-accent p-5 text-white sm:p-6">
      {done === 3 && <Confetti key="mission" />}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-semibold text-white/75">{fmtDate(date, ui, { weekday: "long", day: "numeric", month: "long" })}</div>
          <h1 className="mt-0.5 font-display text-[26px] leading-tight sm:text-3xl">{done === 3 ? (hi ? "मिशन पूरा! 🎉" : "Mission complete! 🎉") : hi ? "आज का मिशन" : "Today's mission"}</h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-accent-2" title={t("streak", ui)}>
          <Flame className={cx("size-[18px]", days > 0 && "wiggle")} strokeWidth={2.6} />
          <span className="font-display text-base leading-none">{days}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-accent-press">
          <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${(done / 3) * 100}%` }} />
        </div>
        <span className="text-sm font-extrabold tabular-nums">{done}/3</span>
      </div>

      <ol className="mt-4 grid grid-cols-3 gap-2">
        {rows.map((r, i) => (
          <li key={i}>
            <Link
              href={r.href}
              className={cx(
                "flex h-full flex-col items-center gap-1.5 rounded-2xl px-1.5 py-3 text-center transition active:translate-y-[3px] active:shadow-none sm:flex-row sm:gap-3 sm:px-3 sm:text-left",
                r.done ? "bg-white/15" : "bg-white text-[#111827] shadow-[0_3px_0_0_var(--accent-press)]",
              )}
            >
              <span className={cx("grid size-9 shrink-0 place-items-center rounded-xl", r.done ? "pop bg-good text-white" : "bg-[#eceafe] text-[#4f46e5]")}>
                {r.done ? <Check className="size-5" strokeWidth={3.5} /> : <r.icon className="size-5" strokeWidth={2.4} />}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] leading-tight font-extrabold sm:text-sm">{r.short}</span>
                <span className={cx("mt-0.5 block text-[11px] leading-tight font-semibold sm:text-xs", r.done ? "text-white/80" : "text-[#6b7280]")}>{r.hint}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
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
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
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

/** Cards used by Archive, Saved and "Also today". */
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
  const ui = lang === "bi" ? "en" : lang;
  const { read } = useMission(date, briefIds);
  return (
    <aside className="sticky top-20 hidden space-y-4 lg:block">
      <div className="rounded-3xl border-2 border-line bg-surface p-5 text-center">
        <ProgressRing value={read} max={briefIds.length || 1} size={110} stroke={12} color="var(--good)">
          <div>
            <div className="font-display text-2xl leading-none tabular-nums">
              {read}/{briefIds.length}
            </div>
            <div className="mt-1 text-[11px] font-bold text-ink-3">{ui === "hi" ? "पढ़ीं" : "read"}</div>
          </div>
        </ProgressRing>
        {countdown !== null && countdown >= 0 && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-pink-soft px-3 py-2 text-sm font-bold text-pink">
            <CalendarDays className="size-4" /> {countdown} {ui === "hi" ? "दिन परीक्षा तक" : "days to your exam"}
          </div>
        )}
      </div>
      {threads.length > 0 && (
        <div className="rounded-3xl border-2 border-line bg-surface p-4">
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
      <div className="flex items-center gap-3 rounded-3xl bg-violet-soft p-4">
        <PartyPopper className="size-6 shrink-0 text-violet" />
        <p className="text-xs font-semibold text-ink-2">{ui === "hi" ? "पढ़ी हर ख़बर कल दोहराव में लौटेगी।" : "Every story you read comes back in Revise, right before you'd forget it."}</p>
      </div>
    </aside>
  );
}
