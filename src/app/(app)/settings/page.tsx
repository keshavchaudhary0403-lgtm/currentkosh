import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { ResetProgress } from "@/components/reset-progress";
import { PageHeader } from "@/components/ui";
import { currentProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Settings" };

export default async function Settings() {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  return (
    <div className="max-w-4xl space-y-7">
      <PageHeader eyebrow="Exams · state · language" title="Settings" sub="Your feed is ranked by these choices. They're stored in a cookie on this device." />
      <div className="card p-5 sm:p-7">
        <ProfileForm initial={profile} submitLabel="Save changes" />
      </div>
      <ResetProgress />
    </div>
  );
}
