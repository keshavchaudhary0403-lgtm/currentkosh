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
    <section className="card p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-card-2 text-ink-2">
          <HardDrive className="size-5" strokeWidth={1.9} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Progress on this device</div>
          <p className="mt-0.5 text-xs text-ink-2">
            <span className="font-mono">
              {tot.read} read · {p.bookmarks.length} saved · {p.attempts.length} tests
            </span>
            . Stored only in this browser, never on our servers, so other devices and other people can&apos;t see it.
          </p>
        </div>
      </div>
      {done ? (
        <p className="pop mt-4 rounded-2xl bg-good-soft px-3 py-2.5 text-sm font-semibold text-good-ink">Cleared. This device now starts fresh.</p>
      ) : confirm ? (
        <div className="popover mt-4 flex flex-wrap items-center gap-2 rounded-[20px] bg-bad-soft p-2 pl-3">
          <span className="flex-1 text-sm font-semibold text-bad-ink">Delete all progress on this device?</span>
          <button onClick={() => setConfirm(false)} className="btn btn-ghost px-4 text-sm">
            Cancel
          </button>
          <button
            onClick={() => {
              resetProgress();
              setConfirm(false);
              setDone(true);
            }}
            className="btn btn-bad px-4 text-sm"
          >
            Delete
          </button>
        </div>
      ) : (
        stored > 0 && (
          <button onClick={() => setConfirm(true)} className="mt-3 inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-bad-ink">
            <RotateCcw className="size-4" /> Reset progress on this device
          </button>
        )
      )}
    </section>
  );
}
