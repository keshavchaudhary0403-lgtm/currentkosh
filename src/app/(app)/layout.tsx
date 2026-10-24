import Link from "next/link";
import { redirect } from "next/navigation";
import { ViewTransition } from "react";
import { NavTracker } from "@/components/back-button";
import { LangProvider } from "@/components/lang-context";
import { AppHeader, AppMain, BottomNav, Sidebar, type NavLabels } from "@/components/nav";
import { t } from "@/lib/i18n";
import { currentProfile } from "@/lib/profile";
import { examById, pick, stateById } from "@/lib/taxonomy";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const lang = profile.lang;
  const labels: NavLabels = {
    today: t("today", lang),
    revise: t("revise", lang),
    practice: t("practice", lang),
    tests: lang === "hi" ? "मेरे टेस्ट" : "My tests",
    threads: t("threads", lang),
    monthly: t("monthly", lang),
    archive: t("archive", lang),
    progress: t("progress", lang),
    saved: t("saved", lang),
    sources: t("sources", lang),
    settings: t("settings", lang),
    you: lang === "hi" ? "आप" : "You",
  };
  const ui = lang === "bi" ? "en" : lang;
  const chips = (
    <Link href="/settings" className="flex items-center gap-1.5" title={ui === "hi" ? "परीक्षाएँ बदलें" : "Change exams"}>
      {profile.exams.map((e) => (
        <span key={e} className="inline-flex h-8 items-center rounded-full bg-card-2 px-3 text-xs font-semibold whitespace-nowrap text-ink-2 shadow-[inset_0_0_0_1px_var(--line)] transition hover:text-ink">
          {pick(examById(e)?.label, ui)}
        </span>
      ))}
      {profile.state && (
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-card-2 px-3 text-xs font-semibold whitespace-nowrap text-ink-2 shadow-[inset_0_0_0_1px_var(--line)]">
          <span className="size-1.5 rounded-full bg-mint" />
          {pick(stateById(profile.state)?.label, ui)}
        </span>
      )}
    </Link>
  );

  return (
    <div className="flex min-h-dvh">
      <Sidebar labels={labels} lang={lang} />
      <div className="min-w-0 flex-1">
        <AppHeader lang={lang} chips={chips} />
        <AppMain>
          <LangProvider lang={lang}>
            <ViewTransition update="page-swap" default="none">
              <div>{children}</div>
            </ViewTransition>
          </LangProvider>
        </AppMain>
      </div>
      <BottomNav labels={labels} />
      <NavTracker />
    </div>
  );
}
