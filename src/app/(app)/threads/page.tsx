import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Empty, fmtDate } from "@/components/ui";
import { currentProfile } from "@/lib/profile";
import { activeThreads } from "@/lib/store";
import { pick } from "@/lib/taxonomy";

export const metadata: Metadata = { title: "Storylines" };

export default async function Threads() {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const ui = profile.lang === "bi" ? "en" : profile.lang;
  const threads = activeThreads(100);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-[28px] sm:text-4xl">{ui === "hi" ? "कहानी-क्रम" : "Storylines"}</h1>
        <p className="mt-1 max-w-2xl text-sm font-medium text-ink-2">Every update on one issue, in order. Revise how it evolved, not just the headline.</p>
      </header>
      {threads.length ? (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {threads.map((t) => (
            <Link key={t.key} href={`/thread/${t.key}`} className="tap flex items-start gap-3 rounded-2xl bg-surface p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-pink-soft font-display text-base text-pink">{t.count}</span>
              <span className="min-w-0">
                <span lang={ui === "hi" ? "hi" : undefined} className="block font-bold leading-snug">
                  {pick(t.title, ui)}
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-ink-3">
                  {t.count === 1 ? "update" : "updates"} · latest {fmtDate(t.lastDate, ui)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <Empty title="No storylines yet" />
      )}
    </div>
  );
}
