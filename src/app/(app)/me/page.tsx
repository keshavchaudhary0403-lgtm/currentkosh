import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, BarChart3, BookOpen, Bookmark, CalendarDays, CalendarRange, ClipboardList, Settings, Waypoints } from "lucide-react";
import { DailyPath } from "@/components/daily-path";
import { InstallCard } from "@/components/install";
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
  const hi = ui === "hi";
  const countdown = profile.examDate ? daysUntil(profile.examDate) : null;
  const links = [
    { href: "/progress", tone: "bg-signal text-on-signal", icon: BarChart3, label: hi ? "प्रगति" : "Progress", hint: hi ? "पढ़ी ख़बरें, सटीकता, कमज़ोर विषय" : "Stories read, accuracy, weak topics" },
    { href: "/tests", tone: "bg-flare-soft text-flare-ink", icon: ClipboardList, label: hi ? "मेरे टेस्ट" : "My tests", hint: hi ? "अंक, विश्लेषण, दोबारा प्रयास" : "Scores, analysis and retries" },
    { href: "/saved", tone: "bg-cobalt-soft text-cobalt-ink", icon: Bookmark, label: hi ? "सहेजे गए" : "Saved", hint: hi ? "अंतिम समय के दोहराव के लिए" : "Kept for last-minute revision" },
    { href: "/threads", tone: "bg-amber-soft text-amber-ink", icon: Waypoints, label: hi ? "घटनाक्रम" : "Timelines", hint: hi ? "एक मुद्दे की पूरी कहानी, क्रम से" : "Follow an issue from start to now" },
    { href: "/monthly", tone: "bg-mint-soft text-mint-ink", icon: CalendarRange, label: hi ? "मासिक" : "Monthly", hint: hi ? "हर महीने के नीतिगत बदलाव और टेस्ट" : "Each month's policy changes, with a test" },
    { href: "/sources", tone: "bg-good-soft text-good-ink", icon: BookOpen, label: hi ? "स्रोत" : "Sources", hint: hi ? "हम कहाँ से पढ़ते हैं" : "Where our news comes from" },
    { href: "/settings", tone: "bg-card-2 text-ink-2", icon: Settings, label: hi ? "सेटिंग्स" : "Settings", hint: hi ? "परीक्षा, राज्य, परीक्षा तिथि" : "Exams, state, exam date" },
  ];

  return (
    <div className="space-y-6">
      <header className="rise flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <div className="eyebrow mb-2 text-ink-3">{hi ? "आपकी तैयारी" : "Your prep"}</div>
          <h1 className="font-display text-[30px] leading-none sm:text-[40px]">{hi ? "आप" : "Hello, aspirant."}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.exams.map((e) => (
            <span key={e} className="inline-flex h-8 items-center rounded-full bg-card px-3 text-xs font-semibold shadow-[inset_0_0_0_1px_var(--line-2)]">
              {pick(examById(e)?.label, ui)}
            </span>
          ))}
          {profile.state && (
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-card px-3 text-xs font-semibold shadow-[inset_0_0_0_1px_var(--line-2)]">
              <span className="size-1.5 rounded-full bg-mint" />
              {pick(stateById(profile.state)?.label, ui)}
            </span>
          )}
          {countdown !== null && countdown >= 0 && (
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-signal px-3 text-xs font-semibold text-on-signal">
              <CalendarDays className="size-3.5" /> {countdown} {hi ? "दिन परीक्षा तक" : "days to your exam"}
            </span>
          )}
        </div>
      </header>

      <DailyPath />

      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
        <div className="space-y-6">
          <section className="card space-y-4 p-5">
            <div>
              <div className="eyebrow mb-2 text-ink-3">{hi ? "पढ़ने की भाषा" : "Reading language"}</div>
              <LangPicker lang={profile.lang} />
            </div>
            <div className="flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm font-semibold">{hi ? "थीम" : "Theme"}</span>
              <ThemeToggle />
            </div>
          </section>
          <InstallCard />
          <ResetProgress />
        </div>
        <nav className="card divide-y divide-line overflow-hidden">
          {links.map(({ href, icon: Icon, label, hint, tone }) => (
            <Link key={href} href={href} className="group flex items-center gap-4 px-4 py-3 transition hover:bg-card-2 sm:px-5">
              <span className={`grid size-10 shrink-0 place-items-center rounded-[12px] ${tone}`}>
                <Icon className="size-5" strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">{label}</span>
                <span className="block truncate text-xs text-ink-3">{hint}</span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-ink-3 transition group-hover:rotate-45 group-hover:text-ink" />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
