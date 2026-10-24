"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Lang } from "@/lib/taxonomy";
import { cx, fmtDate } from "./ui";

const hrefFor = (date: string, latest: string) => (date === latest ? "/" : `/?date=${date}`);

/**
 * One compact date control: previous/next day arrows and a button that opens a month calendar
 * of every day with stories. Replaces the always-visible day strip.
 */
export function DayPicker({ dates, selected, latest, lang }: { dates: { date: string; count: number }[]; selected: string; latest: string; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(selected.slice(0, 7));
  const box = useRef<HTMLDivElement>(null);
  const available = new Set(dates.map((d) => d.date));
  const months = [...new Set(dates.map((d) => d.date.slice(0, 7)))]; // newest first
  const idx = dates.findIndex((d) => d.date === selected); // dates are newest first
  const newer = idx > 0 ? dates[idx - 1].date : null;
  const older = idx >= 0 && idx < dates.length - 1 ? dates[idx + 1].date : null;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  // Calendar grid for the month being viewed (weeks start Monday).
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)];
  const mi = months.indexOf(month);
  const weekdays = ui === "hi" ? ["सो", "मं", "बु", "गु", "शु", "श", "र"] : ["M", "T", "W", "T", "F", "S", "S"];

  const arrow = "grid size-9 place-items-center rounded-xl border border-line bg-surface text-ink-2 transition hover:text-ink";
  return (
    <div ref={box} className="relative flex items-center gap-1.5">
      {older ? (
        <Link href={hrefFor(older, latest)} aria-label="Previous day" className={arrow}>
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cx(arrow, "opacity-40")}>
          <ChevronLeft className="size-4" />
        </span>
      )}
      <button
        onClick={() => {
          setMonth(selected.slice(0, 7));
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm font-semibold text-ink-2 hover:text-ink"
      >
        <CalendarDays className="size-4 text-accent" />
        {fmtDate(selected, ui, { weekday: "short", day: "numeric", month: "short" })}
        <ChevronDown className={cx("size-4 transition", open && "rotate-180")} />
      </button>
      {newer ? (
        <Link href={hrefFor(newer, latest)} aria-label="Next day" className={arrow}>
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cx(arrow, "opacity-40")}>
          <ChevronRight className="size-4" />
        </span>
      )}
      {selected !== latest && (
        <Link href="/" className="ml-1 text-sm font-semibold text-accent">
          {ui === "hi" ? "आज पर जाएँ" : "Jump to latest"}
        </Link>
      )}

      {open && (
        <div className="pop absolute top-11 left-0 z-40 w-[296px] rounded-2xl border border-line bg-surface p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <button disabled={mi >= months.length - 1} onClick={() => setMonth(months[mi + 1])} className="grid size-8 place-items-center rounded-lg text-ink-2 hover:bg-surface-2 disabled:opacity-30" aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-semibold">{fmtDate(`${month}-01`, ui, { month: "long", year: "numeric" })}</span>
            <button disabled={mi <= 0} onClick={() => setMonth(months[mi - 1])} className="grid size-8 place-items-center rounded-lg text-ink-2 hover:bg-surface-2 disabled:opacity-30" aria-label="Next month">
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map((w, i) => (
              <span key={i} className="py-1 text-[11px] font-semibold text-ink-3">
                {w}
              </span>
            ))}
            {cells.map((d, i) =>
              !d ? (
                <span key={i} />
              ) : available.has(d) ? (
                <Link
                  key={d}
                  href={hrefFor(d, latest)}
                  onClick={() => setOpen(false)}
                  className={cx("grid aspect-square place-items-center rounded-lg text-sm font-semibold transition", d === selected ? "bg-accent text-white" : "text-ink hover:bg-accent-soft hover:text-accent")}
                >
                  {Number(d.slice(8))}
                </Link>
              ) : (
                <span key={d} className="grid aspect-square place-items-center text-sm text-ink-3/50">
                  {Number(d.slice(8))}
                </span>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
