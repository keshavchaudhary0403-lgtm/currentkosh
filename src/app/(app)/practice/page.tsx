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
    { href: `/practice/run?kind=daily&from=${latest}&to=${latest}`, hue: 262, icon: <Zap className="size-5" />, title: "Daily quiz", body: "10 questions from the latest day" },
    { href: "/practice/run?kind=weekly", hue: 200, icon: <CalendarRange className="size-5" />, title: "Weekly test", body: "25 questions from the last 7 days" },
    { href: "/practice/run?kind=mock", hue: 25, icon: <Timer className="size-5" />, title: "Timed mock", body: "50 Qs · 1 min each · −⅓ negative" },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-5xl">{ui === "hi" ? "अभ्यास" : "Practice"}</h1>
        <p className="mt-2 text-ink-2">Every question is written from an official source and tagged to your exams. Missed questions automatically return in Revise.</p>
      </header>

      {empty && (
        <div className="rounded-2xl border border-warn/40 bg-warn/10 p-4 text-sm">Not enough questions for that selection yet. Try a wider period or fewer topic filters.</div>
      )}

      <section className="grid gap-3 sm:grid-cols-2">
        {quick.map((q) => (
          <Link key={q.href} href={q.href} className="group flex w-full items-start gap-4 rounded-2xl border border-line bg-surface p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-line-strong">
            <span className="cat grid size-11 shrink-0 place-items-center rounded-xl bg-(--cat-tint) text-(--cat-ink)" style={{ "--h": q.hue } as React.CSSProperties}>
              {q.icon}
            </span>
            <span>
              <span className="block font-semibold">{q.title}</span>
              <span className="block text-sm text-ink-2">{q.body}</span>
            </span>
          </Link>
        ))}
        <WeakDrillCard />
      </section>

      {months.length > 0 && (
        <section>
          <SectionTitle eyebrow="Monthly revision tests" title="Test a whole month" />
          <div className="flex flex-wrap gap-2">
            {months.map((m) => (
              <Link key={m} href={`/practice/run?kind=monthly&from=${m}-01&to=${m}-31`} className="rounded-2xl border border-line bg-surface px-4 py-3 text-left transition hover:border-line-strong">
                <span className="block font-display text-xl">{fmtDate(`${m}-01`, ui, { month: "long" })}</span>
                <span className="block text-xs text-ink-3">{m.slice(0, 4)} · 50 questions</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionTitle eyebrow="Build your own" title="Custom test" />
        <Card className="p-5 sm:p-6">
          <TestBuilder latest={latest} lang={profile.lang} />
        </Card>
      </section>

      <RecentAttempts />
    </div>
  );
}
