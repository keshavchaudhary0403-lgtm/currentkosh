import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { QuizRunner } from "@/components/quiz-runner";
import { addDays, istDate } from "@/lib/dates";
import { currentProfile } from "@/lib/profile";
import { getThread, latestStoryDate, mcqsByIds, pickMcqs } from "@/lib/store";
import { CATEGORY_IDS } from "@/lib/taxonomy";

export const metadata: Metadata = { title: "Test" };

const HI_TITLES: Record<string, string> = {
  daily: "डेली क्विज़",
  weekly: "साप्ताहिक दोहराव टेस्ट",
  monthly: "मासिक दोहराव टेस्ट",
  mock: "टाइम्ड मॉक टेस्ट",
  weak: "कमज़ोर विषय अभ्यास",
  thread: "घटनाक्रम टेस्ट",
  custom: "अपना टेस्ट",
};

const KINDS = {
  daily: { title: "Daily quiz", count: 10, days: 1, timed: false, negative: 0 },
  weekly: {
    title: "Weekly revision test",
    count: 25,
    days: 7,
    timed: false,
    negative: 0,
  },
  monthly: {
    title: "Monthly revision test",
    count: 50,
    days: 31,
    timed: false,
    negative: 0,
  },
  mock: {
    title: "Timed mock test",
    count: 50,
    days: 60,
    timed: true,
    negative: 1 / 3,
  },
  weak: {
    title: "Weak-area drill",
    count: 15,
    days: 60,
    timed: false,
    negative: 0,
  },
  thread: {
    title: "Timeline test",
    count: 20,
    days: 365,
    timed: false,
    negative: 0,
  },
  custom: {
    title: "Custom test",
    count: 25,
    days: 30,
    timed: false,
    negative: 0,
  },
} as const;
type Kind = keyof typeof KINDS;

const str = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);
const isDate = (v?: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
const newSeed = () => Math.floor(Math.random() * 1e9) + 1;

/**
 * A test is fully described by its URL (kind, period, topics, count, seed), so it can be
 * refreshed or shared and always yields the same paper.
 */
export default async function RunTest({ searchParams }: PageProps<"/practice/run">) {
  const profile = await currentProfile();
  if (!profile) redirect("/welcome");
  const sp = await searchParams;
  const kind: Kind = (str(sp.kind) as Kind) in KINDS ? (str(sp.kind) as Kind) : "custom";
  const preset = KINDS[kind];

  const seed = Number(str(sp.seed));
  if (!Number.isFinite(seed) || seed <= 0) {
    const qs = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : [])));
    qs.set("seed", String(newSeed()));
    redirect(`/practice/run?${qs}`);
  }

  const latest = latestStoryDate() ?? istDate();
  const to = isDate(str(sp.to)) ? str(sp.to)! : latest;
  const from = isDate(str(sp.from)) ? str(sp.from)! : str(sp.thread) ? "2000-01-01" : addDays(to, -(preset.days - 1));
  const categories = (str(sp.cats)?.split(",") ?? []).filter((c) => (CATEGORY_IDS as string[]).includes(c));
  // A storyline test names the thread; its stories are looked up here (long storylines would overflow the URL).
  const thread = str(sp.thread) ? getThread(str(sp.thread)!) : null;
  const storyIds = thread ? thread.stories.map((s) => s.id) : str(sp.stories)?.split(",");
  const count = Math.min(Math.max(Number(str(sp.count)) || preset.count, 5), 100);
  const timed = str(sp.timed) ? str(sp.timed) === "1" : preset.timed;
  const negative = str(sp.neg) !== undefined ? Math.min(Math.max(Number(str(sp.neg)) || 0, 0), 1) : preset.negative;
  const presetTitle = profile.lang === "hi" ? HI_TITLES[kind] : preset.title;
  const title = str(sp.title) ?? (kind === "monthly" ? `${presetTitle} · ${from.slice(0, 7)}` : presetTitle);

  // A retry names its questions directly (same paper again, or only the ones missed).
  const direct = str(sp.mcqs)?.split(",").filter(Boolean).slice(0, 100);
  const ids = direct?.length ? direct : pickMcqs(profile, { from, to, categories, count, storyIds, seed });
  if (!ids.length) redirect("/practice?empty=1");
  // Observances filed under another subject still show (and score) as the topic the reader chose.
  const shownAs = (c: string) => (categories.length && !categories.includes(c) && categories.includes("days") ? "days" : c);
  const questions = mcqsByIds(ids).map((m) => ({
    id: m.id,
    storyId: m.storyId,
    category: shownAs(m.category),
    content: m.content,
  }));

  return (
    <QuizRunner
      key={seed}
      kind={kind}
      title={title}
      questions={questions}
      lang={profile.lang}
      timed={timed}
      seconds={timed ? questions.length * 60 : 0}
      negative={negative}
    />
  );
}
