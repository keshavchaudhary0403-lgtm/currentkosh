"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ResultView } from "@/components/result-view";
import { Empty } from "@/components/ui";
import { useProgress } from "@/lib/progress-store";
import { useItems } from "@/lib/use-items";
import { useLang } from "@/components/lang-context";

function PastResult() {
  const id = useSearchParams().get("id");
  const lang = useLang();
  const attempt = useProgress().attempts.find((a) => a.id === id) ?? null;
  const items = useItems(attempt ? { mcqs: attempt.mcqIds } : null);
  if (!attempt) return <Empty title="Result not found">Past results are saved in this browser only.</Empty>;
  if (!items) return <div className="h-64 animate-pulse rounded-xl bg-surface" />;
  return <ResultView attempt={attempt} questions={items.mcqs} lang={lang} />;
}

export default function ResultPage() {
  return (
    <Suspense>
      <PastResult />
    </Suspense>
  );
}
