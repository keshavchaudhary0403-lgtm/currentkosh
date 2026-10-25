import { redirect } from "next/navigation";
import { ViewTransition } from "react";
import { NavTracker } from "@/components/back-button";
import { LangProvider } from "@/components/lang-context";
import { AppHeader, AppMain, BottomNav, Sidebar, type NavLabels } from "@/components/nav";
import { t } from "@/lib/i18n";
import { currentProfile } from "@/lib/profile";

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

  return (
    <div className="flex min-h-dvh">
      <Sidebar labels={labels} lang={lang} />
      <div className="min-w-0 flex-1">
        <AppHeader lang={lang} />
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
