"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { BarChart3, BookOpen, Bookmark, Brain, Check, ChevronDown, Library, Moon, Newspaper, Settings, Sun, Target, UserRound, Waypoints } from "lucide-react";
import { setLang } from "@/app/actions";
import { dueCount, useProgress } from "@/lib/progress-store";
import { setTheme, useTheme } from "@/lib/theme";
import type { Lang } from "@/lib/taxonomy";

type Labels = Record<"today" | "revise" | "practice" | "threads" | "archive" | "progress" | "saved" | "sources" | "settings" | "you", string>;

const MAIN = [
  { href: "/", key: "today", icon: Newspaper },
  { href: "/revise", key: "revise", icon: Brain },
  { href: "/practice", key: "practice", icon: Target },
  { href: "/threads", key: "threads", icon: Waypoints },
  { href: "/archive", key: "archive", icon: Library },
] as const;

const MORE = [
  { href: "/progress", key: "progress", icon: BarChart3 },
  { href: "/saved", key: "saved", icon: Bookmark },
  { href: "/sources", key: "sources", icon: BookOpen },
  { href: "/settings", key: "settings", icon: Settings },
] as const;

const isActive = (path: string, href: string) => (href === "/" ? path === "/" || path.startsWith("/story") : path.startsWith(href));

// Phone tab bar: the four daily destinations plus "You" (progress, saved, storylines, settings…).
const TABS = [
  { href: "/", key: "today", icon: Newspaper, also: [] as string[] },
  { href: "/revise", key: "revise", icon: Brain, also: [] as string[] },
  { href: "/practice", key: "practice", icon: Target, also: [] as string[] },
  { href: "/archive", key: "archive", icon: Library, also: [] as string[] },
  { href: "/me", key: "you", icon: UserRound, also: ["/progress", "/saved", "/threads", "/thread", "/sources", "/settings"] },
] as const;

export function Sidebar({ labels, youLabel }: { labels: Labels; youLabel: string }) {
  const path = usePathname();
  const due = dueCount(useProgress());
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface px-3 py-5 lg:flex">
      <Link href="/" className="mb-8 px-2">
        <Wordmark />
      </Link>
      <nav className="flex flex-col gap-1">
        {MAIN.map(({ href, key, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${active ? "bg-surface-2 text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"}`}
            >
              <Icon className="size-[18px]" strokeWidth={active ? 2.3 : 1.8} />
              {labels[key]}
              {key === "revise" && due > 0 && <span className="ml-auto rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-white">{due}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] text-ink-3 uppercase">{youLabel}</div>
      <nav className="flex flex-col gap-1">
        {MORE.map(({ href, key, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? "bg-surface-2 font-medium text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"}`}>
              <Icon className="size-4" strokeWidth={1.8} />
              {labels[key]}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-xl border border-line p-4 text-xs leading-relaxed text-ink-2">
        <div className="mb-0.5 font-semibold text-ink">No ads. No pop-ups.</div>
        Every note links to its official source.
      </div>
    </aside>
  );
}

export function BottomNav({ labels }: { labels: Labels }) {
  const path = usePathname();
  const due = dueCount(useProgress());
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {TABS.map(({ href, key, icon: Icon, also }) => {
          const active = isActive(path, href) || also.some((p) => path.startsWith(p));
          return (
            <Link key={href} href={href} className={`relative flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[11px] font-medium ${active ? "text-accent" : "text-ink-3"}`}>
              <Icon className="size-[22px]" strokeWidth={active ? 2.3 : 1.7} />
              {labels[key]}
              {key === "revise" && due > 0 && (
                <span className="absolute top-1 left-1/2 ml-2 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] leading-4 font-semibold text-white">{due}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const LANGS: { v: Lang; short: string; label: string }[] = [
  { v: "en", short: "EN", label: "English" },
  { v: "hi", short: "हिं", label: "हिंदी" },
  { v: "bi", short: "EN+हिं", label: "English + हिंदी" },
];

/** Compact reading-language menu for the header. */
export function LangMenu({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);
  const current = LANGS.find((l) => l.v === lang) ?? LANGS[0];
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Reading language"
        className={`flex h-9 items-center gap-1 rounded-full border border-line bg-surface px-3 text-xs font-semibold text-ink-2 hover:text-ink ${pending ? "opacity-60" : ""}`}
      >
        {current.short}
        <ChevronDown className="size-3.5" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-xl">
          {LANGS.map((l) => (
            <button
              key={l.v}
              role="menuitemradio"
              aria-checked={l.v === lang}
              onClick={() => {
                setOpen(false);
                if (l.v !== lang) start(() => setLang(l.v));
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-surface-2"
            >
              {l.label}
              {l.v === lang && <Check className="size-4 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Language choice as a row of buttons (the "You" page). */
export function LangPicker({ lang }: { lang: Lang }) {
  const [pending, start] = useTransition();
  return (
    <div className={`grid grid-cols-3 gap-2 ${pending ? "opacity-60" : ""}`}>
      {LANGS.map((l) => (
        <button
          key={l.v}
          onClick={() => l.v !== lang && start(() => setLang(l.v))}
          aria-pressed={l.v === lang}
          className={`rounded-xl border px-2 py-2.5 text-sm font-semibold ${l.v === lang ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink-2"}`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

/** One icon: a moon in light mode (tap for dark), a sun in dark mode (tap for light). */
export function ThemeToggle() {
  const theme = useTheme();
  const dark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
      className="grid size-9 place-items-center rounded-full border border-line bg-surface text-ink-2 transition hover:text-ink"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

/** CurrentKosh mark: an open book (kosh, a treasury of knowledge) with a dot for "current". */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <rect width="32" height="32" rx="8" fill="#1f3f99" />
      <path d="M7 11.2c3-1.4 6.1-1.2 9 .9 2.9-2.1 6-2.3 9-.9v11.1c-3-1.4-6.1-1.2-9 .9-2.9-2.1-6-2.3-9-.9z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 12.2v10.9" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="25" cy="7" r="3" fill="#e2a24a" />
    </svg>
  );
}

export function Wordmark({ size = 28 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2">
      <Logo size={size} />
      <span className="font-display leading-none" style={{ fontSize: size * 0.68 }}>
        Current<span className="text-accent">Kosh</span>
      </span>
    </span>
  );
}
