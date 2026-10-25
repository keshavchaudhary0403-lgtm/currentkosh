import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageHeader, SectionTitle } from "@/components/ui";
import { SOURCES, type SourceMode } from "@/lib/sources";

export const metadata: Metadata = { title: "Sources" };

const MODE: Record<SourceMode, { label: string; desc: string; cls: string }> = {
  ai: { label: "Full notes", desc: "Official text → exam notes, MCQs and flashcards, always linked back.", cls: "bg-good-soft text-good-ink" },
  facts: { label: "Facts only", desc: "Used only when no official source exists: facts confirmed by 2+ outlets, written fresh as a one-liner.", cls: "bg-amber-soft text-amber-ink" },
  link: { label: "Linked", desc: "Headline + link shown as “Also covered by”. Their text is never copied.", cls: "bg-cobalt-soft text-cobalt-ink" },
  reference: { label: "Further reading", desc: "Curated link to their current-affairs page.", cls: "bg-card-2 text-ink-2" },
};

export default function Sources() {
  const groups = [
    { title: "Government & official", ids: SOURCES.filter((s) => s.kind === "government" || s.kind === "publication") },
    { title: "Newspapers", ids: SOURCES.filter((s) => s.kind === "newspaper") },
    { title: "Exam-prep publishers", ids: SOURCES.filter((s) => s.kind === "coaching") },
  ];
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Where every fact comes from"
        title={
          <>
            Sources<span className="text-good">.</span>
          </>
        }
        sub="CurrentKosh only uses the sources below. Notes and questions are generated from official text. When no official source covers an event, a short one-liner is written from facts that at least two independent outlets confirm. Newspaper and coaching text is never copied, and their robots.txt is respected."
      />
      <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(MODE).map(([k, m]) => (
          <div key={k} className="card p-5">
            <span className={`eyebrow inline-flex h-7 items-center rounded-full px-2.5 ${m.cls}`}>{m.label}</span>
            <p className="mt-3 text-sm text-ink-2">{m.desc}</p>
          </div>
        ))}
      </div>
      <div className="space-y-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
        {groups.map((g) => (
          <section key={g.title} className="reveal">
            <SectionTitle title={g.title} eyebrow={`${g.ids.length} sources`} />
            <div className="card divide-y divide-line overflow-hidden">
              {g.ids.map((s) => (
                <a key={s.id} href={s.caPage ?? s.homepage} target="_blank" rel="noopener noreferrer" className="group flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 transition hover:bg-card-2">
                  <span className="flex min-w-0 flex-1 items-center gap-2 font-semibold">
                    {s.name}
                    <ArrowUpRight className="size-4 text-ink-3 transition group-hover:rotate-45 group-hover:text-ink" />
                  </span>
                  <span className={`eyebrow inline-flex h-7 items-center rounded-full px-2.5 ${MODE[s.mode].cls}`}>{MODE[s.mode].label}</span>
                  <p className="w-full text-xs text-ink-3">{s.license}</p>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
