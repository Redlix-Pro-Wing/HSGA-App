"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if already running in standalone mode (PWA window)
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches 
        || (navigator as any).standalone 
        || document.referrer.includes("android-app://");

      if (isStandalone) {
        router.replace("/login");
        return;
      }

      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
      }

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
      };
      window.addEventListener("appinstalled", handleAppInstalled);

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }
  }, [router]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Installation prompt is not ready. If you are on Android Chrome, make sure you aren't already running the app, or tap the three dots in Chrome and select 'Add to Home Screen'.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-zinc-950 flex flex-col font-sans select-none antialiased">
      {/* Top Banner / Header */}
      <header className="w-full bg-[#FAF8F5] border-b border-zinc-200/60 py-5 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png"
            alt="HSGA Logo"
            className="h-12 w-auto object-contain bg-white p-0.5 rounded-full shadow-sm"
          />
          <div className="leading-tight">
            <span className="font-extrabold text-[#002f6c] text-xs sm:text-sm tracking-wide uppercase block">Hindustan Scouts &amp; Guides</span>
            <span className="font-bold text-amber-600 text-[10px] tracking-widest uppercase block">Telangana Association</span>
          </div>
        </div>
        <Link
          href="/login"
          className="text-xs font-semibold bg-[#002f6c] hover:bg-[#003d8f] text-white py-2 px-4 rounded-md transition-colors"
        >
          Staff Login
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 flex flex-col items-center">
        {/* Page title */}
        <div className="text-center max-w-2xl mb-12">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#800020] uppercase bg-[#800020]/10 px-3 py-1 rounded-full">
            Official Installation Guide
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-4 tracking-tight">
            Download &amp; Install the HSGA PWA App
          </h1>
          <p className="text-sm text-zinc-600 mt-3 leading-relaxed">
            Access your state-wide Scout &amp; Guide profile, digital identity badge, and state associations timetable directly from your home screen as a light-weight Progressive Web App (PWA).
          </p>
        </div>

        {/* Dynamic Installation Dashboard Card */}
        <div className="w-full bg-white border border-zinc-200 shadow-sm rounded-xl p-6 sm:p-8 mb-8 text-center">
          <div className="max-w-md mx-auto flex flex-col items-center">
            <span className="material-icons text-5xl text-[#002f6c] mb-3">
              {isInstalled ? "check_circle" : "install_mobile"}
            </span>
            <h2 className="text-lg font-bold text-zinc-800">
              {isInstalled ? "Application Already Installed" : "Instant PWA Installation"}
            </h2>
            <p className="text-xs text-zinc-500 mt-1 mb-5">
              {isInstalled 
                ? "The application is successfully added to your device. You can open it from your app drawer or home screen."
                : "No need for Google Play Store or Apple App Store. Install directly onto your device in seconds."}
            </p>

            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-6 bg-[#002f6c] hover:bg-[#003d8f] active:scale-98 text-white font-bold rounded-lg text-sm shadow-md transition-all mb-4"
              >
                <span className="material-icons text-base">download</span>
                {isInstallable ? "Install App Directly" : "Install App (Android)"}
              </button>
            )}

            {isInstalled && (
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2.5 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-md transition-all mb-4"
              >
                <span className="material-icons text-base">login</span>
                Proceed to Staff Login
              </Link>
            )}

            <p className="text-[10px] text-zinc-400">
              Supports PWA standalone technology. Offline capability enabled automatically.
            </p>
          </div>
        </div>

        {/* Operating System Specific Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
          
          {/* Android Steps */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-icons text-[#3ddc84] text-2xl">android</span>
                <h3 className="text-base font-bold text-zinc-800">Android Installation Guide</h3>
              </div>
              <ol className="space-y-4 text-xs text-zinc-700">
                <li className="flex gap-3">
                  <span className="font-bold text-zinc-400 bg-zinc-100 rounded-full h-5 w-5 flex items-center justify-center shrink-0">1</span>
                  <span>Open this website inside <strong>Google Chrome</strong> or any chromium-based browser on your Android device.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-zinc-400 bg-zinc-100 rounded-full h-5 w-5 flex items-center justify-center shrink-0">2</span>
                  <span>Tap the <strong>&quot;Install App Directly&quot;</strong> button above, or select <strong>&quot;Add to Home Screen&quot;</strong> from browser settings.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-zinc-400 bg-zinc-100 rounded-full h-5 w-5 flex items-center justify-center shrink-0">3</span>
                  <span>Confirm the prompt to install the app. The HSGA icon will immediately appear on your mobile home screen.</span>
                </li>
              </ol>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-2 text-[10px] font-semibold text-zinc-400">
              <span className="material-icons text-xs">info</span>
              <span>Works on Samsung, Pixel, OnePlus, Xiaomi, Oppo &amp; Vivo.</span>
            </div>
          </div>

          {/* iOS Steps */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-icons text-zinc-800 text-2xl">phone_iphone</span>
                <h3 className="text-base font-bold text-zinc-800">Apple iOS Installation Guide</h3>
              </div>
              <ol className="space-y-4 text-xs text-zinc-700">
                <li className="flex gap-3">
                  <span className="font-bold text-zinc-400 bg-zinc-100 rounded-full h-5 w-5 flex items-center justify-center shrink-0">1</span>
                  <span>Open this website using the default <strong>Apple Safari</strong> browser on your iPhone or iPad.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-zinc-400 bg-zinc-100 rounded-full h-5 w-5 flex items-center justify-center shrink-0">2</span>
                  <span>Tap the <strong>Share</strong> button (box with an upward arrow) at the bottom screen menu bar.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-zinc-400 bg-zinc-100 rounded-full h-5 w-5 flex items-center justify-center shrink-0">3</span>
                  <span>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>, then tap <strong>&quot;Add&quot;</strong> in the top-right corner.</span>
                </li>
              </ol>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-2 text-[10px] font-semibold text-zinc-400">
              <span className="material-icons text-xs">info</span>
              <span>Requires iOS Safari browser compatibility.</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200/50 py-5 text-center text-[10px] font-bold text-zinc-400 shrink-0">
        &copy; {new Date().getFullYear()} Hindustan Scouts &amp; Guides Telangana State Association. All Rights Reserved.
      </footer>
    </div>
  );
}
