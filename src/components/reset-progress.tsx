"use client";

import { useState } from "react";
import { HardDrive, RotateCcw } from "lucide-react";
import { resetProgress, totals, useProgress } from "@/lib/progress-store";

/** Shows what this device has stored and lets the reader clear it (two taps, no browser dialog). */
export function ResetProgress() {
  const p = useProgress();
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const tot = totals(p);
  const stored = tot.read + p.bookmarks.length + p.attempts.length;
  return (
    <section className="rounded-3xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-ink-2">
          <HardDrive className="size-5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-extrabold">Progress on this device</div>
          <p className="mt-0.5 text-xs font-medium text-ink-2">
            {tot.read} read · {p.bookmarks.length} saved · {p.attempts.length} tests. Stored only in this browser, never on our servers, so other devices and
            other people can&apos;t see it.
          </p>
        </div>
      </div>
      {done ? (
        <p className="mt-3 rounded-2xl bg-good-soft px-3 py-2 text-sm font-bold text-good">Cleared. This device now starts fresh.</p>
      ) : confirm ? (
        <div className="mt-3 flex items-center gap-2">
          <span className="flex-1 text-sm font-bold text-bad">Delete all progress on this device?</span>
          <button onClick={() => setConfirm(false)} className="btn btn-ghost px-3 py-2 text-[15px]">
            Cancel
          </button>
          <button
            onClick={() => {
              resetProgress();
              setConfirm(false);
              setDone(true);
            }}
            className="btn btn-red px-3 py-2 text-[15px]"
          >
            Delete
          </button>
        </div>
      ) : (
        stored > 0 && (
          <button onClick={() => setConfirm(true)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-ink-3 hover:text-bad">
            <RotateCcw className="size-4" /> Reset progress on this device
          </button>
        )
      )}
    </section>
  );
}
