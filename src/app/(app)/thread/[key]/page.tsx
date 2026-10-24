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
      <Link href="/threads" className="mb-5 inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-surface px-3 py-1 text-sm font-bold text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" /> Storylines
      </Link>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex rounded-full bg-pink-soft px-2.5 py-0.5 text-xs font-extrabold text-pink">
            Storyline · {thread.stories.length} {thread.stories.length === 1 ? "update" : "updates"}
          </div>
          <BiText v={thread.title} lang={lang} as="h1" className="mt-2 font-display text-[28px] leading-tight sm:text-4xl" hiClassName="font-sans text-xl" />
        </div>
        <Link
          href={`/practice/run?kind=thread&from=${thread.stories[0].date}&to=${thread.stories.at(-1)!.date}&stories=${thread.stories.map((s) => s.id).join(",")}&title=${encodeURIComponent(`Storyline test · ${thread.title.en}`)}`}
          className="btn btn-orange px-4 py-2.5 text-sm"
        >
          Test this storyline
        </Link>
      </div>
      <ol className="relative space-y-5 border-l-[3px] border-pink-soft pl-6">
        {stories.map((s) => (
          <li key={s.id} className="relative">
            <span className="absolute top-1 -left-[33px] size-3.5 rounded-full bg-pink ring-4 ring-bg" />
            <div className="mb-1.5 text-xs font-bold text-ink-3">{fmtDate(s.date, ui, { day: "numeric", month: "long", year: "numeric" })}</div>
            <Link href={`/story/${s.id}`} className="tap block rounded-2xl bg-surface p-4">
              <CategoryPill id={s.category} lang={lang} size="xs" />
              <div lang={ui === "hi" ? "hi" : undefined} className="mt-2 font-bold">
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
