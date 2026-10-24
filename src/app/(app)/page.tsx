import Link from "next/link";
import { redirect } from "next/navigation";
import { InstallBanner } from "@/components/install";
import { Brief, NextSteps, StoryList, TodayHeader, TodayRail } from "@/components/today";
import { Empty, SectionTitle, cx, fmtDate } from "@/components/ui";
import { daysUntil, istDate } from "@/lib/dates";
import { t } from "@/lib/i18n";
import { currentProfile } from "@/lib/profile";
import { activeThreads, feedFor, latestStoryDate, relevanceFor, storyDates } from "@/lib/store";


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
  const briefIds = brief.map((b) => b.story.id);
  const dates = storyDates(14);
  const threads = activeThreads(8);
  const countdown = profile.examDate ? daysUntil(profile.examDate) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-6">
        <div>
          <TodayHeader date={date} briefIds={briefIds} lang={lang} />
          {dates.length > 1 && (
            <nav className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" aria-label="Choose a day">
              {dates.map((d) => (
                <Link
                  key={d.date}
                  href={d.date === latest ? "/" : `/?date=${d.date}`}
                  className={cx(
                    "flex min-w-[54px] flex-col items-center rounded-2xl border-2 px-2 py-1.5 text-center transition active:scale-95",
                    d.date === date ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink-2 hover:border-line-strong",
                  )}
                >
                  <span className="text-[10px] font-extrabold uppercase">{fmtDate(d.date, ui, { weekday: "short" })}</span>
                  <span className="font-display text-lg leading-tight">{fmtDate(d.date, ui, { day: "numeric" })}</span>
                </Link>
              ))}
            </nav>
          )}
          {brief.length ? (
            <Brief items={brief} lang={lang} />
          ) : (
            <Empty title={t("noStories", ui)}>{ui === "hi" ? "नई ख़बरें रोज़ जोड़ी जाती हैं।" : "New stories are added every day from PIB, AIR, DD News and RBI."}</Empty>
          )}
        </div>

        <InstallBanner />

        {brief.length > 0 && <NextSteps date={date} lang={lang} />}

        {more.length > 0 && (
          <section>
            <SectionTitle title={ui === "hi" ? "और भी आज" : "Also today"} eyebrow={ui === "hi" ? "आपकी परीक्षाओं के लिए कम प्राथमिकता" : "Lower priority for your exams"} />
            <StoryList items={more} lang={lang} compact grid />
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

      <TodayRail date={date} briefIds={briefIds} countdown={countdown} threads={threads} lang={lang} />
    </div>
  );
}
