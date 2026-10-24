import type { Metadata } from "next";
import { Brain, Newspaper, ShieldCheck, Target } from "lucide-react";
import Link from "next/link";
import { Wordmark } from "@/components/nav";
import { ProfileForm } from "@/components/profile-form";
import { currentProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Welcome" };

const PILLARS = [
  { icon: Newspaper, title: "A calm daily plan", body: "10 stories ranked for your exam, then a short quiz.", cls: "bg-accent-soft", ink: "bg-accent" },
  { icon: Target, title: "Real exam-style tests", body: "UPSC statements, SSC one-liners, timed mocks.", cls: "bg-accent-2-soft", ink: "bg-accent-2" },
  { icon: Brain, title: "Revision that sticks", body: "Flashcards return right before you forget.", cls: "bg-violet-soft", ink: "bg-violet" },
  { icon: ShieldCheck, title: "Every fact sourced", body: "PIB, AIR, DD News, RBI. No ads, no pop-ups.", cls: "bg-good-soft", ink: "bg-good" },
];

export default async function Welcome() {
  const profile = await currentProfile();
  return (
    <div className="flex min-h-dvh items-center">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-6">
        <Link href="/" aria-label="CurrentKosh home" className="mb-6 flex w-fit items-center gap-2.5 lg:mb-8">
          <Wordmark size={32} text={20} />
          <span lang="hi" className="text-sm text-ink-3">
            · करंट कोश
          </span>
        </Link>
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          <div className="rise">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-good-soft px-3 py-1 text-xs font-semibold text-good">
              <span className="live-dot" /> Updated daily from official sources
            </p>
            <h1 className="font-display text-[32px] leading-[1.1] sm:text-[42px]">
              Crack current affairs,
              <br />
              <span className="text-accent">one day at a time.</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-2">
              One feed for UPSC, State PSC, SSC, Banking, Railways and Defence. Read it, test yourself, and let spaced revision do the remembering.
            </p>
            <p lang="hi" className="mt-1.5 max-w-md text-sm text-ink-3">
              सभी सरकारी परीक्षाओं के लिए एक साफ़-सुथरा करंट अफ़ेयर्स मंच — हिंदी और अंग्रेज़ी में।
            </p>
            <ul className="mt-6 hidden gap-x-6 gap-y-3 sm:grid sm:grid-cols-2">
              {PILLARS.map(({ icon: Icon, title, body, ink }) => (
                <li key={title} className="flex gap-3">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-white ${ink}`}>
                    <Icon className="size-[18px]" strokeWidth={2} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="block text-xs leading-snug text-ink-3">{body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rise rounded-3xl border border-line bg-surface p-5 sm:p-6" style={{ animationDelay: "120ms" }}>
            <h2 className="font-display text-xl">Set up in 30 seconds</h2>
            <p className="mb-4 text-sm text-ink-3">Free. No sign-up needed to start.</p>
            <ProfileForm initial={profile ?? undefined} submitLabel="Start preparing →" wide />
          </div>
        </div>
      </div>
    </div>
  );
}
