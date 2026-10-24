import type { Metadata } from "next";
import { Brain, Newspaper, ShieldCheck, Target } from "lucide-react";
import Link from "next/link";
import { Wordmark } from "@/components/nav";
import { ProfileForm } from "@/components/profile-form";
import { currentProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Welcome" };

const PILLARS = [
  { icon: Newspaper, title: "A daily mission", body: "10 ranked stories for your exam. Finish, tick, done.", cls: "bg-accent-soft", ink: "bg-accent" },
  { icon: Target, title: "Real exam-style tests", body: "UPSC statements, SSC one-liners, timed mocks.", cls: "bg-accent-2-soft", ink: "bg-accent-2" },
  { icon: Brain, title: "Revision that sticks", body: "Flashcards return right before you forget.", cls: "bg-violet-soft", ink: "bg-violet" },
  { icon: ShieldCheck, title: "Every fact sourced", body: "PIB, AIR, DD News, RBI. No ads, no pop-ups.", cls: "bg-good-soft", ink: "bg-good" },
];

export default async function Welcome() {
  const profile = await currentProfile();
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <Link href="/" aria-label="CurrentKosh home" className="mb-10 flex w-fit items-center gap-2.5 sm:mb-12">
          <Wordmark size={32} />
          <span lang="hi" className="text-sm text-ink-3">
            · करंट कोश
          </span>
        </Link>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="rise">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-good-soft px-3 py-1 text-xs font-bold text-good">
              <span className="live-dot" /> Updated daily from official sources
            </p>
            <h1 className="font-display text-[40px] leading-[1.05] sm:text-6xl">
              Crack current affairs,
              <br />
              <span className="text-accent">one day at a time.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed font-medium text-ink-2">
              One feed for UPSC, State PSC, SSC, Banking, Railways and Defence. Read it, test yourself, and let spaced revision do the remembering.
            </p>
            <p lang="hi" className="mt-2 max-w-md text-ink-3">
              सभी सरकारी परीक्षाओं के लिए एक साफ़-सुथरा करंट अफ़ेयर्स मंच — हिंदी और अंग्रेज़ी में।
            </p>
            <div className="mt-10 hidden gap-3 sm:grid sm:grid-cols-2">
              {PILLARS.map(({ icon: Icon, title, body, cls, ink }) => (
                <div key={title} className={`flex gap-3 rounded-3xl p-4 ${cls}`}>
                  <span className={`grid size-11 shrink-0 place-items-center rounded-2xl text-white ${ink}`}>
                    <Icon className="size-5" strokeWidth={2.4} />
                  </span>
                  <span>
                    <span className="block font-display text-base">{title}</span>
                    <span className="mt-0.5 block text-sm leading-snug font-medium text-ink-2">{body}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rise rounded-3xl border-2 border-line bg-surface p-5 sm:p-8" style={{ animationDelay: "120ms" }}>
            <h2 className="font-display text-2xl sm:text-3xl">Set up in 30 seconds</h2>
            <p className="mb-6 text-sm font-medium text-ink-2">Free. No sign-up needed to start.</p>
            <ProfileForm initial={profile ?? undefined} submitLabel="Start preparing →" />
          </div>
        </div>
      </div>
    </div>
  );
}
