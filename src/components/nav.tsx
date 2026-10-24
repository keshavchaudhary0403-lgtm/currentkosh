"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { BarChart3, BookOpen, Bookmark, Brain, Check, ChevronDown, ClipboardList, Flame, Library, Moon, Newspaper, Settings, Sun, Target, UserRound, Waypoints } from "lucide-react";
import { setLang } from "@/app/actions";
import { InstallSidebarButton } from "./install";
import { dueCount, streak, useProgress } from "@/lib/progress-store";
import { setTheme, useTheme } from "@/lib/theme";
import type { Lang } from "@/lib/taxonomy";

type Labels = Record<"today" | "revise" | "practice" | "tests" | "threads" | "archive" | "progress" | "saved" | "sources" | "settings" | "you", string>;

// Each destination has its own colour so the app feels like distinct "rooms".
const TONE = {
  today: { text: "text-accent", soft: "bg-accent-soft" },
  revise: { text: "text-violet", soft: "bg-violet-soft" },
  practice: { text: "text-accent-2", soft: "bg-accent-2-soft" },
  tests: { text: "text-accent-2", soft: "bg-accent-2-soft" },
  threads: { text: "text-pink", soft: "bg-pink-soft" },
  archive: { text: "text-teal", soft: "bg-teal-soft" },
  you: { text: "text-pink", soft: "bg-pink-soft" },
} as const;

const MAIN = [
  { href: "/", key: "today", icon: Newspaper },
  { href: "/revise", key: "revise", icon: Brain },
  { href: "/practice", key: "practice", icon: Target },
  { href: "/tests", key: "tests", icon: ClipboardList },
  { href: "/threads", key: "threads", icon: Waypoints },
  { href: "/library", key: "archive", icon: Library },
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
  { href: "/practice", key: "practice", icon: Target, also: ["/tests"] as string[] },
  { href: "/library", key: "archive", icon: Library, also: [] as string[] },
  { href: "/me", key: "you", icon: UserRound, also: ["/progress", "/saved", "/threads", "/thread", "/sources", "/settings"] },
] as const;

export function Sidebar({ labels, youLabel, lang }: { labels: Labels; youLabel: string; lang: Lang }) {
  const path = usePathname();
  const p = useProgress();
  const due = dueCount(p);
  const days = streak(p);
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface px-4 py-5 lg:flex">
      <Link href="/" className="mb-7 px-2">
        <Wordmark lang={lang} />
      </Link>
      <nav className="flex flex-col gap-1">
        {MAIN.map(({ href, key, icon: Icon }) => {
          const active = isActive(path, href);
          const tone = TONE[key];
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-bold transition ${active ? `${tone.soft} ${tone.text}` : "text-ink-2 hover:bg-surface-2 hover:text-ink"}`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              {labels[key]}
              {key === "revise" && due > 0 && <span className="ml-auto rounded-full bg-violet px-2 py-0.5 text-[11px] font-extrabold text-white">{due}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-7 mb-2 px-3 text-xs font-bold text-ink-3">{youLabel}</div>
      <nav className="flex flex-col gap-0.5">
        {MORE.map(({ href, key, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${active ? "bg-surface-2 text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"}`}>
              <Icon className="size-4" strokeWidth={2.2} />
              {labels[key]}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <InstallSidebarButton />
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-accent-2-soft p-4">
        <Flame className={`size-8 shrink-0 text-accent-2 ${days > 0 ? "wiggle" : ""}`} strokeWidth={2.4} />
        <div>
          <div className="font-display text-xl leading-none text-accent-2">
            {days} {days === 1 ? "day" : "days"}
          </div>
          <div className="mt-1 text-xs font-semibold text-ink-2">{days > 0 ? "of steady study. Small daily steps add up." : "Read a story today to begin."}</div>
        </div>
      </div>
    </aside>
  );
}

export function BottomNav({ labels }: { labels: Labels }) {
  const path = usePathname();
  const due = dueCount(useProgress());
  // Tests and revision sessions are focus mode: no tab bar.
  if (path.startsWith("/practice/run") || path.startsWith("/revise/session")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 px-1">
        {TABS.map(({ href, key, icon: Icon, also }) => {
          const active = isActive(path, href) || also.some((p) => path.startsWith(p));
          const tone = TONE[key];
          return (
            <Link key={href} href={href} className={`relative flex flex-col items-center gap-0.5 pt-1.5 pb-1.5 text-[11px] font-bold ${active ? tone.text : "text-ink-3"}`}>
              <span className={`grid h-8 w-12 place-items-center rounded-full transition ${active ? `${tone.soft} pop` : ""}`}>
                <Icon className="size-[22px]" strokeWidth={active ? 2.5 : 2} />
              </span>
              {labels[key]}
              {key === "revise" && due > 0 && (
                <span className="absolute top-0.5 left-1/2 ml-2.5 grid min-w-[18px] place-items-center rounded-full border-2 border-surface bg-violet px-1 text-[10px] leading-[14px] font-extrabold text-white">
                  {due}
                </span>
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
        className={`flex h-9 items-center gap-1 rounded-full border border-line bg-surface px-3 text-xs font-bold text-ink-2 hover:text-ink ${pending ? "opacity-60" : ""}`}
      >
        {current.short}
        <ChevronDown className="size-3.5" />
      </button>
      {open && (
        <div role="menu" className="pop absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-xl">
          {LANGS.map((l) => (
            <button
              key={l.v}
              role="menuitemradio"
              aria-checked={l.v === lang}
              onClick={() => {
                setOpen(false);
                if (l.v !== lang) start(() => setLang(l.v));
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-surface-2"
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
          className={`rounded-xl border-2 px-2 py-2.5 text-sm font-bold transition ${l.v === lang ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink-2"}`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

/** Header shortcut to saved stories, with a count. */
export function SavedLink() {
  const n = useProgress().bookmarks.length;
  const path = usePathname();
  const active = path.startsWith("/saved");
  return (
    <Link
      href="/saved"
      aria-label={`Saved stories (${n})`}
      title="Saved stories"
      className={`relative grid size-9 place-items-center rounded-full border-2 transition active:scale-90 ${active ? "border-violet bg-violet-soft text-violet" : "border-line bg-surface text-ink-2 hover:text-ink"}`}
    >
      <Bookmark className="size-4" strokeWidth={2.4} />
      {n > 0 && (
        <span key={n} className="pop absolute -top-1.5 -right-1.5 grid min-w-[18px] place-items-center rounded-full border-2 border-surface bg-violet px-1 text-[10px] leading-[14px] font-extrabold text-white">
          {n}
        </span>
      )}
    </Link>
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
      className="grid size-9 place-items-center rounded-full border border-line bg-surface text-ink-2 transition hover:text-ink active:scale-90"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

/** CurrentKosh mark: an open book (kosh, a treasury of knowledge) with an orange dot for "current". */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <rect width="32" height="32" rx="9" fill="#4f46e5" />
      <path d="M7 11.2c3-1.4 6.1-1.2 9 .9 2.9-2.1 6-2.3 9-.9v11.1c-3-1.4-6.1-1.2-9 .9-2.9-2.1-6-2.3-9-.9z" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 12.2v10.9" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="25.5" cy="6.5" r="3.5" fill="#f97316" stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}

/** "CurrentKosh"; in Hindi and bilingual modes the second half reads कोश. */
export function Wordmark({ size = 28, lang = "en" }: { size?: number; lang?: Lang }) {
  return (
    <span className="flex items-center gap-2">
      <Logo size={size} />
      <span className="font-display leading-none" style={{ fontSize: size * 0.7 }}>
        Current<span className="text-accent">{lang === "en" ? "Kosh" : "कोश"}</span>
      </span>
    </span>
  );
}
