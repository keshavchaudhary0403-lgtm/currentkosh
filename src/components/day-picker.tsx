"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import type { Lang } from "@/lib/taxonomy";
import { cx, fmtDate } from "./ui";

/**
 * Browse any day in the archive: month tabs on top, that month's days below.
 * Opens on the month of the day being read and scrolls it into view.
 */
export function DayPicker({ dates, selected, latest, lang }: { dates: { date: string; count: number }[]; selected: string; latest: string; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const months = [...new Set(dates.map((d) => d.date.slice(0, 7)))];
  const [month, setMonth] = useState(selected.slice(0, 7));
  const days = dates.filter((d) => d.date.startsWith(month));
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    strip.current?.querySelector<HTMLElement>("[data-selected]")?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [month]);

  return (
    <div className="mb-5 space-y-2.5">
      <div className="no-scrollbar -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <CalendarDays className="mr-1 size-4 shrink-0 text-ink-3" strokeWidth={2.4} />
        {months.map((m) => (
          <button
            key={m}
            onClick={() => setMonth(m)}
            className={cx(
              "shrink-0 rounded-full px-3 py-1 text-[13px] font-bold whitespace-nowrap transition active:scale-95",
              m === month ? "bg-ink text-bg" : "text-ink-2 hover:bg-surface-2",
            )}
          >
            {fmtDate(`${m}-01`, ui, { month: "short", year: m.slice(0, 4) === latest.slice(0, 4) ? undefined : "2-digit" })}
          </button>
        ))}
      </div>
      <nav ref={strip} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" aria-label="Choose a day">
        {days.map((d) => (
          <Link
            key={d.date}
            href={d.date === latest ? "/" : `/?date=${d.date}`}
            data-selected={d.date === selected ? "" : undefined}
            className={cx(
              "flex min-w-[54px] shrink-0 flex-col items-center rounded-2xl border-2 px-2 py-1.5 text-center transition active:scale-95",
              d.date === selected ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink-2 hover:border-line-strong",
            )}
          >
            <span className="text-[10px] font-extrabold uppercase">{fmtDate(d.date, ui, { weekday: "short" })}</span>
            <span className="font-display text-lg leading-tight">{fmtDate(d.date, ui, { day: "numeric" })}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
