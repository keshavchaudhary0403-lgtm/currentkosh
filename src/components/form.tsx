import { CalendarDays, ChevronDown } from "lucide-react";
import { cx } from "./ui";

// One look for every form control: pill-ish field, hairline ring, ink ring on focus.
export const field =
  "h-12 w-full rounded-2xl bg-card px-4 text-sm text-ink shadow-[inset_0_0_0_1px_var(--line-2)] transition outline-none hover:shadow-[inset_0_0_0_1px_var(--ink-3)] focus:shadow-[inset_0_0_0_2px_var(--ink)]";

/** Native <select> (keeps the phone's own picker) with the app's styling and chevron. */
export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cx("relative block", className)}>
      <select {...props} className={cx(field, "cursor-pointer appearance-none pr-10")}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-3" />
    </span>
  );
}

/** Native date input styled to match, with a calendar icon in place of the browser's own. */
export function DateInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <span className={cx("relative block", className)}>
      <input
        type="date"
        {...props}
        className={cx(
          field,
          "appearance-none pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
        )}
      />
      <CalendarDays className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-3" />
    </span>
  );
}
