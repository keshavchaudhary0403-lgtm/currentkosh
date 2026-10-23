import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, ListChecks } from "lucide-react";
import { RevisionHero } from "@/components/revision-hero";
import { CategoryPill, Empty, SectionTitle, fmtDate } from "@/components/ui";
import { addDays, daysUntil, istDate } from "@/lib/dates";
import { currentProfile } from "@/lib/profile";
import { latestStoryDate, recap, storyMonths } from "@/lib/store";
import { pick } from "@/lib/taxonomy";

export const metadata: Metadata = { title: "Revise" };

export default async function Revise({ searchParams }: PageProps<"/revise">) {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const sp = await searchParams;
  const ui = profile.lang === "bi" ? "en" : profile.lang;
  const latest = latestStoryDate() ?? istDate();
  const months = storyMonths();
  const month = typeof sp.month === "string" && months.includes(sp.month) ? sp.month : null;
  const from = month ? `${month}-01` : addDays(latest, -6);
  const to = month ? `${month}-31` : latest;
  const oneLiners = recap(profile, from, to, month ? 80 : 30);
  const countdown = profile.examDate ? daysUntil(profile.examDate) : null;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-5xl">{ui === "hi" ? "दोहराएँ" : "Revise"}</h1>
        <p className="mt-2 text-ink-2">Spaced repetition brings each fact back just before you&apos;d forget it: tomorrow, then 3, 7, 21 days and beyond.</p>
      </header>

      <RevisionHero />

      {countdown !== null && countdown > 0 && (
        <section className="flex flex-col gap-4 rounded-3xl border border-accent/30 bg-accent-soft p-5 sm:flex-row sm:items-center sm:p-6">
          <CalendarClock className="size-8 shrink-0 text-accent" strokeWidth={1.6} />
          <div className="flex-1">
            <div className="font-semibold">{countdown} days to your exam</div>
            <div className="text-sm text-ink-2">
              Countdown plan: clear your due cards daily, take one monthly test each week (oldest month first), and drill your weakest topics.
            </div>
          </div>
          <Link href="/practice#weak" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-bg">
            Drill weak topics
          </Link>
        </section>
      )}

      <section>
        <SectionTitle
          eyebrow={month ? "Monthly recap" : "Weekly recap"}
          title={month ? fmtDate(`${month}-01`, ui, { month: "long", year: "numeric" }) : "This week in one-liners"}
          right={
            <Link
              href={month ? `/practice/run?kind=monthly&from=${from}&to=${to}` : "/practice/run?kind=weekly"}
              className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-surface px-3.5 py-2 text-sm font-semibold"
            >
              <ListChecks className="size-4" /> Test {month ? "this month" : "this week"}
            </Link>
          }
        />
        <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Link href="/revise" className={`rounded-full border px-3 py-1.5 text-sm whitespace-nowrap ${!month ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink-2"}`}>
            Last 7 days
          </Link>
          {months.map((m) => (
            <Link key={m} href={`/revise?month=${m}`} className={`rounded-full border px-3 py-1.5 text-sm whitespace-nowrap ${month === m ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink-2"}`}>
              {fmtDate(`${m}-01`, ui, { month: "short", year: "numeric" })}
            </Link>
          ))}
        </div>
        {oneLiners.length ? (
          <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {oneLiners.map((s, i) => (
              <li key={s.id}>
                <Link href={`/story/${s.id}`} className="flex gap-4 px-4 py-3.5 hover:bg-surface-2">
                  <span className="w-6 shrink-0 pt-0.5 text-right font-display text-lg text-ink-3">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span lang={ui === "hi" ? "hi" : undefined} className="block font-medium">
                      {pick(s.content.title, ui)}
                    </span>
                    <span lang={ui === "hi" ? "hi" : undefined} className="mt-0.5 block text-sm text-ink-2">
                      {s.content.key_facts.slice(0, 2).map((f) => pick(f, ui)).join(" · ")}
                    </span>
                  </span>
                  <span className="hidden shrink-0 sm:block">
                    <CategoryPill id={s.category} lang={profile.lang} size="xs" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <Empty title="Nothing to recap yet" />
        )}
      </section>
    </div>
  );
}
