import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "CurrentKosh: Current affairs for exams",
    short_name: "CurrentKosh",
    description: "Daily current affairs from official sources, exam-style quizzes and spaced revision for UPSC, SSC, Banking, Railways, Defence and State PSC. English + हिंदी.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f3f2ec",
    theme_color: "#10110e",
    lang: "en-IN",
    categories: ["education", "news", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Daily quiz", short_name: "Quiz", url: "/practice/run?kind=daily", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Revise", url: "/revise", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Saved", short_name: "Saved", url: "/saved", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
