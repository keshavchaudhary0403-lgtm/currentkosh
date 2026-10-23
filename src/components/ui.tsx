import Link from "next/link";
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
      className={cx("inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap", size === "sm" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]")}
      style={{ background: `oklch(0.62 0.14 ${c.hue} / 0.12)`, color: `oklch(0.55 0.14 ${c.hue})` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: `oklch(0.62 0.16 ${c.hue})` }} />
      {pick(c.label, lang === "bi" ? "en" : lang)}
    </span>
  );
}

export function RelevanceBadge({ level, lang }: { level: number; lang: Lang }) {
  if (level <= 0) return null;
  const label = level >= 3 ? t("mustKnow", lang) : level === 2 ? t("likely", lang) : t("low", lang);
  return (
    <span className={cx("inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase", level >= 3 ? "text-accent-2" : level === 2 ? "text-accent" : "text-ink-3")}>
      <span className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span key={i} className={cx("h-2.5 w-1 rounded-full", i <= level ? "bg-current" : "bg-line-strong")} />
        ))}
      </span>
      {label}
    </span>
  );
}

export function SourceChips({ sources, max = 3 }: { sources: { sourceId: string; url: string }[]; max?: number }) {
  const unique = [...new Map(sources.map((s) => [s.sourceId, s])).values()];
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {unique.slice(0, max).map((s) => (
        <span key={s.sourceId} className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-ink-2">
          {sourceById(s.sourceId)?.short ?? s.sourceId}
        </span>
      ))}
      {unique.length > max && <span className="text-[11px] text-ink-3">+{unique.length - max}</span>}
    </span>
  );
}

export function ProgressRing({ value, max, size = 64, stroke = 6, children }: { value: number; max: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max ? Math.min(value / max, 1) : 0;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-strong)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.2,.8,.2,1)" }}
        />
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cx("rounded-2xl border border-line bg-surface shadow-card", className)}>{children}</div>;
}

export function ButtonLink({ href, children, variant = "primary", className }: { href: string; children: React.ReactNode; variant?: "primary" | "ghost"; className?: string }) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[.98]",
        variant === "primary" ? "bg-ink text-bg hover:opacity-90" : "border border-line-strong bg-surface text-ink hover:bg-surface-2",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SectionTitle({ eyebrow, title, right }: { eyebrow?: string; title: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="mb-1 text-xs font-semibold tracking-[0.14em] text-ink-3 uppercase">{eyebrow}</div>}
        <h2 className="font-display text-2xl leading-tight sm:text-3xl">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center">
      <div className="font-display text-2xl">{title}</div>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-ink-2">{children}</div>}
    </div>
  );
}

export function fmtDate(date: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { timeZone: "UTC", ...opts });
}
