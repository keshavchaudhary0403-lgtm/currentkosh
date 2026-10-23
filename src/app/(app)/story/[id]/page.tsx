import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, Landmark, Lightbulb, PenLine, ShieldCheck, Sparkles } from "lucide-react";
import { BookmarkButton, QuickCheck, ReadButton } from "@/components/story-actions";
import { CategoryIcon, catStyle } from "@/components/category-icon";
import { BiText, RelevanceBadge, fmtDate } from "@/components/ui";
import { t } from "@/lib/i18n";
import { currentProfile } from "@/lib/profile";
import { getStory, getThread, mcqsForStory } from "@/lib/store";
import { sourceById } from "@/lib/sources";
import { categoryById, examById, pick } from "@/lib/taxonomy";

export async function generateMetadata({ params }: PageProps<"/story/[id]">): Promise<Metadata> {
  const story = getStory(decodeURIComponent((await params).id));
  return { title: story?.content.title.en ?? "Story" };
}

export default async function StoryPage({ params }: PageProps<"/story/[id]">) {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const story = getStory(decodeURIComponent((await params).id));
  if (!story) notFound();
  const lang = profile.lang;
  const ui = lang === "bi" ? "en" : lang;
  const c = story.content;
  const mcqs = mcqsForStory(story.id);
  const thread = story.threadKey ? getThread(story.threadKey) : null;
  const official = story.sources.filter((s) => sourceById(s.sourceId)?.mode === "ai");
  const alsoCovered = story.sources.filter((s) => sourceById(s.sourceId)?.mode !== "ai");

  return (
    <article className="mx-auto max-w-3xl pb-24">
      <Link href={story.date ? `/?date=${story.date}` : "/"} className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" /> {fmtDate(story.date, ui, { day: "numeric", month: "long" })}
      </Link>

      <header className="rise">
        <div className="mb-4 flex items-center gap-3">
          <CategoryIcon id={story.category} />
          <div className="text-sm">
            <div className="cat font-semibold text-(--cat-ink)" style={catStyle(story.category)}>
              {pick(categoryById(story.category)?.label, ui)}
            </div>
            <div className="text-ink-3">
              {fmtDate(story.date, ui, { day: "numeric", month: "long", year: "numeric" })}
              {story.gsPaper !== "none" && ` · UPSC ${story.gsPaper}`}
            </div>
          </div>
        </div>
        <BiText v={c.title} lang={lang} as="h1" className="font-display text-3xl leading-[1.12] sm:text-[44px]" hiClassName="font-sans text-xl sm:text-2xl font-medium tracking-normal mt-3" />
        <div className="mt-5 flex flex-wrap gap-2">
          {profile.exams.map((e) => (
            <span key={e} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-2">
              {pick(examById(e)?.label, ui)} <RelevanceBadge level={story.relevance[e] ?? 0} lang={ui} />
            </span>
          ))}
        </div>
      </header>

      <section className="mt-8 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
        <BiText v={c.summary} lang={lang} as="p" className="text-[17px] leading-[1.75]" hiClassName="mt-4 text-base" />
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-ink-3 uppercase">
            <Sparkles className="size-4 text-accent" /> {t("keyFacts", ui)}
          </h2>
          <ol className="space-y-3">
            {c.key_facts.map((f, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-snug">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent">{i + 1}</span>
                <BiText v={f} lang={lang} className="pt-0.5" hiClassName="text-sm" />
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-4">
          <Callout icon={<Lightbulb className="size-4 text-accent-2" />} title={t("whyItMatters", ui)}>
            <BiText v={c.why_it_matters} lang={lang} as="p" />
          </Callout>
          <Callout icon={<Landmark className="size-4 text-accent" />} title={t("staticLink", ui)}>
            <BiText v={c.static_link} lang={lang} as="p" />
          </Callout>
        </div>
      </section>

      {c.mains_angle && (
        <section className="mt-4">
          <Callout icon={<PenLine className="size-4 text-accent" />} title={t("mainsAngle", ui)}>
            <BiText v={c.mains_angle} lang={lang} as="p" className="font-medium" />
          </Callout>
        </section>
      )}

      {c.glossary.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-xs font-semibold tracking-[0.14em] text-ink-3 uppercase">{t("glossary", ui)}</h2>
          <div className="flex flex-wrap gap-2">
            {c.glossary.map((g, i) => (
              <span key={i} className="rounded-xl border border-line bg-surface px-3 py-1.5 text-sm">
                {g.en} <span className="text-ink-3">·</span> <span lang="hi">{g.hi}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-3xl border border-line bg-surface-2/60 p-5 sm:p-6">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-ink-3 uppercase">
          <ShieldCheck className="size-4 text-good" /> {ui === "hi" ? "आधिकारिक स्रोत" : "Official sources"}
        </h2>
        <ul className="space-y-2">
          {official.map((s) => (
            <SourceLink key={s.url} name={sourceById(s.sourceId)?.name ?? s.sourceId} title={s.title} url={s.url} />
          ))}
        </ul>
        {alsoCovered.length > 0 && (
          <>
            <h3 className="mt-5 mb-2 text-xs font-semibold tracking-[0.14em] text-ink-3 uppercase">{ui === "hi" ? "यहाँ भी पढ़ें" : "Also covered by"}</h3>
            <ul className="space-y-2">
              {alsoCovered.map((s) => (
                <SourceLink key={s.url} name={sourceById(s.sourceId)?.name ?? s.sourceId} title={s.title} url={s.url} />
              ))}
            </ul>
          </>
        )}
        <p className="mt-4 text-xs leading-relaxed text-ink-3">
          {ui === "hi"
            ? "यह नोट Claude (AI) द्वारा केवल ऊपर दिए आधिकारिक स्रोतों से तैयार किया गया है। अंतिम पुष्टि के लिए मूल स्रोत देखें।"
            : "These notes are written by Claude (AI) only from the official sources above. Check the original for anything you will quote."}
        </p>
      </section>

      <div className="fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-30 flex justify-center px-4 lg:bottom-6 lg:pl-64">
        <div className="flex w-full items-center gap-2 rounded-2xl border border-line-strong bg-surface p-1.5 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.35)] sm:w-auto">
          <ReadButton storyId={story.id} cardIds={story.cardIds} labels={{ mark: t("markRead", ui), done: ui === "hi" ? "पढ़ लिया · दोहराव में जुड़ा" : "Read · added to revision" }} />
          <BookmarkButton storyId={story.id} />
          {mcqs.length > 0 && (
            <a href="#quick-check" className="ml-auto rounded-xl px-3 py-2.5 text-sm font-semibold text-accent hover:bg-accent-soft">
              {ui === "hi" ? "क्विज़ ↓" : "Quiz ↓"}
            </a>
          )}
        </div>
      </div>

      {mcqs.length > 0 && (
        <section id="quick-check" className="mt-10 scroll-mt-20">
          <h2 className="mb-4 font-display text-3xl">{t("quickCheck", ui)}</h2>
          <QuickCheck mcqs={mcqs.map((m) => m.content)} lang={lang} />
        </section>
      )}

      {thread && thread.stories.length > 1 && (
        <section className="mt-10">
          <h2 className="mb-1 font-display text-3xl">{pick(thread.title, ui)}</h2>
          <p className="mb-4 text-sm text-ink-2">{ui === "hi" ? "इस कहानी का पूरा क्रम" : "How this storyline has developed"}</p>
          <ol className="relative space-y-4 border-l border-line-strong pl-5">
            {thread.stories.map((s) => (
              <li key={s.id} className="relative">
                <span className={`absolute top-1.5 -left-[25px] size-2.5 rounded-full ring-4 ring-bg ${s.id === story.id ? "bg-accent" : "bg-ink-3"}`} />
                <div className="text-xs text-ink-3">{fmtDate(s.date, ui, { day: "numeric", month: "short", year: "numeric" })}</div>
                {s.id === story.id ? (
                  <div className="font-semibold">{pick(s.content.title, ui)}</div>
                ) : (
                  <Link href={`/story/${s.id}`} className="font-medium hover:text-accent">
                    {pick(s.content.title, ui)}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}

function Callout({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-5 text-[15px] leading-relaxed shadow-card">
      <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-ink-3 uppercase">
        {icon} {title}
      </h2>
      {children}
    </div>
  );
}

function SourceLink({ name, title, url }: { name: string; title: string | null; url: string }) {
  return (
    <li>
      <a href={url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 rounded-xl p-2 -m-2 hover:bg-surface">
        <ExternalLink className="mt-0.5 size-4 shrink-0 text-ink-3 group-hover:text-accent" />
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{name}</span>
          {title && <span className="block truncate text-sm text-ink-2">{title}</span>}
        </span>
      </a>
    </li>
  );
}
