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
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-5xl">{ui === "hi" ? "कहानी-क्रम" : "Storylines"}</h1>
        <p className="mt-2 max-w-2xl text-ink-2">News rarely happens once. Each storyline collects every update on one issue — a trade deal, a bill, a mission — so you can revise how it evolved, not just the latest headline.</p>
      </header>
      {threads.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {threads.map((t) => (
            <Link key={t.key} href={`/thread/${t.key}`} className="rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-line-strong">
              <div className="text-[11px] font-semibold tracking-wider text-ink-3 uppercase">
                {t.count} {t.count === 1 ? "update" : "updates"} · latest {fmtDate(t.lastDate, ui)}
              </div>
              <div lang={ui === "hi" ? "hi" : undefined} className="mt-2 text-lg font-semibold">
                {pick(t.title, ui)}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty title="No storylines yet" />
      )}
    </div>
  );
}
