import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Target } from "lucide-react";
import { catStyle } from "@/components/category-icon";
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
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
      <div className="min-w-0">
        <Link href="/threads" className="group mb-6 inline-flex h-11 items-center gap-2 rounded-full bg-card pr-4 pl-2 text-sm font-semibold text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] hover:text-ink">
          <span className="grid size-7 place-items-center rounded-full bg-card-2 transition group-hover:-translate-x-0.5">
            <ArrowLeft className="size-4" />
          </span>
          {L("Timelines", "घटनाक्रम")}
        </Link>
        <header className="rise mb-10">
          <div className="eyebrow text-amber-ink">
            {L("Timeline", "घटनाक्रम")} · {thread.stories.length} {L(thread.stories.length === 1 ? "update" : "updates", "अपडेट")} · {fmtDate(thread.stories[0].date, ui, { day: "numeric", month: "short", year: "numeric" })} →
          </div>
          <BiText v={thread.title} lang={lang} as="h1" className="mt-3 font-display text-[31px] sm:text-[47px]" hiClassName="font-sans text-xl font-semibold mt-3" />
          <Link href={testHref} className="btn btn-flare mt-6 px-5 text-[15px] lg:hidden">
            <Target className="size-4" /> {L("Test this timeline", "इस घटनाक्रम का टेस्ट दें")}
          </Link>
        </header>
        <ol className="relative space-y-4 pl-8 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-0.5 before:rounded-full before:bg-gradient-to-b before:from-amber before:to-amber-soft">
          {stories.map((s, i) => (
            <li key={s.id} className="reveal relative">
              <span className={`absolute top-6 -left-8 size-4 rounded-full ring-4 ring-bg ${i === 0 ? "bg-amber shadow-[0_0_0_7px_var(--amber-soft)]" : "bg-card shadow-[inset_0_0_0_3px_var(--amber)]"}`} />
              <Link href={`/story/${s.id}`} className="card lift cat group block p-5" style={catStyle(s.category)}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-ink-3 uppercase">{fmtDate(s.date, ui, { day: "numeric", month: "short", year: "numeric" })}</span>
                  <CategoryPill id={s.category} lang={lang} size="xs" />
                  <ArrowUpRight className="ml-auto size-4 text-ink-3 transition group-hover:rotate-45 group-hover:text-ink" />
                </div>
                <div lang={ui === "hi" ? "hi" : undefined} className="mt-2.5 text-[17px] leading-snug font-semibold">
                  {pick(s.content.title, ui)}
                </div>
                <div lang={ui === "hi" ? "hi" : undefined} className="mt-1.5 line-clamp-3 text-sm text-ink-2">
                  {pick(s.content.summary, ui)}
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <aside className="hidden lg:block">
        <div className="card sticky top-24 space-y-5 p-5">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-[18px] bg-amber-soft p-4 text-amber-ink">
              <div className="font-display text-[31px] leading-none tnum">{thread.stories.length}</div>
              <div className="mt-1 text-xs font-semibold">{L("updates", "अपडेट")}</div>
            </div>
            <div className="rounded-[18px] bg-card-2 p-4 text-ink-2">
              <div className="font-display text-[20px] leading-none">{fmtDate(thread.stories[0].date, ui, { day: "numeric", month: "short" })}</div>
              <div className="mt-1 text-xs font-semibold">{L("first update", "पहला अपडेट")}</div>
            </div>
          </div>
          <div>
            <div className="eyebrow mb-2 text-ink-3">{L("Topics covered", "शामिल विषय")}</div>
            <div className="flex flex-wrap gap-1.5">
              {[...topics.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([c]) => (
                  <CategoryPill key={c} id={c} lang={lang} size="xs" />
                ))}
            </div>
          </div>
          <Link href={testHref} className="btn btn-flare w-full text-[15px]">
            <Target className="size-4" /> {L("Test this timeline", "इस घटनाक्रम का टेस्ट दें")}
          </Link>
          <p className="text-xs text-ink-3">{L("Questions from every update, oldest to newest, so you can revise how the issue evolved.", "हर अपडेट से प्रश्न, ताकि आप मुद्दे का पूरा विकास दोहरा सकें।")}</p>
        </div>
      </aside>
    </div>
  );
}
