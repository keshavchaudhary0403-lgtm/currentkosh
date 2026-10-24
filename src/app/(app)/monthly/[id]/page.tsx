import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ChevronDown, Layers, Sparkles, Target } from "lucide-react";
import { FlipCards } from "@/components/flip-cards";
import { BiText } from "@/components/ui";
import { getMonthly, itemCount } from "@/lib/monthly";
import { currentProfile } from "@/lib/profile";
import { EXAMS, pick, type ExamId } from "@/lib/taxonomy";

export async function generateMetadata({ params }: PageProps<"/monthly/[id]">): Promise<Metadata> {
  const m = getMonthly((await params).id);
  return { title: m ? `Monthly · ${m.title.en}` : "Monthly" };
}

export default async function MonthlyIssue({ params }: PageProps<"/monthly/[id]">) {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const m = getMonthly((await params).id);
  if (!m) notFound();
  const lang = profile.lang;
  const ui = lang === "bi" ? "en" : lang;
  const L = (en: string, hi: string) => (ui === "hi" ? hi : en);
  const mine = new Set<string>(profile.exams);
  const examLabel = (id: string) => EXAMS.find((e) => e.id === (id as ExamId));

  return (
    <div className="space-y-10">
      <header className="rise">
        <Link href="/monthly" className="group inline-flex h-11 items-center gap-2 rounded-full bg-card pr-4 pl-2 text-sm font-semibold text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] hover:text-ink">
          <span className="grid size-7 place-items-center rounded-full bg-card-2 transition group-hover:-translate-x-0.5">
            <ArrowLeft className="size-4" />
          </span>
          {L("All months", "सभी महीने")}
        </Link>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0">
            <p className="eyebrow text-mint-ink">{L("Monthly policy review", "मासिक नीति समीक्षा")}</p>
            <h1 className="mt-2 font-display text-[44px] sm:text-[64px]" lang={ui === "hi" ? "hi" : undefined}>
              {pick(m.title, ui)}
            </h1>
            <p className="mt-2 font-mono text-xs text-ink-3 uppercase">
              {L(`${itemCount(m)} updates across ${m.sections.length} sectors`, `${m.sections.length} क्षेत्रों में ${itemCount(m)} अपडेट`)}
            </p>
          </div>
          <Link href={`/monthly/${m.id}/test`} className="btn h-12 w-full px-6 text-[15px] sm:w-auto">
            <Target className="size-4" /> {L(`Take the ${m.mcqs.length}-question test`, `${m.mcqs.length} प्रश्नों का टेस्ट दें`)}
          </Link>
        </div>
      </header>

      <section className="border-l-[3px] border-mint pl-5 sm:pl-7">
        <BiText v={m.intro} lang={lang} as="p" className="text-[18px] leading-[1.7] sm:text-[20px]" hiClassName="mt-3 text-base" />
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-3 font-display text-[34px] sm:text-[42px]">
          <span className="grid size-11 place-items-center rounded-[14px] bg-signal text-on-signal">
            <Sparkles className="size-5" />
          </span>
          {L("Highlights", "मुख्य बातें")}
        </h2>
        <ol className="stagger grid gap-3 lg:grid-cols-2">
          {m.highlights.map((h, i) => (
            <li key={i} className="card flex gap-4 p-5">
              <span className="w-7 shrink-0 pt-0.5 font-mono text-xs text-signal-ink tnum">{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <BiText v={h.title} lang={lang} as="p" className="leading-snug font-semibold" hiClassName="text-sm font-medium" />
                <BiText v={h.summary} lang={lang} as="p" className="mt-1.5 text-sm leading-relaxed text-ink-2" hiClassName="text-sm" />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-3 font-display text-[34px] sm:text-[42px]">
          <span className="grid size-11 place-items-center rounded-[14px] bg-mint-soft text-mint-ink">
            <Layers className="size-5" />
          </span>
          {L("Sector by sector", "क्षेत्रवार")}
        </h2>
        <div className="space-y-3">
          {m.sections.map((s, i) => (
            <details key={i} open={i === 0} className="group card overflow-hidden">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 transition hover:bg-card-2 sm:px-6 [&::-webkit-details-marker]:hidden">
                <span className="text-[17px] font-semibold" lang={ui === "hi" ? "hi" : undefined}>
                  {pick(s.sector, ui)}
                </span>
                <span className="flex items-center gap-2">
                  <span className="rounded-full bg-card-2 px-2.5 py-1 font-mono text-xs text-ink-2">{s.items.length}</span>
                  <ChevronDown className="size-5 text-ink-3 transition duration-300 group-open:rotate-180" />
                </span>
              </summary>
              <div className="space-y-6 border-t border-line px-5 py-5 sm:px-6">
                {s.items.map((it, j) => (
                  <article key={j}>
                    <BiText v={it.title} lang={lang} as="h3" className="text-[17px] leading-snug font-semibold" hiClassName="text-[15px] font-medium" />
                    <BiText v={it.summary} lang={lang} as="p" className="mt-1.5 text-[15px] leading-relaxed text-ink-2" hiClassName="text-sm" />
                    {it.key_points.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {it.key_points.map((k, n) => (
                          <li key={n} className="flex gap-2.5 text-sm">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-mint" />
                            <BiText v={k} lang={lang} hiClassName="text-sm" />
                          </li>
                        ))}
                      </ul>
                    )}
                    {it.exams.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {it.exams.map((e) => {
                          const ex = examLabel(e);
                          return ex ? (
                            <span key={e} className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold ${mine.has(e) ? "bg-solid text-on-solid" : "bg-card-2 text-ink-3"}`}>
                              {pick(ex.label, ui)}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      {m.cards.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-[34px] sm:text-[42px]">{L("Quick recall", "झटपट याद")}</h2>
          <FlipCards cards={m.cards} lang={lang} />
        </section>
      )}

      <footer className="flex flex-col gap-3 rounded-[22px] bg-card-2 p-5 text-xs text-ink-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {L("Summarised from", "स्रोत:")} <span className="font-semibold">PRS Legislative Research, Monthly Policy Review</span> (CC BY 4.0). {L("PRS is not responsible for this summary.", "इस सारांश के लिए PRS ज़िम्मेदार नहीं है।")}
        </p>
        <a href={m.url} target="_blank" rel="noreferrer" className="btn btn-ghost shrink-0 px-4 text-xs">
          {L("Read the original", "मूल पढ़ें")} <ArrowUpRight className="size-3.5" />
        </a>
      </footer>
    </div>
  );
}
