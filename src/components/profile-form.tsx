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
    <div className="space-y-8">
      <fieldset>
        <legend className="mb-1 font-display text-base">Which exams are you preparing for?</legend>
        <p className="mb-3 text-sm text-ink-2">Pick all that apply. Current affairs overlap a lot — we rank each story by how much it matters to your exams.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {EXAMS.map((e) => {
            const on = exams.includes(e.id);
            return (
              <button
                type="button"
                key={e.id}
                onClick={() => toggle(e.id)}
                aria-pressed={on}
                className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition active:scale-[.98] ${on ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-line-strong"}`}
              >
                <span className={`grid size-6 shrink-0 place-items-center rounded-lg border-2 ${on ? "pop border-accent bg-accent text-white" : "border-line-strong"}`}>{on && <Check className="size-4" strokeWidth={3.5} />}</span>
                <span>
                  <span className="block text-sm font-extrabold">{e.label.en}</span>
                  <span lang="hi" className="block text-xs text-ink-3">
                    {e.label.hi}
                  </span>
                  <span className="block text-xs text-ink-2">{e.blurb.en}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block font-display text-base">Your state</span>
          <span className="mb-2 block text-xs text-ink-2">Adds state-specific news (e.g. UP for UPPSC) to your feed.</span>
          <select value={state} onChange={(e) => setState(e.target.value)} className="w-full rounded-xl border-2 border-line bg-surface px-3 py-2.5 text-sm font-semibold">
            <option value="">No state focus</option>
            {STATES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label.en} · {s.label.hi}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block font-display text-base">Exam date (optional)</span>
          <span className="mb-2 block text-xs text-ink-2">We&apos;ll show a countdown and plan revision around it.</span>
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="w-full rounded-xl border-2 border-line bg-surface px-3 py-2 text-sm font-semibold" />
        </label>
      </div>

      <fieldset>
        <legend className="mb-2 font-display text-base">Read in</legend>
        <div className="flex flex-wrap gap-2">
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
              className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition active:scale-95 ${lang === v ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface text-ink-2"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {error && <p className="shake rounded-xl bg-bad-soft px-3 py-2 text-sm font-bold text-bad">{error}</p>}
      <button
        onClick={submit}
        disabled={pending}
        className="btn w-full px-6 py-4 text-base sm:w-auto"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {submitLabel}
      </button>
    </div>
  );
}
