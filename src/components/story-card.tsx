import Link from "next/link";
import { ArrowUpRight, Check, Clock } from "lucide-react";
import type { StoryCardData as Story } from "@/lib/store";
import { categoryById, pick, type Lang } from "@/lib/taxonomy";
import { CategoryGlyph, CategoryIcon, catStyle } from "./category-icon";
import { RelevanceBadge, cx, fmtDate } from "./ui";

function ReadBadge({ read, hi }: { read?: boolean; hi?: boolean }) {
  if (!read) return null;
  return (
    <span className="pop inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-good-soft px-2 text-[11px] font-semibold text-good-ink" aria-label="Read">
      <Check className="size-3" strokeWidth={3} /> {hi ? "पढ़ा" : "Read"}
    </span>
  );
}

/** One story as a bento tile. */
export function StoryCard({ story, lang, relevance, read, showDate, index }: { story: Story; lang: Lang; relevance: number; read?: boolean; showDate?: boolean; index?: number }) {
  const ui = lang === "bi" ? "en" : lang;
  return (
    <Link
      href={`/story/${story.id}`}
      className={cx("card lift group cat relative flex flex-col overflow-hidden p-4 sm:p-5", read && "bg-card/70")}
      style={catStyle(story.category)}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-(--cat-solid) transition-transform duration-500 group-hover:scale-x-100" />
      <div className="flex items-center gap-2">
        <CategoryIcon id={story.category} size="sm" />
        <span className="min-w-0 truncate text-xs font-semibold text-(--cat-ink)">{pick(categoryById(story.category)?.label, ui)}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          <ReadBadge read={read} hi={ui === "hi"} />
          {!read && index !== undefined && <span className="font-mono text-xs text-ink-3 tnum">{String(index).padStart(2, "0")}</span>}
        </span>
      </div>
      <h3 lang={ui === "hi" ? "hi" : undefined} className={cx("mt-3 text-[17px] leading-snug font-semibold tracking-[-0.01em]", read && "text-ink-2")}>
        {pick(story.content.title, ui)}
      </h3>
      {lang === "bi" && (
        <div lang="hi" className="mt-1 text-sm font-medium text-ink-2">
          {story.content.title.hi}
        </div>
      )}
      <p lang={ui === "hi" ? "hi" : undefined} className="mt-1.5 line-clamp-2 text-sm text-ink-2">
        {pick(story.content.key_facts[0], ui)}
      </p>
      <div className="mt-auto flex items-center gap-2 pt-4">
        <RelevanceBadge level={relevance} lang={ui} />
        {showDate && <span className="font-mono text-[11px] text-ink-3 uppercase">{fmtDate(story.date, ui, { day: "numeric", month: "short" })}</span>}
        <span className="ml-auto grid size-8 place-items-center rounded-full bg-card-2 text-ink-2 transition duration-300 group-hover:rotate-45 group-hover:bg-solid group-hover:text-on-solid">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}

/** One story as a compact row (lists of lower-priority stories). */
export function StoryRow({ story, lang, relevance, read, showDate }: { story: Story; lang: Lang; relevance: number; read?: boolean; showDate?: boolean }) {
  const ui = lang === "bi" ? "en" : lang;
  return (
    <Link href={`/story/${story.id}`} className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-card-2 sm:px-5">
      <CategoryIcon id={story.category} size="sm" />
      <span className="min-w-0 flex-1">
        <span lang={ui === "hi" ? "hi" : undefined} className={cx("block text-[15px] leading-snug font-semibold", read && "text-ink-2")}>
          {pick(story.content.title, ui)}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-2">
          <span className="cat text-xs font-medium text-(--cat-ink)" style={catStyle(story.category)}>
            {pick(categoryById(story.category)?.label, ui)}
          </span>
          {showDate && <span className="font-mono text-[11px] text-ink-3 uppercase">{fmtDate(story.date, ui, { day: "numeric", month: "short" })}</span>}
          <RelevanceBadge level={relevance} lang={ui} />
        </span>
      </span>
      {read ? (
        <span className="grid size-7 place-items-center rounded-full bg-good text-white" aria-label="Read">
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      ) : (
        <ArrowUpRight className="size-4 shrink-0 text-ink-3 transition group-hover:rotate-45 group-hover:text-ink" />
      )}
    </Link>
  );
}

/** Grid of story tiles. */
export function StoryRows({ children }: { children: React.ReactNode }) {
  return <div className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

/** The day's most important story: a big tile with a mesh wash in the category colour. */
export function FeaturedStory({ story, lang, relevance, read, className }: { story: Story; lang: Lang; relevance: number; read?: boolean; className?: string }) {
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  return (
    <Link
      href={`/story/${story.id}`}
      className={cx("card lift group cat mesh relative flex min-h-[340px] flex-col overflow-hidden p-5 sm:p-7", className)}
      style={catStyle(story.category)}
    >
      <span aria-hidden className="pointer-events-none absolute -right-8 -bottom-10 text-(--cat-solid) opacity-[0.14] transition duration-700 group-hover:scale-110 group-hover:-rotate-6">
        <CategoryGlyph id={story.category} className="size-56" />
      </span>
      <div className="relative flex flex-wrap items-center gap-2">
        <span className="eyebrow inline-flex h-7 items-center gap-1.5 rounded-full bg-ink px-2.5 text-bg">
          <span className="live-dot bg-signal!" /> {hi ? "प्रमुख ख़बर" : "Top story"}
        </span>
        <span className="text-xs font-semibold text-(--cat-ink)">{pick(categoryById(story.category)?.label, ui)}</span>
        {read && <ReadBadge read hi={hi} />}
      </div>
      <h2 lang={hi ? "hi" : undefined} className="relative mt-5 max-w-3xl font-display text-[27px] sm:text-[37px]">
        {pick(story.content.title, ui)}
      </h2>
      {lang === "bi" && (
        <div lang="hi" className="relative mt-2 text-lg font-medium text-ink-2">
          {story.content.title.hi}
        </div>
      )}
      <p lang={hi ? "hi" : undefined} className="relative mt-3 line-clamp-3 max-w-2xl text-[15px] leading-relaxed text-ink-2 sm:text-base">
        {story.content.summary && pick(story.content.summary, ui)}
      </p>
      <div className="relative mt-auto flex flex-wrap items-center gap-3 pt-6">
        <RelevanceBadge level={relevance} lang={ui} />
        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-3 uppercase">
          <Clock className="size-3.5" /> 2 min
        </span>
        <span className="btn btn-ink ml-auto h-11 px-5 text-sm">
          {hi ? "पढ़ें" : "Read story"}
          <ArrowUpRight className="size-4 transition duration-300 group-hover:rotate-45" />
        </span>
      </div>
    </Link>
  );
}
