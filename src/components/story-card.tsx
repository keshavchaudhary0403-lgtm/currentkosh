import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { Story } from "@/lib/store";
import { pick, type Lang } from "@/lib/taxonomy";
import { CategoryPill, RelevanceBadge, SourceChips, cx } from "./ui";

export function StoryCard({ story, lang, relevance, read, index, compact }: { story: Story; lang: Lang; relevance: number; read?: boolean; index?: number; compact?: boolean }) {
  const ui = lang === "bi" ? "en" : lang;
  const title = pick(story.content.title, ui);
  return (
    <Link
      href={`/story/${story.id}`}
      className={cx(
        "group relative flex gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:border-line-strong sm:p-5",
        read && "opacity-70 hover:opacity-100",
      )}
    >
      {index !== undefined && (
        <div className={cx("hidden w-8 shrink-0 pt-0.5 font-display text-3xl leading-none sm:block", read ? "text-good" : "text-ink-3")}>
          {read ? <CheckCircle2 className="size-7" strokeWidth={1.6} /> : String(index + 1).padStart(2, "0")}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <CategoryPill id={story.category} lang={lang} />
          <RelevanceBadge level={relevance} lang={ui} />
        </div>
        <h3 lang={ui === "hi" ? "hi" : undefined} className="text-[17px] leading-snug font-semibold tracking-tight text-ink group-hover:text-accent sm:text-lg">
          {title}
        </h3>
        {lang === "bi" && (
          <div lang="hi" className="mt-0.5 text-sm text-ink-2">
            {story.content.title.hi}
          </div>
        )}
        {!compact && (
          <p lang={ui === "hi" ? "hi" : undefined} className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-2">
            {pick(story.content.key_facts[0], ui)}
            {story.content.key_facts[1] && ` · ${pick(story.content.key_facts[1], ui)}`}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-3">
          <SourceChips sources={story.sources} />
          {story.gsPaper !== "none" && <span className="text-[11px] font-semibold text-ink-3">{story.gsPaper}</span>}
        </div>
      </div>
    </Link>
  );
}
