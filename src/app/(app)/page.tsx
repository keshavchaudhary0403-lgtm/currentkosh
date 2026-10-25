import { redirect } from "next/navigation";
import { DayPicker } from "@/components/day-picker";
import { Deck } from "@/components/deck";
import { Empty } from "@/components/ui";
import { istDate } from "@/lib/dates";
import { t } from "@/lib/i18n";
import { currentProfile } from "@/lib/profile";
import { feedFor, latestStoryDate, storyDates } from "@/lib/store";
import { toDeckStory } from "./deck-data";

export default async function Today({ searchParams }: PageProps<"/">) {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const { date: dateParam } = await searchParams;
  const lang = profile.lang;
  const ui = lang === "bi" ? "en" : lang;

  const latest = latestStoryDate();
  const date = typeof dateParam === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : (latest ?? istDate());
  const feed = feedFor(profile, date).map((s) => toDeckStory(s, profile));
  const main = feed.slice(0, profile.dailyGoal);
  const more = feed.slice(profile.dailyGoal);
  const dates = storyDates(400);
  const picker = <DayPicker key={date} dates={dates} selected={date} latest={latest ?? date} lang={lang} />;

  return (
    <div className="h-[calc(100dvh-4rem-1px)] pt-2 lg:p-6 lg:pt-5">
      <h1 className="sr-only">{date === latest ? (ui === "hi" ? "आज की ख़बरें" : "Today's news") : ui === "hi" ? "इस दिन की ख़बरें" : "News for this day"}</h1>
      {main.length ? (
        <Deck main={main} more={more} lang={lang} date={date} isLatest={date === latest} picker={picker} />
      ) : (
        <div className="space-y-4 p-4">
          {picker}
          <Empty title={t("noStories", ui)}>{ui === "hi" ? "नई ख़बरें रोज़ जोड़ी जाती हैं।" : "New stories are added every day from PIB, AIR, DD News and RBI."}</Empty>
        </div>
      )}
    </div>
  );
}
