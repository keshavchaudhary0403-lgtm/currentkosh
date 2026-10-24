import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarRange, Timer, Zap } from "lucide-react";
import { RecentAttempts, WeakDrillCard } from "@/components/practice-widgets";
import { TestBuilder } from "@/components/test-builder";
import { Card, SectionTitle, fmtDate } from "@/components/ui";
import { istDate } from "@/lib/dates";
import { currentProfile } from "@/lib/profile";
import { latestStoryDate, storyMonths } from "@/lib/store";

export const metadata: Metadata = { title: "Practice" };

export default async function Practice({ searchParams }: PageProps<"/practice">) {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const { empty } = await searchParams;
  const ui = profile.lang === "bi" ? "en" : profile.lang;
  const latest = latestStoryDate() ?? istDate();
  const months = storyMonths();

  const quick = [
    { href: `/practice/run?kind=daily&from=${latest}&to=${latest}`, icon: <Zap className="size-6" strokeWidth={2.4} />, title: "Daily quiz", body: "10 Qs · latest day", tone: "bg-accent-soft", ink: "text-accent", solid: "bg-accent" },
    { href: "/practice/run?kind=weekly", icon: <CalendarRange className="size-6" strokeWidth={2.4} />, title: "Weekly test", body: "25 Qs · last 7 days", tone: "bg-teal-soft", ink: "text-teal", solid: "bg-teal" },
    { href: "/practice/run?kind=mock", icon: <Timer className="size-6" strokeWidth={2.4} />, title: "Timed mock", body: "50 Qs · −⅓ negative", tone: "bg-accent-2-soft", ink: "text-accent-2", solid: "bg-accent-2" },
  ];

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-[28px] sm:text-4xl">{ui === "hi" ? "अभ्यास" : "Practice"}</h1>
        <p className="mt-1 text-sm font-medium text-ink-2">Exam-style questions from official sources.</p>
      </header>

      {empty && (
        <div className="rounded-2xl bg-warn-soft p-4 text-sm font-semibold">Not enough questions for that selection yet. Try a wider period or fewer topic filters.</div>
      )}

      <section className="grid grid-cols-2 gap-3">
        {quick.map((q) => (
          <Link key={q.href} href={q.href} className={`group rounded-3xl p-4 transition active:scale-[.97] ${q.tone}`}>
            <span className={`grid size-12 place-items-center rounded-2xl text-white transition group-hover:-rotate-6 ${q.solid}`}>{q.icon}</span>
            <span className={`mt-3 block font-display text-[17px] leading-tight ${q.ink}`}>{q.title}</span>
            <span className="mt-0.5 block text-xs font-semibold text-ink-2">{q.body}</span>
          </Link>
        ))}
        <WeakDrillCard />
      </section>

      {months.length > 0 && (
        <section>
          <SectionTitle title="Monthly tests" eyebrow="50 questions from a whole month" />
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {months.map((m) => (
              <Link key={m} href={`/practice/run?kind=monthly&from=${m}-01&to=${m}-31`} className="tap shrink-0 rounded-2xl bg-surface px-4 py-2.5 text-left">
                <span className="block font-display text-base">{fmtDate(`${m}-01`, ui, { month: "short" })}</span>
                <span className="block text-xs text-ink-3">{m.slice(0, 4)} · 50 Qs</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionTitle title="Build your own test" eyebrow="Pick period, topics and mode" />
        <Card className="rounded-3xl p-5 sm:p-6">
          <TestBuilder latest={latest} lang={profile.lang} />
        </Card>
      </section>

      <RecentAttempts />
    </div>
  );
}
