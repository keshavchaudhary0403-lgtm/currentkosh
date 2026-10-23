import type { Metadata } from "next";
import { Brain, Newspaper, ShieldCheck, Target } from "lucide-react";
import Link from "next/link";
import { Wordmark } from "@/components/nav";
import { ProfileForm } from "@/components/profile-form";
import { currentProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Welcome" };

const PILLARS = [
  { icon: Newspaper, title: "One calm daily brief", body: "Government updates, deduplicated and ranked for your exam. A fixed set you can finish." },
  { icon: Target, title: "Tests in real exam style", body: "UPSC statement questions, SSC one-liners, timed mocks with negative marking." },
  { icon: Brain, title: "Revision that sticks", body: "Missed a fact? It comes back tomorrow, then in 3, 7 and 21 days." },
  { icon: ShieldCheck, title: "Every fact sourced", body: "PIB, AIR, DD News, RBI — linked on every card. No ads, no pop-ups." },
];

export default async function Welcome() {
  const profile = await currentProfile();
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="aurora" />
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <Link href="/" aria-label="CurrentKosh home" className="mb-10 flex w-fit items-center gap-2.5 sm:mb-12">
          <Wordmark size={32} />
          <span lang="hi" className="text-sm text-ink-3">
            · करंट कोश
          </span>
        </Link>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="rise">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-2">
              <span className="live-dot" /> Updated daily from official sources
            </p>
            <h1 className="font-display text-[40px] leading-[1.05] sm:text-6xl">
              Current affairs,
              <br />
              <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">without the clutter.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-2">
              One feed for UPSC, State PSC, SSC, Banking, Railways and Defence. Read it, test yourself, and let spaced revision do the remembering.
            </p>
            <p lang="hi" className="mt-2 max-w-md text-ink-3">
              सभी सरकारी परीक्षाओं के लिए एक साफ़-सुथरा करंट अफ़ेयर्स मंच — हिंदी और अंग्रेज़ी में।
            </p>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {PILLARS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-line bg-surface/70 p-4 backdrop-blur">
                  <Icon className="mb-2 size-5 text-accent" />
                  <div className="text-sm font-semibold">{title}</div>
                  <div className="mt-1 text-sm leading-relaxed text-ink-2">{body}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rise rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8" style={{ animationDelay: "120ms" }}>
            <h2 className="mb-6 font-display text-3xl">Set up your feed</h2>
            <ProfileForm initial={profile ?? undefined} submitLabel="Start preparing →" />
          </div>
        </div>
      </div>
    </div>
  );
}
