"use client";

import { Moon, Sun } from "lucide-react";
import { setTheme, useTheme } from "@/lib/theme";
import { cx } from "./ui";

/**
 * A sun/moon switch that is always visible. `labeled` adds "Light"/"Dark" text (desktop).
 * The first visit follows the system theme (see the script in app/layout.tsx).
 */
export function ThemeSwitch({ labeled = false, className }: { labeled?: boolean; className?: string }) {
  const dark = useTheme() === "dark";
  const flip = () => {
    const go = () => setTheme(dark ? "light" : "dark");
    // Cross-fade the whole page between themes where the browser supports it.
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(go);
    else go();
  };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Dark theme on. Switch to light" : "Light theme on. Switch to dark"}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={flip}
      className={cx(
        "group flex h-11 shrink-0 items-center gap-2 rounded-full bg-card pr-1.5 pl-1.5 shadow-[inset_0_0_0_1px_var(--line-2)] transition hover:shadow-[inset_0_0_0_1px_var(--ink-3)] active:scale-95",
        labeled && "pl-3.5",
        className,
      )}
    >
      {labeled && <span className="text-xs font-semibold text-ink-2 group-hover:text-ink">{dark ? "Dark" : "Light"}</span>}
      <span className="relative flex h-8 w-[60px] items-center justify-between rounded-full bg-card-2 px-2 shadow-[inset_0_1px_2px_rgb(0_0_0/0.12)]">
        <Sun className={cx("relative z-10 size-4 transition-colors", dark ? "text-ink-3" : "text-on-signal")} strokeWidth={2.2} />
        <Moon className={cx("relative z-10 size-4 transition-colors", dark ? "text-on-signal" : "text-ink-3")} strokeWidth={2.2} />
        <span
          aria-hidden
          className="absolute top-1 left-1 size-6 rounded-full bg-signal shadow-card transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)]"
          style={{ transform: dark ? "translateX(28px)" : "translateX(0)" }}
        />
      </span>
    </button>
  );
}
