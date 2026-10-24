import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowUpRight, CalendarRange } from "lucide-react";
import { Empty, PageHeader, cx } from "@/components/ui";
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
    <div className="space-y-7">
      <PageHeader
        eyebrow={L("PRS Monthly Policy Review · CC BY 4.0", "PRS मासिक नीति समीक्षा · CC BY 4.0")}
        title={ui === "hi" ? "मासिक" : <>Monthly<span className="text-mint italic">.</span></>}
        sub={L(
          "Each month's policy changes in one place: new bills, rules, schemes and regulator decisions, sector by sector, with a 10-question test. Based on PRS Legislative Research's Monthly Policy Review.",
          "हर महीने के नीतिगत बदलाव एक जगह: नए विधेयक, नियम, योजनाएँ और नियामकों के फ़ैसले, क्षेत्रवार, 10 प्रश्नों के टेस्ट के साथ। PRS लेजिस्लेटिव रिसर्च की मासिक नीति समीक्षा पर आधारित।",
        )}
      />
      {issues.length === 0 ? (
        <Empty title={L("No monthly summaries yet", "अभी कोई मासिक सारांश नहीं")} icon={<CalendarRange className="size-6" />} />
      ) : (
        <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {issues.map((m, i) => (
            <Link
              key={m.id}
              href={`/monthly/${m.id}`}
              className={cx("lift group flex min-h-[240px] flex-col rounded-[24px] p-5 sm:p-6", i === 0 ? "bg-mint text-white sm:col-span-2 lg:col-span-1" : "card")}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={cx("eyebrow inline-flex h-7 items-center rounded-full px-2.5", i === 0 ? "bg-white/20" : "bg-mint-soft text-mint-ink")}>{i === 0 ? L("Latest · PRS", "ताज़ा · PRS") : "PRS"}</span>
                <ArrowUpRight className={cx("size-5 transition group-hover:rotate-45", i === 0 ? "text-white/80" : "text-ink-3 group-hover:text-ink")} />
              </div>
              <h2 className="mt-4 font-display text-[34px] leading-none" lang={ui === "hi" ? "hi" : undefined}>
                {pick(m.title, ui)}
              </h2>
              <p className={cx("mt-3 line-clamp-3 text-sm", i === 0 ? "text-white/80" : "text-ink-2")} lang={ui === "hi" ? "hi" : undefined}>
                {pick(m.intro, ui)}
              </p>
              <p className={cx("mt-auto pt-5 font-mono text-[11px] uppercase", i === 0 ? "text-white/70" : "text-ink-3")}>
                {L(`${itemCount(m)} updates · ${m.sections.length} sectors · ${m.mcqs.length} Qs`, `${itemCount(m)} अपडेट · ${m.sections.length} क्षेत्र · ${m.mcqs.length} प्रश्न`)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
