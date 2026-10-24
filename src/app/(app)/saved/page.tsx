"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useLang } from "@/components/lang-context";
import { StoryList } from "@/components/today";
import { Empty } from "@/components/ui";
import { useProgress } from "@/lib/progress-store";
import { useItems } from "@/lib/use-items";

export default function Saved() {
  const lang = useLang();
  const hi = lang === "hi";
  const ids = useProgress().bookmarks;
  const items = useItems(ids.length ? { stories: ids } : null);
  // Newest saved first, in the order the reader saved them.
  const order = new Map(ids.map((id, i) => [id, i]));
  const stories = items ? items.stories.filter((s) => order.has(s.id)).sort((a, b) => order.get(a.id)! - order.get(b.id)!) : [];

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-4 rounded-3xl bg-violet-soft p-5">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet text-white">
          <Bookmark className="size-6" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl leading-tight">{hi ? "सहेजे गए" : "Saved"}</h1>
          <p className="text-sm font-medium text-ink-2">
            {ids.length} {hi ? "ख़बरें · अंतिम समय के दोहराव के लिए" : ids.length === 1 ? "story · for last-minute revision" : "stories · for last-minute revision"}
          </p>
        </div>
        {ids.length > 0 && (
          <Link
            href={`/practice/run?kind=custom&from=2000-01-01&stories=${ids.join(",")}&count=${Math.min(50, ids.length * 3)}&title=${encodeURIComponent("Saved stories test")}`}
            className="btn btn-violet shrink-0 px-3.5 py-2.5 text-[15px]"
          >
            {hi ? "टेस्ट दें" : "Test me"}
          </Link>
        )}
      </header>
      {!ids.length ? (
        <Empty title={hi ? "अभी कुछ सहेजा नहीं" : "Nothing saved yet"} icon={<Bookmark className="size-7" />}>
          {hi ? "किसी भी ख़बर पर बुकमार्क दबाएँ, वह यहाँ दिखेगी।" : "Tap the bookmark button at the bottom of any story to keep it here."}
        </Empty>
      ) : !items ? (
        <div className="h-40 animate-pulse rounded-2xl bg-surface" />
      ) : (
        <StoryList items={stories.map((story) => ({ story, relevance: 0 }))} lang={lang} showDate />
      )}
    </div>
  );
}
