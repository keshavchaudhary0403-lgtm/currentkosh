"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

// Counts in-app page views this tab, so "back" can return to the previous screen
// when there is one, and fall back to a sensible parent page when the reader landed here directly.
let views = 0;

export function NavTracker() {
  const path = usePathname();
  useEffect(() => {
    views++;
  }, [path]);
  return null;
}

export function BackButton({ fallback, label, variant = "pill" }: { fallback: string; label?: string; variant?: "pill" | "icon" }) {
  const router = useRouter();
  const go = () => (views > 1 ? router.back() : router.push(fallback));
  if (variant === "icon")
    return (
      <button onClick={go} aria-label={label ?? "Go back"} className="btn btn-ghost h-10 min-w-10 shrink-0 px-2.5 text-[15px]">
        <ArrowLeft className="size-[18px]" strokeWidth={2} />
        {label && <span className="hidden pr-1 lg:inline">{label}</span>}
      </button>
    );
  return (
    <button
      onClick={go}
      className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-sm font-bold text-ink-2 hover:text-ink sm:mb-6"
    >
      <ArrowLeft className="size-4" /> {label ?? "Back"}
    </button>
  );
}
