import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, CalendarRange, Timer, Zap } from "lucide-react";
import { RecentAttempts, WeakDrillCard } from "@/components/practice-widgets";
import { TestBuilder } from "@/components/test-builder";
import { PageHeader, SectionTitle, fmtDate } from "@/components/ui";
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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={hi ? "परीक्षा-शैली · आधिकारिक स्रोत" : "Exam-style · from official sources"}
        title={hi ? "अभ्यास" : <>Practice<span className="text-flare">.</span></>}
      />

      {empty && (
        <div className="pop rounded-[20px] bg-amber-soft p-4 text-sm font-semibold text-amber-ink">
          {hi ? "इस चयन के लिए अभी पर्याप्त प्रश्न नहीं हैं। लंबी अवधि या कम विषय चुनें।" : "Not enough questions for that selection yet. Try a wider period or fewer topic filters."}
        </div>
      )}

      <div className="space-y-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,540px)] lg:items-start lg:gap-6 lg:space-y-0">
        <div className="space-y-8">
          <section className="stagger grid grid-cols-2 gap-3">
            <Link href={`/practice/run?kind=daily&from=${latest}&to=${latest}`} className="lift group relative col-span-2 flex items-center gap-4 overflow-hidden rounded-[28px] bg-signal p-5 text-on-signal sm:p-6">
              <span className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-[#10110e] text-[#c8f135] transition duration-500 group-hover:-rotate-12">
                <Zap className="size-6" strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="eyebrow block opacity-60">{hi ? "ताज़ा दिन" : "Latest day"}</span>
                <span className="mt-1 block font-display text-[27px] leading-none sm:text-[31px]">{hi ? "डेली क्विज़" : "Daily quiz"}</span>
                <span className="mt-1 block text-sm font-medium opacity-70">{hi ? "10 प्रश्न · लगभग 5 मिनट" : "10 questions · about 5 minutes"}</span>
              </span>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-black/10 transition group-hover:rotate-45 group-hover:bg-[#10110e] group-hover:text-[#c8f135]">
                <ArrowUpRight className="size-5" />
              </span>
            </Link>
            <Link href="/practice/run?kind=weekly" className="card lift group flex min-h-[124px] flex-col p-5">
              <span className="grid size-11 place-items-center rounded-[14px] bg-mint-soft text-mint-ink transition group-hover:-rotate-6">
                <CalendarRange className="size-5" />
              </span>
              <span className="mt-auto pt-4">
                <span className="block font-display text-[22px] leading-none">{hi ? "साप्ताहिक" : "Weekly"}</span>
                <span className="mt-1 block text-xs font-medium text-ink-2">{hi ? "25 प्रश्न · पिछले 7 दिन" : "25 Qs · last 7 days"}</span>
              </span>
            </Link>
            <Link href="/practice/run?kind=mock" className="lift group flex min-h-[124px] flex-col rounded-[24px] bg-[#10110e] p-5 text-[#f3f2ec] dark:bg-card dark:shadow-[inset_0_0_0_1px_var(--line-2)]">
              <span className="grid size-11 place-items-center rounded-[14px] bg-white/10 text-[#c8f135] transition group-hover:rotate-6">
                <Timer className="size-5" />
              </span>
              <span className="mt-auto pt-4">
                <span className="block font-display text-[22px] leading-none">{hi ? "टाइम्ड मॉक" : "Timed mock"}</span>
                <span className="mt-1 block text-xs font-medium text-white/60 dark:text-ink-2">{hi ? "50 प्रश्न · −⅓ नेगेटिव" : "50 Qs · −⅓ negative"}</span>
              </span>
            </Link>
            <WeakDrillCard />
          </section>

          {months.length > 0 && (
            <section className="reveal">
              <SectionTitle title={hi ? "मासिक टेस्ट" : "Monthly tests"} eyebrow={hi ? "पूरे महीने से 50 प्रश्न" : "50 questions from a whole month"} />
              <div className="no-scrollbar -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                {months.map((m) => (
                  <Link key={m} href={`/practice/run?kind=monthly&from=${m}-01&to=${m}-31`} className="card lift group w-[92px] shrink-0 snap-start p-3 text-left">
                    <span className="eyebrow block text-ink-3">{m.slice(0, 4)}</span>
                    <span className="mt-1 block font-display text-[20px] leading-none group-hover:text-flare">{fmtDate(`${m}-01`, ui, { month: "short" })}</span>
                    <span className="mt-2 block font-mono text-[11px] text-ink-3">50 {hi ? "प्रश्न" : "Qs"}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <RecentAttempts />
        </div>
        <section className="card p-5 sm:p-6 lg:sticky lg:top-24">
          <div className="mb-5">
            <div className="eyebrow mb-1 text-ink-3">{hi ? "अवधि, विषय और मोड चुनें" : "Pick period, topics and mode"}</div>
            <h2 className="font-display text-[25px] leading-none">{hi ? "अपना टेस्ट बनाएँ" : <>Build your <span>own</span></>}</h2>
          </div>
          <TestBuilder latest={latest} lang={profile.lang} />
        </section>
      </div>
    </div>
  );
}
