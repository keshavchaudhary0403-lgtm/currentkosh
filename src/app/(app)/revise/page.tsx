import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ListChecks } from "lucide-react";
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
  const hi = ui === "hi";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-[28px] sm:text-4xl">{ui === "hi" ? "दोहराएँ" : "Revise"}</h1>
        <p className="mt-1 text-sm font-medium text-ink-2">{hi ? "तथ्य भूलने से ठीक पहले लौटते हैं।" : "Facts come back right before you'd forget them."}</p>
      </header>

      <RevisionHero />

      {countdown !== null && countdown > 0 && (
        <section className="flex items-center gap-4 rounded-3xl bg-pink-soft p-4 sm:p-5">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-pink text-white">
            <div className="text-center leading-none">
              <div className="font-display text-xl">{countdown}</div>
              <div className="text-[9px] font-extrabold uppercase">{hi ? "दिन" : "days"}</div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-base">{hi ? "परीक्षा उलटी गिनती" : "Exam countdown"}</div>
            <div className="text-xs font-medium text-ink-2">{hi ? "रोज़ कार्ड दोहराएँ, हर हफ़्ते एक मासिक टेस्ट, कमज़ोर विषयों का अभ्यास।" : "Clear due cards daily, one monthly test a week, drill weak topics."}</div>
          </div>
          <Link href="/practice#weak" className="hidden shrink-0 text-sm font-extrabold text-pink sm:block">
            Drill →
          </Link>
        </section>
      )}

      <section>
        <SectionTitle
          eyebrow={hi ? (month ? "मासिक सार · एक-पंक्ति" : "साप्ताहिक सार · एक-पंक्ति") : month ? "Monthly recap · one-liners" : "Weekly recap · one-liners"}
          title={month ? fmtDate(`${month}-01`, ui, { month: "long", year: "numeric" }) : hi ? "यह सप्ताह" : "This week"}
          right={
            <Link
              href={month ? `/practice/run?kind=monthly&from=${from}&to=${to}` : "/practice/run?kind=weekly"}
              className="btn btn-orange shrink-0 px-3.5 py-2 text-sm"
            >
              <ListChecks className="size-4" strokeWidth={2.6} /> {hi ? "टेस्ट" : "Test it"}
            </Link>
          }
        />
        <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Link href="/revise" className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-bold whitespace-nowrap ${!month ? "border-violet bg-violet-soft text-violet" : "border-line bg-surface text-ink-2"}`}>
            {hi ? "पिछले 7 दिन" : "Last 7 days"}
          </Link>
          {months.map((m) => (
            <Link key={m} href={`/revise?month=${m}`} className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-bold whitespace-nowrap ${month === m ? "border-violet bg-violet-soft text-violet" : "border-line bg-surface text-ink-2"}`}>
              {fmtDate(`${m}-01`, ui, { month: "short", year: "numeric" })}
            </Link>
          ))}
        </div>
        {oneLiners.length ? (
          <ol className="divide-y-2 divide-line overflow-hidden rounded-3xl border-2 border-line bg-surface">
            {oneLiners.map((s, i) => (
              <li key={s.id}>
                <Link href={`/story/${s.id}`} className="flex gap-4 px-4 py-3.5 hover:bg-surface-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-violet-soft text-xs font-extrabold text-violet">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span lang={ui === "hi" ? "hi" : undefined} className="block font-bold">
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
          <Empty title={hi ? "अभी दोहराने को कुछ नहीं" : "Nothing to recap yet"} />
        )}
      </section>
    </div>
  );
}
