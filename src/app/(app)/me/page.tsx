import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, BookOpen, Bookmark, ChevronRight, Settings, Waypoints } from "lucide-react";
import { MyStats } from "@/components/my-stats";
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
    { href: "/progress", icon: BarChart3, label: ui === "hi" ? "प्रगति" : "Progress", hint: ui === "hi" ? "स्ट्रीक, सटीकता, कमज़ोर विषय" : "Streak, accuracy, weak topics" },
    { href: "/saved", icon: Bookmark, label: ui === "hi" ? "सहेजे गए" : "Saved stories", hint: ui === "hi" ? "अंतिम समय के दोहराव के लिए" : "Kept for last-minute revision" },
    { href: "/threads", icon: Waypoints, label: ui === "hi" ? "कहानी-क्रम" : "Storylines", hint: ui === "hi" ? "एक मुद्दा, पूरी टाइमलाइन" : "One issue, full timeline" },
    { href: "/sources", icon: BookOpen, label: ui === "hi" ? "स्रोत" : "Sources", hint: ui === "hi" ? "हम कहाँ से पढ़ते हैं" : "Where our news comes from" },
    { href: "/settings", icon: Settings, label: ui === "hi" ? "सेटिंग्स" : "Settings", hint: ui === "hi" ? "परीक्षा, राज्य, परीक्षा तिथि" : "Exams, state, exam date" },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <h1 className="font-display text-3xl">{ui === "hi" ? "आप" : "You"}</h1>
        <p className="mt-1 text-sm text-ink-2">
          {profile.exams.map((e) => pick(examById(e)?.label, ui)).join(" · ")}
          {profile.state && ` · ${pick(stateById(profile.state)?.label, ui)}`}
          {countdown !== null && countdown >= 0 && ` · ${countdown} ${ui === "hi" ? "दिन परीक्षा तक" : "days to exam"}`}
        </p>
      </header>

      <MyStats />

      <nav className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {links.map(({ href, icon: Icon, label, hint }) => (
          <Link key={href} href={href} className="flex items-center gap-3.5 px-4 py-3.5 active:bg-surface-2">
            <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
              <Icon className="size-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium">{label}</span>
              <span className="block text-xs text-ink-3">{hint}</span>
            </span>
            <ChevronRight className="size-4 text-ink-3" />
          </Link>
        ))}
      </nav>

      <section className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        <div className="text-sm font-semibold">{ui === "hi" ? "पढ़ने की भाषा" : "Reading language"}</div>
        <LangPicker lang={profile.lang} />
        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="text-sm font-semibold">{ui === "hi" ? "थीम" : "Theme"}</span>
          <ThemeToggle />
        </div>
      </section>

      <p className="px-1 text-xs leading-relaxed text-ink-3">
        {ui === "hi"
          ? "आपकी प्रगति इसी ब्राउज़र में सुरक्षित रहती है। कोई विज्ञापन नहीं, कोई पॉप-अप नहीं।"
          : "Your progress is saved privately in this browser. No ads, no pop-ups."}
      </p>
    </div>
  );
}
