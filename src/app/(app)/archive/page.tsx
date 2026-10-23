import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { StoryList } from "@/components/today";
import { Empty, fmtDate } from "@/components/ui";
import { currentProfile } from "@/lib/profile";
import { relevanceFor, searchStories, storyMonths } from "@/lib/store";
import { CATEGORIES, EXAMS, STATES, pick, type ExamId } from "@/lib/taxonomy";

export const metadata: Metadata = { title: "Archive" };

const str = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);

export default async function Archive({ searchParams }: PageProps<"/archive">) {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const sp = await searchParams;
  const ui = profile.lang === "bi" ? "en" : profile.lang;
  const filter = {
    q: str(sp.q),
    category: str(sp.category),
    month: str(sp.month),
    state: str(sp.state),
    exam: EXAMS.some((e) => e.id === sp.exam) ? (sp.exam as ExamId) : undefined,
  };
  const results = searchStories(filter, 80);
  const months = storyMonths();
  const select = "rounded-xl border border-line bg-surface px-3 py-2.5 text-sm";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-5xl">{ui === "hi" ? "संग्रह" : "Archive"}</h1>
        <p className="mt-2 text-ink-2">Every story, searchable in English or Hindi. Filter by month, topic, exam or state.</p>
      </header>

      <form className="space-y-3">
        <label className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card focus-within:border-accent">
          <Search className="size-5 text-ink-3" />
          <input name="q" defaultValue={filter.q} placeholder="Search: repo rate, Ramsar, गवर्नर, INDRA…" className="w-full bg-transparent text-base outline-none placeholder:text-ink-3" />
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <select name="month" defaultValue={filter.month ?? ""} className={select}>
            <option value="">Any month</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {fmtDate(`${m}-01`, "en", { month: "long", year: "numeric" })}
              </option>
            ))}
          </select>
          <select name="category" defaultValue={filter.category ?? ""} className={select}>
            <option value="">All topics</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {pick(c.label, ui)}
              </option>
            ))}
          </select>
          <select name="exam" defaultValue={filter.exam ?? ""} className={select}>
            <option value="">Any exam</option>
            {EXAMS.map((e) => (
              <option key={e.id} value={e.id}>
                Important for {e.label.en}
              </option>
            ))}
          </select>
          <select name="state" defaultValue={filter.state ?? ""} className={select}>
            <option value="">Any state</option>
            {STATES.map((s) => (
              <option key={s.id} value={s.id}>
                {pick(s.label, ui)}
              </option>
            ))}
          </select>
          <button className="col-span-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-bg sm:col-span-1">Apply</button>
        </div>
      </form>

      <div>
        <div className="mb-3 text-sm text-ink-3">
          {results.length} {results.length === 1 ? "story" : "stories"}
          {results.length === 80 && " (showing the latest 80)"}
        </div>
        {results.length ? (
          <StoryList items={results.map((story) => ({ story, relevance: relevanceFor(story, profile) }))} lang={profile.lang} compact grid />
        ) : (
          <Empty title="No stories match">Try removing a filter or searching a different word.</Empty>
        )}
      </div>
    </div>
  );
}
