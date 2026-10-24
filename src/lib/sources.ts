// The only sources CurrentKosh draws from, and how each one may be used.
//
//  ai        Government / openly licensed content. Full text is fetched and turned into
//            notes, MCQs and flashcards by the daily routine, always with attribution and a link back.
//  link      Copyrighted publishers. We read only headline + URL from their public feed and
//            attach it to matching stories as "Also covered by". Their text is never fetched or used.
//  reference No automated access (no feed, or robots.txt says no). Shown as curated links.
//
// Feed URLs were checked live on 2026-10-23; see docs/sources.md for the audit.

export type SourceMode = "ai" | "link" | "reference";
export type SourceKind = "government" | "newspaper" | "coaching" | "publication";

export type Source = {
  id: string;
  name: string;
  short: string;
  kind: SourceKind;
  mode: SourceMode;
  homepage: string;
  caPage?: string;
  feeds?: string[];
  /** Extra HTML listing pages to scrape when feeds misbehave (PIB). */
  listings?: string[];
  license: string;
};

export const SOURCES: Source[] = [
  {
    id: "pib",
    name: "Press Information Bureau (PIB)",
    short: "PIB",
    kind: "government",
    mode: "ai",
    homepage: "https://pib.gov.in",
    feeds: ["https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3", "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3"],
    listings: ["https://www.pib.gov.in/allRel.aspx?reg=3&lang=1"],
    license: "PIB copyright policy: free reuse with credit and accurate reproduction.",
  },
  {
    id: "air",
    name: "All India Radio — News On AIR",
    short: "AIR",
    kind: "government",
    mode: "ai",
    homepage: "https://newsonair.gov.in",
    feeds: [
      "https://newsonair.gov.in/category/national/feed/",
      "https://newsonair.gov.in/category/international/feed/",
      "https://newsonair.gov.in/category/business/feed/",
      "https://newsonair.gov.in/category/sports/feed/",
    ],
    license: "Prasar Bharati public broadcaster. Summarised with attribution; not republished verbatim.",
  },
  {
    id: "dd",
    name: "DD News",
    short: "DD News",
    kind: "government",
    mode: "ai",
    homepage: "https://ddnews.gov.in",
    feeds: [
      "https://ddnews.gov.in/en/category/national/feed/",
      "https://ddnews.gov.in/en/category/international/feed/",
      "https://ddnews.gov.in/en/category/business/feed/",
      "https://ddnews.gov.in/en/category/sports/feed/",
    ],
    license: "Prasar Bharati public broadcaster. Summarised with attribution; not republished verbatim.",
  },
  {
    id: "sebi",
    name: "Securities and Exchange Board of India (SEBI)",
    short: "SEBI",
    kind: "government",
    mode: "ai",
    homepage: "https://www.sebi.gov.in",
    feeds: ["https://www.sebi.gov.in/sebirss.xml"],
    license: "Official regulator releases. Summarised with attribution.",
  },
  {
    id: "rbi",
    name: "Reserve Bank of India — Press Releases",
    short: "RBI",
    kind: "government",
    mode: "ai",
    homepage: "https://www.rbi.org.in",
    feeds: ["https://www.rbi.org.in/pressreleases_rss.xml"],
    license: "Official regulator releases. Summarised with attribution.",
  },
  {
    id: "prs",
    name: "PRS Legislative Research",
    short: "PRS",
    kind: "publication",
    mode: "reference",
    homepage: "https://prsindia.org",
    caPage: "https://prsindia.org/billtrack",
    license: "CC BY 4.0. Bill-tracker ingestion is planned (crawl-delay 10s).",
  },
  {
    id: "yojana",
    name: "Yojana",
    short: "Yojana",
    kind: "publication",
    mode: "reference",
    homepage: "https://www.publicationsdivision.nic.in",
    caPage: "https://www.publicationsdivision.nic.in/journals",
    license: "Publications Division. Monthly issue summaries planned.",
  },
  {
    id: "kurukshetra",
    name: "Kurukshetra",
    short: "Kurukshetra",
    kind: "publication",
    mode: "reference",
    homepage: "https://www.publicationsdivision.nic.in",
    caPage: "https://www.publicationsdivision.nic.in/journals",
    license: "Publications Division. Monthly issue summaries planned.",
  },
  {
    id: "thehindu",
    name: "The Hindu",
    short: "The Hindu",
    kind: "newspaper",
    mode: "link",
    homepage: "https://www.thehindu.com",
    feeds: [
      "https://www.thehindu.com/news/national/feeder/default.rss",
      "https://www.thehindu.com/news/international/feeder/default.rss",
      "https://www.thehindu.com/business/Economy/feeder/default.rss",
      "https://www.thehindu.com/sci-tech/feeder/default.rss",
      "https://www.thehindu.com/opinion/editorial/feeder/default.rss",
    ],
    license: "Copyrighted; robots.txt opts out of AI crawlers. Headline + link only.",
  },
  {
    id: "ie",
    name: "The Indian Express",
    short: "Indian Express",
    kind: "newspaper",
    mode: "link",
    homepage: "https://indianexpress.com",
    feeds: [
      "https://indianexpress.com/section/india/feed/",
      "https://indianexpress.com/section/explained/feed/",
      "https://indianexpress.com/section/upsc-current-affairs/feed/",
      "https://indianexpress.com/section/opinion/editorials/feed/",
    ],
    license: "Copyrighted; robots.txt opts out of AI crawlers. Headline + link only.",
  },
  { id: "drishti", name: "Drishti IAS", short: "Drishti", kind: "coaching", mode: "link", homepage: "https://www.drishtiias.com", caPage: "https://www.drishtiias.com/current-affairs-news-analysis-editorials", license: "Copyrighted. Headlines only: used as a checklist of exam topics and as 'Also covered by' links; text never used." },
  { id: "affairscloud", name: "AffairsCloud", short: "AffairsCloud", kind: "coaching", mode: "link", homepage: "https://affairscloud.com", caPage: "https://affairscloud.com/current-affairs/", feeds: ["https://affairscloud.com/feed/"], license: "Copyrighted. Link-out only." },
  { id: "vision", name: "Vision IAS", short: "Vision IAS", kind: "coaching", mode: "reference", homepage: "https://www.visionias.in", caPage: "https://www.visionias.in/current-affairs/news-today", license: "Copyrighted. Link-out only." },
  { id: "adda247", name: "Adda247", short: "Adda247", kind: "coaching", mode: "reference", homepage: "https://currentaffairs.adda247.com", caPage: "https://currentaffairs.adda247.com/", license: "Copyrighted. Link-out only." },
  { id: "testbook", name: "Testbook", short: "Testbook", kind: "coaching", mode: "reference", homepage: "https://testbook.com", caPage: "https://testbook.com/current-affairs", license: "Copyrighted. Link-out only." },
  { id: "jagranjosh", name: "Jagran Josh", short: "Jagran Josh", kind: "coaching", mode: "reference", homepage: "https://www.jagranjosh.com", caPage: "https://www.jagranjosh.com/current-affairs", license: "Copyrighted. Link-out only." },
  { id: "gktoday", name: "GKToday", short: "GKToday", kind: "coaching", mode: "reference", homepage: "https://www.gktoday.in", caPage: "https://www.gktoday.in/current-affairs/", license: "Copyrighted. Link-out only." },
  { id: "indiabix", name: "IndiaBix", short: "IndiaBix", kind: "coaching", mode: "reference", homepage: "https://www.indiabix.com", caPage: "https://www.indiabix.com/current-affairs/", license: "Copyrighted. Link-out only." },
  { id: "oliveboard", name: "Oliveboard", short: "Oliveboard", kind: "coaching", mode: "reference", homepage: "https://www.oliveboard.in", caPage: "https://www.oliveboard.in/current-affairs/", license: "Copyrighted; robots.txt disallows feeds. Link-out only." },
  { id: "byjus", name: "BYJU'S Exam Prep", short: "BYJU'S", kind: "coaching", mode: "reference", homepage: "https://byjusexamprep.com", caPage: "https://byjusexamprep.com/current-affairs", license: "Copyrighted. Link-out only." },
  { id: "unacademy", name: "Unacademy Current Affairs", short: "Unacademy", kind: "coaching", mode: "reference", homepage: "https://unacademy.com", caPage: "https://unacademy.com/content/current-affairs/", license: "Copyrighted. Link-out only." },
  { id: "studyiq", name: "StudyIQ", short: "StudyIQ", kind: "coaching", mode: "reference", homepage: "https://www.studyiq.com", caPage: "https://www.studyiq.com/articles/", license: "Copyrighted; robots.txt disallows CA crawling. Link-out only." },
];

export const sourceById = (id: string) => SOURCES.find((s) => s.id === id);
