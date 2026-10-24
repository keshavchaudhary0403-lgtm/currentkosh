"use client";

import { useEffect, useState } from "react";
import { Download, PlusSquare, Share, Smartphone, X } from "lucide-react";
import { dismissBanner, initPwa, promptInstall, useBannerDismissed, useInstallState } from "@/lib/pwa";
import { Logo } from "./nav";

/** Mount once: registers the service worker and captures the install prompt. */
export function PwaSetup() {
  useEffect(() => initPwa(), []);
  return null;
}

function IosSteps() {
  return (
    <ol className="space-y-2 text-sm font-medium text-ink-2">
      <li className="flex items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-extrabold text-accent">1</span>
        Tap <Share className="inline size-4 text-accent" strokeWidth={2} /> <b className="text-ink">Share</b> in Safari&apos;s toolbar
      </li>
      <li className="flex items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-extrabold text-accent">2</span>
        Choose <PlusSquare className="inline size-4 text-accent" strokeWidth={2} /> <b className="text-ink">Add to Home Screen</b>
      </li>
      <li className="flex items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-extrabold text-accent">3</span>
        Tap <b className="text-ink">Add</b>. CurrentKosh opens like an app.
      </li>
    </ol>
  );
}

/** Install card for the "You" page. Explains the right method for each browser. */
export function InstallCard() {
  const state = useInstallState();
  const [showIos, setShowIos] = useState(false);
  if (state === "unknown") return null;
  if (state === "installed")
    return (
      <div className="flex items-center gap-3 rounded-3xl bg-good-soft p-4 text-sm font-bold text-good">
        <Smartphone className="size-5" /> CurrentKosh is installed on this device
      </div>
    );
  return (
    <section className="rounded-3xl border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <Logo size={44} />
        <div className="min-w-0 flex-1">
          <div className="font-display text-base">Install the app</div>
          <div className="text-xs font-medium text-ink-2">Opens full-screen from your home screen, works offline for stories you&apos;ve read.</div>
        </div>
      </div>
      {state === "prompt" && (
        <button onClick={() => promptInstall()} className="btn mt-4 w-full py-3 text-[15px] sm:w-auto sm:px-6">
          <Download className="size-5" strokeWidth={2} /> Install CurrentKosh
        </button>
      )}
      {state === "ios" &&
        (showIos ? (
          <div className="rise mt-4">
            <IosSteps />
          </div>
        ) : (
          <button onClick={() => setShowIos(true)} className="btn mt-4 w-full py-3 text-[15px] sm:w-auto sm:px-6">
            <Download className="size-5" strokeWidth={2} /> How to install on iPhone
          </button>
        ))}
      {state === "manual" && (
        <p className="mt-3 rounded-2xl bg-surface-2 px-3 py-2.5 text-xs font-medium text-ink-2">
          Open your browser menu (⋮ or ⋯) and choose <b className="text-ink">Install app</b> or <b className="text-ink">Add to Home screen</b>.
        </p>
      )}
    </section>
  );
}

/** Small, dismissible install prompt shown on Today when installing is one tap away (or on iPhone). */
export function InstallBanner() {
  const state = useInstallState();
  const dismissed = useBannerDismissed();
  const [showIos, setShowIos] = useState(false);
  if (dismissed || (state !== "prompt" && state !== "ios")) return null;
  return (
    <div className="rise rounded-3xl border-2 border-accent/30 bg-accent-soft p-3.5">
      <div className="flex items-center gap-3">
        <Logo size={40} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-extrabold">Get the CurrentKosh app</div>
          <div className="text-xs font-medium text-ink-2">Free · one tap from your home screen</div>
        </div>
        <button
          onClick={() => (state === "prompt" ? promptInstall() : setShowIos((v) => !v))}
          className="btn shrink-0 px-3.5 py-2 text-[15px]"
        >
          Install
        </button>
        <button onClick={dismissBanner} aria-label="Dismiss" className="grid size-8 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-surface hover:text-ink">
          <X className="size-4" strokeWidth={2.6} />
        </button>
      </div>
      {showIos && (
        <div className="rise mt-3 rounded-2xl bg-surface p-3">
          <IosSteps />
        </div>
      )}
    </div>
  );
}

/** Sidebar install button (desktop Chrome/Edge). */
export function InstallSidebarButton() {
  const state = useInstallState();
  if (state !== "prompt") return null;
  return (
    <button onClick={() => promptInstall()} className="mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-accent hover:bg-accent-soft">
      <Download className="size-4" strokeWidth={2} /> Install app
    </button>
  );
}
