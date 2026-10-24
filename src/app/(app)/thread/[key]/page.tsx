import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BiText, CategoryPill, fmtDate } from "@/components/ui";
import { currentProfile } from "@/lib/profile";
import { getThread } from "@/lib/store";
import { pick } from "@/lib/taxonomy";

export default async function ThreadPage({ params }: PageProps<"/thread/[key]">) {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const thread = getThread((await params).key);
  if (!thread) notFound();
  const lang = profile.lang;
  const ui = lang === "bi" ? "en" : lang;
  const stories = [...thread.stories].reverse();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/threads" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" /> Storylines
      </Link>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-wider text-ink-3 uppercase">
            Storyline · {thread.stories.length} {thread.stories.length === 1 ? "update" : "updates"}
          </div>
          <BiText v={thread.title} lang={lang} as="h1" className="mt-1 font-display text-3xl leading-tight sm:text-5xl" hiClassName="font-sans text-xl" />
        </div>
        <Link
          href={`/practice/run?kind=thread&from=${thread.stories[0].date}&to=${thread.stories.at(-1)!.date}&stories=${thread.stories.map((s) => s.id).join(",")}&title=${encodeURIComponent(`Storyline test · ${thread.title.en}`)}`}
          className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-bg"
        >
          Test this storyline
        </Link>
      </div>
      <ol className="relative space-y-6 border-l border-line-strong pl-6">
        {stories.map((s) => (
          <li key={s.id} className="relative">
            <span className="absolute top-2 -left-[29px] size-2.5 rounded-full bg-accent ring-4 ring-bg" />
            <div className="mb-1 text-xs text-ink-3">{fmtDate(s.date, ui, { day: "numeric", month: "long", year: "numeric" })}</div>
            <Link href={`/story/${s.id}`} className="block rounded-xl border border-line bg-surface p-4 transition hover:border-line-strong">
              <CategoryPill id={s.category} lang={lang} size="xs" />
              <div lang={ui === "hi" ? "hi" : undefined} className="mt-2 font-semibold">
                {pick(s.content.title, ui)}
              </div>
              <div lang={ui === "hi" ? "hi" : undefined} className="mt-1 line-clamp-3 text-sm text-ink-2">
                {pick(s.content.summary, ui)}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
