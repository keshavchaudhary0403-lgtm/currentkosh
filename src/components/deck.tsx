"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BookOpenText,
  Brain,
  Check,
  Lightbulb,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Waypoints,
  X,
  Zap,
} from "lucide-react";
import type { DeckStory } from "@/app/(app)/deck-data";
import { answerQuestion, dueCount, markRead, useProgress } from "@/lib/progress-store";
import { t } from "@/lib/i18n";
import { categoryById, pick, type Lang } from "@/lib/taxonomy";
import { CategoryIcon, catStyle } from "./category-icon";
import { McqView } from "./mcq";
import { MiniTimeline, ReaderSheet } from "./reader";
import { BookmarkButton } from "./story-actions";
import { Confetti, RelevanceBadge, cx, fmtDate } from "./ui";

type Item = { kind: "story"; s: DeckStory; group: "main" | "more"; n: number; of: number } | { kind: "end" };
type Mcq = DeckStory["mcqs"][number];

// Statement questions were rewritten from "how many are correct" to "which are correct" on 26 Oct 2026;
// answers given before then were to the old wording, so they don't count as answering the new one.
const STATEMENT_REWRITE = "2026-10-26T17:05:00Z";

/**
 * Today as one continuous scroll: each story reads top to bottom — headline, key facts,
 * then its quick questions (the summary lives in the deep dive) — and scrolling on brings the next story. A reader sheet holds the deep dive.
 * On desktop the feed sits between a queue (left) and a live context panel (right).
 */
export function Deck({
  main,
  more,
  lang,
  date,
  picker,
}: {
  main: DeckStory[];
  more: DeckStory[];
  lang: Lang;
  date: string;
  isLatest: boolean;
  picker: React.ReactNode;
}) {
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  const p = useProgress();
  const [topic, setTopic] = useState<string | null>(null);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const [reader, setReader] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);

  const matches = useCallback((s: DeckStory) => !topic || s.category === topic || (topic.startsWith("exam:") && s.exams[Number(topic.slice(5))]?.level >= 2), [topic]);
  const items: Item[] = useMemo(() => {
    const m = main.filter(matches);
    const r = more.filter(matches);
    return [
      ...m.map((s, i) => ({ kind: "story" as const, s, group: "main" as const, n: i + 1, of: m.length })),
      { kind: "end" as const },
      ...r.map((s, i) => ({ kind: "story" as const, s, group: "more" as const, n: i + 1, of: r.length })),
    ];
  }, [main, more, matches]);
  const all = useMemo(() => [...main, ...more], [main, more]);
  const byId = useMemo(() => new Map(all.map((s) => [s.id, s])), [all]);

  // Last answer recorded for a question (this session first, then saved progress).
  const resultOf = (m: Mcq): "right" | "wrong" | null => {
    if (picks[m.id] !== undefined) return picks[m.id] === m.content.answer ? "right" : "wrong";
    const log = [...p.answers].reverse().find((a) => a.mcqId === m.id && (m.content.style === "direct" || a.at >= STATEMENT_REWRITE));
    return log ? (log.correct ? "right" : "wrong") : null;
  };
  // A story is wrong if any of its questions was missed, right once all are answered correctly.
  const result = (s: DeckStory): "right" | "wrong" | null => {
    const rs = s.mcqs.map(resultOf);
    if (rs.includes("wrong")) return "wrong";
    return rs.length > 0 && rs.every((r) => r === "right") ? "right" : null;
  };

  const goTo = useCallback((i: number) => {
    const el = cards.current[i];
    const box = scroller.current;
    if (!el || !box) return;
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({ top: el.offsetTop - box.offsetTop, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const answer = (s: DeckStory, m: Mcq, i: number) => {
    const ok = i === m.content.answer;
    setPicks((x) => ({ ...x, [m.id]: i }));
    answerQuestion(m.id, s.category, ok);
    if (!p.reads[s.id]) markRead(s.id, s.cardIds);
  };

  // The story crossing a line a third of the way down the feed is the active one.
  useEffect(() => {
    const box = scroller.current;
    if (!box) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.i);
            setActive(i);
            const it = items[i];
            if (it?.kind === "story") setSeen((s) => (s.has(it.s.id) ? s : new Set(s).add(it.s.id)));
          }
      },
      { root: box, rootMargin: "-33% 0px -66% 0px" },
    );
    cards.current.forEach((c) => c && io.observe(c));
    return () => io.disconnect();
  }, [items]);

  // A story counts as read once its key facts have been on screen.
  const reads = useRef(p.reads);
  useEffect(() => {
    reads.current = p.reads;
  });
  useEffect(() => {
    const box = scroller.current;
    if (!box) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const s = e.isIntersecting ? byId.get((e.target as HTMLElement).dataset.facts ?? "") : null;
          if (s && !reads.current[s.id]) markRead(s.id, s.cardIds);
        }
      },
      { root: box, threshold: 0.35 },
    );
    box.querySelectorAll("[data-facts]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items, byId]);

  // Keyboard: j/k jump between stories, D opens the deep dive, 1–4 answer the active story's next open question.
  const keys = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    keys.current = (e: KeyboardEvent) => {
      if (reader || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement)?.closest?.("input,textarea,select,[role=dialog]")) return;
      const it = items[active];
      const k = e.key;
      const open = it?.kind === "story" ? it.s.mcqs.find((m) => picks[m.id] === undefined && !resultOf(m)) : undefined;
      if (k === "j") goTo(Math.min(items.length - 1, active + 1));
      else if (k === "k") goTo(Math.max(0, active - 1));
      else if (it?.kind === "story" && (k === "d" || k === "D")) setReader(it.s.id);
      else if (it?.kind === "story" && open && ["1", "2", "3", "4"].includes(k)) answer(it.s, open, Number(k) - 1);
    };
  });
  useEffect(() => {
    const h = (e: KeyboardEvent) => keys.current(e);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Topic and exam chips with counts.
  const counts = new Map<string, number>();
  for (const s of all) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  const examChips = main[0]?.exams.length > 1 ? main[0].exams.map((e, i) => ({ id: `exam:${i}`, label: pick(e.label, ui) })) : [];

  const mainStories = main.filter(matches);
  const readN = mainStories.filter((s) => p.reads[s.id]).length;
  const answered = mainStories.flatMap((s) => s.mcqs.map(resultOf)).filter(Boolean);
  const right = answered.filter((r) => r === "right").length;
  const activeItem = items[active];
  const activeStory = activeItem?.kind === "story" ? activeItem.s : null;
  const readerStory = reader ? byId.get(reader) : null;

  const toolbar = (
    <div className="flex min-w-0 items-center gap-2">
      <div className="shrink-0 lg:hidden">{picker}</div>
      <div className="no-scrollbar max-lg:fade-x flex min-w-0 gap-1.5 overflow-x-auto py-0.5 pr-4" role="toolbar" aria-label={hi ? "फ़िल्टर" : "Filter the stories"}>
        <button className="chip shrink-0" aria-pressed={!topic} onClick={() => setTopic(null)}>
          {hi ? "सभी" : "All"} <span className="font-mono text-[11px] opacity-60">{all.length}</span>
        </button>
        {examChips.map((c) => (
          <button key={c.id} className="chip shrink-0" aria-pressed={topic === c.id} onClick={() => setTopic(topic === c.id ? null : c.id)}>
            <Target className="size-3.5" /> {c.label}
          </button>
        ))}
        {[...counts.entries()].map(([id, n]) => (
          <button key={id} className="chip cat shrink-0" style={catStyle(id)} aria-pressed={topic === id} onClick={() => setTopic(topic === id ? null : id)}>
            <span className="size-2 rounded-full bg-(--cat-solid)" />
            {pick(categoryById(id)?.label, ui)} <span className="font-mono text-[11px] opacity-60">{n}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)] gap-2 lg:grid-cols-[272px_minmax(0,1fr)_340px] lg:grid-rows-1 lg:gap-5 xl:grid-cols-[300px_minmax(0,1fr)_380px]">
      {/* Left pane (desktop): the day's queue. */}
      <aside className="relative z-20 hidden min-h-0 flex-col lg:flex" aria-label={hi ? "आज की सूची" : "Today's queue"}>
        {/* No overflow clipping here: the day picker's calendar pops out over the feed. */}
        <div className="card flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2 border-b border-line p-3">
            {picker}
            <span className="font-mono text-[11px] text-ink-3 tnum">
              {readN}/{mainStories.length} {hi ? "पढ़ीं" : "read"} · {right}/{answered.length} {hi ? "सही" : "right"}
            </span>
          </div>
          <ol className="min-h-0 flex-1 overflow-y-auto p-2">
            {items.map((it, i) =>
              it.kind === "end" ? (
                <li key="end" className="eyebrow px-3 pt-4 pb-2 text-ink-3">
                  {hi ? "और भी" : "More stories"} · {items.length - i - 1}
                </li>
              ) : (
                <li key={it.s.id}>
                  <button
                    onClick={() => goTo(i)}
                    aria-current={i === active ? "true" : undefined}
                    className={cx("flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left transition", i === active ? "bg-solid text-on-solid" : "hover:bg-card-2")}
                  >
                    <span className={cx("w-5 shrink-0 pt-0.5 font-mono text-[11px]", i === active ? "opacity-70" : "text-ink-3")}>{String(it.n).padStart(2, "0")}</span>
                    <span lang={hi ? "hi" : undefined} className={cx("line-clamp-2 min-w-0 flex-1 text-[13px] leading-snug font-medium", i !== active && p.reads[it.s.id] && "text-ink-2")}>
                      {pick(it.s.content.title, ui)}
                    </span>
                    <StateDot state={result(it.s) ?? (p.reads[it.s.id] ? "read" : seen.has(it.s.id) ? "seen" : null)} />
                  </button>
                </li>
              ),
            )}
          </ol>
        </div>
      </aside>

      {/* Centre: toolbar + the scrolling feed. */}
      <div className="flex min-h-0 flex-col gap-2 lg:gap-3">
        <div className="px-3 lg:px-0">{toolbar}</div>
        <div className="relative min-h-0 flex-1">
          <div ref={scroller} className="feed h-full overflow-y-auto px-2 pb-[96px] sm:px-3 lg:px-0 lg:pb-6" tabIndex={-1} aria-label={hi ? "आज की ख़बरें" : "Today's stories"}>
            {items.map((it, i) => (
              <section
                key={it.kind === "end" ? "end" : it.s.id}
                ref={(el) => {
                  cards.current[i] = el;
                }}
                data-i={i}
                className="pb-3 lg:pb-5"
                aria-roledescription={it.kind === "end" ? undefined : "story"}
              >
                {it.kind === "end" ? (
                  <EndCard lang={lang} date={date} readN={readN} total={mainStories.length} right={right} answered={answered.length} moreCount={items.length - i - 1} onMore={() => goTo(i + 1)} />
                ) : (
                  <StoryBlock
                    it={it}
                    lang={lang}
                    read={!!p.reads[it.s.id]}
                    picks={picks}
                    resultOf={resultOf}
                    onAnswer={(m, a) => answer(it.s, m, a)}
                    onDeep={() => setReader(it.s.id)}
                  />
                )}
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* Right pane (desktop): live context for the story in view. */}
      <aside className="hidden min-h-0 lg:block" aria-label={hi ? "संदर्भ" : "Context"}>
        <div className="card h-full overflow-y-auto p-5">
          {activeStory ? <ContextPanel key={activeStory.id} s={activeStory} lang={lang} /> : <DayContext lang={lang} />}
        </div>
      </aside>

      {readerStory && <ReaderSheet story={readerStory} lang={lang} onClose={() => setReader(null)} />}
    </div>
  );
}

function StateDot({ state }: { state: "right" | "wrong" | "read" | "seen" | null }) {
  if (state === "right")
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-good text-white" aria-label="Answered right">
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  if (state === "wrong")
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-bad text-white" aria-label="Answered wrong">
        <X className="size-3" strokeWidth={3} />
      </span>
    );
  return <span className={cx("mt-1.5 size-2.5 shrink-0 rounded-full", state === "read" ? "bg-ink-2" : state === "seen" ? "bg-ink-3/50" : "shadow-[inset_0_0_0_1.5px_var(--line-2)]")} aria-label={state ?? "Not opened"} />;
}

/** One story in the feed, read top to bottom: headline → key facts → quick questions. */
function StoryBlock({
  it,
  lang,
  read,
  picks,
  resultOf,
  onAnswer,
  onDeep,
}: {
  it: Extract<Item, { kind: "story" }>;
  lang: Lang;
  read: boolean;
  picks: Record<string, number>;
  resultOf: (m: Mcq) => "right" | "wrong" | null;
  onAnswer: (m: Mcq, i: number) => void;
  onDeep: () => void;
}) {
  const s = it.s;
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  const multi = s.mcqs.length > 1;

  return (
    <article className="cat mesh card relative overflow-hidden rounded-[28px] shadow-card" style={catStyle(s.category)}>
      {/* Top row */}
      <div className="relative flex items-center gap-2 px-4 pt-4 sm:px-6 sm:pt-5">
        <span className="inline-flex h-8 shrink-0 items-center rounded-full bg-solid px-3 font-mono text-xs font-semibold text-on-solid tnum">
          {it.group === "more" && <span className="mr-1.5 opacity-70">{hi ? "और" : "MORE"}</span>}
          {String(it.n).padStart(2, "0")}
          <span className="opacity-60">/{it.of}</span>
        </span>
        <CategoryIcon id={s.category} size="sm" />
        <span className="min-w-0 truncate text-xs font-semibold text-(--cat-ink)">{pick(categoryById(s.category)?.label, ui)}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          {read && (
            <span className="grid size-6 place-items-center rounded-full bg-good text-white" aria-label={hi ? "पढ़ा" : "Read"}>
              <Check className="size-3.5" strokeWidth={3} />
            </span>
          )}
          <RelevanceBadge level={s.relevance} lang={ui} />
        </span>
      </div>

      <div className="relative px-4 pt-3 pb-5 sm:px-6 lg:pt-4 lg:pb-6">
        <h2 lang={hi ? "hi" : undefined} className="font-display text-[26px] sm:text-[30px] lg:text-[34px]">
          {pick(s.content.title, ui)}
        </h2>
        {lang === "bi" && (
          <p lang="hi" className="mt-2 text-base font-medium text-ink-2">
            {s.content.title.hi}
          </p>
        )}

        {s.content.key_facts.length > 0 && (
          <div data-facts={s.id}>
            <div className="eyebrow mt-5 mb-2.5 flex items-center gap-1.5 text-(--cat-ink)">
              <Sparkles className="size-3.5" /> {t("keyFacts", ui)}
            </div>
            <ol className="space-y-2">
              {s.content.key_facts.map((f, i) => (
                <li key={i} className="flex gap-3 rounded-2xl bg-card/80 px-3.5 py-2.5 text-[15px] leading-snug font-medium shadow-[inset_0_0_0_1px_var(--line)]">
                  <span className="pt-0.5 font-mono text-[11px] text-(--cat-ink)">{String(i + 1).padStart(2, "0")}</span>
                  <span lang={hi ? "hi" : undefined}>{pick(f, ui)}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {s.mcqs.length > 0 && (
          <div className="relative mt-6 rounded-[22px] bg-card p-4 shadow-[inset_0_0_0_1px_var(--line-2)] sm:p-5">
            <div className="eyebrow mb-2 flex items-center gap-1.5 text-ink-3 lg:mb-3">
              <Zap className="size-3.5 text-flare" /> {hi ? "तुरंत प्रश्न" : multi ? "Quick questions" : "Quick question"}
            </div>
            <div className="space-y-6">
              {s.mcqs.map((mcq, qi) => {
                const picked = picks[mcq.id] ?? null;
                const earlier = picked === null ? resultOf(mcq) : null;
                return (
                  <div key={mcq.id} className={cx("relative", qi > 0 && "border-t border-line pt-5")}>
                    {picked !== null && picked === mcq.content.answer && <Confetti pieces={18} />}
                    {earlier ? (
                      <div className={cx("rounded-2xl p-3.5 text-sm", earlier === "right" ? "bg-good-soft text-good-ink" : "bg-bad-soft text-bad-ink")}>
                        <div className="font-semibold">
                          {earlier === "right" ? (hi ? "आपने यह पहले सही किया था" : "You got this right earlier") : hi ? "पहले छूट गया था · अब दोहराव में" : "Missed earlier · now in your Revise queue"}
                        </div>
                        <div className="mt-1 text-ink">
                          {mcq.content.style === "direct" ? `${pick(mcq.content.question, ui)} → ` : hi ? "उत्तर: " : "Answer: "}<b>{lang === "hi" ? mcq.content.options.hi[mcq.content.answer] : mcq.content.options.en[mcq.content.answer]}</b>
                        </div>
                      </div>
                    ) : (
                      <McqView
                        mcq={mcq.content}
                        lang={lang}
                        selected={picked}
                        reveal={picked !== null}
                        onSelect={picked === null ? (a) => onAnswer(mcq, a) : undefined}
                        number={multi ? qi + 1 : undefined}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer: the deep dive and saving */}
      <div className="relative flex items-center gap-2 border-t border-line bg-card/60 px-3 py-3 backdrop-blur-md sm:px-5">
        <button onClick={onDeep} className="btn btn-ghost h-11 shrink-0 px-4 text-sm">
          <BookOpenText className="size-4" /> {hi ? "विस्तार" : "Deep dive"}
        </button>
        <BookmarkButton storyId={s.id} />
        <span className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] text-ink-3">
          {hi ? "आगे स्क्रॉल करें" : "Scroll for next"} <ArrowDown className="size-3.5" />
        </span>
      </div>
    </article>
  );
}

function EndCard({ lang, date, readN, total, right, answered, moreCount, onMore }: { lang: Lang; date: string; readN: number; total: number; right: number; answered: number; moreCount: number; onMore: () => void }) {
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  const due = dueCount(useProgress());
  const complete = total > 0 && readN === total;
  return (
    <div className="relative flex flex-col overflow-hidden rounded-[28px] bg-[#10110e] p-6 text-[#f3f2ec] shadow-card dark:bg-card dark:shadow-[inset_0_0_0_1px_var(--line-2)] sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-[#c8f135] opacity-20 blur-3xl" />
      {complete && <Confetti pieces={40} />}
      <div className="relative flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-[16px] bg-[#c8f135] text-[#10110e]">
          <Trophy className="size-6" />
        </span>
        <span className="eyebrow text-white/60 dark:text-ink-3">{fmtDate(date, ui, { weekday: "long", day: "numeric", month: "short" })}</span>
      </div>
      <h2 className="relative mt-5 font-display text-[34px] leading-none sm:text-[44px]">
        {complete ? (hi ? "सार पूरा!" : <>Brief <span>complete.</span></>) : hi ? "डेक का अंत" : <>End of the <span>brief.</span></>}
      </h2>
      <p className="relative mt-2 text-sm text-white/65 dark:text-ink-2">
        {complete
          ? hi
            ? "आज की सभी ख़बरें खुल गईं। अब क्विज़ से पक्का करें।"
            : "Every story read. Lock it in with the quiz, then revise."
          : hi
            ? `${total - readN} ख़बरें अभी खुली नहीं हैं।`
            : `${total - readN} ${total - readN === 1 ? "story is" : "stories are"} still unread. Scroll back up to finish.`}
      </p>

      <div className="relative mt-6 grid grid-cols-2 gap-2">
        <div className="rounded-[18px] bg-white/8 p-3.5 dark:bg-card-2">
          <div className="font-display text-[27px] leading-none">
            {readN}
            <span className="text-lg opacity-50">/{total}</span>
          </div>
          <div className="mt-1 text-[11px] text-white/60 dark:text-ink-3">{hi ? "पढ़ीं" : "read"}</div>
        </div>
        <div className="rounded-[18px] bg-white/8 p-3.5 dark:bg-card-2">
          <div className="font-display text-[27px] leading-none">
            {right}
            <span className="text-lg opacity-50">/{answered}</span>
          </div>
          <div className="mt-1 text-[11px] text-white/60 dark:text-ink-3">{hi ? "सही" : "right"}</div>
        </div>
      </div>

      <div className="relative mt-auto grid gap-2 pt-6 sm:grid-cols-2">
        <Link href={`/practice/run?kind=daily&from=${date}&to=${date}`} className="btn h-12 text-[15px]">
          <Target className="size-4" /> {hi ? "डेली क्विज़" : "Daily quiz"}
        </Link>
        <Link href="/revise" className="btn btn-cobalt h-12 text-[15px]">
          <Brain className="size-4" /> {hi ? "दोहराएँ" : "Revise"} {due > 0 && <span className="rounded-full bg-white/20 px-2 font-mono text-xs">{due}</span>}
        </Link>
        {moreCount > 0 && (
          <button onClick={onMore} className="btn btn-glass h-12 text-[15px] text-white sm:col-span-2 dark:text-ink dark:[--b:var(--card-2)]">
            {hi ? `${moreCount} और ख़बरें` : `${moreCount} more stories`} <ArrowDown className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function ContextPanel({ s, lang }: { s: DeckStory; lang: Lang }) {
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  const kinds = [
    { k: "official", label: hi ? "आधिकारिक" : "Official", icon: ShieldCheck, cls: "text-good-ink" },
    { k: "press", label: hi ? "समाचार रिपोर्ट" : "Press reports", icon: Newspaper, cls: "text-amber-ink" },
    { k: "also", label: hi ? "यहाँ भी" : "Also covered by", icon: ArrowRight, cls: "text-ink-3" },
  ] as const;
  return (
    <div className="rise space-y-6">
      <div className="eyebrow text-ink-3">{hi ? "इस ख़बर का संदर्भ" : "Context for this story"}</div>
      <div className="rounded-[20px] bg-signal-soft p-4 text-sm leading-relaxed">
        <div className="eyebrow mb-2 flex items-center gap-1.5 text-signal-ink">
          <Lightbulb className="size-3.5" /> {t("whyItMatters", ui)}
        </div>
        <p lang={hi ? "hi" : undefined}>{pick(s.content.why_it_matters, ui)}</p>
      </div>
      {s.thread && (
        <div>
          <div className="eyebrow mb-1 flex items-center gap-1.5 text-amber-ink">
            <Waypoints className="size-3.5" /> {hi ? "घटनाक्रम" : "Storyline"} · {s.thread.count}
          </div>
          <div className="mb-3 text-sm font-semibold">{pick(s.thread.title, ui)}</div>
          <MiniTimeline items={s.thread.nearby} currentId={s.id} ui={ui} />
        </div>
      )}
      <div>
        <div className="eyebrow mb-2 text-ink-3">{hi ? "स्रोत" : "Sources"}</div>
        <ul className="space-y-1.5">
          {kinds.flatMap(({ k, label, icon: Icon, cls }) =>
            s.sources
              .filter((x) => x.kind === k)
              .map((x) => (
                <li key={x.url}>
                  <a href={x.url} target="_blank" rel="noopener noreferrer" className="group flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm hover:bg-card-2">
                    <Icon className={cx("size-4 shrink-0", cls)} />
                    <span className="min-w-0 flex-1 truncate font-medium">{x.name}</span>
                    <span className={cx("eyebrow shrink-0", cls)}>{label}</span>
                  </a>
                </li>
              )),
          )}
        </ul>
      </div>
    </div>
  );
}

function DayContext({ lang }: { lang: Lang }) {
  const hi = lang === "hi";
  const keys: [string, string][] = [
    ["J K", hi ? "अगली / पिछली ख़बर" : "Next / previous story"],
    ["1–4", hi ? "उत्तर चुनें" : "Answer the question"],
    ["D", hi ? "पूरा पढ़ें" : "Open the deep dive"],
  ];
  return (
    <div>
      <div className="eyebrow mb-3 text-ink-3">{hi ? "कीबोर्ड" : "Keyboard"}</div>
      <ul className="space-y-2 text-sm">
        {keys.map(([k, v]) => (
          <li key={k} className="flex items-center gap-3">
            <kbd className="min-w-10 rounded-lg bg-card-2 px-2 py-1 text-center font-mono text-xs shadow-[inset_0_0_0_1px_var(--line-2)]">{k}</kbd>
            {v}
          </li>
        ))}
      </ul>
    </div>
  );
}
