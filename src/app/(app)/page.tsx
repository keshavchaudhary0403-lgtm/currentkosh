import Link from "next/link";
import { redirect } from "next/navigation";
import { DayPicker } from "@/components/day-picker";
import { InstallBanner } from "@/components/install";
import { Brief, NextSteps, StoryList, TodayHeader, TodayRail } from "@/components/today";
import { Empty, SectionTitle } from "@/components/ui";
import { daysUntil, istDate } from "@/lib/dates";
import { t } from "@/lib/i18n";
import { currentProfile } from "@/lib/profile";
import { categoryById, pick } from "@/lib/taxonomy";
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
  // The day's main subjects, most stories first, as a gentle "what today is about".
  const topicCount = new Map<string, number>();
  for (const { story } of brief) topicCount.set(story.category, (topicCount.get(story.category) ?? 0) + 1);
  const focus = [...topicCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c]) => pick(categoryById(c)?.label, ui));
  const dates = storyDates(400);
  const threads = activeThreads(8);
  const countdown = profile.examDate ? daysUntil(profile.examDate) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-6">
        <div>
          <TodayHeader date={date} briefIds={briefIds} focus={focus} lang={lang} isLatest={date === latest} />
          {dates.length > 1 && <DayPicker key={date} dates={dates} selected={date} latest={latest ?? date} lang={lang} />}
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
            <StoryList items={more} lang={lang} />
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
