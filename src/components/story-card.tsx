import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import type { Story } from "@/lib/store";
import { categoryById, pick, type Lang } from "@/lib/taxonomy";
import { CategoryIcon, catStyle } from "./category-icon";
import { RelevanceBadge, SourceChips, cx } from "./ui";

function Meta({ story, lang, relevance, read }: { story: Story; lang: Lang; relevance: number; read?: boolean }) {
  const ui = lang === "bi" ? "en" : lang;
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
      <span className="cat font-medium text-(--cat-ink)" style={catStyle(story.category)}>
        {pick(categoryById(story.category)?.label, ui)}
      </span>
      <RelevanceBadge level={relevance} lang={ui} />
      {story.gsPaper !== "none" && <span className="hidden text-ink-3 sm:inline">{story.gsPaper}</span>}
      {read && (
        <span className="ml-auto inline-flex items-center gap-1 font-medium text-good">
          <Check className="size-3.5" strokeWidth={2.5} /> {ui === "hi" ? "पढ़ा" : "Read"}
        </span>
      )}
    </div>
  );
}

/** One story as a row. Use inside <StoryRows> so rows share one container with dividers. */
export function StoryCard({ story, lang, relevance, read }: { story: Story; lang: Lang; relevance: number; read?: boolean; compact?: boolean }) {
  const ui = lang === "bi" ? "en" : lang;
  return (
    <Link href={`/story/${story.id}`} className="group flex items-start gap-3 px-4 py-3.5 transition hover:bg-surface-2 active:bg-surface-2 sm:gap-4 sm:px-5 sm:py-4">
      <CategoryIcon id={story.category} size="sm" />
      <div className="min-w-0 flex-1">
        <Meta story={story} lang={lang} relevance={relevance} read={read} />
        <h3 lang={ui === "hi" ? "hi" : undefined} className={cx("mt-1 text-[15px] leading-snug font-semibold sm:text-base", read ? "text-ink-2" : "text-ink")}>
          {pick(story.content.title, ui)}
        </h3>
        {lang === "bi" && (
          <div lang="hi" className="mt-0.5 text-sm text-ink-2">
            {story.content.title.hi}
          </div>
        )}
        <p lang={ui === "hi" ? "hi" : undefined} className="mt-1 line-clamp-1 hidden text-sm text-ink-2 sm:block">
          {pick(story.content.key_facts[0], ui)}
        </p>
      </div>
      <ChevronRight className="mt-1 hidden size-4 shrink-0 text-ink-3 transition group-hover:translate-x-0.5 sm:block" />
    </Link>
  );
}

/** Container for story rows: one surface, hairline dividers. */
export function StoryRows({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">{children}</div>;
}

/** The day's most important story, shown first and larger. */
export function FeaturedStory({ story, lang, relevance, read }: { story: Story; lang: Lang; relevance: number; read?: boolean }) {
  const ui = lang === "bi" ? "en" : lang;
  return (
    <Link href={`/story/${story.id}`} className="group block rounded-xl border border-line bg-surface p-5 transition hover:border-line-strong sm:p-6">
      <div className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-ink-3 uppercase">{ui === "hi" ? "आज की प्रमुख ख़बर" : "Top story"}</div>
      <Meta story={story} lang={lang} relevance={relevance} read={read} />
      <h2 lang={ui === "hi" ? "hi" : undefined} className="mt-2 font-display text-xl leading-snug group-hover:text-accent sm:text-[26px]">
        {pick(story.content.title, ui)}
      </h2>
      {lang === "bi" && (
        <div lang="hi" className="mt-1 text-base font-medium text-ink-2">
          {story.content.title.hi}
        </div>
      )}
      <p lang={ui === "hi" ? "hi" : undefined} className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-ink-2">
        {pick(story.content.summary, ui)}
      </p>
      <div className="mt-4 hidden items-center justify-between sm:flex">
        <SourceChips sources={story.sources} />
        <span className="text-sm font-medium text-accent">{ui === "hi" ? "पूरी ख़बर पढ़ें →" : "Read story →"}</span>
      </div>
    </Link>
  );
}
