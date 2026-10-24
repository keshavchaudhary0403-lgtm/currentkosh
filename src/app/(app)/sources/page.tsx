import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { SectionTitle } from "@/components/ui";
import { SOURCES, type SourceMode } from "@/lib/sources";

export const metadata: Metadata = { title: "Sources" };

const MODE: Record<SourceMode, { label: string; desc: string; cls: string }> = {
  ai: { label: "Full notes", desc: "Official text → exam notes, MCQs and flashcards, always linked back.", cls: "bg-good/10 text-good" },
  link: { label: "Linked", desc: "Headline + link shown as “Also covered by”. Their text is never copied.", cls: "bg-accent-soft text-accent" },
  reference: { label: "Further reading", desc: "Curated link to their current-affairs page.", cls: "bg-surface-2 text-ink-2" },
};

export default function Sources() {
  const groups = [
    { title: "Government & official", ids: SOURCES.filter((s) => s.kind === "government" || s.kind === "publication") },
    { title: "Newspapers", ids: SOURCES.filter((s) => s.kind === "newspaper") },
    { title: "Exam-prep publishers", ids: SOURCES.filter((s) => s.kind === "coaching") },
  ];
  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-[28px] sm:text-4xl">Sources</h1>
        <p className="mt-2 max-w-2xl text-ink-2">
          CurrentKosh only uses the sources below. Notes and questions are generated from official government text; newspapers and coaching sites are linked, never copied, and respect their robots.txt.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {Object.entries(MODE).map(([k, m]) => (
          <div key={k} className="rounded-2xl border-2 border-line bg-surface p-4">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${m.cls}`}>{m.label}</span>
            <p className="mt-2 text-sm text-ink-2">{m.desc}</p>
          </div>
        ))}
      </div>
      {groups.map((g) => (
        <section key={g.title}>
          <SectionTitle title={g.title} />
          <div className="divide-y divide-line overflow-hidden rounded-2xl border-2 border-line bg-surface">
            {g.ids.map((s) => {
              return (
                <div key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3.5">
                  <a href={s.caPage ?? s.homepage} target="_blank" rel="noopener noreferrer" className="group flex min-w-0 flex-1 items-center gap-2 font-medium">
                    {s.name}
                    <ExternalLink className="size-3.5 text-ink-3 group-hover:text-accent" />
                  </a>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${MODE[s.mode].cls}`}>{MODE[s.mode].label}</span>
                  <p className="w-full text-xs text-ink-3">{s.license}</p>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
