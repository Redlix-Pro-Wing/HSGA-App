"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
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
      <div className="min-h-screen flex items-center justify-center bg-[#e8eaf6]">
        <div className="flex flex-col items-center gap-2">
          <span className="material-icons animate-spin text-3xl text-[#002f6c] select-none">sync</span>
          <p className="text-sm font-semibold text-zinc-500">Loading portal credentials...</p>
        </div>
      </div>
    );
  }

  // Case B: Logged out -> Render normal portal login card
  return (
    <div className="min-h-screen flex flex-col bg-[#e8eaf6] text-zinc-900 font-sans antialiased">
      {/* Navbar at the top matching main page background */}
      <nav className="w-full bg-[#e8eaf6] py-4 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png"
            alt="Hindustan Scouts & Guides Association — Telangana Logo"
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

      {/* Main Login Card Body */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <main className="w-full max-w-md">
          {/* Secure Login Card */}
          <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-8">
            {/* Dynamic Headers based on resetStep */}
            {resetStep === "login" && (
              <>
                <h2 className="text-xl font-bold text-zinc-800 mb-1 text-center">
                  Sign In
                </h2>
                <p className="text-xs text-zinc-500 mb-6 text-center">
                  HSGA Telangana Portal
                </p>
              </>
            )}

            {resetStep === "forgot" && (
              <>
                <h2 className="text-xl font-bold text-zinc-800 mb-1 text-center">
                  Forgot Password
                </h2>
                <p className="text-xs text-zinc-500 mb-6 text-center">
                  Enter your credentials to receive a verification OTP code
                </p>
              </>
            )}

            {resetStep === "otp" && (
              <>
                <h2 className="text-xl font-bold text-zinc-800 mb-1 text-center">
                  Verify OTP Code
                </h2>
                <p className="text-xs text-zinc-500 mb-6 text-center">
                  A 6-digit verification code has been dispatched to {maskedEmail}
                </p>
              </>
            )}

            {resetStep === "reset" && (
              <>
                <h2 className="text-xl font-bold text-zinc-800 mb-1 text-center">
                  Create New Password
                </h2>
                <p className="text-xs text-zinc-500 mb-6 text-center">
                  Create a new secure set of password credentials for your account
                </p>
              </>
            )}

            {/* Status Messages */}
            {error && (
              <div className="mb-5 p-3.5 border-l-4 border-rose-600 bg-rose-50 text-rose-950 text-xs font-semibold flex items-start gap-2.5 rounded-r">
                <span className="material-icons text-base text-rose-600 shrink-0 select-none">error_outline</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-5 p-3.5 border-l-4 border-emerald-600 bg-emerald-50 text-emerald-950 text-xs font-semibold flex items-start gap-2.5 rounded-r">
                <span className="material-icons text-base text-emerald-600 shrink-0 select-none">check_circle_outline</span>
                <span>{success}</span>
              </div>
            )}

            {/* Conditional Views rendering */}
            {resetStep === "login" && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Employee ID or Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-zinc-700 mb-1.5"
                  >
                    Employee ID or Email Address
                  </label>
                  <div className="relative">
                    <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">
                      badge
                    </span>
                    <input
                      type="text"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="HSGA/TG/SM00053 or name@domain.com"
                      autoComplete="username"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-md text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] transition-colors"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label
                    htmlFor="current-password"
                    className="block text-sm font-medium text-zinc-700 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">
                      lock
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="current-password"
                      name="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      className="w-full pl-10 pr-12 py-2.5 bg-white border border-zinc-300 rounded-md text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors focus:outline-none focus:ring-1 focus:ring-[#002f6c] rounded p-1 flex items-center justify-center"
                    >
                      <span className="material-icons text-lg select-none">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 bg-[#002f6c] hover:bg-[#002352] text-white font-semibold rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002f6c] transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-sm"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>

                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep("forgot");
                      setError(null);
                      setSuccess(null);
                      setEmail("");
                    }}
                    className="text-xs font-semibold text-[#800020] hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            )}

            {resetStep === "forgot" && (
              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div>
                  <label htmlFor="reset-username" className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Employee ID or Registered Email
                  </label>
                  <div className="relative">
                    <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">
                      badge
                    </span>
                    <input
                      type="text"
                      id="reset-username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="HSGA/TG/SM00053 or name@domain.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-md text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 bg-[#002f6c] hover:bg-[#002352] text-white font-semibold rounded-md text-sm focus:outline-none transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Sending OTP..." : "Send Verification Code"}
                </button>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep("login");
                      setError(null);
                      setSuccess(null);
                      setEmail("");
                    }}
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 focus:outline-none"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {resetStep === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label htmlFor="otp-code" className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Enter Verification Code (OTP)
                  </label>
                  <div className="relative">
                    <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">
                      pin
                    </span>
                    <input
                      type="text"
                      id="otp-code"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-md text-sm text-zinc-900 font-mono text-center tracking-[10px] text-lg placeholder-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 bg-[#002f6c] hover:bg-[#002352] text-white font-semibold rounded-md text-sm focus:outline-none transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </button>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep("forgot");
                      setError(null);
                      setSuccess(null);
                      setOtpCode("");
                    }}
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 focus:outline-none"
                  >
                    Request a new code
                  </button>
                </div>
              </form>
            )}

            {resetStep === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* New Password */}
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-zinc-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">
                      lock
                    </span>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-12 py-2.5 bg-white border border-zinc-300 rounded-md text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none p-1 flex items-center justify-center"
                    >
                      <span className="material-icons text-lg select-none">
                        {showNewPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-zinc-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">
                      lock
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirm-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-12 py-2.5 bg-white border border-zinc-300 rounded-md text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none p-1 flex items-center justify-center"
                    >
                      <span className="material-icons text-lg select-none">
                        {showConfirmPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 bg-[#002f6c] hover:bg-[#002352] text-white font-semibold rounded-md text-sm focus:outline-none transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isLoading ? "Saving..." : "Save Password"}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
