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
      <div className="h-dvh flex items-center justify-center bg-[#f0f2ff]">
        <div className="flex flex-col items-center gap-2">
          <span className="material-icons animate-spin text-3xl text-[#002f6c] select-none">sync</span>
          <p className="text-sm font-semibold text-zinc-500">Loading portal credentials...</p>
        </div>
      </div>
    );
  }

  return (
    /*
     * LAYOUT: Full viewport, no scroll.
     * - Light lavender-white background at top
     * - Large navy semi-circle SVG rising from the bottom
     * - White card with logo + form centred in the upper half
     */
    <div className="h-dvh w-full overflow-hidden relative flex flex-col items-center bg-[#f0f2ff] font-sans antialiased">

      {/* ── Decorative large semi-circle at the bottom ── */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none"
        style={{
          width: "160vw",
          maxWidth: "1200px",
          aspectRatio: "1/0.75",
        }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 900 675"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Single clean navy semi-circle rising from the bottom with increased height */}
          <ellipse cx="450" cy="675" rx="450" ry="480" fill="#002f6c" />
        </svg>
      </div>

      {/* ── Brand text watermark inside semi-circle ── */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none z-10"
        aria-hidden="true"
      >
        <p className="text-white/20 font-black text-[10px] sm:text-xs uppercase tracking-[0.35em]">
          Hindustan Scouts &amp; Guides · Telangana
        </p>
      </div>

      {/* ── Main content: logo + card ── */}
      <div className="relative z-20 flex flex-col items-center w-full px-5 pt-10 sm:pt-14">

        {/* Logo + org name */}
        <div className="flex flex-col items-center mb-5 sm:mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png"
            alt="HSGA Telangana Logo"
            className="h-16 sm:h-20 w-auto object-contain drop-shadow-md select-none"
          />
          <h1 className="mt-2 text-[#002f6c] font-extrabold text-base sm:text-lg text-center leading-tight">
            Hindustan Scouts &amp; Guides
          </h1>
          <span className="text-[#800020] font-bold text-xs sm:text-sm tracking-widest uppercase">
            Telangana
          </span>
        </div>

        {/* ── Login Card ── */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-blue-900/10 border border-zinc-100 px-6 py-7 sm:px-8 sm:py-8">

          {/* Dynamic title */}
          {resetStep === "login" && (
            <div className="mb-5 text-center">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-800">Staff Portal Sign In</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">HSGA Telangana — Secure Access</p>
            </div>
          )}
          {resetStep === "forgot" && (
            <div className="mb-5 text-center">
              <h2 className="text-lg font-bold text-zinc-800">Forgot Password</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">Enter your ID to receive a verification code</p>
            </div>
          )}
          {resetStep === "otp" && (
            <div className="mb-5 text-center">
              <h2 className="text-lg font-bold text-zinc-800">Verify OTP Code</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">6-digit code dispatched to {maskedEmail}</p>
            </div>
          )}
          {resetStep === "reset" && (
            <div className="mb-5 text-center">
              <h2 className="text-lg font-bold text-zinc-800">Create New Password</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">Set a new secure password for your account</p>
            </div>
          )}

          {/* Status messages */}
          {error && (
            <div className="mb-4 p-3 border-l-4 border-rose-500 bg-rose-50 text-rose-900 text-xs font-semibold flex items-start gap-2 rounded-r-md">
              <span className="material-icons text-base text-rose-500 shrink-0 select-none">error_outline</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 border-l-4 border-emerald-500 bg-emerald-50 text-emerald-900 text-xs font-semibold flex items-start gap-2 rounded-r-md">
              <span className="material-icons text-base text-emerald-500 shrink-0 select-none">check_circle_outline</span>
              <span>{success}</span>
            </div>
          )}

          {/* ─── Sign In form ─── */}
          {resetStep === "login" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-zinc-600 mb-1.5">
                  Employee ID or Email
                </label>
                <div className="relative">
                  <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">badge</span>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="HSGA/TG/SM00053 or email"
                    autoComplete="username"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#002f6c]/30 focus:border-[#002f6c] transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="current-password" className="block text-xs font-semibold text-zinc-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">lock</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="current-password"
                    name="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-12 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#002f6c]/30 focus:border-[#002f6c] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors focus:outline-none"
                  >
                    <span className="material-icons text-lg select-none">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-[#002f6c] hover:bg-[#003d8f] active:bg-[#001f4a] text-white font-bold rounded-lg text-sm transition-all shadow-md shadow-blue-900/20 disabled:opacity-50 disabled:pointer-events-none mt-1"
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
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setResetStep("forgot"); setError(null); setSuccess(null); setEmail(""); }}
                  className="text-[11px] font-semibold text-[#800020] hover:underline focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          {/* ─── Forgot Password form ─── */}
          {resetStep === "forgot" && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label htmlFor="reset-username" className="block text-xs font-semibold text-zinc-600 mb-1.5">
                  Employee ID or Registered Email
                </label>
                <div className="relative">
                  <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">badge</span>
                  <input
                    type="text"
                    id="reset-username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="HSGA/TG/SM00053 or email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#002f6c]/30 focus:border-[#002f6c] transition-all"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 bg-[#002f6c] hover:bg-[#003d8f] text-white font-bold rounded-lg text-sm transition-all shadow-md shadow-blue-900/20 disabled:opacity-50">
                {isLoading ? "Sending OTP..." : "Send Verification Code"}
              </button>
              <div className="text-center">
                <button type="button"
                  onClick={() => { setResetStep("login"); setError(null); setSuccess(null); setEmail(""); }}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 focus:outline-none">
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ─── OTP Verify form ─── */}
          {resetStep === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label htmlFor="otp-code" className="block text-xs font-semibold text-zinc-600 mb-1.5">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">pin</span>
                  <input
                    type="text"
                    id="otp-code"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 font-mono text-center tracking-[10px] text-lg placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#002f6c]/30 focus:border-[#002f6c] transition-all"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 bg-[#002f6c] hover:bg-[#003d8f] text-white font-bold rounded-lg text-sm transition-all shadow-md shadow-blue-900/20 disabled:opacity-50">
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
              <div className="text-center">
                <button type="button"
                  onClick={() => { setResetStep("forgot"); setError(null); setSuccess(null); setOtpCode(""); }}
                  className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 focus:outline-none">
                  Request a new code
                </button>
              </div>
            </form>
          )}

          {/* ─── Reset Password form ─── */}
          {resetStep === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-xs font-semibold text-zinc-600 mb-1.5">New Password</label>
                <div className="relative">
                  <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">lock</span>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-12 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#002f6c]/30 focus:border-[#002f6c] transition-all"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none">
                    <span className="material-icons text-lg select-none">{showNewPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-xs font-semibold text-zinc-600 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">lock</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-12 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#002f6c]/30 focus:border-[#002f6c] transition-all"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none">
                    <span className="material-icons text-lg select-none">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 bg-[#002f6c] hover:bg-[#003d8f] text-white font-bold rounded-lg text-sm transition-all shadow-md shadow-blue-900/20 disabled:opacity-50">
                {isLoading ? "Saving..." : "Save Password"}
              </button>
            </form>
          )}
        </div>
        {/* End card */}
      </div>
      {/* End main content */}
    </div>
  );
}

