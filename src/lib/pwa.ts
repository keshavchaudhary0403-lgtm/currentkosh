"use client";

import { useSyncExternalStore } from "react";

// Chrome/Edge/Samsung fire `beforeinstallprompt`; we hold on to it so our own button can trigger the install.
type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

let deferred: InstallPrompt | null = null;
let installed = false;
let started = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Registers the service worker and starts listening for the install prompt. Call once on the client. */
export function initPwa() {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallPrompt;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    installed = true;
    emit();
  });
  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
  }
}

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  if (outcome === "accepted") installed = true;
  emit();
  return outcome === "accepted";
}

const standalone = () =>
  installed || window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

const ios = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export type InstallState = "installed" | "prompt" | "ios" | "manual" | "unknown";

function snapshot(): InstallState {
  if (standalone()) return "installed";
  if (deferred) return "prompt";
  if (ios()) return "ios";
  return "manual";
}

/** How this browser can install the app: one tap ("prompt"), iOS share sheet, browser menu, or already installed. */
export const useInstallState = () => useSyncExternalStore(subscribe, snapshot, (): InstallState => "unknown");

// Remembers that the reader closed the install banner (per device).
const DISMISS_KEY = "ck.install.dismissed";
export const useBannerDismissed = () =>
  useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(DISMISS_KEY) === "1";
      } catch {
        return false;
      }
    },
    () => true,
  );
export function dismissBanner() {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {}
  emit();
}
