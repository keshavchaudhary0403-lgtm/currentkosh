import type { Metadata } from "next";
import { Brain, Newspaper, ShieldCheck, Target } from "lucide-react";
import Link from "next/link";
import { Wordmark } from "@/components/nav";
import { ProfileForm } from "@/components/profile-form";
import { ThemeSwitch } from "@/components/theme-switch";
import { currentProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Welcome" };

const PILLARS = [
  { icon: Newspaper, title: "A calm daily plan", body: "10 stories ranked for your exam, then a short quiz.", cls: "bg-signal text-on-signal" },
  { icon: Target, title: "Real exam-style tests", body: "UPSC statements, SSC one-liners, timed mocks.", cls: "bg-flare text-white" },
  { icon: Brain, title: "Revision that sticks", body: "Flashcards return right before you forget.", cls: "bg-cobalt text-white" },
  { icon: ShieldCheck, title: "Every fact sourced", body: "PIB, AIR, DD News, RBI. No ads, no pop-ups.", cls: "bg-mint text-white" },
];

const EXAMS = ["UPSC CSE", "State PSC", "SSC CGL", "IBPS · SBI", "RRB NTPC", "CDS · NDA", "CTET", "यूपीएससी", "बैंकिंग", "रेलवे", "राज्य लोक सेवा आयोग"];

export default async function Welcome() {
  const profile = await currentProfile();
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 size-[520px] rounded-full bg-signal opacity-30 blur-[120px] dark:opacity-15" />
      <div aria-hidden className="pointer-events-none absolute top-1/3 -right-40 size-[460px] rounded-full bg-cobalt opacity-15 blur-[120px]" />
      <div className="relative mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="CurrentKosh home" className="flex w-fit items-center gap-2.5">
            <Wordmark size={34} text={21} />
          </Link>
          <span className="flex items-center gap-3">
            <span lang="hi" className="eyebrow hidden text-ink-3 sm:block">
              करंट कोश
            </span>
            <span className="sm:hidden">
              <ThemeSwitch />
            </span>
            <span className="hidden sm:block">
              <ThemeSwitch labeled />
            </span>
          </span>
        </div>
        <div className="mt-10 grid items-start gap-10 lg:mt-14 lg:grid-cols-[1fr_1.02fr] lg:gap-14">
          <div className="rise min-w-0 lg:sticky lg:top-10">
            <p className="eyebrow inline-flex h-8 items-center gap-2 rounded-full bg-card px-3 text-good-ink shadow-[inset_0_0_0_1px_var(--line-2)]">
              <span className="live-dot" /> Updated daily from official sources
            </p>
            <h1 className="mt-6 font-display text-[56px] leading-[0.95] sm:text-[84px]">
              Current affairs,
              <br />
              <span className="italic">made exam-ready.</span>
            </h1>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-2">
              One feed for UPSC, State PSC, SSC, Banking, Railways and Defence. Read it, test yourself, and let spaced revision do the remembering.
            </p>
            <p lang="hi" className="mt-2 max-w-md text-sm text-ink-3">
              सभी सरकारी परीक्षाओं के लिए एक साफ़-सुथरा करंट अफ़ेयर्स मंच — हिंदी और अंग्रेज़ी में।
            </p>
            <div className="fade-x mt-8 overflow-hidden" aria-hidden>
              <div className="marquee">
                {[...EXAMS, ...EXAMS].map((e, i) => (
                  <span key={i} className="mr-2 inline-flex h-10 shrink-0 items-center rounded-full bg-card px-4 text-sm font-semibold whitespace-nowrap shadow-[inset_0_0_0_1px_var(--line-2)]">
                    {e}
                  </span>
                ))}
              </div>
            </div>
            <ul className="stagger mt-8 grid grid-cols-2 gap-2.5">
              {PILLARS.map(({ icon: Icon, title, body, cls }) => (
                <li key={title} className="card p-4">
                  <span className={`grid size-10 place-items-center rounded-[13px] ${cls}`}>
                    <Icon className="size-5" strokeWidth={2} />
                  </span>
                  <span className="mt-3 block text-sm font-semibold">{title}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-ink-3">{body}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rise glass min-w-0 rounded-[32px] p-5 shadow-float ring-1 ring-line-2 sm:p-8" style={{ animationDelay: "120ms" }}>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <div className="eyebrow text-ink-3">Free · no sign-up</div>
                <h2 className="mt-1 font-display text-[38px] leading-none">
                  Set up in <span className="italic">30 seconds</span>
                </h2>
              </div>
            </div>
            <ProfileForm initial={profile ?? undefined} submitLabel="Start preparing" wide />
          </div>
        </div>
      </div>
    </div>
  );
}
