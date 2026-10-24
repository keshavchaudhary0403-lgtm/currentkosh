"use client";

import Link from "next/link";
import { Bookmark, Target } from "lucide-react";
import { useLang } from "@/components/lang-context";
import { StoryList } from "@/components/today";
import { Empty, PageHeader } from "@/components/ui";
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
    <div className="space-y-7">
      <PageHeader
        eyebrow={`${ids.length} ${hi ? "ख़बरें · अंतिम समय के दोहराव के लिए" : ids.length === 1 ? "story · for last-minute revision" : "stories · for last-minute revision"}`}
        title={hi ? "सहेजे गए" : <>Saved<span className="text-cobalt italic">.</span></>}
        right={
          ids.length > 0 && (
            <Link
              href={`/practice/run?kind=custom&from=2000-01-01&stories=${ids.join(",")}&count=${Math.min(50, ids.length * 3)}&title=${encodeURIComponent("Saved stories test")}`}
              className="btn btn-cobalt shrink-0 px-5 text-[15px]"
            >
              <Target className="size-4" /> {hi ? "टेस्ट दें" : "Test me"}
            </Link>
          )
        }
      />
      {!ids.length ? (
        <Empty title={hi ? "अभी कुछ सहेजा नहीं" : "Nothing saved yet"} icon={<Bookmark className="size-7" />}>
          {hi ? "किसी भी ख़बर पर बुकमार्क दबाएँ, वह यहाँ दिखेगी।" : "Tap the bookmark button at the bottom of any story to keep it here."}
        </Empty>
      ) : !items ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ids.slice(0, 6).map((id) => (
            <div key={id} className="skeleton h-44 rounded-[24px]" />
          ))}
        </div>
      ) : (
        <StoryList items={stories.map((story) => ({ story, relevance: 0 }))} lang={lang} showDate />
      )}
    </div>
  );
}
