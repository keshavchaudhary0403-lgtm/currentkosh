import { redirect } from "next/navigation";
import { DayPicker } from "@/components/day-picker";
import { InstallBanner } from "@/components/install";
import { Brief, MissionCard, MoreStories, NextSteps, Storylines, TodayHeader } from "@/components/today";
import { Empty } from "@/components/ui";
import { daysUntil, istDate } from "@/lib/dates";
import { t } from "@/lib/i18n";
import { currentProfile } from "@/lib/profile";
import { activeThreads, feedFor, latestStoryDate, relevanceFor, storyDates, toCard } from "@/lib/store";
import { examById, pick } from "@/lib/taxonomy";

export default async function Today({ searchParams }: PageProps<"/">) {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const { date: dateParam } = await searchParams;
  const lang = profile.lang;
  const ui = lang === "bi" ? "en" : lang;

  const latest = latestStoryDate();
  const date = typeof dateParam === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : (latest ?? istDate());
  const feed = feedFor(profile, date).map((story) => ({ story, relevance: relevanceFor(story, profile) }));
  const brief = feed.slice(0, profile.dailyGoal).map((x) => ({ ...x, story: toCard(x.story, true) }));
  const more = feed.slice(profile.dailyGoal).map((x) => ({ ...x, story: toCard(x.story) }));
  const briefIds = brief.map((b) => b.story.id);
  const dates = storyDates(400);
  const threads = activeThreads(8);
  const countdown = profile.examDate ? daysUntil(profile.examDate) : null;
  const isLatest = date === latest;
  const edition = Math.max(1, dates.length - Math.max(0, dates.findIndex((d) => d.date === date)));
  const exams = profile.exams.map((e) => pick(examById(e)?.label, ui)).join(" · ");

  return (
    <div className="space-y-6 sm:space-y-8">
      <TodayHeader
        date={date}
        lang={lang}
        isLatest={isLatest}
        edition={edition}
        exams={exams}
        picker={dates.length > 1 && <DayPicker key={date} dates={dates} selected={date} latest={latest ?? date} lang={lang} />}
      />
      {brief.length ? (
        <Brief items={brief} lang={lang} aside={<MissionCard date={date} briefIds={briefIds} lang={lang} isLatest={isLatest} countdown={countdown} />} />
      ) : (
        <Empty title={t("noStories", ui)}>{ui === "hi" ? "नई ख़बरें रोज़ जोड़ी जाती हैं।" : "New stories are added every day from PIB, AIR, DD News and RBI."}</Empty>
      )}
      {brief.length > 0 && <NextSteps date={date} lang={lang} />}
      <InstallBanner />
      {more.length > 0 && <MoreStories items={more} lang={lang} />}
      <Storylines threads={threads} lang={lang} />
    </div>
  );
}
