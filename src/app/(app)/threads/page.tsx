import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TimelineBrowser } from "@/components/timeline-browser";
import { PageHeader } from "@/components/ui";
import { currentProfile } from "@/lib/profile";
import { threadIndex } from "@/lib/store";

export const metadata: Metadata = { title: "Timelines" };

export default async function Timelines() {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const hi = profile.lang === "hi";
  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={hi ? "पूरा संदर्भ, क्रम से" : "The whole context, in order"}
        title={hi ? "घटनाक्रम" : <>Timelines<span className="text-amber">.</span></>}
        sub={
          hi
            ? "एक मुद्दे की हर ख़बर, शुरू से अब तक क्रम में, जैसे भारत-चीन संबंध या चुनाव 2026। परीक्षा में पूरा संदर्भ पूछा जाता है, सिर्फ़ ताज़ा ख़बर नहीं।"
            : "Every update on one issue, from the start to now, like India–China relations or Elections 2026. Exams ask for the whole context, not just the latest headline."
        }
      />
      <TimelineBrowser threads={threadIndex()} lang={profile.lang} />
    </div>
  );
}
