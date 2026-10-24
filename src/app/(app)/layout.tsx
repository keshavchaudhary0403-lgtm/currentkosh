import Link from "next/link";
import { redirect } from "next/navigation";
import { NavTracker } from "@/components/back-button";
import { LangProvider } from "@/components/lang-context";
import { BottomNav, LangMenu, SavedLink, Sidebar, ThemeToggle, Wordmark } from "@/components/nav";
import { t } from "@/lib/i18n";
import { currentProfile } from "@/lib/profile";
import { examById, pick, stateById } from "@/lib/taxonomy";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const lang = profile.lang;
  const labels = {
    today: t("today", lang),
    revise: t("revise", lang),
    practice: t("practice", lang),
    threads: t("threads", lang),
    archive: t("archive", lang),
    progress: t("progress", lang),
    saved: t("saved", lang),
    sources: t("sources", lang),
    settings: t("settings", lang),
    you: lang === "hi" ? "आप" : "You",
  };
  const ui = lang === "bi" ? "en" : lang;

  return (
    <div className="flex min-h-dvh">
      <Sidebar labels={labels} youLabel={ui === "hi" ? "आप" : "You"} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b-2 border-line bg-(--glass) backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
            <Link href="/" className="lg:hidden" aria-label="CurrentKosh home">
              <Wordmark size={24} />
            </Link>
            <Link href="/settings" className="no-scrollbar hidden min-w-0 items-center gap-1.5 overflow-x-auto sm:flex">
              {profile.exams.map((e) => (
                <span key={e} className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold whitespace-nowrap text-accent">
                  {pick(examById(e)?.label, ui)}
                </span>
              ))}
              {profile.state && (
                <span className="rounded-full bg-teal-soft px-2.5 py-1 text-xs font-bold whitespace-nowrap text-teal">{pick(stateById(profile.state)?.label, ui)}</span>
              )}
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <SavedLink />
              <LangMenu lang={lang} />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 pt-4 pb-28 sm:px-6 sm:pt-8 lg:pb-16">
          <LangProvider lang={lang}>{children}</LangProvider>
        </main>
      </div>
      <BottomNav labels={labels} />
      <NavTracker />
    </div>
  );
}
