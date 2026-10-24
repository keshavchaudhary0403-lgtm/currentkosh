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
  const L = (en: string, hi: string) => (ui === "hi" ? hi : en);
  const stories = [...thread.stories].reverse();
  const testHref = `/practice/run?kind=thread&thread=${encodeURIComponent((await params).key)}&title=${encodeURIComponent(`Timeline test · ${thread.title.en}`)}`;
  const topics = new Map<string, number>();
  for (const s of thread.stories) topics.set(s.category, (topics.get(s.category) ?? 0) + 1);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-10">
      <div className="min-w-0">
        <Link
          href="/threads"
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-sm font-bold text-ink-2 hover:text-ink"
        >
          <ArrowLeft className="size-4" /> {L("Timelines", "घटनाक्रम")}
        </Link>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full bg-pink-soft px-2.5 py-0.5 text-xs font-extrabold text-pink">
              {L("Timeline", "घटनाक्रम")} · {thread.stories.length} {L(thread.stories.length === 1 ? "update" : "updates", "अपडेट")}
            </div>
            <BiText v={thread.title} lang={lang} as="h1" className="mt-2 font-display text-3xl leading-tight sm:text-5xl" hiClassName="font-sans text-xl" />
          </div>
          <Link href={testHref} className="btn btn-orange px-4 py-2.5 text-[15px] lg:hidden">
            {L("Test this timeline", "इस घटनाक्रम का टेस्ट दें")}
          </Link>
        </div>
        <ol className="relative space-y-5 border-l-[3px] border-pink-soft pl-6">
          {stories.map((s) => (
            <li key={s.id} className="relative">
              <span className="absolute top-1 -left-[33px] size-3.5 rounded-full bg-pink ring-4 ring-bg" />
              <div className="mb-1.5 text-xs font-bold text-ink-3">
                {fmtDate(s.date, ui, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
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

      <aside className="hidden lg:block">
        <div className="sticky top-20 space-y-4 rounded-3xl border border-line bg-surface p-5">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-2xl bg-pink-soft p-3 text-pink">
              <div className="font-display text-2xl leading-none">{thread.stories.length}</div>
              <div className="mt-1 text-xs font-bold">{L("updates", "अपडेट")}</div>
            </div>
            <div className="rounded-2xl bg-surface-2 p-3 text-ink-2">
              <div className="font-display text-base leading-tight">
                {fmtDate(thread.stories[0].date, ui, {
                  day: "numeric",
                  month: "short",
                })}
              </div>
              <div className="mt-1 text-xs font-bold">{L("first update", "पहला अपडेट")}</div>
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-extrabold">{L("Topics covered", "शामिल विषय")}</div>
            <div className="flex flex-wrap gap-1.5">
              {[...topics.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([c]) => (
                  <CategoryPill key={c} id={c} lang={lang} size="xs" />
                ))}
            </div>
          </div>
          <Link href={testHref} className="btn btn-orange w-full py-3 text-[15px]">
            {L("Test this timeline", "इस घटनाक्रम का टेस्ट दें")}
          </Link>
          <p className="text-xs font-medium text-ink-3">{L("Questions from every update, oldest to newest, so you can revise how the issue evolved.", "हर अपडेट से प्रश्न, ताकि आप मुद्दे का पूरा विकास दोहरा सकें।")}</p>
        </div>
      </aside>
    </div>
  );
}
