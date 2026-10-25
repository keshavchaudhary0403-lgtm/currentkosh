"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  BarChart3,
  Bookmark,
  Brain,
  CalendarRange,
  Check,
  ChevronDown,
  ClipboardList,
  Flame,
  Library,
  Newspaper,
  Search,
  Target,
  UserRound,
  Waypoints,
} from "lucide-react";
import { setLang } from "@/app/actions";
import { InstallSidebarButton } from "./install";
import { dueCount, useProgress } from "@/lib/progress-store";
import type { Lang } from "@/lib/taxonomy";
import { ThemeSwitch } from "./theme-switch";
import { cx } from "./ui";
import { useXp } from "./xp";

export type NavLabels = Record<"today" | "revise" | "practice" | "tests" | "threads" | "monthly" | "archive" | "progress" | "saved" | "sources" | "settings" | "you", string>;

// Desktop rail: every destination as an icon with a short label.
const RAIL = [
  { href: "/", key: "today", icon: Newspaper },
  { href: "/revise", key: "revise", icon: Brain },
  { href: "/practice", key: "practice", icon: Target },
  { href: "/tests", key: "tests", icon: ClipboardList },
  { href: "/threads", key: "threads", icon: Waypoints },
  { href: "/monthly", key: "monthly", icon: CalendarRange },
  { href: "/library", key: "archive", icon: Library },
  { href: "/progress", key: "progress", icon: BarChart3 },
  { href: "/me", key: "you", icon: UserRound },
] as const;

// Phone dock: the four daily destinations plus "You" (progress, saved, storylines, settings…).
const TABS = [
  { href: "/", key: "today", icon: Newspaper, also: [] as string[] },
  { href: "/revise", key: "revise", icon: Brain, also: [] as string[] },
  { href: "/practice", key: "practice", icon: Target, also: ["/tests"] as string[] },
  { href: "/library", key: "archive", icon: Library, also: [] as string[] },
  { href: "/me", key: "you", icon: UserRound, also: ["/progress", "/saved", "/threads", "/thread", "/monthly", "/sources", "/settings"] },
] as const;

const isActive = (path: string, href: string) => (href === "/" ? path === "/" || path.startsWith("/story") : path.startsWith(href));

/** Tests and revision sessions are focus mode: no rail, header or dock. */
export const isFocus = (path: string) => path.startsWith("/practice/run") || path.startsWith("/revise/session") || /^\/monthly\/[^/]+\/test/.test(path);

/** Desktop icon rail with the level ring at the bottom. */
export function Sidebar({ labels }: { labels: NavLabels; lang: Lang }) {
  const path = usePathname();
  const xp = useXp();
  if (isFocus(path)) return null;
  return (
    <aside className="sticky top-0 hidden h-dvh w-[88px] shrink-0 flex-col items-center border-r border-line py-4 lg:flex">
      <Link href="/" className="mb-5" aria-label="CurrentKosh home">
        <Logo size={40} />
      </Link>
      <nav className="flex flex-col items-center gap-1" aria-label="Main">
        {RAIL.map(({ href, key, icon: Icon }) => {
          const active = isActive(path, href) || (key === "you" && ["/saved", "/sources", "/settings"].some((p) => path.startsWith(p)));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              title={labels[key]}
              className={cx("group relative flex h-[54px] w-[68px] flex-col items-center justify-center gap-1 rounded-[18px] transition-colors", active ? "bg-solid text-on-solid" : "text-ink-2 hover:bg-card hover:text-ink")}
            >
              <Icon className={cx("size-5 transition-transform group-hover:scale-110", active && "text-solid-accent")} strokeWidth={active ? 2.2 : 1.8} />
              <span className="max-w-full truncate px-1 text-[10px] leading-none font-semibold">{labels[key]}</span>
              {key === "revise" && xp.due > 0 && (
                <span className="absolute top-1 right-2 grid min-w-[18px] place-items-center rounded-full bg-cobalt px-1 text-[10px] leading-[18px] font-bold text-white tnum">{xp.due > 99 ? "99+" : xp.due}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-3">
        <InstallSidebarButton />
      </div>
    </aside>
  );
}

/** Streak flame and XP, shown in the header on every screen. */
export function XpChip() {
  const xp = useXp();
  return (
    <Link
      href="/progress"
      title={`Level ${xp.level} · ${xp.total} XP · ${xp.streak}-day streak`}
      className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-card pr-3 pl-1.5 shadow-[inset_0_0_0_1px_var(--line-2)] transition hover:shadow-[inset_0_0_0_1px_var(--ink-3)]"
    >
      <span className="flex h-8 items-center gap-1 rounded-full bg-[#10110e] px-2 text-xs font-bold text-[#c8f135] tnum dark:bg-signal dark:text-on-signal">
        <Flame className={cx("size-4", xp.streak > 0 && "flicker")} /> {xp.streak}
      </span>
      <span className="font-mono text-xs font-semibold tnum">
        {xp.total.toLocaleString("en-IN")}
        <span className="text-ink-3"> XP</span>
      </span>
      <span className="hidden font-mono text-[11px] text-ink-3 xl:inline">· L{xp.level}</span>
    </Link>
  );
}

/** Sticky glass top bar: brand (phones), search (desktop), XP, saved, language and the theme switch. */
export function AppHeader({ lang }: { lang: Lang }) {
  const path = usePathname();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const ui = lang === "bi" ? "en" : lang;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (input.current && input.current.offsetParent) input.current.focus();
        else router.push("/library");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
  if (isFocus(path)) return null;
  return (
    <header className="glass sticky top-0 z-30 border-b border-line" style={{ viewTransitionName: "app-header" }}>
      <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-6">
        <Link href="/" className="shrink-0 lg:hidden" aria-label="CurrentKosh home">
          <span className="sm:hidden">
            <Logo size={34} />
          </span>
          <span className="hidden sm:block">
            <Wordmark size={30} text={19} lang={lang} />
          </span>
        </Link>
        <form action="/library" className="hidden w-full max-w-xs lg:block" role="search">
          <label className="group flex h-11 items-center gap-2.5 rounded-full bg-card px-4 shadow-[inset_0_0_0_1px_var(--line-2)] transition focus-within:shadow-[inset_0_0_0_2px_var(--ink)]">
            <Search className="size-4 text-ink-3" />
            <input ref={input} name="q" placeholder={ui === "hi" ? "हर ख़बर में खोजें…" : "Search every story…"} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-3" aria-label="Search stories" />
            <kbd className="eyebrow rounded-md bg-card-2 px-1.5 py-0.5 text-ink-3">⌘K</kbd>
          </label>
        </form>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <XpChip />
          <span className="hidden sm:block">
            <SavedLink />
          </span>
          <LangMenu lang={lang} />
          <span className="lg:hidden">
            <ThemeSwitch />
          </span>
          <span className="hidden lg:block">
            <ThemeSwitch labeled />
          </span>
        </div>
      </div>
    </header>
  );
}

/** Main column. Today's deck runs edge to edge; other pages get the usual gutters. */
export function AppMain({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/") return <main className="min-w-0">{children}</main>;
  return <main className="mx-auto max-w-[1240px] px-4 pt-5 pb-32 sm:px-6 sm:pt-8 lg:px-8 lg:pb-16">{children}</main>;
}

export function BottomNav({ labels }: { labels: NavLabels }) {
  const path = usePathname();
  const due = dueCount(useProgress());
  // Focus mode and story pages (which have their own action dock) hide the tab dock.
  if (isFocus(path) || path.startsWith("/story/")) return null;
  return (
    <nav
      aria-label="Tabs"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(10px+env(safe-area-inset-bottom))] lg:hidden"
      style={{ viewTransitionName: "app-dock" }}
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-dock p-1.5 shadow-float ring-1 ring-white/10 backdrop-blur-xl">
        {TABS.map(({ href, key, icon: Icon, also }) => {
          const active = isActive(path, href) || also.some((p) => path.startsWith(p));
          return (
            <Link
              key={href}
              href={href}
              aria-label={labels[key]}
              aria-current={active ? "page" : undefined}
              className={cx(
                "relative flex h-12 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] active:scale-90",
                active ? "bg-signal px-4 text-on-signal" : "w-12 text-on-dock/65 hover:text-on-dock",
              )}
            >
              <Icon className="size-[21px] shrink-0" strokeWidth={active ? 2.3 : 1.9} />
              <span
                className={cx(
                  "overflow-hidden text-sm font-semibold whitespace-nowrap transition-all duration-500",
                  active ? "ml-2 max-w-[120px] opacity-100" : "max-w-0 opacity-0",
                )}
              >
                {labels[key]}
              </span>
              {key === "revise" && due > 0 && !active && (
                <span className="absolute top-1.5 right-1.5 grid min-w-[17px] place-items-center rounded-full bg-cobalt px-1 text-[10px] leading-[17px] font-bold text-white tnum">{due > 99 ? "99+" : due}</span>
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
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  const current = LANGS.find((l) => l.v === lang) ?? LANGS[0];
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Reading language"
        className={cx("flex h-11 items-center gap-1 rounded-full bg-card px-3.5 text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--line-2)] transition active:scale-95", pending && "opacity-60")}
      >
        {current.short}
        <ChevronDown className={cx("size-3.5 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div role="menu" className="popover absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-[20px] border border-line bg-card p-1.5 shadow-float">
          {LANGS.map((l) => (
            <button
              key={l.v}
              role="menuitemradio"
              aria-checked={l.v === lang}
              onClick={() => {
                setOpen(false);
                if (l.v !== lang) start(() => setLang(l.v));
              }}
              className="flex min-h-11 w-full items-center justify-between rounded-2xl px-3 text-left text-sm font-medium hover:bg-card-2"
            >
              {l.label}
              {l.v === lang && (
                <span className="grid size-5 place-items-center rounded-full bg-signal text-on-signal">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Language choice as a segmented control (the "You" page). */
export function LangPicker({ lang }: { lang: Lang }) {
  const [pending, start] = useTransition();
  return (
    <div className={cx("grid grid-cols-3 gap-1 rounded-full bg-card-2 p-1", pending && "opacity-60")} role="radiogroup" aria-label="Reading language">
      {LANGS.map((l) => (
        <button
          key={l.v}
          role="radio"
          onClick={() => l.v !== lang && start(() => setLang(l.v))}
          aria-checked={l.v === lang}
          className={cx("h-10 rounded-full px-2 text-sm font-semibold transition", l.v === lang ? "bg-solid text-on-solid shadow-card" : "text-ink-2 hover:text-ink")}
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
      aria-label={`Saved (${n})`}
      title="Saved"
      className={cx(
        "relative grid size-11 place-items-center rounded-full transition active:scale-90",
        active ? "bg-solid text-on-solid" : "bg-card text-ink shadow-[inset_0_0_0_1px_var(--line-2)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]",
      )}
    >
      <Bookmark className="size-[18px]" strokeWidth={2} />
      {n > 0 && (
        <span key={n} className="pop absolute -top-0.5 -right-0.5 grid min-w-[18px] place-items-center rounded-full bg-signal px-1 text-[10px] leading-[18px] font-bold text-on-signal ring-2 ring-bg tnum">
          {n}
        </span>
      )}
    </Link>
  );
}

/** Labeled theme switch (kept under the old name for existing imports). */
export function ThemeToggle() {
  return <ThemeSwitch labeled />;
}

/** CurrentKosh mark: an ink tile with three lines of a brief and a lime "live" signal dot. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <rect width="32" height="32" rx="9.5" fill="#10110e" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="none" stroke="rgb(255 255 255 / 0.12)" />
      <rect x="7" y="10" width="11" height="3" rx="1.5" fill="#f3f2ec" />
      <rect x="7" y="15" width="18" height="3" rx="1.5" fill="#f3f2ec" />
      <rect x="7" y="20" width="14" height="3" rx="1.5" fill="#f3f2ec" opacity="0.55" />
      <circle cx="23.5" cy="11.5" r="3.5" fill="#c8f135" />
    </svg>
  );
}

/** Logo + name in the display face; "Kosh" takes the brand accent. */
export function Wordmark({ size = 32, text = 21, lang = "en" }: { size?: number; text?: number; lang?: Lang }) {
  return (
    <span className="flex items-center gap-2.5">
      <Logo size={size} />
      <span className="font-display leading-none font-bold tracking-[-0.04em]" style={{ fontSize: text * 0.92 }}>
        Current
        {lang === "en" ? (
          <span className="text-signal-ink">Kosh</span>
        ) : (
          <span lang="hi" className="font-semibold text-signal-ink">
            कोश
          </span>
        )}
      </span>
    </span>
  );
}
