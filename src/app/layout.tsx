import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from "next/font/google";
import { currentProfile } from "@/lib/profile";
import { PwaSetup } from "@/components/install";
import "./globals.css";

// Instrument Sans for UI and body, Instrument Serif for display, JetBrains Mono for labels and numbers.
// Noto Sans / Serif Devanagari carry Hindi in the matching roles.
const ui = Instrument_Sans({ variable: "--font-ui", subsets: ["latin"], axes: ["wdth"] });
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const mono = JetBrains_Mono({ variable: "--font-mono-ui", subsets: ["latin"] });
const deva = Noto_Sans_Devanagari({ variable: "--font-deva", subsets: ["devanagari"] });
const devaSerif = Noto_Serif_Devanagari({ variable: "--font-deva-serif", subsets: ["devanagari"], preload: false });

export const metadata: Metadata = {
  title: { default: "CurrentKosh — Current affairs, made exam-ready", template: "%s · CurrentKosh" },
  description:
    "One calm, source-cited feed of current affairs for UPSC, State PSC, SSC, Banking, Railways and Defence aspirants, with daily quizzes and spaced revision. English + हिंदी.",
  applicationName: "CurrentKosh",
  appleWebApp: { capable: true, title: "CurrentKosh", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  openGraph: {
    title: "CurrentKosh — Current affairs, made exam-ready",
    description: "Daily current affairs from official sources, exam-style tests and spaced revision. English + हिंदी.",
    siteName: "CurrentKosh",
    locale: "en_IN",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f2ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0a" },
  ],
  viewportFit: "cover",
};

// Applies the saved theme before first paint so there is no flash; with no saved choice, follows the system.
const themeScript = `try{var t=localStorage.getItem("theme");document.documentElement.dataset.theme=t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light"}catch(e){}`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // In Hindi mode Devanagari is the main font; Instrument Sans still renders anything Latin (names, numbers, acronyms).
  const lang = (await currentProfile())?.lang === "hi" ? "hi" : "en";
  return (
    <html
      lang={lang}
      data-theme="light"
      suppressHydrationWarning
      className={`${ui.variable} ${serif.variable} ${mono.variable} ${deva.variable} ${devaSerif.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        {children}
        <PwaSetup />
      </body>
    </html>
  );
}
