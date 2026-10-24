import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, BookOpen, Bookmark, ChevronRight, GraduationCap, Settings, Waypoints } from "lucide-react";
import { InstallCard } from "@/components/install";
import { MyStats } from "@/components/my-stats";
import { ResetProgress } from "@/components/reset-progress";
import { LangPicker, ThemeToggle } from "@/components/nav";
import { daysUntil } from "@/lib/dates";
import { currentProfile } from "@/lib/profile";
import { examById, pick, stateById } from "@/lib/taxonomy";

export const metadata: Metadata = { title: "You" };

export default async function Me() {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const ui = profile.lang === "bi" ? "en" : profile.lang;
  const countdown = profile.examDate ? daysUntil(profile.examDate) : null;
  const links = [
    {
      href: "/progress",
      tone: "bg-accent-soft text-accent",
      icon: BarChart3,
      label: ui === "hi" ? "प्रगति" : "Progress",
      hint: ui === "hi" ? "स्ट्रीक, सटीकता, कमज़ोर विषय" : "Streak, accuracy, weak topics",
    },
    {
      href: "/saved",
      tone: "bg-violet-soft text-violet",
      icon: Bookmark,
      label: ui === "hi" ? "सहेजे गए" : "Saved stories",
      hint: ui === "hi" ? "अंतिम समय के दोहराव के लिए" : "Kept for last-minute revision",
    },
    {
      href: "/threads",
      tone: "bg-pink-soft text-pink",
      icon: Waypoints,
      label: ui === "hi" ? "कहानी-क्रम" : "Storylines",
      hint: ui === "hi" ? "एक मुद्दा, पूरी टाइमलाइन" : "One issue, full timeline",
    },
    {
      href: "/sources",
      tone: "bg-good-soft text-good",
      icon: BookOpen,
      label: ui === "hi" ? "स्रोत" : "Sources",
      hint: ui === "hi" ? "हम कहाँ से पढ़ते हैं" : "Where our news comes from",
    },
    {
      href: "/settings",
      tone: "bg-surface-2 text-ink-2",
      icon: Settings,
      label: ui === "hi" ? "सेटिंग्स" : "Settings",
      hint: ui === "hi" ? "परीक्षा, राज्य, परीक्षा तिथि" : "Exams, state, exam date",
    },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-5 lg:max-w-none">
      <header className="flex items-center gap-4 rounded-3xl bg-pink p-5 text-white">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-white font-display text-2xl text-pink">
          <GraduationCap className="size-8" strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-2xl leading-tight">{ui === "hi" ? "आपकी तैयारी" : "Your prep"}</h1>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {profile.exams.map((e) => (
              <span key={e} className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
                {pick(examById(e)?.label, ui)}
              </span>
            ))}
            {profile.state && <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">{pick(stateById(profile.state)?.label, ui)}</span>}
          </div>
          {countdown !== null && countdown >= 0 && (
            <div className="mt-1.5 text-sm font-bold text-white/90">
              ⏳ {countdown} {ui === "hi" ? "दिन परीक्षा तक" : "days to your exam"}
            </div>
          )}
        </div>
      </header>

      <div className="space-y-5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5 lg:space-y-0">
        <div className="space-y-5">
          <MyStats />

          <InstallCard />

          <ResetProgress />
        </div>
        <div className="space-y-5">
          <nav className="divide-y-2 divide-line overflow-hidden rounded-3xl border-2 border-line bg-surface">
            {links.map(({ href, icon: Icon, label, hint, tone }) => (
              <Link key={href} href={href} className="flex items-center gap-3.5 px-4 py-3.5 transition hover:bg-surface-2 active:bg-surface-2">
                <span className={`grid size-10 place-items-center rounded-xl ${tone}`}>
                  <Icon className="size-5" strokeWidth={2.3} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold">{label}</span>
                  <span className="block text-xs text-ink-3">{hint}</span>
                </span>
                <ChevronRight className="size-4 text-ink-3" />
              </Link>
            ))}
          </nav>

          <section className="space-y-3 rounded-3xl border-2 border-line bg-surface p-4">
            <div className="text-sm font-extrabold">{ui === "hi" ? "पढ़ने की भाषा" : "Reading language"}</div>
            <LangPicker lang={profile.lang} />
            <div className="flex items-center justify-between border-t-2 border-line pt-3">
              <span className="text-sm font-extrabold">{ui === "hi" ? "थीम" : "Theme"}</span>
              <ThemeToggle />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
