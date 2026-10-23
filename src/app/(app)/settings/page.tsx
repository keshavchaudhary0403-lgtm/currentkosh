import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ThemeSwitch } from "@/components/nav";
import { ProfileForm } from "@/components/profile-form";
import { currentProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Settings" };

export default async function Settings() {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-5xl">Settings</h1>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-surface p-6 shadow-card">
        <div>
          <div className="text-sm font-semibold">Appearance</div>
          <div className="text-sm text-ink-2">Light is the default. System follows your phone or computer.</div>
        </div>
        <ThemeSwitch full />
      </div>
      <div className="rounded-3xl border border-line bg-surface p-6 shadow-card">
        <ProfileForm initial={profile} submitLabel="Save changes" />
      </div>
    </div>
  );
}
