import Link from "next/link";
import { ArrowRight, Check, Clock } from "lucide-react";
import type { Story } from "@/lib/store";
import { categoryById, pick, type Lang } from "@/lib/taxonomy";
import { CategoryIcon, catStyle } from "./category-icon";
import { RelevanceBadge, cx, fmtDate } from "./ui";

// Only read stories get a mark; an empty circle looked like a checkbox you could tap.
function ReadTick({ read }: { read?: boolean }) {
  if (!read) return null;
  return (
    <span className="pop grid size-6 shrink-0 place-items-center rounded-full bg-good text-white" aria-label="Read">
      <Check className="size-3.5" strokeWidth={3.5} />
    </span>
  );
}

/** One story as a tappable card. */
export function StoryCard({ story, lang, relevance, read, showDate }: { story: Story; lang: Lang; relevance: number; read?: boolean; showDate?: boolean }) {
  const ui = lang === "bi" ? "en" : lang;
  return (
    <Link href={`/story/${story.id}`} className="tap group flex items-start gap-3 rounded-2xl bg-surface p-3.5 sm:gap-4 sm:p-4">
      <CategoryIcon id={story.category} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="cat text-xs font-bold text-(--cat-ink)" style={catStyle(story.category)}>
            {pick(categoryById(story.category)?.label, ui)}
          </span>
          <RelevanceBadge level={relevance} lang={ui} />
          {showDate && <span className="text-xs font-semibold text-ink-3">{fmtDate(story.date, ui, { day: "numeric", month: "short" })}</span>}
        </div>
        <h3 lang={ui === "hi" ? "hi" : undefined} className={cx("mt-1 text-[15px] leading-snug font-bold sm:text-base", read && "text-ink-2")}>
          {pick(story.content.title, ui)}
        </h3>
        {lang === "bi" && (
          <div lang="hi" className="mt-0.5 text-sm font-medium text-ink-2">
            {story.content.title.hi}
          </div>
        )}
        <p lang={ui === "hi" ? "hi" : undefined} className="mt-1 line-clamp-2 hidden text-sm text-ink-2 sm:block">
          {pick(story.content.key_facts[0], ui)}
        </p>
      </div>
      <ReadTick read={read} />
    </Link>
  );
}

/** Stack of story cards. */
export function StoryRows({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-2.5 sm:gap-3">{children}</div>;
}

/** The day's most important story: a card with a coloured category band. */
export function FeaturedStory({ story, lang, relevance, read }: { story: Story; lang: Lang; relevance: number; read?: boolean }) {
  const ui = lang === "bi" ? "en" : lang;
  return (
    <Link href={`/story/${story.id}`} className="tap cat group block overflow-hidden rounded-2xl bg-surface" style={catStyle(story.category)}>
      <div className="flex items-center gap-2 px-4 pt-4 text-xs sm:px-5 sm:pt-5">
        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-semibold text-accent">{ui === "hi" ? "प्रमुख ख़बर" : "Top story"}</span>
        <span className="truncate font-medium text-ink-3">{pick(categoryById(story.category)?.label, ui)}</span>
        {read && (
          <span className="ml-auto inline-flex items-center gap-1 font-semibold text-good">
            <Check className="size-3.5" strokeWidth={2.6} /> {ui === "hi" ? "पढ़ा" : "Read"}
          </span>
        )}
      </div>
      <div className="px-4 pt-2 pb-4 sm:px-5 sm:pb-5">
        <h2 lang={ui === "hi" ? "hi" : undefined} className="font-display text-lg leading-snug sm:text-xl">
          {pick(story.content.title, ui)}
        </h2>
        {lang === "bi" && (
          <div lang="hi" className="mt-1 text-base font-semibold text-ink-2">
            {story.content.title.hi}
          </div>
        )}
        <p lang={ui === "hi" ? "hi" : undefined} className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-ink-2">
          {pick(story.content.summary, ui)}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <RelevanceBadge level={relevance} lang={ui} />
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-3">
            <Clock className="size-3.5" /> 2 min
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-accent transition group-hover:gap-2">
            {ui === "hi" ? "पढ़ें" : "Read"} <ArrowRight className="size-4" strokeWidth={2.6} />
          </span>
        </div>
      </div>
    </Link>
  );
}
