import Link from "next/link";
import { Select } from "@/components/form";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { StoryList } from "@/components/today";
import { Empty, fmtDate } from "@/components/ui";
import { currentProfile } from "@/lib/profile";
import { relevanceFor, searchStories, storyMonths } from "@/lib/store";
import { CATEGORIES, EXAMS, STATES, pick, type ExamId } from "@/lib/taxonomy";

export const metadata: Metadata = { title: "Library" };

const str = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);

export default async function Library({ searchParams }: PageProps<"/library">) {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const sp = await searchParams;
  const ui = profile.lang === "bi" ? "en" : profile.lang;
  const L = (en: string, hi: string) => (ui === "hi" ? hi : en);
  const filter = {
    q: str(sp.q),
    category: str(sp.category),
    month: str(sp.month),
    state: str(sp.state),
    exam: EXAMS.some((e) => e.id === sp.exam) ? (sp.exam as ExamId) : undefined,
  };
  const all = searchStories(filter, Infinity);
  const page = Math.max(1, Number(str(sp.page)) || 1);
  const results = all.slice(0, page * 50);
  const more = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" && v && k !== "page" ? [[k, v]] : [])));
  more.set("page", String(page + 1));
  const months = storyMonths();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-[28px]">{ui === "hi" ? "लाइब्रेरी" : "Library"}</h1>
        <p className="mt-1 text-sm font-medium text-ink-2">{L("Every story since April, searchable in English or Hindi.", "अप्रैल से अब तक की हर ख़बर, हिंदी या अंग्रेज़ी में खोजें।")}</p>
      </header>

      <form className="space-y-3">
        <label className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 transition focus-within:border-teal">
          <Search className="size-5 text-teal" strokeWidth={2.5} />
          <input name="q" defaultValue={filter.q} placeholder={L("Search: repo rate, Ramsar, गवर्नर, INDRA…", "खोजें: रेपो दर, रामसर, गवर्नर, INDRA…")} className="w-full bg-transparent text-base font-medium outline-none placeholder:text-ink-3" />
        </label>
        <details className="peer sm:hidden" open={!!(filter.month || filter.category || filter.exam || filter.state)}>
          <summary className="cursor-pointer list-none text-sm font-bold text-teal">{L("Filters", "फ़िल्टर")} {filter.month || filter.category || filter.exam || filter.state ? "· on" : ""}</summary>
        </details>
        <div className="hidden grid-cols-2 gap-2 peer-open:grid sm:grid sm:grid-cols-5">
          <Select name="month" defaultValue={filter.month ?? ""}>
            <option value="">{L("Any month", "कोई भी महीना")}</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {fmtDate(`${m}-01`, "en", { month: "long", year: "numeric" })}
              </option>
            ))}
          </Select>
          <Select name="category" defaultValue={filter.category ?? ""}>
            <option value="">{L("All topics", "सभी विषय")}</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {pick(c.label, ui)}
              </option>
            ))}
          </Select>
          <Select name="exam" defaultValue={filter.exam ?? ""}>
            <option value="">{L("Any exam", "कोई भी परीक्षा")}</option>
            {EXAMS.map((e) => (
              <option key={e.id} value={e.id}>
                {L(`Important for ${e.label.en}`, `${e.label.hi} के लिए महत्वपूर्ण`)}
              </option>
            ))}
          </Select>
          <Select name="state" defaultValue={filter.state ?? ""}>
            <option value="">{L("Any state", "कोई भी राज्य")}</option>
            {STATES.map((s) => (
              <option key={s.id} value={s.id}>
                {pick(s.label, ui)}
              </option>
            ))}
          </Select>
          <button className="btn btn-teal col-span-2 h-11 px-4 text-sm sm:col-span-1">{L("Apply", "लागू करें")}</button>
        </div>
      </form>

      <div>
        <div className="mb-3 text-sm font-bold text-ink-3">
          {all.length} {L(all.length === 1 ? "story" : "stories", "ख़बरें")}
          {all.length > results.length && L(` · showing the latest ${results.length}`, ` · ताज़ा ${results.length} दिख रही हैं`)}
        </div>
        {results.length ? (
          <>
            <StoryList items={results.map((story) => ({ story, relevance: relevanceFor(story, profile) }))} lang={profile.lang} showDate />
            {all.length > results.length && (
              <Link href={`/library?${more}`} scroll={false} className="btn btn-ghost mt-4 w-full py-3 text-sm sm:mx-auto sm:flex sm:w-auto sm:px-8">
                {L(`Show 50 more · ${all.length - results.length} left`, `50 और दिखाएँ · ${all.length - results.length} बाकी`)}
              </Link>
            )}
          </>
        ) : (
          <Empty title={L("No stories match", "कोई ख़बर नहीं मिली")}>{L("Try removing a filter or searching a different word.", "कोई फ़िल्टर हटाएँ या दूसरा शब्द खोजें।")}</Empty>
        )}
      </div>
    </div>
  );
}
