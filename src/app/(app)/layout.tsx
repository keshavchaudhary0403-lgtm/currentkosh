import Link from "next/link";
import { redirect } from "next/navigation";
import { LangProvider } from "@/components/lang-context";
import { BottomNav, LangToggle, Sidebar, ThemeToggle, Wordmark } from "@/components/nav";
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
  };
  const ui = lang === "bi" ? "en" : lang;

  return (
    <div className="flex min-h-dvh">
      <Sidebar labels={labels} youLabel={ui === "hi" ? "आप" : "You"} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-line bg-(--glass) backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
            <Link href="/" className="lg:hidden">
              <Wordmark size={24} />
            </Link>
            <Link href="/settings" className="no-scrollbar hidden min-w-0 items-center gap-1.5 overflow-x-auto sm:flex">
              {profile.exams.map((e) => (
                <span key={e} className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium whitespace-nowrap text-ink-2">
                  {pick(examById(e)?.label, ui)}
                </span>
              ))}
              {profile.state && (
                <span className="rounded-full border border-dashed border-line-strong px-2.5 py-1 text-xs whitespace-nowrap text-ink-3">{pick(stateById(profile.state)?.label, ui)}</span>
              )}
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <LangToggle lang={lang} />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 pt-6 pb-28 sm:px-6 lg:pb-16">
          <LangProvider lang={lang}>{children}</LangProvider>
        </main>
      </div>
      <BottomNav labels={labels} />
    </div>
  );
}
