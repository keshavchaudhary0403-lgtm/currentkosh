"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowDown,
  ArrowRight,
  BookOpenText,
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Layers3,
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
import { answerQuestion, markRead, useProgress } from "@/lib/progress-store";
import { t } from "@/lib/i18n";
import { categoryById, pick, type Lang } from "@/lib/taxonomy";
import { CategoryIcon, catStyle } from "./category-icon";
import { McqView } from "./mcq";
import { MiniTimeline, ReaderSheet } from "./reader";
import { BookmarkButton } from "./story-actions";
import { Confetti, Count, RelevanceBadge, cx, fmtDate } from "./ui";
import { XP, useXp } from "./xp";

// Phones get a card that never scrolls inside (it would fight the deck swipe); desktop may.
const DESKTOP = "(min-width: 1024px)";
const useIsDesktop = () =>
  useSyncExternalStore(
    (cb) => {
      const m = matchMedia(DESKTOP);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => matchMedia(DESKTOP).matches,
    () => false,
  );

type Item = { kind: "story"; s: DeckStory; group: "main" | "more"; n: number; of: number } | { kind: "end" };

/**
 * Today as a deck: one story per screen, snapping vertically. Each card unfolds in place —
 * headline → key facts → one MCQ — and a reader sheet holds the deep dive.
 * On desktop the same deck sits between a queue (left) and a live context panel (right).
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
  const [layers, setLayers] = useState<Record<string, number>>({});
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [combo, setCombo] = useState(0);
  const [pop, setPop] = useState<{ id: string; text: string; key: number } | null>(null);
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
  const mainCount = items.filter((x) => x.kind === "story" && x.group === "main").length;
  const all = useMemo(() => [...main, ...more], [main, more]);
  const byId = useMemo(() => new Map(all.map((s) => [s.id, s])), [all]);

  // Last answer recorded for a story's deck question (this session first, then saved progress).
  const result = (s: DeckStory): "right" | "wrong" | null => {
    const m = s.mcqs[0];
    if (!m) return null;
    if (picks[s.id] !== undefined) return picks[s.id] === m.content.answer ? "right" : "wrong";
    const log = [...p.answers].reverse().find((a) => a.mcqId === m.id);
    return log ? (log.correct ? "right" : "wrong") : null;
  };
  const maxLayer = (s: DeckStory) => (s.mcqs.length ? 2 : 1);
  const layerOf = (s: DeckStory) => layers[s.id] ?? (result(s) ? 2 : 0);

  const goTo = useCallback((i: number) => {
    const el = cards.current[i];
    const box = scroller.current;
    if (!el || !box) return;
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({ top: el.offsetTop - box.offsetTop, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const reveal = (s: DeckStory, to?: number) => {
    const next = Math.min(maxLayer(s), to ?? layerOf(s) + 1);
    setLayers((l) => ({ ...l, [s.id]: next }));
    if (next >= 1 && !p.reads[s.id]) markRead(s.id, s.cardIds);
  };

  const answer = (s: DeckStory, i: number) => {
    const m = s.mcqs[0];
    const ok = i === m.content.answer;
    setPicks((x) => ({ ...x, [s.id]: i }));
    answerQuestion(m.id, s.category, ok);
    const c = ok ? combo + 1 : 0;
    setCombo(c);
    setPop({ id: s.id, text: ok ? `+${XP.right} XP${c >= 2 ? ` · ×${c} combo` : ""}` : `+${XP.wrong} XP`, key: Date.now() });
  };

  // Track the card in view.
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
      { root: box, threshold: 0.6 },
    );
    cards.current.forEach((c) => c && io.observe(c));
    return () => io.disconnect();
  }, [items]);

  // Keyboard: ↑/↓ or j/k move between cards, → / Enter / Space unfold, ← folds, D opens the deep dive.
  const keys = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    keys.current = (e: KeyboardEvent) => {
      if (reader || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement)?.closest?.("input,textarea,select,[role=dialog]")) return;
      const it = items[active];
      const k = e.key;
      if (k === "ArrowDown" || k === "j") {
        e.preventDefault();
        goTo(Math.min(items.length - 1, active + 1));
      } else if (k === "ArrowUp" || k === "k") {
        e.preventDefault();
        goTo(Math.max(0, active - 1));
      } else if (it?.kind === "story" && (k === "ArrowRight" || k === "Enter" || k === " ")) {
        e.preventDefault();
        if (layerOf(it.s) < maxLayer(it.s)) reveal(it.s);
        else goTo(Math.min(items.length - 1, active + 1));
      } else if (it?.kind === "story" && k === "ArrowLeft") {
        setLayers((l) => ({ ...l, [it.s.id]: Math.max(0, layerOf(it.s) - 1) }));
      } else if (it?.kind === "story" && (k === "d" || k === "D")) {
        setReader(it.s.id);
      } else if (it?.kind === "story" && layerOf(it.s) === 2 && picks[it.s.id] === undefined && !result(it.s) && ["1", "2", "3", "4"].includes(k)) {
        answer(it.s, Number(k) - 1);
      }
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
  const answered = mainStories.map(result).filter(Boolean);
  const right = answered.filter((r) => r === "right").length;
  const activeItem = items[active];
  const activeStory = activeItem?.kind === "story" ? activeItem.s : null;
  const readerStory = reader ? byId.get(reader) : null;

  const toolbar = (
    <div className="flex min-w-0 items-center gap-2">
      <div className="shrink-0 lg:hidden">{picker}</div>
      <div className="no-scrollbar max-lg:fade-x flex min-w-0 gap-1.5 overflow-x-auto py-0.5 pr-4" role="toolbar" aria-label={hi ? "फ़िल्टर" : "Filter the deck"}>
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
      {/* Left pane (desktop): the deck queue. */}
      <aside className="hidden min-h-0 flex-col lg:flex" aria-label={hi ? "आज की सूची" : "Today's queue"}>
        <div className="card flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-line p-3">
            {picker}
            <span className="font-mono text-[11px] text-ink-3 tnum">
              {readN}/{mainStories.length} {hi ? "खुलीं" : "read"} · {right}/{answered.length} {hi ? "सही" : "right"}
            </span>
          </div>
          <ol className="flex-1 overflow-y-auto p-2">
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

      {/* Centre: toolbar + the snapping deck. */}
      <div className="flex min-h-0 flex-col gap-2 lg:gap-3">
        <div className="px-3 lg:px-0">{toolbar}</div>
        <div className="relative min-h-0 flex-1 lg:pr-14">
          <div ref={scroller} className="deck h-full overflow-y-auto" tabIndex={-1} aria-label={hi ? "ख़बरों की डेक" : "Story deck"}>
            {items.map((it, i) => (
              <section
                key={it.kind === "end" ? "end" : it.s.id}
                ref={(el) => {
                  cards.current[i] = el;
                }}
                data-i={i}
                className="h-full px-2 pb-[84px] sm:px-3 lg:px-0 lg:pb-3"
                aria-roledescription="card"
              >
                {it.kind === "end" ? (
                  <EndCard lang={lang} date={date} readN={readN} total={mainStories.length} right={right} answered={answered.length} moreCount={items.length - i - 1} onMore={() => goTo(i + 1)} />
                ) : (
                  <StoryCardDeck
                    it={it}
                    lang={lang}
                    layer={layerOf(it.s)}
                    max={maxLayer(it.s)}
                    read={!!p.reads[it.s.id]}
                    picked={picks[it.s.id] ?? null}
                    earlier={picks[it.s.id] === undefined ? result(it.s) : null}
                    pop={pop?.id === it.s.id ? pop : null}
                    combo={combo}
                    onReveal={(to) => reveal(it.s, to)}
                    onAnswer={(a) => answer(it.s, a)}
                    onNext={() => goTo(i + 1)}
                    onDeep={() => setReader(it.s.id)}
                  />
                )}
              </section>
            ))}
          </div>
          {/* Phone progress rail: seen, answered, remaining. */}
          <div className="pointer-events-none absolute top-1/2 right-0 flex -translate-y-1/2 flex-col gap-1 lg:hidden" aria-hidden>
            {items.slice(0, mainCount + 1).map((it, i) => (
              <span
                key={i}
                className={cx(
                  "w-1 rounded-full transition-all duration-300",
                  i === active ? "h-6 bg-signal shadow-[0_0_0_1px_var(--ink)]" : "h-2.5",
                  i !== active &&
                    (it.kind === "end"
                      ? "bg-ink-3"
                      : result(it.s) === "right"
                        ? "bg-good"
                        : result(it.s) === "wrong"
                          ? "bg-bad"
                          : seen.has(it.s.id) || p.reads[it.s.id]
                            ? "bg-ink"
                            : "bg-line-2"),
                )}
              />
            ))}
          </div>
          {/* Desktop up/down controls */}
          <div className="absolute top-1/2 right-0 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
            <button onClick={() => goTo(Math.max(0, active - 1))} aria-label="Previous card" className="btn btn-ghost size-11 px-0 shadow-card">
              <ChevronUp className="size-5" />
            </button>
            <button onClick={() => goTo(Math.min(items.length - 1, active + 1))} aria-label="Next card" className="btn btn-ink size-11 px-0 shadow-card">
              <ChevronDown className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right pane (desktop): live context for the active card. */}
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

const LAYER_NAMES = { en: ["Headline", "Key facts", "Test"], hi: ["शीर्षक", "मुख्य तथ्य", "प्रश्न"] };

function StoryCardDeck({
  it,
  lang,
  layer,
  max,
  read,
  picked,
  earlier,
  pop,
  combo,
  onReveal,
  onAnswer,
  onNext,
  onDeep,
}: {
  it: Extract<Item, { kind: "story" }>;
  lang: Lang;
  layer: number;
  max: number;
  read: boolean;
  picked: number | null;
  earlier: "right" | "wrong" | null;
  pop: { text: string; key: number } | null;
  combo: number;
  onReveal: (to?: number) => void;
  onAnswer: (i: number) => void;
  onNext: () => void;
  onDeep: () => void;
}) {
  const s = it.s;
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  const mcq = s.mcqs[0];
  const done = layer >= max && (!mcq || picked !== null || earlier);
  const names = LAYER_NAMES[hi ? "hi" : "en"];
  const primary = done
    ? { label: hi ? "अगली ख़बर" : "Next story", icon: ArrowDown, go: onNext }
    : layer === 0
      ? { label: hi ? "तथ्य खोलें" : "Unfold key facts", icon: Layers3, go: () => onReveal() }
      : layer === 1
        ? { label: hi ? "ख़ुद को परखें" : "Test yourself", icon: Zap, go: () => onReveal() }
        : { label: hi ? "छोड़ें" : "Skip", icon: ArrowDown, go: onNext };
  const body = useRef<HTMLDivElement>(null);
  const desktop = useIsDesktop();
  // Phones: if a layer still overflows the card, tighten in steps. 1: smaller type; 2: fewer facts and
  // no inner question card; 3: hide the card's top row. Only step 4 lets the body scroll, so nothing is cut off.
  const fitKey = `${layer}:${picked}:${earlier}`;
  const [fitState, setFit] = useState({ key: fitKey, level: 0 });
  const tight = fitState.key === fitKey ? fitState.level : 0;
  useEffect(() => {
    if (desktop || layer === 0) return;
    const id = setTimeout(
      () => {
        const el = body.current;
        if (el && el.scrollHeight - el.clientHeight > 1 && tight < 4) setFit({ key: fitKey, level: tight + 1 });
      },
      tight === 0 ? 560 : 40,
    );
    return () => clearTimeout(id);
  }, [desktop, layer, fitKey, tight]);
  // Phone layer 0: clamp the summary to the lines that fit under the headline; Deep dive has the rest.
  const sumBox = useRef<HTMLDivElement>(null);
  const sumText = useRef<HTMLParagraphElement>(null);
  const [lines, setLines] = useState(0);
  useLayoutEffect(() => {
    const box = sumBox.current;
    const p = sumText.current;
    if (!box || !p || desktop || layer !== 0) return;
    const fit = () => {
      const lh = parseFloat(getComputedStyle(p).lineHeight) || 26;
      setLines(Math.max(2, Math.floor(box.clientHeight / lh)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [desktop, layer]);
  // Desktop: bring each new layer into view as it unfolds.
  useEffect(() => {
    const el = body.current;
    if (!el || layer < 2 || !desktop) return;
    const id = setTimeout(() => {
      const target = el.querySelector<HTMLElement>(`[data-layer="${layer}"]`);
      if (target) el.scrollTo({ top: target.offsetTop - 12, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }, 220);
    return () => clearTimeout(id);
  }, [layer, desktop]);

  return (
    <div
      className="cat mesh card group relative flex h-full flex-col overflow-hidden rounded-[28px] shadow-card"
      style={catStyle(s.category)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button,a,[role=radio]")) return;
        if (layer < max) onReveal();
      }}
    >
      {/* Top row */}
      <div className={cx("relative flex items-center gap-2 px-4 pt-4 sm:px-6 sm:pt-5 [@media(max-height:720px)]:pt-3", tight >= 3 && "max-lg:hidden")}>
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

      {/* Body: unfolds in place */}
      <div
        ref={body}
        data-tight={tight}
        className={cx(
          "relative flex min-h-0 flex-1 flex-col px-4 pt-3 pb-2 sm:px-6 lg:overflow-y-auto lg:overscroll-contain lg:pt-4",
          tight >= 4 ? "overflow-y-auto overscroll-contain" : "overflow-hidden",
        )}
      >
        <h2
          lang={hi ? "hi" : undefined}
          className={cx(
            "shrink-0 font-display transition-all duration-500",
            layer === 0 ? "text-[28px] sm:text-[34px] lg:text-[38px]" : layer === 1
              ? "text-[20px] max-lg:line-clamp-2 sm:text-[24px]"
              : "text-[17px] max-lg:line-clamp-2 max-lg:[@media(max-height:720px)]:hidden sm:text-[22px] lg:text-[24px]",
            layer >= 2 && tight >= 1 && "max-lg:hidden",
          )}
        >
          {pick(s.content.title, ui)}
        </h2>
        {lang === "bi" && (
          <p lang="hi" className={cx("mt-2 shrink-0 text-base font-medium text-ink-2", layer >= 2 && "max-lg:hidden")}>
            {s.content.title.hi}
          </p>
        )}
        {/* Layer 0 shows the whole short summary; once facts unfold it shrinks to the one-line hook. */}
        {layer === 0 ? (
          <div ref={sumBox} className="mt-3 min-h-0 flex-1 overflow-hidden lg:flex-none lg:overflow-visible">
            <p
              ref={sumText}
              lang={hi ? "hi" : undefined}
              className="text-[16px] leading-relaxed text-ink-2 sm:text-[17px]"
              style={
                !desktop && lines
                  ? { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: lines, overflow: "hidden", maskImage: "linear-gradient(#000 calc(100% - 1.7em), transparent)" }
                  : undefined
              }
            >
              {pick(s.content.summary, ui)}
            </p>
          </div>
        ) : (
          <p lang={hi ? "hi" : undefined} className="mt-2 line-clamp-2 shrink-0 text-sm text-ink-2 max-lg:hidden">
            {pick(s.hook, ui)}
          </p>
        )}

        <div className="unfold shrink-0" data-open={layer === 1 || (layer >= 2 && desktop)}>
          <div>
            <div data-layer="1" className="eyebrow mt-3 mb-2 flex lg:mt-5 items-center gap-1.5 text-(--cat-ink)">
              <Sparkles className="size-3.5" /> {t("keyFacts", ui)}
            </div>
            <ol className={cx("space-y-1.5 lg:space-y-2 max-lg:[@media(max-height:720px)]:[&>li:nth-child(n+4)]:hidden", tight >= 2 && "max-lg:[&>li:nth-child(n+4)]:hidden")}>
              {s.content.key_facts.slice(0, 4).map((f, i) => (
                <li
                  key={i}
                  className={cx(
                    "flex gap-3 rounded-2xl bg-card/80 px-3 py-2 text-[14px] leading-snug font-medium shadow-[inset_0_0_0_1px_var(--line)] lg:px-3.5 lg:py-2.5 lg:text-[15px]",
                    tight >= 1 && "max-lg:py-1.5 max-lg:text-[13px]",
                  )}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <span className="pt-0.5 font-mono text-[11px] text-(--cat-ink)">{String(i + 1).padStart(2, "0")}</span>
                  <span lang={hi ? "hi" : undefined} className="max-lg:line-clamp-3">
                    {pick(f, ui)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {mcq && (
          <div className="unfold shrink-0" data-open={layer >= 2}>
            <div>
              <div
                data-layer="2"
                className={cx(
                  "relative mt-3 rounded-[22px] bg-card p-3 shadow-[inset_0_0_0_1px_var(--line-2)] sm:p-4 lg:mt-5 lg:p-5",
                  tight >= 2 && "max-lg:mt-1 max-lg:bg-transparent max-lg:p-0 max-lg:shadow-none",
                )}
              >
                {pop && (
                  <span key={pop.key} className="xp-pop absolute -top-3 right-4 z-10 rounded-full bg-signal px-3 py-1 font-mono text-xs font-semibold text-on-signal shadow-card">
                    {pop.text}
                  </span>
                )}
                {picked !== null && picked === mcq.content.answer && <Confetti key={pop?.key} pieces={18} />}
                <div className={cx("eyebrow mb-2 flex items-center justify-between text-ink-3 lg:mb-3", tight >= 1 && "max-lg:hidden")}>
                  <span className="inline-flex items-center gap-1.5">
                    <Zap className="size-3.5 text-flare" /> {hi ? "तुरंत प्रश्न" : "Quick question"} · +{XP.right} XP
                  </span>
                  {combo >= 2 && (
                    <span className="inline-flex items-center gap-1 text-flare-ink">
                      <Flame className="flicker size-3.5" /> ×{combo}
                    </span>
                  )}
                </div>
                {earlier && picked === null ? (
                  <div className={cx("rounded-2xl p-3.5 text-sm", earlier === "right" ? "bg-good-soft text-good-ink" : "bg-bad-soft text-bad-ink")}>
                    <div className="font-semibold">
                      {earlier === "right" ? (hi ? "आपने यह पहले सही किया था" : "You got this right earlier") : hi ? "पहले छूट गया था · अब दोहराव में" : "Missed earlier · now in your Revise queue"}
                    </div>
                    <div className="mt-1 text-ink">
                      {pick(mcq.content.question, ui).split("\n")[0]} → <b>{lang === "hi" ? mcq.content.options.hi[mcq.content.answer] : mcq.content.options.en[mcq.content.answer]}</b>
                    </div>
                  </div>
                ) : (
                  <McqView mcq={mcq.content} lang={lang} selected={picked} reveal={picked !== null} onSelect={picked === null ? onAnswer : undefined} compact={!desktop} tight={tight >= 1} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer: layer meter + actions */}
      <div className="relative flex items-center gap-2 border-t border-line bg-card/60 px-3 py-3 backdrop-blur-md sm:px-5 [@media(max-height:720px)]:py-2">
        <div className="hidden items-center gap-1 sm:flex" aria-label={`${names[layer]} · ${layer + 1}/${max + 1}`}>
          {Array.from({ length: max + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => onReveal(i)}
              title={names[i]}
              aria-label={names[i]}
              className={cx("h-2 rounded-full transition-all duration-300", i <= layer ? "w-7 bg-(--cat-solid)" : "w-2 bg-line-2 hover:bg-ink-3")}
            />
          ))}
        </div>
        <button onClick={onDeep} className="btn btn-ghost h-11 shrink-0 px-4 text-sm">
          <BookOpenText className="size-4" /> {hi ? "विस्तार" : "Deep dive"}
        </button>
        <BookmarkButton storyId={s.id} />
        <button onClick={primary.go} className={cx("btn group/p ml-auto h-11 min-w-0 px-4 text-sm sm:px-5", done && "btn-ink")}>
          <span className="truncate">{primary.label}</span>
          <primary.icon className="size-4 shrink-0 transition group-hover/p:translate-y-0.5" />
        </button>
      </div>
    </div>
  );
}

function EndCard({ lang, date, readN, total, right, answered, moreCount, onMore }: { lang: Lang; date: string; readN: number; total: number; right: number; answered: number; moreCount: number; onMore: () => void }) {
  const ui = lang === "bi" ? "en" : lang;
  const hi = ui === "hi";
  const xp = useXp();
  const complete = total > 0 && readN === total;
  return (
    <div className="relative flex h-full flex-col overflow-y-auto rounded-[28px] bg-[#10110e] p-6 text-[#f3f2ec] shadow-card dark:bg-card dark:shadow-[inset_0_0_0_1px_var(--line-2)] sm:p-8">
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
            : "Every story unfolded. Lock it in with the quiz, then revise."
          : hi
            ? `${total - readN} ख़बरें अभी खुली नहीं हैं।`
            : `${total - readN} ${total - readN === 1 ? "story is" : "stories are"} still folded. Swipe back up to finish.`}
      </p>

      <div className="relative mt-6 grid grid-cols-3 gap-2">
        <div className="rounded-[18px] bg-white/8 p-3.5 dark:bg-card-2">
          <div className="font-display text-[27px] leading-none">
            {readN}
            <span className="text-lg opacity-50">/{total}</span>
          </div>
          <div className="mt-1 text-[11px] text-white/60 dark:text-ink-3">{hi ? "पढ़ीं" : "unfolded"}</div>
        </div>
        <div className="rounded-[18px] bg-white/8 p-3.5 dark:bg-card-2">
          <div className="font-display text-[27px] leading-none">
            {right}
            <span className="text-lg opacity-50">/{answered}</span>
          </div>
          <div className="mt-1 text-[11px] text-white/60 dark:text-ink-3">{hi ? "सही" : "right"}</div>
        </div>
        <div className="rounded-[18px] bg-[#c8f135] p-3.5 text-[#10110e]">
          <div className="font-display text-[27px] leading-none">
            +<Count to={xp.today} />
          </div>
          <div className="mt-1 text-[11px] opacity-70">XP {hi ? "आज" : "today"}</div>
        </div>
      </div>
      <div className="relative mt-3 flex items-center gap-2 text-sm text-white/75 dark:text-ink-2">
        <Flame className={cx("size-5 text-[#c8f135]", xp.streak > 0 && "flicker")} /> <b className="tnum">{xp.streak}</b> {hi ? "दिन लगातार" : "day streak"} · Lv {xp.level}
      </div>

      <div className="relative mt-auto grid gap-2 pt-6 sm:grid-cols-2">
        <Link href={`/practice/run?kind=daily&from=${date}&to=${date}`} className="btn h-12 text-[15px]">
          <Target className="size-4" /> {hi ? "डेली क्विज़" : "Daily quiz"}
        </Link>
        <Link href="/revise" className="btn btn-cobalt h-12 text-[15px]">
          <Brain className="size-4" /> {hi ? "दोहराएँ" : "Revise"} {xp.due > 0 && <span className="rounded-full bg-white/20 px-2 font-mono text-xs">{xp.due}</span>}
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
      <div className="eyebrow text-ink-3">{hi ? "इस कार्ड का संदर्भ" : "Context for this card"}</div>
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
    ["↑ ↓", hi ? "कार्ड बदलें" : "Move between cards"],
    ["→", hi ? "अगली परत खोलें" : "Unfold the next layer"],
    ["←", hi ? "परत बंद करें" : "Fold a layer"],
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
