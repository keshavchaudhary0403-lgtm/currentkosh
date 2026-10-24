"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { Lang } from "@/lib/taxonomy";
import { cx, fmtDate } from "./ui";

const hrefFor = (date: string, latest: string) => (date === latest ? "/" : `/?date=${date}`);

/**
 * The date strip: a swipeable row of recent news days (the selected one in ink), plus a
 * calendar button that opens a month grid of every day with stories.
 */
export function DayPicker({ dates, selected, latest, lang }: { dates: { date: string; count: number }[]; selected: string; latest: string; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(selected.slice(0, 7));
  const box = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const available = new Set(dates.map((d) => d.date));
  const months = [...new Set(dates.map((d) => d.date.slice(0, 7)))]; // newest first
  const idx = Math.max(0, dates.findIndex((d) => d.date === selected)); // dates are newest first
  // A window of days around the selected one, oldest on the left.
  const start = Math.max(0, idx - 8);
  const windowDays = dates.slice(start, start + 24).reverse();

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

  // Keep the selected day in view without scrolling the page.
  useLayoutEffect(() => {
    const el = strip.current?.querySelector<HTMLElement>("[data-selected=true]");
    if (el && strip.current) strip.current.scrollLeft = el.offsetLeft - strip.current.clientWidth / 2 + el.clientWidth / 2;
  }, [selected]);

  // Calendar grid for the month being viewed (weeks start Monday).
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)];
  const mi = months.indexOf(month);
  const weekdays = ui === "hi" ? ["सो", "मं", "बु", "गु", "शु", "श", "र"] : ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div ref={box} className="relative flex min-w-0 items-center gap-2">
      <button
        onClick={() => {
          setMonth(selected.slice(0, 7));
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-label={ui === "hi" ? "कैलेंडर खोलें" : "Open calendar"}
        className={cx(
          "grid h-[60px] w-12 shrink-0 place-items-center rounded-[18px] transition active:scale-95",
          open ? "bg-solid text-on-solid" : "bg-card text-ink shadow-[inset_0_0_0_1px_var(--line-2)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]",
        )}
      >
        <CalendarDays className="size-5" />
      </button>
      <div ref={strip} className="no-scrollbar fade-x flex min-w-0 snap-x gap-1.5 overflow-x-auto scroll-smooth py-1 pr-6 pl-1">
        {windowDays.map((d) => {
          const on = d.date === selected;
          return (
            <Link
              key={d.date}
              href={hrefFor(d.date, latest)}
              data-selected={on}
              aria-current={on ? "date" : undefined}
              aria-label={`${fmtDate(d.date, ui, { weekday: "long", day: "numeric", month: "long" })} · ${d.count}`}
              className={cx(
                "relative flex h-[60px] w-12 shrink-0 snap-center flex-col items-center justify-center rounded-[18px] transition duration-300 active:scale-95",
                on ? "bg-solid text-on-solid shadow-card" : "text-ink-2 hover:bg-card hover:text-ink",
              )}
            >
              <span className={cx("font-mono text-[10px] uppercase", on ? "text-solid-accent" : "text-ink-3")}>{fmtDate(d.date, ui, { weekday: "short" }).slice(0, 3)}</span>
              <span className="font-display text-[24px] leading-none tnum">{Number(d.date.slice(8))}</span>
              {d.date === latest && <span className={cx("absolute top-1.5 right-1.5 size-1.5 rounded-full", on ? "bg-solid-accent" : "bg-good")} />}
            </Link>
          );
        })}
      </div>

      {open && (
        <div className="popover absolute top-[68px] left-0 z-40 w-[304px] rounded-[24px] border border-line bg-card p-3 shadow-float">
          <div className="mb-2 flex items-center justify-between">
            <button disabled={mi >= months.length - 1} onClick={() => setMonth(months[mi + 1])} className="grid size-10 place-items-center rounded-full text-ink-2 hover:bg-card-2 disabled:opacity-30" aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-semibold">{fmtDate(`${month}-01`, ui, { month: "long", year: "numeric" })}</span>
            <button disabled={mi <= 0} onClick={() => setMonth(months[mi - 1])} className="grid size-10 place-items-center rounded-full text-ink-2 hover:bg-card-2 disabled:opacity-30" aria-label="Next month">
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
                  className={cx(
                    "grid aspect-square place-items-center rounded-full text-sm font-semibold transition tnum",
                    d === selected ? "bg-solid text-on-solid" : "text-ink hover:bg-signal hover:text-on-signal",
                  )}
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
          {selected !== latest && (
            <Link href="/" onClick={() => setOpen(false)} className="btn mt-3 w-full text-sm">
              {ui === "hi" ? "ताज़ा दिन पर जाएँ" : "Jump to latest"}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
