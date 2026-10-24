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
  if (!items)
    return (
      <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        <div className="skeleton h-[520px] rounded-[28px]" />
        <div className="space-y-4">
          <div className="skeleton h-12 w-64 rounded-2xl" />
          <div className="skeleton h-64 rounded-[24px]" />
        </div>
      </div>
    );
  return <ResultView attempt={attempt} questions={items.mcqs} lang={lang} />;
}

export default function ResultPage() {
  return (
    <Suspense>
      <PastResult />
    </Suspense>
  );
}
