"use client";

import { Moon, Sun } from "lucide-react";
import { setTheme, useTheme } from "@/lib/theme";
import { cx } from "./ui";

/**
 * One round button that is always visible: a moon in light mode, a sun in dark mode. Tapping it flips the theme.
 * The first visit follows the system theme (see the script in app/layout.tsx).
 */
export function ThemeSwitch({ className }: { className?: string }) {
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
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={flip}
      className={cx(
        "group grid size-11 shrink-0 place-items-center rounded-full bg-card text-ink shadow-[inset_0_0_0_1px_var(--line-2)] transition hover:shadow-[inset_0_0_0_1px_var(--ink-3)] active:scale-90",
        className,
      )}
    >
      {/* One icon: the moon offers dark mode, the sun offers light mode. */}
      {dark ? <Sun key="sun" className="pop size-[18px]" strokeWidth={2.2} /> : <Moon key="moon" className="pop size-[18px]" strokeWidth={2.2} />}
    </button>
  );
}
