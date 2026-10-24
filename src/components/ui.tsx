import Link from "next/link";
import { Flame, TrendingUp } from "lucide-react";
import { CATEGORIES, categoryById, pick, type Bi, type Lang } from "@/lib/taxonomy";
import { sourceById } from "@/lib/sources";
import { t } from "@/lib/i18n";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/** Bilingual text. In "bi" mode, Hindi sits beneath English in a quieter tone. */
export function BiText({ v, lang, as: Tag = "span", className, hiClassName }: { v: Bi | null | undefined; lang: Lang; as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "li"; className?: string; hiClassName?: string }) {
  if (!v) return null;
  if (lang === "bi" && v.hi) {
    return (
      <Tag className={className}>
        {v.en}
        <span lang="hi" className={cx("mt-1 block text-ink-2", hiClassName)}>
          {v.hi}
        </span>
      </Tag>
    );
  }
  return (
    <Tag className={className} lang={lang === "hi" ? "hi" : undefined}>
      {pick(v, lang)}
    </Tag>
  );
}

export function CategoryPill({ id, lang, size = "sm" }: { id: string; lang: Lang; size?: "sm" | "xs" }) {
  const c = categoryById(id) ?? CATEGORIES[0];
  return (
    <span
      className={cx("cat inline-flex items-center gap-1.5 rounded-full bg-(--cat-tint) font-bold whitespace-nowrap text-(--cat-ink)", size === "sm" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-xs")}
      style={{ "--h": c.hue } as React.CSSProperties}
    >
      {pick(c.label, lang === "bi" ? "en" : lang)}
    </span>
  );
}

/** How much a story matters for the reader's exams: a coloured pill. */
export function RelevanceBadge({ level, lang }: { level: number; lang: Lang }) {
  if (level <= 1) return null;
  const must = level >= 3;
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold", must ? "bg-warn-soft text-warn-ink" : "bg-accent-soft text-accent")}>
      {must ? <Flame className="size-3" strokeWidth={2} /> : <TrendingUp className="size-3" strokeWidth={2} />}
      {must ? t("mustKnow", lang) : t("likely", lang)}
    </span>
  );
}

export function SourceChips({ sources, max = 3 }: { sources: { sourceId: string; url: string }[]; max?: number }) {
  const unique = [...new Map(sources.map((s) => [s.sourceId, s])).values()];
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {unique.slice(0, max).map((s) => (
        <span key={s.sourceId} className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold text-ink-2">
          {sourceById(s.sourceId)?.short ?? s.sourceId}
        </span>
      ))}
      {unique.length > max && <span className="text-xs text-ink-3">+{unique.length - max}</span>}
    </span>
  );
}

export function ProgressRing({
  value,
  max,
  size = 64,
  stroke = 6,
  color = "var(--accent)",
  track = "var(--line)",
  children,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max ? Math.min(value / max, 1) : 0;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/** A thick, rounded progress bar. */
export function Bar({ value, max, color = "bg-accent", track = "bg-line", className }: { value: number; max: number; color?: string; track?: string; className?: string }) {
  return (
    <div className={cx("h-3 overflow-hidden rounded-full", track, className)}>
      <div className={cx("h-full rounded-full transition-all duration-700", color)} style={{ width: `${max ? Math.min(100, (value / max) * 100) : 0}%` }} />
    </div>
  );
}

const CONFETTI_COLORS = ["#4f46e5", "#f97316", "#16a34a", "#ec4899", "#f59e0b", "#0ea5a4", "#8b5cf6"];

/** A one-shot confetti burst. Mount it (e.g. with a changing key) to fire. */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {Array.from({ length: pieces }, (_, i) => {
        // Deterministic spread so renders stay pure.
        const angle = (i / pieces) * Math.PI * 2 + (i % 3) * 0.4;
        const dist = 110 + ((i * 47) % 120);
        return (
          <span
            key={i}
            className="confetti"
            style={
              {
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                "--x": `${Math.cos(angle) * dist}px`,
                "--y": `${Math.sin(angle) * dist - 60}px`,
                "--r": `${(i * 83) % 720 - 360}deg`,
                "--d": `${(i % 6) * 25}ms`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cx("rounded-2xl border border-line bg-surface", className)}>{children}</div>;
}

export function ButtonLink({ href, children, variant = "primary", className }: { href: string; children: React.ReactNode; variant?: "primary" | "orange" | "green" | "violet" | "ghost"; className?: string }) {
  const v = variant === "primary" ? "" : `btn-${variant}`;
  return (
    <Link href={href} className={cx("btn px-5 py-3 text-[15px]", v, className)}>
      {children}
    </Link>
  );
}

export function SectionTitle({ eyebrow, title, right, icon }: { eyebrow?: string; title: React.ReactNode; right?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        {icon}
        <div>
          <h2 className="font-display text-lg leading-tight sm:text-xl">{title}</h2>
          {eyebrow && <div className="text-xs font-medium text-ink-3">{eyebrow}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Empty({ title, children, icon }: { title: string; children?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-line-strong bg-surface px-6 py-10 text-center">
      {icon && <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent">{icon}</div>}
      <div className="font-display text-lg">{title}</div>
      {children && <div className="mx-auto mt-1.5 max-w-md text-sm text-ink-2">{children}</div>}
    </div>
  );
}

export function fmtDate(date: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { timeZone: "UTC", ...opts });
}
