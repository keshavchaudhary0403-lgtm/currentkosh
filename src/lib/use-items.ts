"use client";

import { useEffect, useState } from "react";
import type { Card, Mcq, Story } from "./store";

export type Items = { stories: Story[]; mcqs: Mcq[]; cards: Card[] };

/** Fetch content for ids stored in the browser. `null` while loading. */
export function useItems(req: { stories?: string[]; mcqs?: string[]; cards?: string[] } | null): Items | null {
  const key = req ? JSON.stringify(req) : null;
  const [data, setData] = useState<{ key: string; items: Items } | null>(null);
  useEffect(() => {
    if (!key) return;
    const r = JSON.parse(key) as { stories?: string[]; mcqs?: string[]; cards?: string[] };
    const qs = new URLSearchParams();
    for (const k of ["stories", "mcqs", "cards"] as const) if (r[k]?.length) qs.set(k, r[k]!.join(","));
    let live = true;
    fetch(`/api/items?${qs}`)
      .then((res) => res.json() as Promise<Items>)
      .then((items) => live && setData({ key, items }));
    return () => {
      live = false;
    };
  }, [key]);
  return data && data.key === key ? data.items : null;
}
