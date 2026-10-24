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
      <button onClick={go} aria-label={label ?? "Go back"} className="btn btn-ghost size-11 shrink-0 px-0">
        <ArrowLeft className="size-[18px]" strokeWidth={2} />
      </button>
    );
  return (
    <button onClick={go} className="group mb-5 inline-flex h-11 items-center gap-2 rounded-full bg-card pr-4 pl-2 text-sm font-semibold text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] transition hover:text-ink sm:mb-7">
      <span className="grid size-7 place-items-center rounded-full bg-card-2 transition group-hover:-translate-x-0.5 group-hover:bg-solid group-hover:text-on-solid">
        <ArrowLeft className="size-4" />
      </span>
      {label ?? "Back"}
    </button>
  );
}
