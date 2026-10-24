import { notFound, redirect } from "next/navigation";
import { QuizRunner } from "@/components/quiz-runner";
import { getMonthly, monthlyQuestions } from "@/lib/monthly";
import { currentProfile } from "@/lib/profile";
import { pick } from "@/lib/taxonomy";

export default async function MonthlyTest({ params }: PageProps<"/monthly/[id]/test">) {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const m = getMonthly((await params).id);
  if (!m) notFound();
  const ui = profile.lang === "bi" ? "en" : profile.lang;
  const title = `${ui === "hi" ? "मासिक टेस्ट" : "Monthly test"} · ${pick(m.title, ui)}`;
  return <QuizRunner kind="monthly-prs" title={title} questions={monthlyQuestions(m)} lang={profile.lang} timed={false} seconds={0} negative={0} />;
}
