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
  const step = "grid size-7 shrink-0 place-items-center rounded-full bg-solid font-mono text-xs font-semibold text-on-solid";
  return (
    <ol className="space-y-2.5 text-sm text-ink-2">
      <li className="flex items-center gap-2.5">
        <span className={step}>1</span>
        Tap <Share className="inline size-4 text-ink" strokeWidth={2} /> <b className="text-ink">Share</b> in Safari&apos;s toolbar
      </li>
      <li className="flex items-center gap-2.5">
        <span className={step}>2</span>
        Choose <PlusSquare className="inline size-4 text-ink" strokeWidth={2} /> <b className="text-ink">Add to Home Screen</b>
      </li>
      <li className="flex items-center gap-2.5">
        <span className={step}>3</span>
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
      <div className="flex items-center gap-3 rounded-[22px] bg-good-soft p-4 text-sm font-semibold text-good-ink">
        <Smartphone className="size-5" /> CurrentKosh is installed on this device
      </div>
    );
  return (
    <section className="card p-5">
      <div className="flex items-center gap-3">
        <Logo size={44} />
        <div className="min-w-0 flex-1">
          <div className="font-display text-[19px] leading-none">Install the app</div>
          <div className="mt-1 text-xs text-ink-2">Opens full-screen from your home screen, works offline for stories you&apos;ve read.</div>
        </div>
      </div>
      {state === "prompt" && (
        <button onClick={() => promptInstall()} className="btn mt-4 w-full text-[15px] sm:w-auto sm:px-6">
          <Download className="size-5" strokeWidth={2} /> Install CurrentKosh
        </button>
      )}
      {state === "ios" &&
        (showIos ? (
          <div className="rise mt-4">
            <IosSteps />
          </div>
        ) : (
          <button onClick={() => setShowIos(true)} className="btn mt-4 w-full text-[15px] sm:w-auto sm:px-6">
            <Download className="size-5" strokeWidth={2} /> How to install on iPhone
          </button>
        ))}
      {state === "manual" && (
        <p className="mt-4 rounded-2xl bg-card-2 px-3 py-2.5 text-xs text-ink-2">
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
    <div className="rise card p-3.5 pl-4">
      <div className="flex items-center gap-3">
        <Logo size={40} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Get the CurrentKosh app</div>
          <div className="text-xs text-ink-2">Free · one tap from your home screen</div>
        </div>
        <button onClick={() => (state === "prompt" ? promptInstall() : setShowIos((v) => !v))} className="btn shrink-0 px-4 text-sm">
          Install
        </button>
        <button onClick={dismissBanner} aria-label="Dismiss" className="grid size-11 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-card-2 hover:text-ink">
          <X className="size-4" strokeWidth={2.4} />
        </button>
      </div>
      {showIos && (
        <div className="rise mt-3 rounded-2xl bg-card-2 p-3.5">
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
    <button onClick={() => promptInstall()} className="flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-ink-2 shadow-[inset_0_0_0_1px_var(--line-2)] transition hover:bg-card hover:text-ink">
      <Download className="size-4" strokeWidth={2} /> Install app
    </button>
  );
}
