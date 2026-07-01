"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Forgot password reset states
  const [resetStep, setResetStep] = useState<"login" | "forgot" | "otp" | "reset">("login");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  // On mount: if employee session already exists redirect to dashboard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("employeeSession");
      if (stored) {
        router.replace("/employee");
        return;
      }
    }
    setIsChecking(false);
  }, [router]);

  // Lock document body scroll on mobile
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.classList.add("overflow-hidden", "h-full", "fixed", "w-full");
      return () => {
        document.body.classList.remove("overflow-hidden", "h-full", "fixed", "w-full");
      };
    }
  }, []);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/employee/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch verification code.");
      }

      setMaskedEmail(data.maskedEmail || data.email);
      setSuccess(`Verification code dispatched to ${data.maskedEmail || data.email}`);
      setResetStep("otp");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/employee/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, otp: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed.");
      }

      setSuccess("Identity verified successfully. Please enter your new password below.");
      setResetStep("reset");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/employee/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          otp: otpCode,
          newPassword
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess("Password updated successfully. Please log in with your new credentials.");
      setResetStep("login");
      setOtpCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const username = email.trim();

    // Check if they enter the admin email
    if (username.toLowerCase() === "webstrixx@gmail.com") {
      setIsLoading(false);
      setSuccess("Administrator account detected. Redirecting to admin portal...");
      setTimeout(() => {
        router.push("/admin");
      }, 1000);
      return;
    }

    try {
      const res = await fetch("/api/employee/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("employeeSession", JSON.stringify(data.employee));
      }
      setSuccess("Authentication successful. Opening portal...");
      setEmail("");
      setPassword("");
      setTimeout(() => { router.push("/employee"); }, 800);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="h-dvh flex items-center justify-center bg-[#002f6c]">
        <div className="flex flex-col items-center gap-2">
          <span className="material-icons animate-spin text-3xl text-white/70 select-none">sync</span>
          <p className="text-sm font-semibold text-white/50">Loading portal...</p>
        </div>
      </div>
    );
  }

  // ── shared underline-input style ──
  const inputCls = "w-full bg-transparent border-0 border-b border-zinc-300 focus:border-[#002f6c] focus:outline-none py-2.5 text-sm text-zinc-800 placeholder-zinc-400 transition-colors";

  return (
    /*
     * LAYOUT: Full-viewport, no scroll.
     * ┌─────────────────────────────────┐  ← navy header   ~42% height
     * │  [HSGA logo]    [Telangana seal]│
     * │                                 │
     * │  ┌───────────────────────────┐  │  ← white card (floats between)
     * │  │  Sign in                  │  │
     * │  │  ─────────────────────    │  │
     * │  │  Username                 │  │
     * │  │  Password                 │  │
     * │  │  [  Sign In  ]            │  │
     * │  └───────────────────────────┘  │
     * └─────────────────────────────────┘  ← light grey body ~58% height
     */
    <div className="fixed inset-0 w-full h-dvh overflow-hidden flex flex-col bg-[#e8eaf6] font-sans antialiased select-none">

      {/* ── TOP: Header with HSGA logo (left-aligned) using overview card bg color (#F7F6F3) ── */}
      <div className="bg-[#F7F6F3] flex-none border-b border-zinc-200/40" style={{ height: "35%" }}>
        {/* HSGA logo — left-aligned */}
        <div className="flex items-center px-6 sm:px-8 pt-8 sm:pt-10 pb-4 gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png"
            alt="HSGA Logo"
            className="h-20 w-20 sm:h-24 sm:w-24 object-contain select-none"
          />
          <div className="leading-tight">
            <span className="text-[#002f6c] text-xs sm:text-sm font-extrabold tracking-wide block">Hindustan Scouts and Guides</span>
            <span className="text-[#800020] text-[10px] sm:text-[11px] font-bold block">Association · Telangana</span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Page container bg color (#e8eaf6) ── */}
      <div className="bg-[#e8eaf6] flex-1" />

      {/* ── FLOATING WHITE CARD (centered and non-overflowing) ── */}
      <div className="absolute inset-x-5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm"
        style={{ top: "24dvh" }}>
        <div className="bg-white rounded-2xl shadow-xl shadow-black/10 px-6 py-6 sm:px-8 sm:py-8 border border-zinc-100">

          {/* Dynamic title */}
          {resetStep === "login" && (
            <h2 className="text-xl font-bold text-[#002f6c] text-center mb-6">Sign In</h2>
          )}
          {resetStep === "forgot" && (
            <h2 className="text-xl font-bold text-[#002f6c] text-center mb-6">Forgot Password</h2>
          )}
          {resetStep === "otp" && (
            <h2 className="text-xl font-bold text-[#002f6c] text-center mb-6">Verify OTP Code</h2>
          )}
          {resetStep === "reset" && (
            <h2 className="text-xl font-bold text-[#002f6c] text-center mb-6">New Password</h2>
          )}

          {/* Status messages */}
          {error && (
            <div className="mb-4 p-2.5 border-l-4 border-rose-500 bg-rose-50 text-rose-800 text-xs font-semibold flex items-start gap-2 rounded-r">
              <span className="material-icons text-sm text-rose-500 shrink-0 select-none">error_outline</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-2.5 border-l-4 border-emerald-500 bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-start gap-2 rounded-r">
              <span className="material-icons text-sm text-emerald-500 shrink-0 select-none">check_circle_outline</span>
              <span>{success}</span>
            </div>
          )}

          {/* ─── Sign In form ─── */}
          {resetStep === "login" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-zinc-500 mb-0.5">Username</label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Employee ID or Email"
                  autoComplete="username"
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="current-password" className="block text-xs font-medium text-zinc-500 mb-0.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="current-password"
                    name="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide" : "Show"}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  >
                    <span className="material-icons text-base select-none">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-6 bg-[#002f6c] hover:bg-[#003d8f] active:scale-[0.98] text-white font-bold rounded-full text-sm transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing In...</span>
                  </>
                ) : "Sign In"}
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => { setResetStep("forgot"); setError(null); setSuccess(null); setEmail(""); }}
                  className="text-xs font-semibold text-[#002f6c] hover:underline focus:outline-none"
                >
                  Forgot Password
                </button>
              </div>
            </form>
          )}

          {/* ─── Forgot Password form ─── */}
          {resetStep === "forgot" && (
            <form onSubmit={handleRequestOTP} className="space-y-5">
              <div>
                <label htmlFor="reset-username" className="block text-xs font-medium text-zinc-500 mb-0.5">Employee ID or Email</label>
                <input
                  type="text"
                  id="reset-username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="HSGA/TG/SM00053 or email"
                  required
                  className={inputCls}
                />
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-6 bg-[#002f6c] hover:bg-[#003d8f] text-white font-bold rounded-full text-sm transition-all shadow-md disabled:opacity-50">
                {isLoading ? "Sending..." : "Send Verification Code"}
              </button>
              <div className="text-center">
                <button type="button"
                  onClick={() => { setResetStep("login"); setError(null); setSuccess(null); setEmail(""); }}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 focus:outline-none">
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ─── OTP Verify form ─── */}
          {resetStep === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label htmlFor="otp-code" className="block text-xs font-medium text-zinc-500 mb-0.5">6-Digit Verification Code</label>
                <input
                  type="text"
                  id="otp-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="1  2  3  4  5  6"
                  required
                  className={inputCls + " font-mono tracking-[6px] text-center text-lg"}
                />
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-6 bg-[#002f6c] hover:bg-[#003d8f] text-white font-bold rounded-full text-sm transition-all shadow-md disabled:opacity-50">
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
              <div className="text-center">
                <button type="button"
                  onClick={() => { setResetStep("forgot"); setError(null); setSuccess(null); setOtpCode(""); }}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 focus:outline-none">
                  Request a new code
                </button>
              </div>
            </form>
          )}

          {/* ─── Reset Password form ─── */}
          {resetStep === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label htmlFor="new-password" className="block text-xs font-medium text-zinc-500 mb-0.5">New Password</label>
                <div className="relative">
                  <input type={showNewPassword ? "text" : "password"} id="new-password" value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required
                    className={inputCls + " pr-10"} />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none">
                    <span className="material-icons text-base select-none">{showNewPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-xs font-medium text-zinc-500 mb-0.5">Confirm New Password</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} id="confirm-password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required
                    className={inputCls + " pr-10"} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none">
                    <span className="material-icons text-base select-none">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-6 bg-[#002f6c] hover:bg-[#003d8f] text-white font-bold rounded-full text-sm transition-all shadow-md disabled:opacity-50">
                {isLoading ? "Saving..." : "Save New Password"}
              </button>
            </form>
          )}

        </div>
        {/* End card */}
      </div>

      {/* ── POWERED BY FOOTER ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 select-none z-10">
        <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-500/80">Powered By</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493"
          alt="Redlix Logo"
          className="h-6 w-auto object-contain opacity-70"
        />
      </div>
    </div>
  );
}
