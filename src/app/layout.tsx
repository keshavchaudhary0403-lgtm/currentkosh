import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import { currentProfile } from "@/lib/profile";
import { PwaSetup } from "@/components/install";
import "./globals.css";

// Geist (variable) for English and numbers; Noto Sans Devanagari (variable) for Hindi.
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const display = Bricolage_Grotesque({ variable: "--font-display-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const deva = Noto_Sans_Devanagari({ variable: "--font-deva", subsets: ["devanagari"] });

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
    { media: "(prefers-color-scheme: light)", color: "#f7f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#151a2e" },
  ],
  viewportFit: "cover",
};

// Applies the saved theme (light by default) before first paint so there is no flash.
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem("theme")==="dark"?"dark":"light"}catch(e){}`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // In Hindi mode Devanagari is the main font; Geist still renders anything Latin (names, numbers, acronyms).
  const lang = (await currentProfile())?.lang === "hi" ? "hi" : "en";
  return (
    <html
      lang={lang}
      data-theme="light"
      suppressHydrationWarning
      className={`${geist.variable} ${display.variable} ${geistMono.variable} ${deva.variable} h-full antialiased`}
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
