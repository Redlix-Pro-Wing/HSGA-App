"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Guidelines() {
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
        router.replace("/");
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
    <div className="min-h-screen bg-slate-50/50 text-zinc-900 flex flex-col font-poppins select-none antialiased relative overflow-x-hidden">
      {/* Subtle decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-blue-50/40 via-transparent to-transparent pointer-events-none -z-10" />

      {/* Top Banner / Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-zinc-200 py-3.5 px-6 flex items-center justify-between transition-all duration-200">
        <div className="flex items-center gap-3 select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png"
            alt="HSGA Logo"
            className="h-8 w-auto object-contain bg-white"
          />
          <h1 className="font-semibold text-[#002f6c] text-sm tracking-wide">
            Guidelines
          </h1>
          <div className="h-4 w-[1px] bg-zinc-300 mx-1.5" />
          <span className="font-normal text-zinc-500 text-[11px] sm:text-xs tracking-wide block">
            HSGA Telangana
          </span>
        </div>
        <Link
          href="/"
          className="text-xs font-medium bg-[#002f6c] hover:bg-[#002352] active:scale-95 text-white py-2.5 px-4 rounded-none transition-all duration-200 shadow-sm"
        >
          Staff Login
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-5 pt-24 pb-8 sm:pt-28 sm:pb-12 flex flex-col items-start z-10">
        {/* Page title */}
        <div className="text-left w-full max-w-2xl mb-8">
          <span className="text-[10px] font-bold tracking-[0.05em] text-[#800020] bg-[#800020]/10 px-3.5 py-1 rounded-full inline-block">
            Official Installation Guide
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 mt-5 tracking-tight leading-tight">
            Download &amp; Install the <span className="text-[#002f6c]">HSGA App</span>
          </h1>
          <p className="text-[11px] font-semibold text-zinc-400 mt-1.5 select-none">
            Powered by <a href="https://www.redlix.co.in" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-[#002f6c] transition-colors">Studio Redlix</a>
          </p>
          <p className="text-sm sm:text-base text-zinc-600 mt-3.5 leading-relaxed max-w-xl">
            Access your state-wide Scout &amp; Guide profile, digital identity badge, and timetable directly from your home screen as a secure Progressive Web App (PWA).
          </p>
        </div>

        {/* Dynamic Installation Dashboard Card */}
        <div className="w-full bg-white border border-zinc-200/80 shadow-md shadow-zinc-100/50 rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left Column: Details */}
            <div className="flex-1 flex flex-col items-start text-left">
              {isInstalled ? (
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-emerald-500/5">
                  <span className="material-symbols-outlined text-2xl text-emerald-600 select-none">check_circle</span>
                </div>
              ) : (
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-[#002f6c]/5">
                  <span className="material-symbols-outlined text-2xl text-[#002f6c] select-none">download_for_offline</span>
                </div>
              )}

              <h2 className="text-lg sm:text-xl font-bold text-zinc-800">
                {isInstalled ? "Application Already Installed" : "Instant PWA Installation"}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 mb-5 leading-relaxed max-w-xl">
                {isInstalled
                  ? "The application is ready on your device. You can safely launch it from your home screen or app drawer."
                  : "No store downloads or updates needed. Install directly to your device screen in seconds."}
              </p>

              {!isInstalled && (
                <button
                  onClick={handleInstallClick}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-[#002f6c] hover:bg-[#003d8f] active:scale-[0.98] text-white font-semibold rounded-none text-sm shadow-sm transition-all duration-200 mb-4 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base select-none">download</span>
                  {isInstallable ? "Install App Directly" : "Install App (Android)"}
                </button>
              )}

              {isInstalled && (
                <Link
                  href="/"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold rounded-none text-sm shadow-sm transition-all duration-200 mb-4"
                >
                  <span className="material-symbols-outlined text-base select-none">login</span>
                  Proceed to Staff Login
                </Link>
              )}

              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-medium mt-1">
                <span className="material-symbols-outlined text-sm text-zinc-400 select-none">verified_user</span>
                Supports secure PWA technology with integrated offline mode.
              </div>
            </div>

            {/* Right Column: SVG Illustration */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://ik.imagekit.io/dypkhqxip/Mobile%20development-rafiki.svg"
                alt="Mobile Development Illustration"
                className="w-full h-full object-contain select-none"
              />
            </div>
          </div>
        </div>

        {/* Operating System Specific Guidelines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-2">

          {/* Android Steps */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-250">
            <div>
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-zinc-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  {/* Android Icon */}
                  <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.3414C17.11 15.3414 16.7728 15.0063 16.7728 14.5912C16.7728 14.1793 17.11 13.8442 17.523 13.8442C17.9359 13.8442 18.2731 14.1793 18.2731 14.5912C18.2731 15.0063 17.9359 15.3414 17.523 15.3414ZM6.47721 15.3414C6.06429 15.3414 5.72714 15.0063 5.72714 14.5912C5.72714 14.1793 6.06429 13.8442 6.47721 13.8442C6.89013 13.8442 7.22728 14.1793 7.22728 14.5912C7.22728 15.0063 6.89013 15.3414 6.47721 15.3414ZM17.9427 10.7497L19.8242 7.46808C19.9573 7.23466 19.8787 6.93883 19.6433 6.80456C19.412 6.67406 19.1128 6.7519 18.9798 6.98532L17.0729 10.3023C15.6015 9.62778 13.882 9.24414 12 9.24414C10.118 9.24414 8.39849 9.62778 6.9271 10.3023L5.02016 6.98532C4.88716 6.7519 4.58793 6.67406 4.35667 6.80456C4.12128 6.93883 4.04271 7.23466 4.17571 7.46808L6.05728 10.7497C2.93532 12.4463 0.811707 15.655 0.5 19.4452H23.5C23.1883 15.655 21.0647 12.4463 17.9427 10.7497Z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-zinc-800">Android Instructions</h3>
              </div>
              <p className="text-[10px] text-rose-655 font-semibold mb-4 leading-normal -mt-3">[Supports Android Laptops and Android devices]</p>
              <ol className="space-y-4 text-xs text-zinc-600">
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-zinc-500 bg-zinc-100 rounded-full h-5.5 w-5.5 flex items-center justify-center shrink-0 text-[11px] ring-4 ring-zinc-50">1</span>
                  <span className="leading-relaxed">Launch <strong>Google Chrome</strong> and visit this portal on your device.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-zinc-500 bg-zinc-100 rounded-full h-5.5 w-5.5 flex items-center justify-center shrink-0 text-[11px] ring-4 ring-zinc-50">2</span>
                  <span className="leading-relaxed">Tap the <strong>&quot;Install App Directly&quot;</strong> button above, or open Chrome settings (<span className="font-bold text-zinc-800">⋮</span>) and select <strong>&quot;Add to Home screen&quot;</strong>.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-zinc-500 bg-zinc-100 rounded-full h-5.5 w-5.5 flex items-center justify-center shrink-0 text-[11px] ring-4 ring-zinc-50">3</span>
                  <span className="leading-relaxed">Confirm the installation. The official HSGA logo icon will be placed on your home launcher screen.</span>
                </li>
              </ol>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-2 text-[10px] font-semibold text-zinc-400">
              <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
              <span>Supports Chrome, Samsung Internet &amp; Edge.</span>
            </div>
          </div>

          {/* iOS Steps */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-250">
            <div>
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-zinc-100">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center">
                  {/* Apple Icon */}
                  <svg className="w-5 h-5 text-zinc-800" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.57 2.95-1.39z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-zinc-800">Apple iOS Instructions</h3>
              </div>
              <p className="text-[10px] text-rose-655 font-semibold mb-4 leading-normal -mt-3">[Supports both MacBooks and iMac OS]</p>
              <ol className="space-y-4 text-xs text-zinc-600">
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-zinc-500 bg-zinc-100 rounded-full h-5.5 w-5.5 flex items-center justify-center shrink-0 text-[11px] ring-4 ring-zinc-50">1</span>
                  <span className="leading-relaxed">Open this link inside the built-in <strong>Apple Safari</strong> browser on your iPhone or iPad.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-zinc-500 bg-zinc-100 rounded-full h-5.5 w-5.5 flex items-center justify-center shrink-0 text-[11px] ring-4 ring-zinc-50">2</span>
                  <span className="leading-relaxed">Tap the native <strong>Share</strong> button (<span className="material-symbols-outlined text-[14px] align-middle inline-block">ios_share</span>) located in the browser navigation bar.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-zinc-500 bg-zinc-100 rounded-full h-5.5 w-5.5 flex items-center justify-center shrink-0 text-[11px] ring-4 ring-zinc-50">3</span>
                  <span className="leading-relaxed">Scroll down, tap <strong>&quot;Add to Home Screen&quot;</strong>, and click <strong>&quot;Add&quot;</strong> in the top-right corner to complete.</span>
                </li>
              </ol>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-2 text-[10px] font-semibold text-zinc-400">
              <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
              <span>Requires Safari implementation on iOS.</span>
            </div>
          </div>

          {/* Windows Steps */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-250">
            <div>
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-zinc-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  {/* Windows Icon */}
                  <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM10.8 1.95L24 0v11.55H10.8V1.95zM10.8 12.45H24v11.55l-13.2-1.95v-9.6z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-zinc-800">Windows PC Instructions</h3>
              </div>
              <ol className="space-y-4 text-xs text-zinc-600">
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-zinc-500 bg-zinc-100 rounded-full h-5.5 w-5.5 flex items-center justify-center shrink-0 text-[11px] ring-4 ring-zinc-50">1</span>
                  <span className="leading-relaxed">Launch <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> on your computer.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-zinc-500 bg-zinc-100 rounded-full h-5.5 w-5.5 flex items-center justify-center shrink-0 text-[11px] ring-4 ring-zinc-50">2</span>
                  <span className="leading-relaxed">Click the <strong>Install</strong> icon (<span className="material-symbols-outlined text-[14px] align-middle inline-block">install_desktop</span>) on the right side of the URL address bar.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-zinc-500 bg-zinc-100 rounded-full h-5.5 w-5.5 flex items-center justify-center shrink-0 text-[11px] ring-4 ring-zinc-50">3</span>
                  <span className="leading-relaxed">Click <strong>&quot;Install&quot;</strong> to place a standalone app window shortcut directly on your PC desktop.</span>
                </li>
              </ol>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-2 text-[10px] font-semibold text-zinc-400">
              <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
              <span>Fully compatible with Windows 10 &amp; 11.</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200/60 py-5 text-center text-[10px] font-bold text-zinc-400 tracking-wide bg-white shrink-0 mt-12">
        &copy; {new Date().getFullYear()} Hindustan Scouts &amp; Guides Telangana State Association. All Rights Reserved.
      </footer>
    </div>
  );
}
