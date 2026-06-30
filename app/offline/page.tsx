"use client";

import React, { useState, useEffect } from "react";

export default function OfflinePage() {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsReconnecting(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.href = "/";
      } else {
        setIsReconnecting(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#e8eaf6] text-zinc-900 font-sans antialiased">
      {/* Navbar with brand logo */}
      <nav className="w-full bg-[#e8eaf6] py-4 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png"
            alt="HSGA Telangana Logo"
            className="h-20 w-auto object-contain select-none shrink-0"
          />
          <div className="flex flex-col justify-center leading-tight self-center">
            <span className="font-bold text-[#002f6c] text-sm sm:text-base md:text-lg lg:text-xl">
              Hindustan Scouts & Guides Association
            </span>
            <span className="font-extrabold text-[#800020] text-xs sm:text-sm md:text-base lg:text-lg tracking-wider">
              Telangana
            </span>
          </div>
        </div>
      </nav>

      {/* Offline content area */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <main className="w-full max-w-md bg-white border border-zinc-200 shadow-sm rounded-lg p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-[#800020]/10 text-[#800020] rounded-full flex items-center justify-center animate-pulse">
              <span className="material-icons text-3xl select-none">wifi_off</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-zinc-800 mb-2">
            Connection Lost
          </h2>
          <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
            It looks like you are currently offline. Please check your internet connection or try reconnecting to access the HSGA Telangana Portal.
          </p>

          <button
            onClick={handleRetry}
            disabled={isReconnecting}
            className="w-full flex justify-center items-center py-2.5 px-4 bg-[#002f6c] hover:bg-[#002352] text-white font-semibold rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002f6c] transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-sm cursor-pointer"
          >
            {isReconnecting ? (
              <div className="flex items-center gap-2">
                <span className="material-icons animate-spin text-sm select-none">sync</span>
                <span>Retrying connection...</span>
              </div>
            ) : (
              "Try Reconnecting"
            )}
          </button>

          {isOnline && (
            <p className="text-[11px] text-emerald-600 font-semibold mt-4">
              Your device is connected! Click retry to load the portal.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
