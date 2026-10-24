"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Lang } from "@/lib/taxonomy";
import { cx, fmtDate } from "./ui";

const hrefFor = (date: string, latest: string) => (date === latest ? "/" : `/?date=${date}`);

/** Compact date control: a pill that opens a sheet with previous/next day and a month calendar. */
export function DayPicker({ dates, selected, latest, lang }: { dates: { date: string; count: number }[]; selected: string; latest: string; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(selected.slice(0, 7));
  const box = useRef<HTMLDivElement>(null);
  const available = new Set(dates.map((d) => d.date));
  const months = [...new Set(dates.map((d) => d.date.slice(0, 7)))]; // newest first
  const idx = dates.findIndex((d) => d.date === selected);
  const newer = idx > 0 ? dates[idx - 1].date : null;
  const older = idx >= 0 && idx < dates.length - 1 ? dates[idx + 1].date : null;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)];
  const mi = months.indexOf(month);
  const weekdays = ui === "hi" ? ["सो", "मं", "बु", "गु", "शु", "श", "र"] : ["M", "T", "W", "T", "F", "S", "S"];
  const isLatest = selected === latest;

  return (
    <div ref={box} className="relative">
      <button
        onClick={() => {
          setMonth(selected.slice(0, 7));
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-label={ui === "hi" ? "तारीख़ बदलें" : "Change date"}
        className={cx(
          "flex h-11 items-center gap-2 rounded-full pr-3 pl-3.5 text-sm font-semibold whitespace-nowrap transition active:scale-95",
          open ? "bg-solid text-on-solid" : "bg-card shadow-[inset_0_0_0_1px_var(--line-2)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]",
        )}
      >
        {isLatest ? <span className="live-dot" /> : <CalendarDays className="size-4" />}
        {isLatest ? (ui === "hi" ? "आज" : "Today") : fmtDate(selected, ui, { day: "numeric", month: "short" })}
        <ChevronDown className={cx("size-4 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="popover absolute top-[52px] left-0 z-50 w-[312px] rounded-[24px] border border-line bg-card p-3 shadow-float">
          <div className="mb-3 grid grid-cols-2 gap-2">
            {older ? (
              <Link href={hrefFor(older, latest)} onClick={() => setOpen(false)} className="btn btn-ghost h-11 text-xs">
                <ChevronLeft className="size-4" /> {fmtDate(older, ui, { day: "numeric", month: "short" })}
              </Link>
            ) : (
              <span />
            )}
            {newer ? (
              <Link href={hrefFor(newer, latest)} onClick={() => setOpen(false)} className="btn btn-ghost h-11 text-xs">
                {fmtDate(newer, ui, { day: "numeric", month: "short" })} <ChevronRight className="size-4" />
              </Link>
            ) : (
              <span />
            )}
          </div>
          <div className="mb-2 flex items-center justify-between">
            <button disabled={mi >= months.length - 1} onClick={() => setMonth(months[mi + 1])} className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-card-2 disabled:opacity-30" aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-semibold">{fmtDate(`${month}-01`, ui, { month: "long", year: "numeric" })}</span>
            <button disabled={mi <= 0} onClick={() => setMonth(months[mi - 1])} className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-card-2 disabled:opacity-30" aria-label="Next month">
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map((w, i) => (
              <span key={i} className="py-1 font-mono text-[10px] text-ink-3">
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
                  className={cx("grid aspect-square place-items-center rounded-full text-sm font-semibold transition tnum", d === selected ? "bg-solid text-on-solid" : "text-ink hover:bg-signal hover:text-on-signal")}
                >
                  {Number(d.slice(8))}
                </Link>
              ) : (
                <span key={d} className="grid aspect-square place-items-center text-sm text-ink-3/40 tnum">
                  {Number(d.slice(8))}
                </span>
              ),
            )}
          </div>
          {!isLatest && (
            <Link href="/" onClick={() => setOpen(false)} className="btn mt-3 w-full text-sm">
              {ui === "hi" ? "ताज़ा दिन पर जाएँ" : "Jump to latest"}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
