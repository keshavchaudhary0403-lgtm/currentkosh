"use client";

import { useLang } from "@/components/lang-context";
import { StoryList } from "@/components/today";
import { Empty } from "@/components/ui";
import { useProgress } from "@/lib/progress-store";
import { useItems } from "@/lib/use-items";

export default function Saved() {
  const lang = useLang();
  const ids = useProgress().bookmarks;
  const items = useItems(ids.length ? { stories: ids } : null);
  return (
    <div className="space-y-8">
      <h1 className="font-display text-[28px] sm:text-4xl">{lang === "hi" ? "सहेजे गए" : "Saved"}</h1>
      {!ids.length ? (
        <Empty title="Nothing saved yet">Tap the bookmark on any story to keep it here for last-minute revision.</Empty>
      ) : !items ? (
        <div className="h-40 animate-pulse rounded-xl bg-surface" />
      ) : (
        <StoryList items={items.stories.map((story) => ({ story, relevance: 0 }))} lang={lang} compact grid />
      )}
    </div>
  );
}
