import "server-only";
import type { McqContent } from "@/lib/content";
import type { Profile } from "@/lib/profile";
import { sourceById } from "@/lib/sources";
import { examRelevance, getThread, mcqsForStory, relevanceFor, type Story } from "@/lib/store";
import { examById, pick, type Bi } from "@/lib/taxonomy";

// Everything one deck card and its reader sheet need, resolved on the server so the client
// never has to load the source list or the storyline index.
export type DeckSource = { name: string; title: string | null; url: string; kind: "official" | "press" | "also" };
export type DeckStory = {
  id: string;
  date: string;
  category: string;
  gsPaper: string;
  relevance: number;
  exams: { label: Bi; level: number }[];
  content: Story["content"];
  hook: Bi;
  mcqs: { id: string; content: McqContent }[];
  cardIds: string[];
  sources: DeckSource[];
  thread: { key: string; title: Bi; count: number; nearby: { id: string; date: string; title: Bi }[] } | null;
};

/** First sentence of a summary, for the one-line hook on a deck card. */
const firstSentence = (s: string) => {
  const m = s.match(/^.{40,220}?[.।](?=\s|$)/);
  return (m ? m[0] : s.slice(0, 200)).trim();
};

export function toDeckStory(story: Story, profile: Profile): DeckStory {
  const thread = story.threadKey ? getThread(story.threadKey) : null;
  const at = thread ? thread.stories.findIndex((s) => s.id === story.id) : -1;
  const sources: DeckSource[] = story.sources.map((s) => {
    const src = sourceById(s.sourceId);
    const kind = src?.mode === "ai" ? "official" : src?.mode === "facts" ? "press" : "also";
    let name = src?.name ?? s.sourceId;
    if (kind === "press") {
      try {
        name = new URL(s.url).hostname.replace(/^www\./, "");
      } catch {}
    }
    return { name, title: s.title ?? null, url: s.url, kind };
  });
  return {
    id: story.id,
    date: story.date,
    category: story.category,
    gsPaper: story.gsPaper,
    relevance: relevanceFor(story, profile),
    exams: profile.exams.map((e) => ({ label: examById(e)?.label ?? { en: e, hi: e }, level: examRelevance(story, e) })),
    content: story.content,
    hook: { en: firstSentence(pick(story.content.summary, "en")), hi: firstSentence(pick(story.content.summary, "hi")) },
    mcqs: mcqsForStory(story.id).map((m) => ({ id: m.id, content: m.content })),
    cardIds: story.cardIds,
    sources,
    thread:
      thread && thread.stories.length > 1
        ? {
            key: story.threadKey!,
            title: thread.title,
            count: thread.stories.length,
            nearby: thread.stories.slice(Math.max(0, at - 3), at + 4).map((s) => ({ id: s.id, date: s.date, title: s.content.title })),
          }
        : null,
  };
}
