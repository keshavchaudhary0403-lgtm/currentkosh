import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarRange, ChevronRight } from "lucide-react";
import { Empty } from "@/components/ui";
import { allMonthly, itemCount } from "@/lib/monthly";
import { currentProfile } from "@/lib/profile";
import { pick } from "@/lib/taxonomy";

export const metadata: Metadata = { title: "Monthly" };

export default async function MonthlyList() {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const ui = profile.lang === "bi" ? "en" : profile.lang;
  const L = (en: string, hi: string) => (ui === "hi" ? hi : en);
  const issues = allMonthly();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl sm:text-5xl">{L("Monthly", "मासिक")}</h1>
        <p className="mt-1 max-w-2xl text-sm font-medium text-ink-2">
          {L(
            "Each month's policy changes in one place: new bills, rules, schemes and regulator decisions, sector by sector, with a 10-question test. Based on PRS Legislative Research's Monthly Policy Review.",
            "हर महीने के नीतिगत बदलाव एक जगह: नए विधेयक, नियम, योजनाएँ और नियामकों के फ़ैसले, क्षेत्रवार, 10 प्रश्नों के टेस्ट के साथ। PRS लेजिस्लेटिव रिसर्च की मासिक नीति समीक्षा पर आधारित।",
          )}
        </p>
      </header>
      {issues.length === 0 ? (
        <Empty title={L("No monthly summaries yet", "अभी कोई मासिक सारांश नहीं")} icon={<CalendarRange className="size-6" />} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {issues.map((m) => (
            <Link
              key={m.id}
              href={`/monthly/${m.id}`}
              className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition hover:border-line-strong hover:shadow-card"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-violet-soft px-2.5 py-1 text-xs font-bold text-violet">PRS</span>
                <ChevronRight className="size-5 text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-ink" />
              </div>
              <h2 className="mt-3 font-display text-2xl leading-tight" lang={ui === "hi" ? "hi" : undefined}>
                {pick(m.title, ui)}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-ink-2" lang={ui === "hi" ? "hi" : undefined}>
                {pick(m.intro, ui)}
              </p>
              <p className="mt-auto pt-4 text-xs font-semibold text-ink-3">
                {L(
                  `${itemCount(m)} updates · ${m.sections.length} sectors · ${m.mcqs.length} questions`,
                  `${itemCount(m)} अपडेट · ${m.sections.length} क्षेत्र · ${m.mcqs.length} प्रश्न`,
                )}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
