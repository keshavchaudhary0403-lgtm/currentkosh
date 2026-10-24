"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { saveProfile } from "@/app/actions";
import { DateInput, Select } from "./form";
import { EXAMS, STATES, type Lang } from "@/lib/taxonomy";
import { cx } from "./ui";

type Initial = { exams: string[]; state: string | null; lang: Lang; examDate: string | null };

/** `wide`: the button spans the form (welcome card); otherwise it sizes to its label on larger screens. */
export function ProfileForm({ initial, submitLabel, wide = false }: { initial?: Initial; submitLabel: string; wide?: boolean }) {
  const [exams, setExams] = useState<string[]>(initial?.exams ?? []);
  const [state, setState] = useState<string>(initial?.state ?? "");
  const [lang, setLang] = useState<Lang>(initial?.lang ?? "en");
  const [examDate, setExamDate] = useState(initial?.examDate ?? "");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) => setExams((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));

  const submit = () => {
    if (!exams.length) return setError("Pick at least one exam to personalise your feed.");
    setError(null);
    start(() => saveProfile({ exams, state: state || null, lang, examDate: examDate || null }));
  };
  const langs = [
    ["en", "English"],
    ["hi", "हिंदी"],
    ["bi", "EN + हिं"],
  ] as const;
  const li = langs.findIndex(([v]) => v === lang);

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="eyebrow mb-1 text-ink-3">01 · Your exams</legend>
        <p className="mb-3 text-sm text-ink-2">Pick all that apply. Each story is ranked by how much it matters to your exams.</p>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          {EXAMS.map((e) => {
            const on = exams.includes(e.id);
            return (
              <button
                type="button"
                key={e.id}
                onClick={() => toggle(e.id)}
                aria-pressed={on}
                title={e.blurb.en}
                className={cx(
                  "flex min-h-14 items-center gap-2.5 rounded-[18px] px-3 py-2.5 text-left transition duration-200 active:scale-[.97]",
                  on ? "bg-solid text-on-solid shadow-card" : "bg-card shadow-[inset_0_0_0_1px_var(--line-2)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]",
                )}
              >
                <span className={cx("grid size-6 shrink-0 place-items-center rounded-full transition", on ? "pop bg-solid-accent text-solid" : "shadow-[inset_0_0_0_1.5px_var(--line-2)]")}>
                  {on && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{e.label.en}</span>
                  <span lang="hi" className={cx("block truncate text-xs", on ? "opacity-70" : "text-ink-3")}>
                    {e.label.hi}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow mb-2 block text-ink-3">02 · Your state</span>
          <Select value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">No state focus</option>
            {STATES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label.en} · {s.label.hi}
              </option>
            ))}
          </Select>
        </label>
        <label className="block">
          <span className="eyebrow mb-2 block text-ink-3">
            03 · Exam date <span className="normal-case">(optional)</span>
          </span>
          <DateInput value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        </label>
      </div>

      <fieldset>
        <legend className="eyebrow mb-2 text-ink-3">04 · Read in</legend>
        <div className="relative grid grid-cols-3 rounded-full bg-card-2 p-1" role="radiogroup">
          <span
            aria-hidden
            className="absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-solid shadow-card transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)]"
            style={{ transform: `translateX(${li * 100}%)` }}
          />
          {langs.map(([v, label]) => (
            <button
              type="button"
              key={v}
              role="radio"
              onClick={() => setLang(v)}
              aria-checked={lang === v}
              className={cx("relative z-10 h-11 rounded-full px-2 text-sm font-semibold transition-colors", lang === v ? "text-on-solid" : "text-ink-2 hover:text-ink")}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {error && <p className="shake rounded-2xl bg-bad-soft px-4 py-3 text-sm font-semibold text-bad-ink">{error}</p>}
      <div className={wide ? "" : "flex justify-end border-t border-line pt-5"}>
        <button onClick={submit} disabled={pending} className={cx("btn group h-12 px-6 text-[15px]", wide ? "w-full" : "w-full sm:w-auto sm:min-w-44")}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {submitLabel}
          {!pending && <ArrowRight className="size-4 transition group-hover:translate-x-1" />}
        </button>
      </div>
    </div>
  );
}
