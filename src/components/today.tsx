"use client";

import Link from "next/link";
import { ArrowRight, Brain, CalendarDays, Flame, Target } from "lucide-react";
import { dueCount, streak, useProgress } from "@/lib/progress-store";
import type { Story } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/taxonomy";
import { StoryCard } from "./story-card";
import { Card, ProgressRing, fmtDate } from "./ui";

export function BriefHero({ date, briefIds, countdown, lang }: { date: string; briefIds: string[]; countdown: number | null; lang: Lang }) {
  const p = useProgress();
  const ui = lang === "bi" ? "en" : lang;
  const read = briefIds.filter((id) => p.reads[id]).length;
  const total = briefIds.length;
  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-8">
      <div className="aurora opacity-60" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <ProgressRing value={read} max={total || 1} size={104} stroke={8}>
          <div>
            <div className="font-display text-3xl leading-none">
              {read}
              <span className="text-lg text-ink-3">/{total}</span>
            </div>
            <div className="mt-1 text-[10px] font-semibold tracking-wider text-ink-3 uppercase">{ui === "hi" ? "पढ़े" : "read"}</div>
          </div>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-xs font-medium text-ink-3">
            <span className="live-dot" />
            {fmtDate(date, ui, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">{read === total && total > 0 ? t("done", ui) : t("todaysBrief", ui)}</h1>
          <p className="mt-1 text-sm text-ink-2">
            {total
              ? ui === "hi"
                ? `आपकी परीक्षाओं के लिए ${total} सबसे ज़रूरी ख़बरें · लगभग ${total * 2} मिनट`
                : `The ${total} stories that matter most for your exams · about ${total * 2} min`
              : ui === "hi"
                ? "इस दिन के लिए कोई ख़बर नहीं"
                : "No stories for this day yet"}
          </p>
        </div>
        <div className="flex gap-2 sm:flex-col">
          <Stat icon={<Flame className="size-4 text-accent-2" />} value={streak(p)} label={t("streak", ui)} />
          {countdown !== null && countdown >= 0 && <Stat icon={<CalendarDays className="size-4 text-accent" />} value={countdown} label={ui === "hi" ? "दिन परीक्षा तक" : "days to exam"} />}
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <Card className="flex items-center gap-2 px-3 py-2 shadow-none">
      {icon}
      <span className="font-display text-2xl leading-none">{value}</span>
      <span className="text-xs text-ink-2">{label}</span>
    </Card>
  );
}

export function StoryList({ items, lang, numbered, compact, grid }: { items: { story: Story; relevance: number }[]; lang: Lang; numbered?: boolean; compact?: boolean; grid?: boolean }) {
  const p = useProgress();
  return (
    <div className={grid ? "grid gap-3 md:grid-cols-2" : "space-y-3"}>
      {items.map(({ story, relevance }, i) => (
        <div key={story.id} className="rise" style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}>
          <StoryCard story={story} lang={lang} relevance={relevance} read={!!p.reads[story.id]} index={numbered ? i : undefined} compact={compact} />
        </div>
      ))}
    </div>
  );
}

export function NextSteps({ date, lang }: { date: string; lang: Lang }) {
  const due = dueCount(useProgress());
  const ui = lang === "bi" ? "en" : lang;
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <Link href={`/practice/run?kind=daily&from=${date}&to=${date}`} className="group flex w-full items-center gap-4 rounded-2xl bg-ink p-5 text-left text-bg transition hover:opacity-95 active:scale-[.99]">
        <Target className="size-8 shrink-0 opacity-80" strokeWidth={1.6} />
        <span className="flex-1">
          <span className="block font-semibold">{t("startQuiz", ui)}</span>
          <span className="block text-sm opacity-70">{ui === "hi" ? "10 प्रश्न · आपकी परीक्षा शैली में" : "10 questions in your exam's style"}</span>
        </span>
        <ArrowRight className="size-5 transition group-hover:translate-x-1" />
      </Link>
      <Link href="/revise" className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:border-line-strong">
        <Brain className="size-8 shrink-0 text-accent" strokeWidth={1.6} />
        <span className="flex-1">
          <span className="block font-semibold">{due > 0 ? (ui === "hi" ? `${due} कार्ड दोहराने हैं` : `${due} cards ${t("dueNow", ui)}`) : ui === "hi" ? "दोहराव सत्र" : "Revision"}</span>
          <span className="block text-sm text-ink-2">{ui === "hi" ? "पढ़ी गई ख़बरें यहाँ याद रखने लायक बनती हैं" : "What you read today comes back here tomorrow"}</span>
        </span>
        <ArrowRight className="size-5 text-ink-3 transition group-hover:translate-x-1" />
      </Link>
    </section>
  );
}
