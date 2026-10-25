import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { ReaderBody } from "@/components/reader";
import { fmtDate } from "@/components/ui";
import { currentProfile } from "@/lib/profile";
import { feedFor, getStory, latestStoryDate } from "@/lib/store";
import { pick } from "@/lib/taxonomy";
import { toDeckStory } from "../../deck-data";

export async function generateMetadata({ params }: PageProps<"/story/[id]">): Promise<Metadata> {
  const story = getStory(decodeURIComponent((await params).id));
  return { title: story?.content.title.en ?? "Story" };
}

/** A story as a full page: the same reader that opens over the deck, for shared links, search and storylines. */
export default async function StoryPage({ params }: PageProps<"/story/[id]">) {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const story = getStory(decodeURIComponent((await params).id));
  if (!story) notFound();
  const lang = profile.lang;
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  // Reading order for the day, same as the deck, so a reader can go story to story.
  const dayFeed = feedFor(profile, story.date);
  const pos = dayFeed.findIndex((s) => s.id === story.id);
  const next = pos >= 0 ? (dayFeed[pos + 1] ?? null) : null;
  const dayHref = story.date === latestStoryDate() ? "/" : `/?date=${story.date}`;

  return (
    <div className="pb-16">
      <div className="px-5 sm:px-8">
        <ReaderBody
          story={toDeckStory(story, profile)}
          lang={lang}
          variant="page"
          nextHref={next ? `/story/${next.id}` : null}
          back={
            <>
              <span className="sm:hidden">
                <BackButton fallback={dayHref} label={hi ? "वापस" : "Back"} variant="icon" />
              </span>
              <span className="hidden sm:block">
                <BackButton fallback={dayHref} label={hi ? "वापस" : "Back"} />
              </span>
            </>
          }
        />
      </div>
      <nav className="mt-12 grid gap-3 px-5 sm:grid-cols-2 sm:px-8" aria-label="Keep reading">
        {next ? (
          <Link href={`/story/${next.id}`} className="card lift group p-5 sm:order-2">
            <span className="eyebrow text-ink-3">{hi ? "अगली ख़बर" : "Up next"}</span>
            <span lang={hi ? "hi" : undefined} className="mt-2 flex items-start gap-3">
              <span className="line-clamp-2 flex-1 text-[17px] leading-snug font-semibold">{pick(next.content.title, ui)}</span>
              <ArrowRight className="mt-1 size-5 shrink-0 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ) : (
          <Link href="/practice/run?kind=daily" className="lift group rounded-[24px] bg-signal p-5 text-on-signal sm:order-2">
            <span className="eyebrow opacity-60">{hi ? "दिन की आख़िरी ख़बर" : "That's the last story of the day"}</span>
            <span className="mt-2 flex items-center gap-3 text-[17px] font-semibold">
              {hi ? "अब डेली क्विज़ दें" : "Take the daily quiz"} <ArrowRight className="size-5 transition group-hover:translate-x-1" />
            </span>
          </Link>
        )}
        <Link href={dayHref} className="card lift p-5 sm:order-1">
          <span className="eyebrow text-ink-3">{hi ? "डेक पर लौटें" : "Back to the deck"}</span>
          <span className="mt-2 block text-[17px] font-semibold">
            {fmtDate(story.date, ui, { day: "numeric", month: "long" })}
            {pos >= 0 && <span className="font-mono text-sm text-ink-3"> · {pos + 1}/{dayFeed.length}</span>}
          </span>
        </Link>
      </nav>
    </div>
  );
}
