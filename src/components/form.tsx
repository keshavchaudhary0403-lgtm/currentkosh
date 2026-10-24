import { CalendarDays, ChevronDown } from "lucide-react";
import { cx } from "./ui";

// One look for every form control: same height, radius, border and focus ring as the rest of the app.
export const field =
  "h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-ink transition outline-none hover:border-line-strong focus:border-accent focus:ring-2 focus:ring-accent/15";

/** Native <select> (keeps the phone's own picker) with the app's styling and chevron. */
export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cx("relative block", className)}>
      <select {...props} className={cx(field, "cursor-pointer appearance-none pr-10")}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-3" />
    </span>
  );
}

/** Native date input styled to match, with a calendar icon in place of the browser's own. */
export function DateInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span className={cx("relative block", className)}>
      <input type="date" {...props} className={cx(field, "appearance-none pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0")} />
      <CalendarDays className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-3" />
    </span>
  );
}
