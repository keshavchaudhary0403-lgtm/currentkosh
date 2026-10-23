"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { BarChart3, BookOpen, Bookmark, Brain, Library, Moon, Newspaper, Settings, Sun, Target, Waypoints } from "lucide-react";
import { setLang } from "@/app/actions";
import { dueCount, useProgress } from "@/lib/progress-store";
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
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line px-4 py-6 lg:flex">
      <Link href="/" className="mb-8 px-2">
        <Wordmark />
      </Link>
      <nav className="flex flex-col gap-1">
        {MAIN.map(({ href, key, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive(path, href) ? "bg-surface text-ink shadow-card" : "text-ink-2 hover:bg-surface/60 hover:text-ink"}`}
          >
            <Icon className="size-[18px]" strokeWidth={isActive(path, href) ? 2.2 : 1.8} />
            {labels[key]}
            {key === "revise" && due > 0 && <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">{due}</span>}
          </Link>
        ))}
      </nav>
      <div className="mt-8 mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] text-ink-3 uppercase">{youLabel}</div>
      <nav className="flex flex-col gap-1">
        {MORE.map(({ href, key, icon: Icon }) => (
          <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive(path, href) ? "bg-surface text-ink shadow-card" : "text-ink-2 hover:text-ink"}`}>
            <Icon className="size-4" strokeWidth={1.8} />
            {labels[key]}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border border-line bg-surface p-4 text-xs leading-relaxed text-ink-2">
        <div className="mb-1 font-semibold text-ink">No ads. No pop-ups. Ever.</div>
        Every note links to its official source.
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
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(({ href, key, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <Link key={href} href={href} className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${active ? "text-ink" : "text-ink-3"}`}>
              <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
              {labels[key]}
              {key === "revise" && due > 0 && <span className="absolute top-1.5 left-1/2 ml-2 size-2 rounded-full bg-accent-2" />}
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
    <div className={`flex rounded-full border border-line bg-surface p-0.5 text-xs font-semibold ${pending ? "opacity-60" : ""}`}>
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

export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const current = root.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };
  return (
    <button onClick={toggle} aria-label="Toggle theme" className="grid size-8 place-items-center rounded-full border border-line bg-surface text-ink-2 hover:text-ink">
      <Sun className="hidden size-4 dark:block" />
      <Moon className="size-4 dark:hidden" />
    </button>
  );
}

/** CurrentKosh mark: an open book (kosh, a treasury of knowledge) with a live dot (current). */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="ck-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a48f5" />
          <stop offset="1" stopColor="#ff7a3d" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#ck-logo)" />
      <path d="M7 11.2c3-1.4 6.1-1.2 9 .9 2.9-2.1 6-2.3 9-.9v11.1c-3-1.4-6.1-1.2-9 .9-2.9-2.1-6-2.3-9-.9z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 12.2v10.9" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="25" cy="7" r="3" fill="#fff" />
      <circle cx="25" cy="7" r="1.5" fill="#ff7a3d" />
    </svg>
  );
}

export function Wordmark({ size = 28 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <Logo size={size} />
      <span className="font-display leading-none tracking-tight" style={{ fontSize: size * 0.86 }}>
        Current<span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">Kosh</span>
      </span>
    </span>
  );
}
