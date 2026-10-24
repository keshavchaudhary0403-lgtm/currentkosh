import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarRange, Timer, Zap } from "lucide-react";
import { RecentAttempts, WeakDrillCard } from "@/components/practice-widgets";
import { TestBuilder } from "@/components/test-builder";
import { SectionTitle, fmtDate } from "@/components/ui";
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

  const hi = ui === "hi";
  const quick = [
    {
      href: `/practice/run?kind=daily&from=${latest}&to=${latest}`,
      icon: <Zap className="size-6" strokeWidth={2.4} />,
      title: hi ? "डेली क्विज़" : "Daily quiz",
      body: hi ? "10 प्रश्न · ताज़ा दिन" : "10 Qs · latest day",
      tone: "border border-line bg-surface hover:border-line-strong",
      ink: "text-ink",
      solid: "bg-accent-soft text-accent",
    },
    {
      href: "/practice/run?kind=weekly",
      icon: <CalendarRange className="size-6" strokeWidth={2.4} />,
      title: hi ? "साप्ताहिक टेस्ट" : "Weekly test",
      body: hi ? "25 प्रश्न · पिछले 7 दिन" : "25 Qs · last 7 days",
      tone: "border border-line bg-surface hover:border-line-strong",
      ink: "text-ink",
      solid: "bg-accent-soft text-accent",
    },
    {
      href: "/practice/run?kind=mock",
      icon: <Timer className="size-6" strokeWidth={2.4} />,
      title: hi ? "टाइम्ड मॉक" : "Timed mock",
      body: hi ? "50 प्रश्न · −⅓ नेगेटिव" : "50 Qs · −⅓ negative",
      tone: "border border-line bg-surface hover:border-line-strong",
      ink: "text-ink",
      solid: "bg-accent-soft text-accent",
    },
  ];

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-2xl sm:text-[28px]">{ui === "hi" ? "अभ्यास" : "Practice"}</h1>
        <p className="mt-1 text-sm font-medium text-ink-2">
          {hi ? "आधिकारिक स्रोतों से परीक्षा-शैली के प्रश्न।" : "Exam-style questions from official sources."}
        </p>
      </header>

      {empty && (
        <div className="rounded-2xl bg-warn-soft p-4 text-sm font-semibold">
          {hi
            ? "इस चयन के लिए अभी पर्याप्त प्रश्न नहीं हैं। लंबी अवधि या कम विषय चुनें।"
            : "Not enough questions for that selection yet. Try a wider period or fewer topic filters."}
        </div>
      )}

      <div className="space-y-7 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-6 lg:space-y-0">
        <div className="space-y-7">
          <section className="grid grid-cols-2 gap-3">
            {quick.map((q) => (
              <Link key={q.href} href={q.href} className={`group rounded-3xl p-4 transition active:scale-[.97] ${q.tone}`}>
                <span className={`grid size-12 place-items-center rounded-2xl transition ${q.solid}`}>{q.icon}</span>
                <span className={`mt-3 block font-display text-[17px] leading-tight ${q.ink}`}>{q.title}</span>
                <span className="mt-0.5 block text-xs font-semibold text-ink-2">{q.body}</span>
              </Link>
            ))}
            <WeakDrillCard />
          </section>

          <RecentAttempts />

          {months.length > 0 && (
            <section>
              <SectionTitle title={hi ? "मासिक टेस्ट" : "Monthly tests"} eyebrow={hi ? "पूरे महीने से 50 प्रश्न" : "50 questions from a whole month"} />
              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                {months.map((m) => (
                  <Link
                    key={m}
                    href={`/practice/run?kind=monthly&from=${m}-01&to=${m}-31`}
                    className="tap shrink-0 rounded-2xl bg-surface px-4 py-2.5 text-left"
                  >
                    <span className="block font-display text-base">{fmtDate(`${m}-01`, ui, { month: "short" })}</span>
                    <span className="block text-xs text-ink-3">
                      {m.slice(0, 4)} · 50 {hi ? "प्रश्न" : "Qs"}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
        <section className="rounded-3xl border border-line bg-surface p-5 lg:sticky lg:top-20">
          <div className="mb-4">
            <h2 className="font-display text-lg leading-tight">{hi ? "अपना टेस्ट बनाएँ" : "Build your own test"}</h2>
            <p className="text-xs text-ink-3">{hi ? "अवधि, विषय और मोड चुनें" : "Pick period, topics and mode"}</p>
          </div>
          <TestBuilder latest={latest} lang={profile.lang} />
        </section>
      </div>
    </div>
  );
}
