"use client";

import { useSyncExternalStore } from "react";

// The theme lives on <html data-theme>, set before first paint by the script in app/layout.tsx.
export type Theme = "light" | "dark" | "system";

const EVENT = "ck-theme";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

const read = (): Theme => {
  const t = document.documentElement.dataset.theme;
  return t === "dark" || t === "system" ? t : "light";
};

export const useTheme = () => useSyncExternalStore(subscribe, read, (): Theme => "light");

export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem("theme", t);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}
