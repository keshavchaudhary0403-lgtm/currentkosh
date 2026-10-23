import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { Story } from "@/lib/store";
import { categoryById, pick, type Lang } from "@/lib/taxonomy";
import { CategoryIcon, catStyle } from "./category-icon";
import { RelevanceBadge, SourceChips, cx } from "./ui";

function Meta({ story, lang, relevance, read }: { story: Story; lang: Lang; relevance: number; read?: boolean }) {
  const ui = lang === "bi" ? "en" : lang;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <span className="cat font-semibold text-(--cat-ink)" style={catStyle(story.category)}>
        {pick(categoryById(story.category)?.label, ui)}
      </span>
      <RelevanceBadge level={relevance} lang={ui} />
      {read && (
        <span className="ml-auto inline-flex items-center gap-1 font-semibold text-good">
          <Check className="size-3.5" strokeWidth={3} /> {ui === "hi" ? "पढ़ा" : "Read"}
        </span>
      )}
    </div>
  );
}

export function StoryCard({ story, lang, relevance, read, compact }: { story: Story; lang: Lang; relevance: number; read?: boolean; compact?: boolean }) {
  const ui = lang === "bi" ? "en" : lang;
  return (
    <Link
      href={`/story/${story.id}`}
      className={cx(
        "group flex gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg active:scale-[.99] sm:gap-4 sm:p-5",
        read && "bg-surface/60",
      )}
    >
      <CategoryIcon id={story.category} size="sm" />
      <div className="min-w-0 flex-1">
        <Meta story={story} lang={lang} relevance={relevance} read={read} />
        <h3 lang={ui === "hi" ? "hi" : undefined} className={cx("mt-1 text-[15px] leading-snug font-semibold tracking-tight group-hover:text-accent sm:text-[17px]", read && "text-ink-2")}>
          {pick(story.content.title, ui)}
        </h3>
        {lang === "bi" && (
          <div lang="hi" className="mt-0.5 text-sm text-ink-2">
            {story.content.title.hi}
          </div>
        )}
        {!compact && (
          <p lang={ui === "hi" ? "hi" : undefined} className="mt-1.5 line-clamp-2 hidden text-sm leading-relaxed text-ink-2 sm:block">
            {story.content.key_facts.slice(0, 2).map((f) => pick(f, ui)).join(" · ")}
          </p>
        )}
        <div className="mt-3 hidden items-center justify-between gap-3 sm:flex">
          <SourceChips sources={story.sources} />
          {story.gsPaper !== "none" && <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-ink-3">{story.gsPaper}</span>}
        </div>
      </div>
    </Link>
  );
}

/** The day's most important story, shown large at the top of the brief. */
export function FeaturedStory({ story, lang, relevance, read }: { story: Story; lang: Lang; relevance: number; read?: boolean }) {
  const ui = lang === "bi" ? "en" : lang;
  return (
    <Link
      href={`/story/${story.id}`}
      className="cat group relative block overflow-hidden rounded-3xl border border-line bg-surface p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[.99] sm:p-7"
      style={catStyle(story.category)}
    >
      <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-(--cat-solid) opacity-[0.13] blur-3xl" />
      <div className="relative">
        <div className="mb-3 flex items-center gap-3 sm:mb-4">
          <CategoryIcon id={story.category} size="md" />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold tracking-[0.14em] text-ink-3 uppercase">{ui === "hi" ? "आज की सबसे अहम ख़बर" : "Top story"}</div>
            <Meta story={story} lang={lang} relevance={relevance} read={read} />
          </div>
        </div>
        <h2 lang={ui === "hi" ? "hi" : undefined} className="font-display text-[22px] leading-tight group-hover:text-accent sm:text-[32px]">
          {pick(story.content.title, ui)}
        </h2>
        {lang === "bi" && (
          <div lang="hi" className="mt-1 text-lg font-medium text-ink-2">
            {story.content.title.hi}
          </div>
        )}
        <p lang={ui === "hi" ? "hi" : undefined} className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-ink-2 sm:mt-3 sm:line-clamp-3 sm:text-base">
          {pick(story.content.summary, ui)}
        </p>
        <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
          {story.content.key_facts.slice(0, 3).map((f, i) => (
            <span key={i} lang={ui === "hi" ? "hi" : undefined} className="rounded-full bg-(--cat-tint) px-3 py-1 text-xs font-medium text-(--cat-ink)">
              {pick(f, ui)}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between sm:mt-5">
          <span className="hidden sm:block">
            <SourceChips sources={story.sources} />
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
            {ui === "hi" ? "पूरी ख़बर" : "Read story"} <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
