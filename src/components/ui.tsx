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
        <span lang="hi" className={cx("mt-1.5 block text-ink-2", hiClassName)}>
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
      className={cx(
        "cat inline-flex items-center gap-1.5 rounded-full bg-(--cat-tint) font-semibold whitespace-nowrap text-(--cat-ink)",
        size === "sm" ? "h-7 px-2.5 text-xs" : "h-6 px-2 text-[11px]",
      )}
      style={{ "--h": c.hue } as React.CSSProperties}
    >
      <span className="size-1.5 rounded-full bg-(--cat-solid)" />
      {pick(c.label, lang === "bi" ? "en" : lang)}
    </span>
  );
}

/** How much a story matters for the reader's exams. */
export function RelevanceBadge({ level, lang }: { level: number; lang: Lang }) {
  if (level <= 1) return null;
  const must = level >= 3;
  return (
    <span
      className={cx(
        "inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-semibold",
        must ? "bg-amber-soft text-amber-ink" : "bg-cobalt-soft text-cobalt-ink",
      )}
    >
      {must ? <Flame className="size-3" strokeWidth={2.4} /> : <TrendingUp className="size-3" strokeWidth={2.4} />}
      {must ? t("mustKnow", lang) : t("likely", lang)}
    </span>
  );
}

export function SourceChips({ sources, max = 3 }: { sources: { sourceId: string; url: string }[]; max?: number }) {
  const unique = [...new Map(sources.map((s) => [s.sourceId, s])).values()];
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {unique.slice(0, max).map((s) => (
        <span key={s.sourceId} className="eyebrow rounded-full bg-card-2 px-2 py-0.5 text-ink-2">
          {sourceById(s.sourceId)?.short ?? s.sourceId}
        </span>
      ))}
      {unique.length > max && <span className="text-xs text-ink-3">+{unique.length - max}</span>}
    </span>
  );
}

/** Circular progress. The stroke draws in on mount. */
export function ProgressRing({
  value,
  max,
  size = 64,
  stroke = 6,
  color = "var(--signal)",
  track = "var(--line)",
  children,
  label,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: React.ReactNode;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max ? Math.min(value / max, 1) : 0;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }} role={label ? "img" : undefined} aria-label={label}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          className="ring-draw"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ "--ring-c": c, transition: "stroke-dashoffset 0.8s cubic-bezier(.2,.8,.2,1)" } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

/** A slim, rounded progress bar that grows in. */
export function Bar({ value, max, color = "bg-signal", track = "bg-line", className }: { value: number; max: number; color?: string; track?: string; className?: string }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={cx("h-2.5 overflow-hidden rounded-full", track, className)} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cx("grow-x h-full rounded-full transition-[width] duration-700", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** A number that counts up from zero (CSS only). Falls back to the plain number for screen readers. */
export function Count({ to, className }: { to: number; className?: string }) {
  return (
    <span className={cx("tnum", className)}>
      <span aria-hidden className="count" style={{ "--to": Math.round(to) } as React.CSSProperties} />
      <span className="sr-only">{Math.round(to)}</span>
    </span>
  );
}

const CONFETTI_COLORS = ["#c8f135", "#3557ff", "#e5306f", "#0ea67a", "#f0a20b", "#10110e", "#ffffff"];

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
                "--r": `${((i * 83) % 720) - 360}deg`,
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
  return <div className={cx("card", className)}>{children}</div>;
}

export function ButtonLink({ href, children, variant = "signal", className }: { href: string; children: React.ReactNode; variant?: "signal" | "ink" | "ghost" | "cobalt" | "flare" | "mint"; className?: string }) {
  return (
    <Link href={href} className={cx("btn px-5 text-[15px]", variant !== "signal" && `btn-${variant}`, className)}>
      {children}
    </Link>
  );
}

/** Page header: a mono eyebrow, a big serif title and an optional line of context. */
export function PageHeader({ eyebrow, title, sub, right, className }: { eyebrow?: React.ReactNode; title: React.ReactNode; sub?: React.ReactNode; right?: React.ReactNode; className?: string }) {
  return (
    <header className={cx("rise flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-2 text-ink-3">{eyebrow}</div>}
        <h1 className="font-display text-[30px] sm:text-[40px]">{title}</h1>
        {sub && <p className="mt-2 max-w-2xl text-[15px] text-ink-2">{sub}</p>}
      </div>
      {right}
    </header>
  );
}

export function SectionTitle({ eyebrow, title, right, icon }: { eyebrow?: string; title: React.ReactNode; right?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2.5">
        {icon}
        <div className="min-w-0">
          {eyebrow && <div className="eyebrow mb-1 text-ink-3">{eyebrow}</div>}
          <h2 className="font-display text-[22px] sm:text-[27px]">{title}</h2>
        </div>
      </div>
      {right}
    </div>
  );
}

/** Small stat tile: big number, small label. */
export function Stat({ value, label, hint, tone = "bg-card", className }: { value: React.ReactNode; label: string; hint?: string; tone?: string; className?: string }) {
  return (
    <div className={cx("rounded-[22px] p-4", tone, className)}>
      <div className="font-display text-[31px] leading-none tnum">{value}</div>
      <div className="mt-2 text-xs font-semibold">{label}</div>
      {hint && <div className="text-[11px] opacity-70">{hint}</div>}
    </div>
  );
}

export function Empty({ title, children, icon }: { title: string; children?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="rise card border-dashed px-6 py-12 text-center">
      {icon && <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-signal text-on-signal">{icon}</div>}
      <div className="font-display text-3xl">{title}</div>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-ink-2">{children}</div>}
    </div>
  );
}

export function fmtDate(date: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { timeZone: "UTC", ...opts });
}
