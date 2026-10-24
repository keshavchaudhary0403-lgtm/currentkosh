import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, Layers, Sparkles, Target } from "lucide-react";
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
    <div className="space-y-8">
      <header>
        <Link href="/monthly" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-2 hover:text-ink">
          <ArrowLeft className="size-4" /> {L("All months", "सभी महीने")}
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-violet">{L("Monthly policy review", "मासिक नीति समीक्षा")}</p>
            <h1 className="font-display text-3xl sm:text-5xl" lang={ui === "hi" ? "hi" : undefined}>
              {pick(m.title, ui)}
            </h1>
            <p className="mt-1 text-sm font-medium text-ink-3">
              {L(`${itemCount(m)} updates across ${m.sections.length} sectors`, `${m.sections.length} क्षेत्रों में ${itemCount(m)} अपडेट`)}
            </p>
          </div>
          <Link href={`/monthly/${m.id}/test`} className="btn h-11 w-full px-5 text-[15px] sm:w-auto">
            <Target className="size-4" /> {L(`Take the ${m.mcqs.length}-question test`, `${m.mcqs.length} प्रश्नों का टेस्ट दें`)}
          </Link>
        </div>
      </header>

      <section className="rounded-3xl border border-line bg-surface p-5 sm:p-7">
        <BiText v={m.intro} lang={lang} as="p" className="text-[17px] leading-[1.7]" hiClassName="mt-3 text-base" />
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-2xl sm:text-3xl">
          <Sparkles className="size-6 text-accent-2" /> {L("Highlights", "मुख्य बातें")}
        </h2>
        <ol className="grid gap-3 lg:grid-cols-2">
          {m.highlights.map((h, i) => (
            <li key={i} className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-2 text-xs font-extrabold text-white">{i + 1}</span>
              <div className="min-w-0">
                <BiText v={h.title} lang={lang} as="p" className="font-bold leading-snug" hiClassName="text-sm font-semibold" />
                <BiText v={h.summary} lang={lang} as="p" className="mt-1 text-sm leading-relaxed text-ink-2" hiClassName="text-sm" />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-display text-2xl sm:text-3xl">
          <Layers className="size-6 text-accent" /> {L("Sector by sector", "क्षेत्रवार")}
        </h2>
        <div className="space-y-3">
          {m.sections.map((s, i) => (
            <details key={i} open={i === 0} className="group rounded-2xl border border-line bg-surface">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
                <span className="font-display text-lg" lang={ui === "hi" ? "hi" : undefined}>
                  {pick(s.sector, ui)}
                </span>
                <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold text-ink-2">{s.items.length}</span>
              </summary>
              <div className="space-y-5 border-t border-line px-5 py-5">
                {s.items.map((it, j) => (
                  <article key={j}>
                    <BiText v={it.title} lang={lang} as="h3" className="text-[17px] leading-snug font-bold" hiClassName="text-[15px] font-semibold" />
                    <BiText v={it.summary} lang={lang} as="p" className="mt-1.5 text-[15px] leading-relaxed text-ink-2" hiClassName="text-sm" />
                    {it.key_points.length > 0 && (
                      <ul className="mt-2.5 space-y-1.5">
                        {it.key_points.map((k, n) => (
                          <li key={n} className="flex gap-2 text-sm font-medium">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                            <BiText v={k} lang={lang} hiClassName="text-sm" />
                          </li>
                        ))}
                      </ul>
                    )}
                    {it.exams.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {it.exams.map((e) => {
                          const ex = examLabel(e);
                          return ex ? (
                            <span
                              key={e}
                              className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${mine.has(e) ? "bg-accent-soft text-accent" : "bg-surface-2 text-ink-3"}`}
                            >
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
          <h2 className="mb-3 font-display text-2xl sm:text-3xl">{L("Quick recall", "झटपट याद")}</h2>
          <FlipCards cards={m.cards} lang={lang} />
        </section>
      )}

      <footer className="flex flex-col gap-3 rounded-2xl bg-surface-2 p-4 text-xs text-ink-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {L("Summarised from", "स्रोत:")} <span className="font-semibold">PRS Legislative Research, Monthly Policy Review</span> (CC BY 4.0).{" "}
          {L("PRS is not responsible for this summary.", "इस सारांश के लिए PRS ज़िम्मेदार नहीं है।")}
        </p>
        <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 font-bold text-accent">
          {L("Read the original", "मूल पढ़ें")} <ExternalLink className="size-3.5" />
        </a>
      </footer>
    </div>
  );
}
