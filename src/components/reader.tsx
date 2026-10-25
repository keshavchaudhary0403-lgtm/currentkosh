"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ArrowUpRight, Landmark, Lightbulb, Newspaper, PenLine, ShieldCheck, Sparkles, Target, Waypoints, X } from "lucide-react";
import type { DeckStory } from "@/app/(app)/deck-data";
import { t } from "@/lib/i18n";
import { categoryById, pick, type Lang } from "@/lib/taxonomy";
import { CategoryIcon, catStyle } from "./category-icon";
import { BookmarkButton, QuickCheck, ReadButton } from "./story-actions";
import { ThemeSwitch } from "./theme-switch";
import { BiText, RelevanceBadge, cx, fmtDate } from "./ui";

/** The full story: summary, facts, insights, glossary, sources, all MCQs and the storyline. */
export function ReaderBody({ story, lang, variant, nextHref, onClose }: { story: DeckStory; lang: Lang; variant: "sheet" | "page"; nextHref?: string | null; onClose?: () => void }) {
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  const c = story.content;
  const official = story.sources.filter((s) => s.kind === "official");
  const press = story.sources.filter((s) => s.kind === "press");
  const also = story.sources.filter((s) => s.kind === "also");
  const minutes = Math.max(1, Math.round((pick(c.summary, "en").split(/\s+/).length + c.key_facts.length * 14) / 200));
  const quizId = `quick-check-${story.id}`;
  const note =
    press.length > 0 && official.length > 0
      ? hi
        ? "यह नोट Claude (AI) ने ऊपर दिए आधिकारिक स्रोतों से तैयार किया है; कुछ विवरण उन तथ्यों से हैं जिनकी पुष्टि कम से कम दो स्वतंत्र समाचार स्रोतों ने की है। उद्धृत करने से पहले मूल स्रोत देखें।"
        : "Claude (AI) wrote these notes from the official sources above, with some details from facts that at least two independent outlets confirm. Check the original for anything you will quote."
      : press.length > 0
        ? hi
          ? "इस घटना का कोई आधिकारिक स्रोत नहीं मिला। यह संक्षिप्त नोट Claude (AI) ने केवल उन तथ्यों से लिखा है जिनकी पुष्टि कम से कम दो स्वतंत्र समाचार स्रोतों ने की है। उद्धृत करने से पहले मूल रिपोर्ट देखें।"
          : "No official source covered this event yet. Claude (AI) wrote this short note only from facts that at least two independent outlets confirm. Check the reports before you quote anything."
        : hi
          ? "यह नोट Claude (AI) द्वारा केवल ऊपर दिए आधिकारिक स्रोतों से तैयार किया गया है। अंतिम पुष्टि के लिए मूल स्रोत देखें।"
          : "These notes are written by Claude (AI) only from the official sources above. Check the original for anything you will quote.";

  return (
    <article className="cat" style={catStyle(story.category)}>
      {/* Action bar: sticky at the top of the sheet, or of the page under the app header. */}
      <div className={cx("glass sticky z-20 -mx-5 flex items-center gap-1.5 border-b border-line px-3 py-2 sm:-mx-8 sm:px-6", variant === "sheet" ? "top-0" : "top-16")}>
        {onClose && (
          <button onClick={onClose} aria-label={hi ? "बंद करें" : "Close"} className="btn btn-ghost size-11 shrink-0 px-0">
            <X className="size-5" />
          </button>
        )}
        <ReadButton
          storyId={story.id}
          cardIds={story.cardIds}
          labels={{ mark: hi ? "पढ़ा" : "Read", next: hi ? "अगली" : "Next", doneHint: hi ? "इसके तथ्य दोहराव में जुड़ गए" : "Its facts are now in your Revise queue" }}
          nextHref={variant === "page" ? nextHref : undefined}
          className="min-w-0 flex-1 sm:flex-none"
        />
        <BookmarkButton storyId={story.id} label={hi ? "सहेजें" : "Save"} />
        {story.mcqs.length > 0 && (
          <a href={`#${quizId}`} aria-label={t("quickCheck", ui)} title={t("quickCheck", ui)} className="btn btn-flare size-11 shrink-0 px-0">
            <Target className="size-[18px]" />
          </a>
        )}
        {variant === "sheet" && <ThemeSwitch className="ml-auto" />}
      </div>

      <header className="pt-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="inline-flex h-8 items-center gap-2 rounded-full bg-(--cat-tint) pr-3 pl-1 text-xs font-semibold text-(--cat-ink)">
            <CategoryIcon id={story.category} size="sm" solid />
            {pick(categoryById(story.category)?.label, ui)}
          </span>
          <span className="eyebrow text-ink-3">
            {fmtDate(story.date, ui, { day: "numeric", month: "short", year: "numeric" })}
            {story.gsPaper !== "none" && ` · UPSC ${story.gsPaper}`} · {minutes} min
          </span>
        </div>
        <BiText
          v={c.title}
          lang={lang}
          as="h1"
          className={cx("mt-4 font-display", variant === "sheet" ? "text-[27px] sm:text-[32px]" : "text-[29px] sm:text-[42px]")}
          hiClassName="font-sans text-lg sm:text-xl font-semibold tracking-normal mt-3 leading-snug"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {story.exams.map((e, i) => (
            <span key={i} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-card px-3 text-xs font-semibold text-ink-2 shadow-[inset_0_0_0_1px_var(--line)] has-[>span]:pr-1">
              {pick(e.label, ui)} <RelevanceBadge level={e.level} lang={ui} />
            </span>
          ))}
        </div>
      </header>

      <section className="mt-7 border-l-[3px] border-(--cat-solid) pl-5">
        <BiText v={c.summary} lang={lang} as="p" className="text-[17px] leading-[1.7] sm:text-[19px]" hiClassName="mt-4 text-base" />
      </section>

      <section className="card mt-7 overflow-hidden">
        <h2 className="flex items-center gap-2.5 border-b border-line bg-(--cat-tint) px-5 py-3.5 text-[15px] font-semibold">
          <Sparkles className="size-[18px] text-(--cat-ink)" /> {t("keyFacts", ui)}
        </h2>
        <ol className="divide-y divide-line">
          {c.key_facts.map((f, i) => (
            <li key={i} className="flex gap-4 px-5 py-3.5 text-[15px] leading-relaxed font-medium">
              <span className="w-6 shrink-0 pt-0.5 font-mono text-xs text-(--cat-ink)">{String(i + 1).padStart(2, "0")}</span>
              <BiText v={f} lang={lang} hiClassName="text-sm" />
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        <Insight tone="signal" icon={<Lightbulb className="size-[18px]" />} title={t("whyItMatters", ui)}>
          <BiText v={c.why_it_matters} lang={lang} as="p" />
        </Insight>
        <Insight tone="cobalt" icon={<Landmark className="size-[18px]" />} title={t("staticLink", ui)}>
          <BiText v={c.static_link} lang={lang} as="p" />
        </Insight>
        {c.mains_angle && (
          <Insight tone="ink" icon={<PenLine className="size-[18px]" />} title={t("mainsAngle", ui)} className="sm:col-span-2">
            <BiText v={c.mains_angle} lang={lang} as="p" className="font-display text-[17px] leading-snug" hiClassName="font-sans text-base" />
          </Insight>
        )}
      </section>

      {c.glossary.length > 0 && (
        <section className="mt-7">
          <h2 className="eyebrow mb-3 text-ink-3">{t("glossary", ui)}</h2>
          <div className="flex flex-wrap gap-2">
            {c.glossary.map((g, i) => (
              <span key={i} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-card px-4 text-sm font-medium shadow-[inset_0_0_0_1px_var(--line-2)]">
                {g.en} <span className="text-ink-3">⇄</span>
                <span lang="hi" className="text-mint-ink">
                  {g.hi}
                </span>
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="card mt-7 p-5">
        <SourceGroup icon={<ShieldCheck className="size-[18px] text-good" />} title={hi ? "आधिकारिक स्रोत" : "Official sources"} items={official} />
        <SourceGroup icon={<Newspaper className="size-[18px] text-amber-ink" />} title={hi ? "समाचार रिपोर्ट (तथ्य मिलान)" : "Press reports (facts cross-checked)"} items={press} />
        <SourceGroup title={hi ? "यहाँ भी पढ़ें" : "Also covered by"} items={also} />
        <p className="mt-4 rounded-2xl bg-card-2 p-3 text-xs leading-relaxed text-ink-3">{note}</p>
      </section>

      {story.mcqs.length > 0 && (
        <section id={quizId} className="mt-10 scroll-mt-20">
          <div className="mb-4 flex items-end gap-3">
            <span className="grid size-11 place-items-center rounded-[14px] bg-flare text-white">
              <Target className="size-5" />
            </span>
            <div>
              <div className="eyebrow text-ink-3">
                {story.mcqs.length} {hi ? "प्रश्न" : story.mcqs.length === 1 ? "question" : "questions"}
              </div>
              <h2 className="font-display text-[25px] leading-none">{t("quickCheck", ui)}</h2>
            </div>
          </div>
          <QuickCheck mcqs={story.mcqs} category={story.category} lang={lang} />
        </section>
      )}

      {story.thread && (
        <section className="mt-10">
          <div className="eyebrow mb-1 inline-flex items-center gap-1.5 text-amber-ink">
            <Waypoints className="size-3.5" /> {hi ? "घटनाक्रम" : "Storyline"}
          </div>
          <h2 className="mb-5 text-xl font-semibold">{pick(story.thread.title, ui)}</h2>
          <MiniTimeline items={story.thread.nearby} currentId={story.id} ui={ui} />
          <Link href={`/thread/${story.thread.key}`} className="btn btn-ghost mt-5 h-11 w-full px-4 text-sm">
            {hi ? `पूरा क्रम देखें (${story.thread.count})` : `See all ${story.thread.count} updates`} <ArrowRight className="size-4" />
          </Link>
        </section>
      )}
    </article>
  );
}

const TONES = {
  signal: "bg-signal-soft [&_h2]:text-signal-ink",
  cobalt: "bg-cobalt-soft [&_h2]:text-cobalt-ink",
  ink: "bg-[#10110e] text-[#f3f2ec] [&_h2]:text-[#c8f135] dark:bg-card dark:text-ink dark:shadow-[inset_0_0_0_1px_var(--line-2)] [&_[lang=hi]]:text-white/70 dark:[&_[lang=hi]]:text-ink-2",
} as const;

function Insight({ icon, title, tone, children, className }: { icon: React.ReactNode; title: string; tone: keyof typeof TONES; children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("rounded-[22px] p-5 text-[15px] leading-relaxed", TONES[tone], className)}>
      <h2 className="eyebrow mb-3 flex items-center gap-2">
        {icon} {title}
      </h2>
      {children}
    </div>
  );
}

function SourceGroup({ icon, title, items }: { icon?: React.ReactNode; title: string; items: DeckStory["sources"] }) {
  if (!items.length) return null;
  return (
    <div className="mb-4 last-of-type:mb-0">
      <h3 className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
        {icon} {title}
      </h3>
      <ul>
        {items.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="group -mx-2 flex min-h-11 items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-card-2">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{s.name}</span>
                {s.title && <span className="block truncate text-sm text-ink-2">{s.title}</span>}
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-ink-3 transition group-hover:rotate-45 group-hover:text-ink" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MiniTimeline({ items, currentId, ui }: { items: { id: string; date: string; title: { en: string; hi: string } }[]; currentId: string; ui: "en" | "hi" }) {
  return (
    <ol className="relative space-y-4 pl-6 before:absolute before:top-1.5 before:bottom-1.5 before:left-[5px] before:w-0.5 before:rounded-full before:bg-amber-soft">
      {items.map((s) => {
        const here = s.id === currentId;
        return (
          <li key={s.id} className="relative">
            <span className={cx("absolute top-1 -left-6 size-3 rounded-full", here ? "bg-amber shadow-[0_0_0_5px_var(--amber-soft)]" : "bg-line-2")} />
            <div className="font-mono text-[11px] text-ink-3 uppercase">{fmtDate(s.date, ui, { day: "numeric", month: "short" })}</div>
            {here ? (
              <div className="text-sm leading-snug font-semibold">{pick(s.title, ui)}</div>
            ) : (
              <Link href={`/story/${s.id}`} className="block text-sm leading-snug text-ink-2 hover:text-ink hover:underline">
                {pick(s.title, ui)}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** The reader over the deck: a bottom sheet on phones, a side drawer on desktop. */
export function ReaderSheet({ story, lang, onClose }: { story: DeckStory; lang: Lang; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const drag = useRef<number | null>(null);
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", esc);
    panel.current?.focus();
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", esc);
    };
  }, [onClose]);
  return createPortal(
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={pick(story.content.title, lang === "hi" ? "hi" : "en")}>
      <button aria-label="Close" tabIndex={-1} onClick={onClose} className="sheet-fade absolute inset-0 bg-black/45 backdrop-blur-[3px]" />
      <div
        ref={panel}
        tabIndex={-1}
        className="sheet-panel absolute inset-x-0 bottom-0 flex h-[92dvh] flex-col overflow-hidden rounded-t-[28px] bg-bg shadow-float outline-none lg:inset-y-3 lg:right-3 lg:left-auto lg:h-auto lg:w-[640px] lg:rounded-[28px]"
      >
        <div
          className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center lg:hidden"
          onPointerDown={(e) => (drag.current = e.clientY)}
          onPointerUp={(e) => {
            if (drag.current !== null && e.clientY - drag.current > 80) onClose();
            drag.current = null;
          }}
          aria-hidden
        >
          <span className="h-1.5 w-12 rounded-full bg-line-2" />
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-16 sm:px-8">
          <ReaderBody story={story} lang={lang} variant="sheet" onClose={onClose} />
          <Link href={`/story/${story.id}`} className="mt-10 inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-ink">
            Open as a page <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
