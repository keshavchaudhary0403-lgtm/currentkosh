"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/components/lang-context";
import { ReviewSession, type SessionItem } from "@/components/review-session";
import { Empty } from "@/components/ui";
import { dueItems, useProgress } from "@/lib/progress-store";
import { useItems } from "@/lib/use-items";

export default function Session() {
  const lang = useLang();
  const progress = useProgress();
  // Freeze the queue when the session starts; grading items mid-session must not reshuffle it.
  const [queue, setQueue] = useState<{ type: "card" | "mcq"; id: string }[] | null>(null);
  const due = queue ?? dueItems(progress, 30);
  if (!queue && due.length) setQueue(due);
  const items = useItems(due.length ? { cards: due.filter((d) => d.type === "card").map((d) => d.id), mcqs: due.filter((d) => d.type === "mcq").map((d) => d.id) } : null);

  if (!due.length)
    return (
      <Empty title="Nothing due right now">
        <Link href="/revise" className="text-accent underline">
          Back to Revise
        </Link>
      </Empty>
    );
  if (!items) return <div className="mx-auto h-72 max-w-2xl animate-pulse rounded-xl bg-surface" />;

  const cards = new Map(items.cards.map((c) => [c.id, c]));
  const mcqs = new Map(items.mcqs.map((m) => [m.id, m]));
  const session: SessionItem[] = due.flatMap((d): SessionItem[] => {
    if (d.type === "card") {
      const c = cards.get(d.id);
      return c ? [{ type: "card", id: c.id, storyId: c.storyId, category: c.category, content: c.content }] : [];
    }
    const m = mcqs.get(d.id);
    return m ? [{ type: "mcq", id: m.id, storyId: m.storyId, category: m.category, content: m.content }] : [];
  });
  return <ReviewSession items={session} lang={lang} />;
}
