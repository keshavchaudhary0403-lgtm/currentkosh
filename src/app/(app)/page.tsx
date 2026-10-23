import Link from "next/link";
import { redirect } from "next/navigation";
import { BriefHero, NextSteps, StoryList } from "@/components/today";
import { Empty, SectionTitle, fmtDate } from "@/components/ui";
import { daysUntil, istDate } from "@/lib/dates";
import { t } from "@/lib/i18n";
import { currentProfile } from "@/lib/profile";
import { activeThreads, feedFor, latestStoryDate, relevanceFor, storyDates } from "@/lib/store";
import { pick } from "@/lib/taxonomy";

export default async function Today({ searchParams }: PageProps<"/">) {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const { date: dateParam } = await searchParams;
  const lang = profile.lang;
  const ui = lang === "bi" ? "en" : lang;

  const latest = latestStoryDate();
  const date = typeof dateParam === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : (latest ?? istDate());
  const feed = feedFor(profile, date).map((story) => ({ story, relevance: relevanceFor(story, profile) }));
  const brief = feed.slice(0, profile.dailyGoal);
  const more = feed.slice(profile.dailyGoal);
  const dates = storyDates(14);
  const threads = activeThreads(6);
  const countdown = profile.examDate ? daysUntil(profile.examDate) : null;

  return (
    <div className="space-y-10">
      <BriefHero date={date} briefIds={brief.map((b) => b.story.id)} countdown={countdown} lang={lang} />

      {dates.length > 1 && (
        <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {dates.map((d) => (
            <Link
              key={d.date}
              href={d.date === latest ? "/" : `/?date=${d.date}`}
              className={`flex min-w-16 flex-col items-center rounded-2xl border px-3 py-2 text-center transition ${d.date === date ? "border-ink bg-ink text-bg" : "border-line bg-surface hover:border-line-strong"}`}
            >
              <span className="text-[11px] font-medium uppercase opacity-70">{fmtDate(d.date, ui, { weekday: "short" })}</span>
              <span className="font-display text-xl leading-tight">{fmtDate(d.date, ui, { day: "numeric" })}</span>
              <span className="text-[10px] opacity-60">{d.count}</span>
            </Link>
          ))}
        </nav>
      )}

      <section>
        {brief.length ? (
          <StoryList items={brief} lang={lang} numbered />
        ) : (
          <Empty title={t("noStories", ui)}>{ui === "hi" ? "नई ख़बरें रोज़ जोड़ी जाती हैं।" : "New stories are added every day from PIB, AIR, DD News and RBI."}</Empty>
        )}
      </section>

      {brief.length > 0 && <NextSteps date={date} lang={lang} />}

      {more.length > 0 && (
        <section>
          <SectionTitle eyebrow={ui === "hi" ? "और भी" : "Also today"} title={ui === "hi" ? "कम प्राथमिकता वाली ख़बरें" : "Lower priority for your exams"} />
          <StoryList items={more} lang={lang} compact grid />
        </section>
      )}

      {threads.length > 0 && (
        <section>
          <SectionTitle eyebrow={t("threads", ui)} title={ui === "hi" ? "चल रही कहानियाँ" : "Follow the storylines"} right={<Link href="/threads" className="text-sm font-medium text-accent">{ui === "hi" ? "सभी" : "All"} →</Link>} />
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {threads.map((th) => (
              <Link key={th.key} href={`/thread/${th.key}`} className="min-w-56 rounded-2xl border border-line bg-surface p-4 shadow-card transition hover:border-line-strong">
                <div className="text-[11px] font-semibold tracking-wider text-ink-3 uppercase">
                  {th.count} {ui === "hi" ? "अपडेट" : th.count === 1 ? "update" : "updates"} · {fmtDate(th.lastDate, ui)}
                </div>
                <div lang={ui === "hi" ? "hi" : undefined} className="mt-1 font-semibold">
                  {pick(th.title, ui)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {date !== latest && (
        <p className="text-center text-sm text-ink-3">
          <Link href="/" className="underline">
            {ui === "hi" ? "आज पर लौटें" : "Back to the latest day"}
          </Link>
        </p>
      )}
    </div>
  );
}
