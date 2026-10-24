import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { currentProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Settings" };

export default async function Settings() {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-display text-3xl sm:text-5xl">Settings</h1>
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <ProfileForm initial={profile} submitLabel="Save changes" />
      </div>
    </div>
  );
}
