// Shared vocabulary for exams, topics and states. Every story is tagged against
// these lists, and every user's feed is filtered through them.

export type Bi = { en: string; hi: string };
export type Lang = "en" | "hi" | "bi";

export const EXAMS = [
  { id: "upsc", label: { en: "UPSC CSE", hi: "यूपीएससी सीएसई" }, blurb: { en: "Prelims + Mains, analysis-heavy", hi: "प्रारंभिक + मुख्य, विश्लेषण आधारित" } },
  { id: "state_psc", label: { en: "State PSC", hi: "राज्य लोक सेवा आयोग" }, blurb: { en: "UPPSC, BPSC, RPSC, MPPSC…", hi: "UPPSC, BPSC, RPSC, MPPSC…" } },
  { id: "ssc", label: { en: "SSC", hi: "एसएससी" }, blurb: { en: "CGL, CHSL, MTS, GD", hi: "CGL, CHSL, MTS, GD" } },
  { id: "banking", label: { en: "Banking & Insurance", hi: "बैंकिंग व बीमा" }, blurb: { en: "IBPS, SBI, RBI, LIC", hi: "IBPS, SBI, RBI, LIC" } },
  { id: "railways", label: { en: "Railways", hi: "रेलवे" }, blurb: { en: "RRB NTPC, Group D, ALP", hi: "RRB NTPC, ग्रुप D, ALP" } },
  { id: "defence", label: { en: "Defence", hi: "रक्षा" }, blurb: { en: "CDS, NDA, AFCAT, CAPF", hi: "CDS, NDA, AFCAT, CAPF" } },
  { id: "teaching", label: { en: "Teaching", hi: "शिक्षक भर्ती" }, blurb: { en: "CTET, State TETs, KVS, NVS, DSSSB", hi: "CTET, राज्य TET, KVS, NVS, DSSSB" } },
] as const satisfies readonly { id: string; label: Bi; blurb: Bi }[];
export type ExamId = (typeof EXAMS)[number]["id"];
export const EXAM_IDS = EXAMS.map((e) => e.id) as [ExamId, ...ExamId[]];

export const CATEGORIES = [
  { id: "polity", label: { en: "Polity & Governance", hi: "राजव्यवस्था व शासन" }, hue: 262 },
  { id: "schemes", label: { en: "Schemes & Policies", hi: "योजनाएँ व नीतियाँ" }, hue: 200 },
  { id: "economy", label: { en: "Economy & Banking", hi: "अर्थव्यवस्था व बैंकिंग" }, hue: 150 },
  { id: "international", label: { en: "International Relations", hi: "अंतरराष्ट्रीय संबंध" }, hue: 220 },
  { id: "environment", label: { en: "Environment & Ecology", hi: "पर्यावरण व पारिस्थितिकी" }, hue: 130 },
  { id: "science_tech", label: { en: "Science & Tech", hi: "विज्ञान व प्रौद्योगिकी" }, hue: 185 },
  { id: "defence", label: { en: "Defence & Security", hi: "रक्षा व सुरक्षा" }, hue: 20 },
  { id: "reports_indices", label: { en: "Reports & Indices", hi: "रिपोर्ट व सूचकांक" }, hue: 45 },
  { id: "appointments", label: { en: "Appointments", hi: "नियुक्तियाँ" }, hue: 290 },
  { id: "awards", label: { en: "Awards & Honours", hi: "पुरस्कार व सम्मान" }, hue: 35 },
  { id: "sports", label: { en: "Sports", hi: "खेल" }, hue: 0 },
  { id: "culture", label: { en: "Art, Culture & History", hi: "कला, संस्कृति व इतिहास" }, hue: 320 },
  { id: "social", label: { en: "Health, Education & Society", hi: "स्वास्थ्य, शिक्षा व समाज" }, hue: 340 },
  { id: "geography", label: { en: "Geography & Disasters", hi: "भूगोल व आपदा" }, hue: 95 },
  { id: "days", label: { en: "Important Days", hi: "महत्वपूर्ण दिवस" }, hue: 60 },
] as const satisfies readonly { id: string; label: Bi; hue: number }[];
export type CategoryId = (typeof CATEGORIES)[number]["id"];
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [CategoryId, ...CategoryId[]];

export const GS_PAPERS = ["GS1", "GS2", "GS3", "GS4", "none"] as const;
export type GsPaper = (typeof GS_PAPERS)[number];

export const STATES = [
  { id: "AP", label: { en: "Andhra Pradesh", hi: "आंध्र प्रदेश" } },
  { id: "AR", label: { en: "Arunachal Pradesh", hi: "अरुणाचल प्रदेश" } },
  { id: "AS", label: { en: "Assam", hi: "असम" } },
  { id: "BR", label: { en: "Bihar", hi: "बिहार" } },
  { id: "CG", label: { en: "Chhattisgarh", hi: "छत्तीसगढ़" } },
  { id: "GA", label: { en: "Goa", hi: "गोवा" } },
  { id: "GJ", label: { en: "Gujarat", hi: "गुजरात" } },
  { id: "HR", label: { en: "Haryana", hi: "हरियाणा" } },
  { id: "HP", label: { en: "Himachal Pradesh", hi: "हिमाचल प्रदेश" } },
  { id: "JH", label: { en: "Jharkhand", hi: "झारखंड" } },
  { id: "KA", label: { en: "Karnataka", hi: "कर्नाटक" } },
  { id: "KL", label: { en: "Kerala", hi: "केरल" } },
  { id: "MP", label: { en: "Madhya Pradesh", hi: "मध्य प्रदेश" } },
  { id: "MH", label: { en: "Maharashtra", hi: "महाराष्ट्र" } },
  { id: "MN", label: { en: "Manipur", hi: "मणिपुर" } },
  { id: "ML", label: { en: "Meghalaya", hi: "मेघालय" } },
  { id: "MZ", label: { en: "Mizoram", hi: "मिज़ोरम" } },
  { id: "NL", label: { en: "Nagaland", hi: "नागालैंड" } },
  { id: "OD", label: { en: "Odisha", hi: "ओडिशा" } },
  { id: "PB", label: { en: "Punjab", hi: "पंजाब" } },
  { id: "RJ", label: { en: "Rajasthan", hi: "राजस्थान" } },
  { id: "SK", label: { en: "Sikkim", hi: "सिक्किम" } },
  { id: "TN", label: { en: "Tamil Nadu", hi: "तमिलनाडु" } },
  { id: "TS", label: { en: "Telangana", hi: "तेलंगाना" } },
  { id: "TR", label: { en: "Tripura", hi: "त्रिपुरा" } },
  { id: "UP", label: { en: "Uttar Pradesh", hi: "उत्तर प्रदेश" } },
  { id: "UK", label: { en: "Uttarakhand", hi: "उत्तराखंड" } },
  { id: "WB", label: { en: "West Bengal", hi: "पश्चिम बंगाल" } },
  { id: "AN", label: { en: "Andaman & Nicobar", hi: "अंडमान व निकोबार" } },
  { id: "CH", label: { en: "Chandigarh", hi: "चंडीगढ़" } },
  { id: "DN", label: { en: "Dadra & Nagar Haveli and Daman & Diu", hi: "दादरा व नगर हवेली और दमन व दीव" } },
  { id: "DL", label: { en: "Delhi", hi: "दिल्ली" } },
  { id: "JK", label: { en: "Jammu & Kashmir", hi: "जम्मू व कश्मीर" } },
  { id: "LA", label: { en: "Ladakh", hi: "लद्दाख" } },
  { id: "LD", label: { en: "Lakshadweep", hi: "लक्षद्वीप" } },
  { id: "PY", label: { en: "Puducherry", hi: "पुडुचेरी" } },
] as const satisfies readonly { id: string; label: Bi }[];
export type StateId = (typeof STATES)[number]["id"];

export const MCQ_STYLES = ["statement", "direct", "match", "assertion"] as const;
export type McqStyle = (typeof MCQ_STYLES)[number];

export const examById = (id: string) => EXAMS.find((e) => e.id === id);
export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id);
export const stateById = (id: string) => STATES.find((s) => s.id === id);

/** Pick the right language out of a bilingual value. "bi" falls back to English for single-line slots. */
export function pick(v: Bi | null | undefined, lang: Lang): string {
  if (!v) return "";
  if (lang === "hi") return v.hi || v.en;
  return v.en || v.hi;
}
