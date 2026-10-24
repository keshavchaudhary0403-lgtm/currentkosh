"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { saveProfile } from "@/app/actions";
import { EXAMS, STATES, type Lang } from "@/lib/taxonomy";

type Initial = { exams: string[]; state: string | null; lang: Lang; examDate: string | null };

export function ProfileForm({ initial, submitLabel }: { initial?: Initial; submitLabel: string }) {
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

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-0.5 text-sm font-semibold">Which exams are you preparing for?</legend>
        <p className="mb-2.5 text-xs text-ink-3">Pick all that apply. Each story is ranked by how much it matters to your exams.</p>
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
                className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition active:scale-[.98] ${on ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-line-strong"}`}
              >
                <span className={`grid size-5 shrink-0 place-items-center rounded-md border ${on ? "pop border-accent bg-accent text-white" : "border-line-strong"}`}>{on && <Check className="size-3.5" strokeWidth={3} />}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{e.label.en}</span>
                  <span lang="hi" className="block truncate text-xs text-ink-3">
                    {e.label.hi}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Your state</span>
          <select value={state} onChange={(e) => setState(e.target.value)} className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm">
            <option value="">No state focus</option>
            {STATES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label.en} · {s.label.hi}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">
            Exam date <span className="font-normal text-ink-3">(optional)</span>
          </span>
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm" />
        </label>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-semibold">Read in</legend>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["en", "English"],
              ["hi", "हिंदी"],
              ["bi", "English + हिंदी"],
            ] as const
          ).map(([v, label]) => (
            <button
              type="button"
              key={v}
              onClick={() => setLang(v)}
              aria-pressed={lang === v}
              className={`rounded-xl border px-2 py-2 text-sm font-semibold transition active:scale-95 ${lang === v ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink-2"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {error && <p className="shake rounded-xl bg-bad-soft px-3 py-2 text-sm font-semibold text-bad">{error}</p>}
      <button onClick={submit} disabled={pending} className="btn w-full px-6 py-3 text-[15px]">
        {pending && <Loader2 className="size-4 animate-spin" />}
        {submitLabel}
      </button>
    </div>
  );
}
