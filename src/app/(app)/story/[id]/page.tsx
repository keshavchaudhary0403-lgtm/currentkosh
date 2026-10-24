import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, ArrowUpRight, Landmark, Lightbulb, Newspaper, PenLine, ShieldCheck, Sparkles, Target, Waypoints } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { BookmarkButton, QuickCheck, QuizButton, ReadButton } from "@/components/story-actions";
import { CategoryIcon, catStyle } from "@/components/category-icon";
import { BiText, RelevanceBadge, cx, fmtDate } from "@/components/ui";
import { t } from "@/lib/i18n";
import { currentProfile } from "@/lib/profile";
import { examRelevance, feedFor, getStory, getThread, latestStoryDate, mcqsForStory } from "@/lib/store";
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
  const hi = ui === "hi";
  const c = story.content;
  const mcqs = mcqsForStory(story.id);
  const thread = story.threadKey ? getThread(story.threadKey) : null;
  const official = story.sources.filter((s) => sourceById(s.sourceId)?.mode === "ai");
  const reported = story.sources.filter((s) => sourceById(s.sourceId)?.mode === "facts");
  const alsoCovered = story.sources.filter((s) => !["ai", "facts"].includes(sourceById(s.sourceId)?.mode ?? ""));
  // Reading order for the day, same as the Today list, so a reader can go story to story.
  const dayFeed = feedFor(profile, story.date);
  const pos = dayFeed.findIndex((s) => s.id === story.id);
  const next = pos >= 0 ? (dayFeed[pos + 1] ?? null) : null;
  const nextHref = next ? `/story/${next.id}` : null;
  const dayHref = story.date === latestStoryDate() ? "/" : `/?date=${story.date}`;
  const readLabels = {
    mark: hi ? "पढ़ा" : "Read",
    next: hi ? "अगली" : "Next",
    doneHint: hi ? "इसके तथ्य दोहराव में जुड़ गए" : "Its facts are now in your Revise queue",
  };
  // Long storylines (some have 200+ updates): show the few updates around this one.
  const at = thread ? thread.stories.findIndex((s) => s.id === story.id) : -1;
  const nearby = thread ? thread.stories.slice(Math.max(0, at - 3), at + 4) : [];
  const words = pick(c.summary, "en").split(/\s+/).length + c.key_facts.length * 14;
  const minutes = Math.max(1, Math.round(words / 200));

  return (
    <div className="cat pb-28 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 lg:pb-10" style={catStyle(story.category)}>
      <div aria-hidden className="read-progress fixed inset-x-0 top-0 z-50 h-[3px] bg-(--cat-solid)" />
      <article className="min-w-0">
        <BackButton fallback={dayHref} label={hi ? "वापस" : "Back"} />

        <header className="rise">
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
            className="mt-5 font-display text-[38px] sm:text-[60px] xl:text-[68px]"
            hiClassName="font-sans text-xl sm:text-2xl font-semibold tracking-normal mt-4 leading-snug"
          />
          <div className="mt-5 flex flex-wrap gap-2 lg:hidden">
            {profile.exams.map((e) => (
              <span key={e} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-card px-3 text-xs font-semibold text-ink-2 shadow-[inset_0_0_0_1px_var(--line)] has-[>span]:pr-1">
                {pick(examById(e)?.label, ui)} <RelevanceBadge level={examRelevance(story, e)} lang={ui} />
              </span>
            ))}
          </div>
        </header>

        <section className="rise mt-7 border-l-[3px] border-(--cat-solid) pl-5 sm:mt-9 sm:pl-7" style={{ animationDelay: "80ms" }}>
          <BiText v={c.summary} lang={lang} as="p" className="text-[18px] leading-[1.7] text-ink sm:text-[20px]" hiClassName="mt-4 text-[17px]" />
        </section>

        <section className="card reveal mt-8 overflow-hidden">
          <h2 className="flex items-center gap-2.5 border-b border-line bg-(--cat-tint) px-5 py-4 text-[15px] font-semibold sm:px-6">
            <Sparkles className="size-[18px] text-(--cat-ink)" /> {t("keyFacts", ui)}
            <span className="ml-auto font-mono text-xs text-ink-3">{c.key_facts.length}</span>
          </h2>
          <ol className="divide-y divide-line">
            {c.key_facts.map((f, i) => (
              <li key={i} className="flex gap-4 px-5 py-4 text-[15px] leading-relaxed font-medium sm:px-6">
                <span className="w-6 shrink-0 pt-0.5 font-mono text-xs text-(--cat-ink) tnum">{String(i + 1).padStart(2, "0")}</span>
                <BiText v={f} lang={lang} hiClassName="text-sm" />
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2">
          <Insight tone="signal" icon={<Lightbulb className="size-[18px]" />} title={t("whyItMatters", ui)}>
            <BiText v={c.why_it_matters} lang={lang} as="p" />
          </Insight>
          <Insight tone="cobalt" icon={<Landmark className="size-[18px]" />} title={t("staticLink", ui)}>
            <BiText v={c.static_link} lang={lang} as="p" />
          </Insight>
          {c.mains_angle && (
            <Insight tone="ink" icon={<PenLine className="size-[18px]" />} title={t("mainsAngle", ui)} className="sm:col-span-2">
              <BiText v={c.mains_angle} lang={lang} as="p" className="font-display text-[22px] leading-snug sm:text-[26px]" hiClassName="font-sans text-base" />
            </Insight>
          )}
        </section>

        {c.glossary.length > 0 && (
          <section className="reveal mt-8">
            <h2 className="eyebrow mb-3 text-ink-3">{t("glossary", ui)}</h2>
            <div className="flex flex-wrap gap-2">
              {c.glossary.map((g, i) => (
                <span key={i} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-card px-4 text-sm font-medium shadow-[inset_0_0_0_1px_var(--line-2)]">
                  {g.en}
                  <span className="text-ink-3">⇄</span>
                  <span lang="hi" className="text-mint-ink">
                    {g.hi}
                  </span>
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="card reveal mt-8 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold">
            <ShieldCheck className="size-[18px] text-good" /> {hi ? "आधिकारिक स्रोत" : "Official sources"}
          </h2>
          {official.length > 0 && (
            <ul className="mt-3 space-y-1">
              {official.map((s) => (
                <SourceLink key={s.url} name={sourceById(s.sourceId)?.name ?? s.sourceId} title={s.title} url={s.url} />
              ))}
            </ul>
          )}
          {reported.length > 0 && (
            <>
              <h3 className="mt-5 mb-2 flex items-center gap-2 text-sm font-semibold text-ink-2">
                <Newspaper className="size-4 text-amber-ink" />
                {hi ? "समाचार रिपोर्ट (तथ्य मिलान)" : "Press reports (facts cross-checked)"}
              </h3>
              <ul className="space-y-1">
                {reported.map((s) => (
                  <SourceLink key={s.url} name={outletName(s.url)} title={s.title} url={s.url} />
                ))}
              </ul>
            </>
          )}
          {alsoCovered.length > 0 && (
            <>
              <h3 className="mt-5 mb-2 text-sm font-semibold text-ink-2">{hi ? "यहाँ भी पढ़ें" : "Also covered by"}</h3>
              <ul className="space-y-1">
                {alsoCovered.map((s) => (
                  <SourceLink key={s.url} name={sourceById(s.sourceId)?.name ?? s.sourceId} title={s.title} url={s.url} />
                ))}
              </ul>
            </>
          )}
          <p className="mt-4 rounded-2xl bg-card-2 p-3 text-xs leading-relaxed text-ink-3">
            {reported.length > 0 && official.length > 0
              ? hi
                ? "यह नोट Claude (AI) ने ऊपर दिए आधिकारिक स्रोतों से तैयार किया है; कुछ विवरण उन तथ्यों से हैं जिनकी पुष्टि कम से कम दो स्वतंत्र समाचार स्रोतों ने की है। उद्धृत करने से पहले मूल स्रोत देखें।"
                : "Claude (AI) wrote these notes from the official sources above, with some details from facts that at least two independent outlets confirm. Check the original for anything you will quote."
              : reported.length > 0
              ? hi
                ? "इस घटना का कोई आधिकारिक स्रोत नहीं मिला। यह संक्षिप्त नोट Claude (AI) ने केवल उन तथ्यों से लिखा है जिनकी पुष्टि कम से कम दो स्वतंत्र समाचार स्रोतों ने की है। उद्धृत करने से पहले मूल रिपोर्ट देखें।"
                : "No official source covered this event yet. Claude (AI) wrote this short note only from facts that at least two independent outlets confirm. Check the reports before you quote anything."
              : hi
                ? "यह नोट Claude (AI) द्वारा केवल ऊपर दिए आधिकारिक स्रोतों से तैयार किया गया है। अंतिम पुष्टि के लिए मूल स्रोत देखें।"
                : "These notes are written by Claude (AI) only from the official sources above. Check the original for anything you will quote."}
          </p>
        </section>

        {mcqs.length > 0 && (
          <section id="quick-check" className="mt-12 scroll-mt-24">
            <div className="mb-4 flex items-end gap-3">
              <span className="grid size-12 place-items-center rounded-[16px] bg-flare text-white">
                <Target className="size-6" strokeWidth={2} />
              </span>
              <div>
                <div className="eyebrow text-ink-3">{mcqs.length} {hi ? "प्रश्न" : "questions"}</div>
                <h2 className="font-display text-[34px] sm:text-[42px]">{t("quickCheck", ui)}</h2>
              </div>
            </div>
            <QuickCheck mcqs={mcqs.map((m) => ({ id: m.id, content: m.content }))} category={story.category} lang={lang} />
          </section>
        )}

        {thread && thread.stories.length > 1 && (
          <section className="reveal mt-12 lg:hidden">
            <div className="eyebrow mb-1 inline-flex items-center gap-1.5 text-amber-ink">
              <Waypoints className="size-3.5" /> {hi ? "घटनाक्रम" : "Timeline"}
            </div>
            <h2 className="mb-1 font-display text-[30px]">{pick(thread.title, ui)}</h2>
            <p className="mb-5 text-sm text-ink-2">{hi ? "यह मुद्दा कैसे आगे बढ़ा" : "How this issue has developed"}</p>
            <Timeline items={nearby} currentId={story.id} ui={ui} />
            <FullStorylineLink threadKey={story.threadKey!} count={thread.stories.length} ui={ui} />
          </section>
        )}

        <nav className="mt-12 grid gap-3 sm:grid-cols-2" aria-label="Keep reading">
          {next ? (
            <Link href={`/story/${next.id}`} className="card lift group p-5 sm:order-2">
              <span className="eyebrow text-ink-3">{hi ? "अगली ख़बर" : "Up next"}</span>
              <span lang={hi ? "hi" : undefined} className="mt-2 flex items-start gap-3">
                <span className="line-clamp-2 flex-1 text-[17px] leading-snug font-semibold">{pick(next.content.title, ui)}</span>
                <ArrowRight className="mt-1 size-5 shrink-0 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ) : (
            <Link href="/practice/run?kind=daily" className="lift group rounded-[24px] bg-signal p-5 text-on-signal sm:order-2">
              <span className="eyebrow opacity-60">{hi ? "दिन की आख़िरी ख़बर" : "That's the last story of the day"}</span>
              <span className="mt-2 flex items-center gap-3 text-[17px] font-semibold">
                {hi ? "अब डेली क्विज़ दें" : "Take the daily quiz"} <ArrowRight className="size-5 transition group-hover:translate-x-1" />
              </span>
            </Link>
          )}
          <Link href={dayHref} className="card lift p-5 sm:order-1">
            <span className="eyebrow text-ink-3">{hi ? "सूची पर लौटें" : "Back to the list"}</span>
            <span className="mt-2 block text-[17px] font-semibold">
              {fmtDate(story.date, ui, { day: "numeric", month: "long" })}
              {pos >= 0 && <span className="font-mono text-sm text-ink-3"> · {pos + 1}/{dayFeed.length}</span>}
            </span>
          </Link>
        </nav>

        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] lg:sticky lg:bottom-6 lg:mt-10 lg:px-0 lg:pb-0">
          <div className="glass mx-auto flex w-full max-w-md items-center gap-1.5 rounded-full p-1.5 shadow-float ring-1 ring-line-2 lg:w-fit lg:max-w-none">
            <BackButton fallback={dayHref} variant="icon" label={hi ? "वापस" : "Back"} />
            <ReadButton storyId={story.id} cardIds={story.cardIds} labels={readLabels} nextHref={nextHref} className="flex-1 lg:flex-none" />
            <BookmarkButton storyId={story.id} label={hi ? "सहेजें" : "Save"} />
            {mcqs.length > 0 && <QuizButton storyId={story.id} label={hi ? "क्विज़" : "Quiz"} />}
          </div>
        </div>
      </article>

      <aside className="hidden lg:block">
        <div className="no-scrollbar sticky top-24 max-h-[calc(100dvh-7rem)] space-y-4 overflow-y-auto pb-2">
          <div className="card p-5">
            <h2 className="eyebrow mb-3 text-ink-3">{hi ? "आपकी परीक्षाओं के लिए" : "For your exams"}</h2>
            <ul className="space-y-2.5">
              {profile.exams.map((e) => (
                <li key={e} className="flex items-center justify-between gap-2 text-sm font-semibold">
                  {pick(examById(e)?.label, ui)}
                  {examRelevance(story, e) >= 2 ? <RelevanceBadge level={examRelevance(story, e)} lang={ui} /> : <span className="font-mono text-[11px] text-ink-3 uppercase">{hi ? "कम" : "Low"}</span>}
                </li>
              ))}
            </ul>
          </div>

          {thread && thread.stories.length > 1 && (
            <div className="card p-5">
              <div className="eyebrow mb-1 inline-flex items-center gap-1.5 text-amber-ink">
                <Waypoints className="size-3.5" /> {hi ? "घटनाक्रम" : "Timeline"}
              </div>
              <h2 className="mb-4 text-[17px] leading-snug font-semibold">{pick(thread.title, ui)}</h2>
              <Timeline items={nearby} currentId={story.id} ui={ui} compact />
              <FullStorylineLink threadKey={story.threadKey!} count={thread.stories.length} ui={ui} />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

const TONES = {
  signal: "bg-signal-soft [&_h2]:text-signal-ink",
  cobalt: "bg-cobalt-soft [&_h2]:text-cobalt-ink",
  ink: "bg-[#10110e] text-[#f3f2ec] [&_h2]:text-[#c8f135] dark:bg-card dark:text-ink dark:shadow-[inset_0_0_0_1px_var(--line-2)] [&_[lang=hi]]:text-white/70 dark:[&_[lang=hi]]:text-ink-2",
} as const;

function Insight({ icon, title, tone, children, className }: { icon: React.ReactNode; title: string; tone: keyof typeof TONES; children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("reveal rounded-[24px] p-5 text-[15px] leading-relaxed sm:p-6", TONES[tone], className)}>
      <h2 className="eyebrow mb-3 flex items-center gap-2">
        {icon} {title}
      </h2>
      {children}
    </div>
  );
}

function Timeline({ items, currentId, ui, compact }: { items: { id: string; date: string; content: { title: { en: string; hi: string } } }[]; currentId: string; ui: "en" | "hi"; compact?: boolean }) {
  return (
    <ol className="relative space-y-4 pl-6 before:absolute before:top-1.5 before:bottom-1.5 before:left-[5px] before:w-0.5 before:rounded-full before:bg-amber-soft">
      {items.map((s) => {
        const here = s.id === currentId;
        return (
          <li key={s.id} className="relative">
            <span className={cx("absolute top-1 -left-6 size-3 rounded-full ring-4", compact ? "ring-card" : "ring-bg", here ? "bg-amber shadow-[0_0_0_6px_var(--amber-soft)]" : "bg-line-2")} />
            <div className="font-mono text-[11px] text-ink-3 uppercase">{fmtDate(s.date, ui, { day: "numeric", month: "short", year: compact ? undefined : "numeric" })}</div>
            {here ? (
              <div className={cx("leading-snug font-semibold", compact && "text-sm")}>{pick(s.content.title, ui)}</div>
            ) : (
              <Link href={`/story/${s.id}`} className={cx("block leading-snug font-medium text-ink-2 hover:text-ink hover:underline", compact && "text-sm")}>
                {pick(s.content.title, ui)}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function FullStorylineLink({ threadKey, count, ui }: { threadKey: string; count: number; ui: "en" | "hi" }) {
  return (
    <Link href={`/thread/${threadKey}`} className="btn btn-ghost mt-5 h-11 w-full px-4 text-sm">
      {ui === "hi" ? `पूरा क्रम देखें (${count})` : `See all ${count} updates`} <ArrowRight className="size-4" />
    </Link>
  );
}

function outletName(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function SourceLink({ name, title, url }: { name: string; title: string | null; url: string }) {
  return (
    <li>
      <a href={url} target="_blank" rel="noopener noreferrer" className="group -mx-2 flex min-h-11 items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-card-2">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{name}</span>
          {title && <span className="block truncate text-sm text-ink-2">{title}</span>}
        </span>
        <ArrowUpRight className="size-4 shrink-0 text-ink-3 transition group-hover:rotate-45 group-hover:text-ink" />
      </a>
    </li>
  );
}
