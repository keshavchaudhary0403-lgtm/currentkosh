import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, ListChecks } from "lucide-react";
import { RevisionHero } from "@/components/revision-hero";
import { CategoryPill, Empty, PageHeader, SectionTitle, fmtDate } from "@/components/ui";
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
    <div className="space-y-8">
      <PageHeader
        eyebrow={hi ? "स्पेस्ड रिपिटिशन · 1 → 3 → 7 → 21 → 60 दिन" : "Spaced repetition · 1 → 3 → 7 → 21 → 60 days"}
        title={hi ? "दोहराएँ" : <>Revise<span className="text-cobalt">.</span></>}
      />

      <RevisionHero countdown={countdown} />
      <section>
        <SectionTitle
          eyebrow={hi ? (month ? "मासिक सार · एक-पंक्ति" : "साप्ताहिक सार · एक-पंक्ति") : month ? "Monthly recap · one-liners" : "Weekly recap · one-liners"}
          title={month ? fmtDate(`${month}-01`, ui, { month: "long", year: "numeric" }) : hi ? "यह सप्ताह" : "This week"}
          right={
            <Link href={month ? `/practice/run?kind=monthly&from=${from}&to=${to}` : "/practice/run?kind=weekly"} className="btn btn-flare shrink-0 px-5 text-[15px]">
              <ListChecks className="size-4" strokeWidth={2.4} /> {hi ? "टेस्ट" : "Test it"}
            </Link>
          }
        />
        <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/revise" className="chip shrink-0" aria-current={!month ? "page" : undefined}>
            {hi ? "पिछले 7 दिन" : "Last 7 days"}
          </Link>
          {months.map((m) => (
            <Link key={m} href={`/revise?month=${m}`} className="chip shrink-0" aria-current={month === m ? "page" : undefined}>
              {fmtDate(`${m}-01`, ui, { month: "short", year: "numeric" })}
            </Link>
          ))}
        </div>
        {oneLiners.length ? (
          <ol className="card divide-y divide-line overflow-hidden lg:columns-2 lg:gap-0 [&>li]:break-inside-avoid">
            {oneLiners.map((s, i) => (
              <li key={s.id}>
                <Link href={`/story/${s.id}`} className="group flex gap-4 px-4 py-4 transition hover:bg-card-2 sm:px-6">
                  <span className="w-7 shrink-0 pt-0.5 font-mono text-xs text-cobalt-ink tnum">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span lang={hi ? "hi" : undefined} className="block text-[15px] leading-snug font-semibold">
                      {pick(s.content.title, ui)}
                    </span>
                    <span lang={hi ? "hi" : undefined} className="mt-1 line-clamp-2 block text-sm text-ink-2">
                      {s.content.key_facts
                        .slice(0, 2)
                        .map((f) => pick(f, ui))
                        .join(" · ")}
                    </span>
                  </span>
                  <span className="hidden shrink-0 items-start gap-3 sm:flex lg:hidden">
                    <CategoryPill id={s.category} lang={profile.lang} size="xs" />
                    <ArrowUpRight className="size-4 text-ink-3 transition group-hover:rotate-45 group-hover:text-ink" />
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
