import type { Lang } from "./taxonomy";

const STRINGS = {
  today: { en: "Today", hi: "आज" },
  revise: { en: "Revise", hi: "दोहराएँ" },
  practice: { en: "Practice", hi: "अभ्यास" },
  threads: { en: "Storylines", hi: "कहानी-क्रम" },
  archive: { en: "Archive", hi: "संग्रह" },
  progress: { en: "Progress", hi: "प्रगति" },
  saved: { en: "Saved", hi: "सहेजे गए" },
  sources: { en: "Sources", hi: "स्रोत" },
  settings: { en: "Settings", hi: "सेटिंग्स" },
  todaysBrief: { en: "Today's brief", hi: "आज का सार" },
  done: { en: "Done for today", hi: "आज का पूरा" },
  readTime: { en: "min read", hi: "मिनट" },
  keyFacts: { en: "Key facts", hi: "मुख्य तथ्य" },
  whyItMatters: { en: "Why it matters for your exam", hi: "परीक्षा के लिए क्यों ज़रूरी" },
  mainsAngle: { en: "Mains angle", hi: "मुख्य परीक्षा दृष्टिकोण" },
  staticLink: { en: "Static link", hi: "स्थैतिक संबंध" },
  glossary: { en: "Glossary", hi: "शब्दावली" },
  quickCheck: { en: "Quick check", hi: "त्वरित जाँच" },
  markRead: { en: "Mark as read", hi: "पढ़ा हुआ चिह्नित करें" },
  read: { en: "Read", hi: "पढ़ा" },
  mustKnow: { en: "Must-know", hi: "अवश्य जानें" },
  likely: { en: "Likely", hi: "संभावित" },
  low: { en: "Optional", hi: "वैकल्पिक" },
  dueNow: { en: "due now", hi: "अभी बाकी" },
  streak: { en: "day streak", hi: "दिन लगातार" },
  startQuiz: { en: "Take today's quiz", hi: "आज की क्विज़ दें" },
  noStories: { en: "Nothing here yet", hi: "अभी यहाँ कुछ नहीं" },
  sample: { en: "Sample", hi: "नमूना" },
} as const;

export type StringKey = keyof typeof STRINGS;

/** UI label in the user's language. Bilingual mode uses Hindi labels only where space allows, so it reads English here. */
export function t(key: StringKey, lang: Lang): string {
  const s = STRINGS[key];
  return lang === "hi" ? s.hi : s.en;
}
