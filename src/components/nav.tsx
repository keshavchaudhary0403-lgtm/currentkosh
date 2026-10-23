"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useTransition } from "react";
import { BarChart3, BookOpen, Bookmark, Brain, Library, Monitor, Moon, Newspaper, Settings, Sun, Target, Waypoints } from "lucide-react";
import { setLang } from "@/app/actions";
import { dueCount, useProgress } from "@/lib/progress-store";
import { setTheme, useTheme, type Theme } from "@/lib/theme";
import type { Lang } from "@/lib/taxonomy";

type Labels = Record<"today" | "revise" | "practice" | "threads" | "archive" | "progress" | "saved" | "sources" | "settings", string>;

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

export function Sidebar({ labels, youLabel }: { labels: Labels; youLabel: string }) {
  const path = usePathname();
  const due = dueCount(useProgress());
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface/60 px-4 py-6 lg:flex">
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
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-accent-soft text-accent" : "text-ink-2 hover:bg-surface-2 hover:text-ink"}`}
            >
              {active && <span className="absolute top-2 bottom-2 left-0 w-1 rounded-full bg-accent" />}
              <Icon className="size-[18px]" strokeWidth={active ? 2.3 : 1.8} />
              {labels[key]}
              {key === "revise" && due > 0 && <span className="ml-auto rounded-full bg-accent-2 px-2 py-0.5 text-[11px] font-bold text-white">{due}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] text-ink-3 uppercase">{youLabel}</div>
      <nav className="flex flex-col gap-1">
        {MORE.map(({ href, key, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${active ? "bg-accent-soft font-medium text-accent" : "text-ink-2 hover:bg-surface-2 hover:text-ink"}`}>
              <Icon className="size-4" strokeWidth={1.8} />
              {labels[key]}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-accent-2 p-4 text-xs leading-relaxed text-white">
        <div className="mb-1 text-sm font-semibold">No ads. No pop-ups. Ever.</div>
        <span className="opacity-90">Every note links to its official source.</span>
      </div>
    </aside>
  );
}

export function BottomNav({ labels }: { labels: Labels }) {
  const path = usePathname();
  const due = dueCount(useProgress());
  const items = [...MAIN.slice(0, 3), MAIN[4], MORE[0]];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-(--glass) pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 px-2 py-1.5">
        {items.map(({ href, key, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <Link key={href} href={href} className={`relative flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium ${active ? "text-accent" : "text-ink-3"}`}>
              <span className={`grid h-7 w-12 place-items-center rounded-full transition ${active ? "bg-accent-soft" : ""}`}>
                <Icon className="size-5" strokeWidth={active ? 2.3 : 1.8} />
              </span>
              {labels[key]}
              {key === "revise" && due > 0 && (
                <span className="absolute top-0 left-1/2 ml-2.5 grid min-w-4 place-items-center rounded-full bg-accent-2 px-1 text-[10px] leading-4 font-bold text-white">{due}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function LangToggle({ lang }: { lang: Lang }) {
  const [pending, start] = useTransition();
  const opts: { v: Lang; label: string }[] = [
    { v: "en", label: "EN" },
    { v: "hi", label: "हिं" },
    { v: "bi", label: "EN+हिं" },
  ];
  return (
    <div className={`flex rounded-full border border-line bg-surface p-0.5 text-xs font-semibold ${pending ? "opacity-60" : ""}`} role="group" aria-label="Reading language">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => start(() => setLang(o.v))}
          className={`rounded-full px-2.5 py-1 transition ${lang === o.v ? "bg-ink text-bg" : "text-ink-2 hover:text-ink"}`}
          aria-pressed={lang === o.v}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const THEMES: { v: Theme; label: string; icon: typeof Sun }[] = [
  { v: "light", label: "Light", icon: Sun },
  { v: "dark", label: "Dark", icon: Moon },
  { v: "system", label: "System", icon: Monitor },
];

/** Light / Dark switch for the header; `full` adds "System" and text labels (Settings page). */
export function ThemeSwitch({ full }: { full?: boolean }) {
  const theme = useTheme();
  const opts = full ? THEMES : THEMES.slice(0, 2);
  return (
    <div className="flex rounded-full border border-line bg-surface p-0.5" role="group" aria-label="Theme">
      {opts.map(({ v, label, icon: Icon }) => (
        <button
          key={v}
          onClick={() => setTheme(v)}
          aria-pressed={theme === v}
          title={`${label} theme`}
          className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold transition ${full ? "px-3.5 py-1.5" : ""} ${theme === v ? "bg-ink text-bg" : "text-ink-2 hover:text-ink"}`}
        >
          <Icon className="size-3.5" />
          <span className={full ? "" : "hidden sm:inline"}>{label}</span>
        </button>
      ))}
    </div>
  );
}

/** CurrentKosh mark: an open book (kosh, a treasury of knowledge) with a live dot (current). */
export function Logo({ size = 28 }: { size?: number }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a48f5" />
          <stop offset="1" stopColor="#ff7a3d" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      <path d="M7 11.2c3-1.4 6.1-1.2 9 .9 2.9-2.1 6-2.3 9-.9v11.1c-3-1.4-6.1-1.2-9 .9-2.9-2.1-6-2.3-9-.9z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 12.2v10.9" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="25" cy="7" r="3" fill="#fff" />
      <circle cx="25" cy="7" r="1.5" fill="#ff7a3d" />
    </svg>
  );
}

export function Wordmark({ size = 28 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2">
      <Logo size={size} />
      <span className="font-display leading-none" style={{ fontSize: size * 0.72 }}>
        Current<span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">Kosh</span>
      </span>
    </span>
  );
}
