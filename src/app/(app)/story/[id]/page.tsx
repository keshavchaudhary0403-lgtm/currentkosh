import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowDown, ArrowLeft, ExternalLink, Landmark, Lightbulb, PenLine, ShieldCheck, Sparkles, Target, Waypoints } from "lucide-react";
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
      <Link href={story.date ? `/?date=${story.date}` : "/"} className="mb-4 inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-surface px-3 py-1 text-sm font-bold text-ink-2 hover:text-ink sm:mb-6">
        <ArrowLeft className="size-4" /> {fmtDate(story.date, ui, { day: "numeric", month: "long" })}
      </Link>

      <header className="rise">
        <div className="mb-4 flex items-center gap-3">
          <CategoryIcon id={story.category} solid />
          <div className="text-sm">
            <div className="cat font-extrabold text-(--cat-ink)" style={catStyle(story.category)}>
              {pick(categoryById(story.category)?.label, ui)}
            </div>
            <div className="font-medium text-ink-3">
              {fmtDate(story.date, ui, { day: "numeric", month: "long", year: "numeric" })}
              {story.gsPaper !== "none" && ` · UPSC ${story.gsPaper}`}
            </div>
          </div>
        </div>
        <BiText v={c.title} lang={lang} as="h1" className="font-display text-[28px] leading-[1.15] sm:text-[42px]" hiClassName="font-sans text-xl sm:text-2xl font-semibold tracking-normal mt-3" />
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.exams.map((e) => (
            <span key={e} className="inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-surface px-2.5 py-0.5 text-xs font-bold text-ink-2 has-[>span]:pr-1">
              {pick(examById(e)?.label, ui)} <RelevanceBadge level={story.relevance[e] ?? 0} lang={ui} />
            </span>
          ))}
        </div>
      </header>

      <section className="mt-5 rounded-3xl border-2 border-line bg-surface p-5 sm:mt-7 sm:p-7">
        <BiText v={c.summary} lang={lang} as="p" className="text-[17px] leading-[1.75]" hiClassName="mt-4 text-base" />
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-[1.2fr_1fr]">
        <div className="cat rounded-3xl border-2 border-line bg-surface p-5 sm:p-6" style={catStyle(story.category)}>
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg">
            <Sparkles className="size-5 text-(--cat-ink)" /> {t("keyFacts", ui)}
          </h2>
          <ol className="space-y-3.5">
            {c.key_facts.map((f, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-snug font-medium">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-(--cat-solid) text-xs font-extrabold text-white">{i + 1}</span>
                <BiText v={f} lang={lang} className="pt-0.5" hiClassName="text-sm" />
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-4">
          <Callout tone="orange" icon={<Lightbulb className="size-5" />} title={t("whyItMatters", ui)}>
            <BiText v={c.why_it_matters} lang={lang} as="p" />
          </Callout>
          <Callout tone="indigo" icon={<Landmark className="size-5" />} title={t("staticLink", ui)}>
            <BiText v={c.static_link} lang={lang} as="p" />
          </Callout>
        </div>
      </section>

      {c.mains_angle && (
        <section className="mt-4">
          <Callout tone="violet" icon={<PenLine className="size-5" />} title={t("mainsAngle", ui)}>
            <BiText v={c.mains_angle} lang={lang} as="p" className="font-medium" />
          </Callout>
        </section>
      )}

      {c.glossary.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 font-display text-lg">{t("glossary", ui)}</h2>
          <div className="flex flex-wrap gap-2">
            {c.glossary.map((g, i) => (
              <span key={i} className="rounded-full bg-teal-soft px-3.5 py-1.5 text-sm font-semibold text-teal">
                {g.en} <span className="opacity-50">·</span> <span lang="hi">{g.hi}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-3xl border-2 border-line bg-surface p-5 sm:p-6">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg">
          <ShieldCheck className="size-5 text-good" /> {ui === "hi" ? "आधिकारिक स्रोत" : "Official sources"}
        </h2>
        <ul className="space-y-2">
          {official.map((s) => (
            <SourceLink key={s.url} name={sourceById(s.sourceId)?.name ?? s.sourceId} title={s.title} url={s.url} />
          ))}
        </ul>
        {alsoCovered.length > 0 && (
          <>
            <h3 className="mt-5 mb-2 text-sm font-bold text-ink-2">{ui === "hi" ? "यहाँ भी पढ़ें" : "Also covered by"}</h3>
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

      <div className="fixed inset-x-0 bottom-[calc(62px+env(safe-area-inset-bottom))] z-30 flex justify-center px-4 lg:bottom-6 lg:pl-64">
        <div className="flex w-full items-center gap-2 rounded-2xl border-2 border-line bg-surface p-2 pb-2.5 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.3)] sm:w-auto">
          <ReadButton storyId={story.id} cardIds={story.cardIds} labels={{ mark: t("markRead", ui), done: ui === "hi" ? "पढ़ लिया!" : "Done! In Revise" }} />
          <BookmarkButton storyId={story.id} />
          {mcqs.length > 0 && (
            <a href="#quick-check" className="btn btn-orange ml-auto px-4 py-2.5 text-sm">
              {ui === "hi" ? "क्विज़" : "Quiz"} <ArrowDown className="size-4" strokeWidth={2.6} />
            </a>
          )}
        </div>
      </div>

      {mcqs.length > 0 && (
        <section id="quick-check" className="mt-10 scroll-mt-20">
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl sm:text-2xl">
            <span className="grid size-9 place-items-center rounded-xl bg-accent-2 text-white">
              <Target className="size-5" strokeWidth={2.4} />
            </span>
            {t("quickCheck", ui)}
          </h2>
          <QuickCheck mcqs={mcqs.map((m) => m.content)} lang={lang} />
        </section>
      )}

      {thread && thread.stories.length > 1 && (
        <section className="mt-10">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-pink-soft px-2.5 py-0.5 text-xs font-extrabold text-pink">
            <Waypoints className="size-3.5" /> {ui === "hi" ? "कहानी-क्रम" : "Storyline"}
          </div>
          <h2 className="mb-1 font-display text-xl sm:text-2xl">{pick(thread.title, ui)}</h2>
          <p className="mb-4 text-sm text-ink-2">{ui === "hi" ? "इस कहानी का पूरा क्रम" : "How this storyline has developed"}</p>
          <ol className="relative space-y-4 border-l-[3px] border-pink-soft pl-5">
            {thread.stories.map((s) => (
              <li key={s.id} className="relative">
                <span className={`absolute top-1 -left-[29px] size-3.5 rounded-full ring-4 ring-bg ${s.id === story.id ? "bg-pink" : "bg-line-strong"}`} />
                <div className="text-xs text-ink-3">{fmtDate(s.date, ui, { day: "numeric", month: "short", year: "numeric" })}</div>
                {s.id === story.id ? (
                  <div className="font-extrabold">{pick(s.content.title, ui)}</div>
                ) : (
                  <Link href={`/story/${s.id}`} className="font-semibold text-ink-2 hover:text-pink">
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

const TONES = {
  orange: "bg-accent-2-soft [&_h2]:text-accent-2",
  indigo: "bg-accent-soft [&_h2]:text-accent",
  violet: "bg-violet-soft [&_h2]:text-violet",
} as const;

function Callout({ icon, title, tone, children }: { icon: React.ReactNode; title: string; tone: keyof typeof TONES; children: React.ReactNode }) {
  return (
    <div className={`rounded-3xl p-5 text-[15px] leading-relaxed ${TONES[tone]}`}>
      <h2 className="mb-2 flex items-center gap-2 font-display text-base">
        {icon} {title}
      </h2>
      {children}
    </div>
  );
}

function SourceLink({ name, title, url }: { name: string; title: string | null; url: string }) {
  return (
    <li>
      <a href={url} target="_blank" rel="noopener noreferrer" className="group -m-2 flex items-start gap-3 rounded-xl p-2 hover:bg-surface-2">
        <ExternalLink className="mt-0.5 size-4 shrink-0 text-ink-3 group-hover:text-accent" />
        <span className="min-w-0">
          <span className="block text-sm font-bold">{name}</span>
          {title && <span className="block truncate text-sm text-ink-2">{title}</span>}
        </span>
      </a>
    </li>
  );
}
