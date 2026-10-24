import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const deva = Noto_Sans_Devanagari({ variable: "--font-deva", subsets: ["devanagari"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "CurrentKosh — Current affairs, made exam-ready", template: "%s · CurrentKosh" },
  description:
    "One calm, source-cited feed of current affairs for UPSC, State PSC, SSC, Banking, Railways and Defence aspirants, with daily quizzes and spaced revision. English + हिंदी.",
  applicationName: "CurrentKosh",
  openGraph: {
    title: "CurrentKosh — Current affairs, made exam-ready",
    description: "Daily current affairs from official sources, exam-style tests and spaced revision. English + हिंदी.",
    siteName: "CurrentKosh",
    locale: "en_IN",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f6f3",
};

// Applies the saved theme (light by default) before first paint so there is no flash.
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem("theme")==="dark"?"dark":"light"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${deva.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
