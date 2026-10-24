import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarRange, ChevronRight, Timer, Zap } from "lucide-react";
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
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-[28px] sm:text-4xl">{ui === "hi" ? "अभ्यास" : "Practice"}</h1>
        <p className="mt-1 text-sm text-ink-2">Questions from official sources, in your exam&apos;s style. Missed ones return in Revise.</p>
      </header>

      {empty && (
        <div className="rounded-xl border border-warn/40 bg-warn/10 p-4 text-sm">Not enough questions for that selection yet. Try a wider period or fewer topic filters.</div>
      )}

      <section className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {quick.map((q) => (
          <Link key={q.href} href={q.href} className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-surface-2 sm:px-5">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">{q.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium">{q.title}</span>
              <span className="block text-xs text-ink-3">{q.body}</span>
            </span>
            <ChevronRight className="size-4 text-ink-3" />
          </Link>
        ))}
        <WeakDrillCard />
      </section>

      {months.length > 0 && (
        <section>
          <SectionTitle eyebrow="Monthly revision tests" title="Test a whole month" />
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {months.map((m) => (
              <Link key={m} href={`/practice/run?kind=monthly&from=${m}-01&to=${m}-31`} className="shrink-0 rounded-lg border border-line bg-surface px-3.5 py-2 text-left transition hover:border-line-strong">
                <span className="block text-[15px] font-semibold">{fmtDate(`${m}-01`, ui, { month: "short" })}</span>
                <span className="block text-xs text-ink-3">{m.slice(0, 4)} · 50 Qs</span>
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
