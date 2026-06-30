"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface Employee {
  id: string;
  name: string;
  email: string;
  gender: string;
}

interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  gender: string;
  designation: string;
  district: string;
  phone: string;
  assignedSchool: string;
  address: string;
  imageUrl: string;
}

export default function EmployeeDashboard() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState<"overview" | "id-card" | "settings">("overview");

  // Profile view state — "view" | "edit"
  const [profileView, setProfileView] = useState<"edit" | "view">("view");

  // Extended profile state
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Form fields
  const [designation, setDesignation] = useState("");
  const [district, setDistrict] = useState("");
  const [phone, setPhone] = useState("");
  const [assignedSchool, setAssignedSchool] = useState("");
  const [address, setAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSavingPw, setIsSavingPw] = useState(false);

  // Load session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("employeeSession");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Employee;
          setEmployee(parsed);
        } catch {
          localStorage.removeItem("employeeSession");
          router.push("/");
        }
      } else {
        router.push("/");
      }
    }
    setIsChecking(false);
  }, [router]);

  // Load extended profile when settings tab opens
  const fetchProfile = useCallback(async (id: string) => {
    setIsLoadingProfile(true);
    try {
      const res = await fetch(`/api/employee/profile?id=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("Failed to load profile.");
      const data: EmployeeProfile = await res.json();
      setProfile(data);
      setDesignation(data.designation);
      setDistrict(data.district);
      setPhone(data.phone);
      setAssignedSchool(data.assignedSchool);
      setAddress(data.address);
      setImageUrl(data.imageUrl);
      if (data.imageUrl) setImagePreview(data.imageUrl);
      // If employee has saved profile data, show the profile view; else show form
      const hasProfile = data.designation || data.district || data.phone || data.address || data.imageUrl;
      setProfileView(hasProfile ? "view" : "edit");
    } catch {
      // profile simply empty
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "settings" && employee) {
      if (!profile) {
        fetchProfile(employee.id);
      } else {
        // Profile already loaded — show saved card if has data, else form
        const hasProfile = profile.designation || profile.district || profile.phone || profile.address || profile.imageUrl;
        setProfileView(hasProfile ? "view" : "edit");
      }
    }
  }, [activeTab, employee, profile, fetchProfile]);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("employeeSession");
    }
    router.push("/");
  };

  // ── Image Drag & Drop ──────────────────────────────────────
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be under 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setImageUrl(dataUrl);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // ── Save Profile ──────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setError(null);
    setSuccess(null);
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/employee/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: employee.id,
          designation,
          district,
          phone,
          assignedSchool,
          address,
          imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile.");
      setProfile(data.profile);
      setSuccess("Profile saved successfully!");
      setProfileView("view");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Change Password ───────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmPassword) { setError("New passwords do not match."); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    setIsSavingPw(true);
    try {
      const res = await fetch("/api/employee/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: employee?.email, otp: null, newPassword, currentPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password.");
      setSuccess("Password updated successfully.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsSavingPw(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="flex flex-col items-center gap-2">
          <span className="material-icons animate-spin text-3xl text-[#002f6c] select-none">sync</span>
          <p className="text-sm font-semibold text-zinc-500">Loading portal...</p>
        </div>
      </div>
    );
  }
  if (!employee) return null;

  const isMale = employee.id.includes("SM");
  const roleTitle = isMale ? "Scout Master" : "Guide Captain";
  const genderLabel = isMale ? "Male" : "Female";

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8] text-zinc-900 font-sans antialiased">

      {/* ── Top Bar ── */}
      <header className="bg-white border-b border-zinc-200 py-3 px-6 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png" alt="HSGA Telangana Logo" className="h-8 w-auto object-contain select-none" />
          <span className="font-bold tracking-wider text-[#002f6c] text-sm md:text-base">HSGA Telangana Employee Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs md:text-sm font-medium text-zinc-600">Namaste, <strong className="text-zinc-800">{employee.name}</strong></span>
          <button onClick={handleSignOut} title="Sign Out" className="p-2 text-zinc-500 hover:text-[#800020] hover:bg-zinc-100 rounded-full transition-colors focus:outline-none">
            <span className="material-icons text-xl select-none">exit_to_app</span>
          </button>
        </div>
      </header>

      {/* ── Workspace ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Foldable Sidebar ── */}
        <aside className="w-16 hover:w-60 bg-white border-r border-zinc-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out group z-20 overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-center group-hover:justify-between min-h-[57px] shrink-0">
            <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase hidden group-hover:block whitespace-nowrap select-none">Navigation</p>
            <span className="material-icons text-zinc-400 text-lg select-none shrink-0">menu</span>
          </div>
          <nav className="flex-1 p-3 space-y-2">
            {[
              { key: "overview", icon: "dashboard", label: "Overview" },
              { key: "id-card", icon: "badge", label: "My ID Card" },
              { key: "settings", icon: "manage_accounts", label: "Profile & Settings" },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => { setActiveTab(key as typeof activeTab); setError(null); setSuccess(null); if (key === "settings") setProfileView("view"); }}
                title={label}
                className={`w-full flex items-center justify-center group-hover:justify-start gap-4 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${activeTab === key ? "bg-[#002f6c]/10 text-[#002f6c]" : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"}`}
              >
                <span className="material-icons text-lg shrink-0">{icon}</span>
                <span className="hidden group-hover:inline-block text-xs whitespace-nowrap">{label}</span>
              </button>
            ))}
          </nav>
          <div className="p-3.5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-center group-hover:justify-start gap-3 overflow-hidden min-h-[65px] shrink-0">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Avatar" className="h-8 w-8 rounded-full object-cover shrink-0 border border-zinc-200" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#002f6c]/10 text-[#002f6c] flex items-center justify-center font-bold text-xs shrink-0 select-none">
                {employee.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 hidden group-hover:block">
              <p className="text-xs font-semibold text-zinc-700 truncate">{roleTitle}</p>
              <p className="text-[9px] text-zinc-400 font-mono mt-0.5 truncate">{employee.email}</p>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 bg-[#f0f4f8] overflow-y-auto p-8">
          <div className="w-full space-y-6">

            {/* Status alerts */}
            {error && (
              <div className="p-3.5 border-l-4 border-rose-600 bg-rose-50 text-rose-950 text-xs font-semibold flex items-start gap-2.5 shadow-sm rounded-r-md">
                <span className="material-icons text-base text-rose-600 shrink-0 select-none">error_outline</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3.5 border-l-4 border-emerald-600 bg-emerald-50 text-emerald-950 text-xs font-semibold flex items-start gap-2.5 shadow-sm rounded-r-md">
                <span className="material-icons text-base text-emerald-600 shrink-0 select-none">check_circle_outline</span>
                <span>{success}</span>
              </div>
            )}

            {/* ═══ TAB: Overview ═══ */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#002f6c] to-[#053266] text-white rounded-lg p-6 shadow-sm flex items-center gap-5">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="Avatar" className="h-14 w-14 rounded-full object-cover border-2 border-white/20" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-2xl font-black select-none">
                      {employee.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Welcome back</p>
                    <h1 className="text-xl font-bold mt-0.5">{employee.name}</h1>
                    <p className="text-white/80 text-xs mt-1">{profile?.designation || roleTitle} · {genderLabel}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Employee ID", value: employee.id, icon: "badge", color: "text-[#002f6c]", bg: "bg-[#002f6c]/10" },
                    { label: "Role", value: profile?.designation || roleTitle, icon: "work", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Account Status", value: "Active", icon: "verified", color: "text-amber-600", bg: "bg-amber-50", badge: true },
                  ].map(({ label, value, icon, color, bg, badge }) => (
                    <div key={label} className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-9 w-9 rounded-md ${bg} flex items-center justify-center shrink-0`}>
                          <span className={`material-icons ${color} text-lg select-none`}>{icon}</span>
                        </div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</p>
                      </div>
                      {badge ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold text-sm">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>Active
                        </span>
                      ) : (
                        <p className="font-semibold text-zinc-900 font-mono text-sm">{value}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
                  <h2 className="text-base font-bold text-zinc-800 mb-4 pb-3 border-b border-zinc-100">Account Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Full Name", value: employee.name, icon: "person" },
                      { label: "Employee ID", value: employee.id, icon: "badge", mono: true },
                      { label: "Email Address", value: employee.email, icon: "email" },
                      { label: "Gender", value: genderLabel, icon: "wc" },
                      { label: "District", value: profile?.district || "—", icon: "location_on" },
                      { label: "Phone", value: profile?.phone || "—", icon: "phone" },
                      { label: "Address", value: profile?.address || "—", icon: "home" },
                    ].map(({ label, value, icon, mono }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-icons text-zinc-400 text-sm select-none">{icon}</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{label}</p>
                          <p className={`text-sm font-semibold text-zinc-900 mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══ TAB: ID Card ═══ */}
            {activeTab === "id-card" && (
              <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-base font-bold text-zinc-800 mb-1">Digital Identity Badge</h2>
                <p className="text-xs text-zinc-500 mb-6">Your official HSGA Telangana employee verification card.</p>
                <div className="flex justify-center">
                  <div className="w-full max-w-sm">
                    <div className="bg-gradient-to-br from-[#002f6c] via-[#053266] to-[#011b3d] text-white rounded-xl shadow-2xl overflow-hidden border-2 border-amber-400 relative">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
                      <div className="bg-white/10 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png" alt="Logo" className="h-9 w-auto object-contain bg-white/90 p-0.5 rounded-full" />
                          <div className="leading-none">
                            <span className="font-bold text-[11px] tracking-wide uppercase block text-white/90">Hindustan Scouts & Guides</span>
                            <span className="font-extrabold text-[#e2f1ff] text-[9px] tracking-widest uppercase block mt-0.5">Telangana State Association</span>
                          </div>
                        </div>
                        <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 opacity-80 border border-amber-300 shadow flex items-center justify-center">
                          <span className="material-icons text-[10px] text-amber-900 select-none">verified</span>
                        </div>
                      </div>
                      <div className="p-6 flex gap-5">
                        <div className="flex flex-col items-center gap-3 shrink-0">
                          <div className="h-24 w-20 rounded-md border-2 border-white/20 bg-white/5 flex items-center justify-center overflow-hidden relative shadow-inner">
                            {imagePreview ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={imagePreview} alt="Employee" className="h-full w-full object-cover" />
                            ) : (
                              <span className="material-icons text-5xl text-white/30 select-none">account_circle</span>
                            )}
                            <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-emerald-600/80 rounded text-[6px] font-bold text-white uppercase tracking-widest select-none">Active</div>
                          </div>
                          <div className="bg-white p-1 rounded-sm flex flex-col items-center">
                            <div className="flex items-center gap-0.5 h-6 select-none">
                              {[1, 2, 1, 3, 1, 2, 4, 1, 2].map((w, i) => <div key={i} style={{ width: `${w}px` }} className="h-full bg-zinc-950"></div>)}
                            </div>
                            <span className="text-[6px] font-mono text-zinc-800 tracking-widest font-bold mt-0.5">{employee.id}</span>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-2 justify-center text-xs">
                          {[
                            { label: "Name", value: employee.name },
                            { label: "Employee ID", value: employee.id, mono: true },
                            { label: "Role / Section", value: profile?.designation || roleTitle },
                            { label: "Registered Email", value: employee.email },
                            ...(profile?.district ? [{ label: "District", value: profile.district }] : []),
                          ].map(({ label, value, mono }) => (
                            <div key={label}>
                              <span className="text-[9px] text-[#93c5fd] font-bold uppercase tracking-wider block leading-none">{label}</span>
                              <span className={`font-bold text-sm tracking-wide text-white block mt-0.5 ${mono ? "font-mono text-[11px]" : ""}`}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-amber-400 py-1.5 px-6 flex items-center justify-between text-zinc-900 font-bold select-none text-[10px] uppercase tracking-widest">
                        <span>Verification Card</span>
                        <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-700 animate-ping"></span>Active Badge</span>
                      </div>
                    </div>
                    <p className="text-center text-xs text-zinc-500 mt-4 leading-relaxed">Scan this badge at any HSGA Telangana facility to verify your status.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ TAB: Settings ═══ */}
            {activeTab === "settings" && (
              <div className="space-y-6">

                {/* ── Breadcrumb ── */}
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="material-icons text-sm text-zinc-400 select-none">manage_accounts</span>
                  <span className="font-medium text-zinc-400">Profile & Settings</span>
                  <span className="text-zinc-300">›</span>
                  <button
                    onClick={() => { setProfileView("edit"); setError(null); setSuccess(null); }}
                    className={`font-semibold transition-colors ${profileView === "edit" ? "text-[#002f6c] cursor-default pointer-events-none" : "text-zinc-500 hover:text-[#002f6c] hover:underline"}`}
                  >
                    Edit Profile
                  </button>
                  {profileView === "view" && (
                    <>
                      <span className="text-zinc-300">›</span>
                      <span className="font-semibold text-[#002f6c]">Saved Profile</span>
                    </>
                  )}
                </div>

                {isLoadingProfile ? (
                  <div className="flex items-center gap-3 py-8 justify-center">
                    <span className="material-icons animate-spin text-2xl text-[#002f6c] select-none">sync</span>
                    <p className="text-sm text-zinc-500 font-medium">Loading profile...</p>
                  </div>
                ) : profileView === "view" && profile ? (
                  /* ─── SAVED PROFILE VIEW ─── */
                  <div className="space-y-6">
                    {/* Centered Profile Header (Lavender Area) */}
                    <div className="bg-[#e8eaf6] rounded-xl border border-zinc-200/80 p-8 flex flex-col items-center relative shadow-sm">
                      <button
                        onClick={() => { setProfileView("edit"); setError(null); setSuccess(null); }}
                        className="absolute top-4 right-5 text-xs font-semibold text-[#002f6c] hover:underline"
                      >
                        Edit Profile
                      </button>

                      {/* Hello Title */}
                      <h1 className="text-3xl text-zinc-700 font-light tracking-wide mb-5" style={{ fontFamily: "Georgia, serif" }}>
                        Hello
                      </h1>

                      {/* Centered Circular Profile Photo */}
                      <div className="mb-4">
                        {imagePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imagePreview} alt="Profile"
                            className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md" />
                        ) : (
                          <div className="h-32 w-32 rounded-full bg-[#002f6c] border-4 border-white shadow-md flex items-center justify-center text-4xl font-black text-white select-none">
                            {employee.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Centered Name and Info details */}
                      <div className="text-center">
                        <h2 className="text-lg font-bold text-[#002f6c]">{employee.name}</h2>
                        <p className="text-sm font-medium text-zinc-600 mt-1">
                          {employee.id} | {profile.designation || roleTitle}
                        </p>
                      </div>

                      {/* Horizontal pill link buttons like in the screenshot */}
                      <div className="flex flex-wrap justify-center gap-2 mt-5 pt-4 border-t border-[#c5cae9]/80 w-full max-w-xl">
                        <span className="px-3 py-1 bg-[#e3f2fd] text-[#0d47a1] text-[11px] font-semibold rounded-md shadow-sm border border-[#bbdefb]">
                          Personal Info
                        </span>
                        <span className="px-3 py-1 bg-[#e3f2fd] text-[#0d47a1] text-[11px] font-semibold rounded-md shadow-sm border border-[#bbdefb]">
                          Contact Details
                        </span>
                        <span className="px-3 py-1 bg-[#e3f2fd] text-[#0d47a1] text-[11px] font-semibold rounded-md shadow-sm border border-[#bbdefb]">
                          Role &amp; School
                        </span>
                        <button
                          onClick={() => { setActiveTab("id-card"); }}
                          className="px-3 py-1 bg-[#0d47a1] hover:bg-[#0b3c8f] text-white text-[11px] font-semibold rounded-md shadow-sm transition-colors"
                        >
                          View ID Card
                        </button>
                      </div>
                    </div>

                    {/* Two-column Details (aligned clean layout) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Left Column Cards */}
                      <div className="space-y-6">
                        {/* Card 1: Personal Details */}
                        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
                          <h3 className="text-sm font-bold text-zinc-800 border-b border-zinc-150 pb-2 mb-4 uppercase tracking-wider">
                            Personal Details
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { label: "Full Name", value: employee.name },
                              { label: "Employee ID", value: employee.id, mono: true },
                              { label: "Gender", value: genderLabel },
                              { label: "Email Address", value: employee.email },
                            ].map(({ label, value, mono }) => (
                              <div key={label} className="space-y-0.5">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
                                <p className={`text-sm font-semibold text-zinc-800 ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card 2: Contact Details */}
                        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
                          <h3 className="text-sm font-bold text-zinc-800 border-b border-zinc-150 pb-2 mb-4 uppercase tracking-wider">
                            Contact Details
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Phone Number</p>
                              <p className="text-sm font-semibold text-zinc-800">{profile.phone || "—"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">District</p>
                              <p className="text-sm font-semibold text-zinc-800">{profile.district || "—"}</p>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Address</p>
                              <p className="text-sm font-semibold text-zinc-800 leading-relaxed">{profile.address || "—"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column Cards */}
                      <div className="space-y-6">
                        {/* Card 3: Role & Assignment */}
                        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
                          <h3 className="text-sm font-bold text-zinc-800 border-b border-zinc-150 pb-2 mb-4 uppercase tracking-wider">
                            Role &amp; Assignment
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { label: "Designation", value: profile.designation || roleTitle },
                              { label: "Section / Unit", value: roleTitle },
                              { label: "Assigned School", value: profile.assignedSchool },
                              { label: "Current Term", value: "2025–2026" },
                            ].map(({ label, value }) => (
                              <div key={label} className="space-y-0.5">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
                                <p className="text-sm font-semibold text-zinc-800">{value || "—"}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card 4: Account Information */}
                        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
                          <h3 className="text-sm font-bold text-zinc-800 border-b border-zinc-150 pb-2 mb-4 uppercase tracking-wider">
                            Account Information
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Employee ID</p>
                              <p className="text-sm font-mono font-semibold text-zinc-800">{employee.id}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Account Status</p>
                              <p className="text-sm font-semibold text-green-600 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
                                Active
                              </p>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Portal Access</p>
                              <p className="text-sm font-semibold text-zinc-800">Employee Portal</p>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ) : (

                  /* ─── EDIT PROFILE FORM ─── */
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Left: Profile Form */}
                    <div className="lg:col-span-3 space-y-5">
                      <form onSubmit={handleSaveProfile} className="space-y-5">
                        {/* ── Photo Upload ── */}
                        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
                          <h3 className="text-sm font-bold text-zinc-700 mb-1">Profile Photo</h3>
                          <p className="text-xs text-zinc-400 mb-4">Drag & drop an image or click to browse. JPG, PNG, WEBP · Max 5MB.</p>
                          <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative cursor-pointer flex flex-col items-center justify-center gap-3 h-44 rounded-xl border-2 border-dashed transition-all duration-200
                              ${isDragging ? "border-[#002f6c] bg-[#002f6c]/5 scale-[1.01]" : "border-zinc-300 bg-zinc-50 hover:border-[#002f6c]/50 hover:bg-[#002f6c]/5"}`}
                          >
                            {imagePreview ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-xl opacity-80" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                                  <div className="text-white text-center">
                                    <span className="material-icons text-3xl select-none">add_a_photo</span>
                                    <p className="text-xs font-semibold mt-1">Change Photo</p>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${isDragging ? "bg-[#002f6c]/10" : "bg-zinc-200"}`}>
                                  <span className={`material-icons text-3xl select-none transition-colors ${isDragging ? "text-[#002f6c]" : "text-zinc-400"}`}>add_a_photo</span>
                                </div>
                                <p className={`text-sm font-semibold transition-colors ${isDragging ? "text-[#002f6c]" : "text-zinc-500"}`}>
                                  {isDragging ? "Drop image here" : "Drag & drop or click to upload"}
                                </p>
                              </>
                            )}
                          </div>
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                          {imagePreview && (
                            <button type="button" onClick={() => { setImagePreview(null); setImageUrl(""); }} className="mt-2 text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1">
                              <span className="material-icons text-sm select-none">delete</span>Remove photo
                            </button>
                          )}
                        </div>

                        {/* ── Info Fields ── */}
                        <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm">
                          <h3 className="text-sm font-bold text-zinc-700 mb-5">Personal & Role Information</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {/* Read-only: Full Name */}
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Full Name <span className="text-zinc-300 font-normal">(system-managed)</span></label>
                              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-md">
                                <span className="material-icons text-zinc-300 text-sm select-none">person</span>
                                <span className="text-sm text-zinc-400 font-medium">{employee.name}</span>
                              </div>
                            </div>

                            {/* Designation */}
                            <div>
                              <label htmlFor="designation" className="block text-xs font-semibold text-zinc-600 mb-1.5">
                                Designation / Role
                              </label>
                              <div className="relative">
                                <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-base select-none">work</span>
                                <input
                                  type="text"
                                  id="designation"
                                  value={designation}
                                  onChange={(e) => setDesignation(e.target.value)}
                                  placeholder="e.g. Scout Master, Group Leader"
                                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] transition-colors"
                                />
                              </div>
                            </div>

                            {/* District */}
                            <div>
                              <label htmlFor="district" className="block text-xs font-semibold text-zinc-600 mb-1.5">District</label>
                              <div className="relative">
                                <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-base select-none">location_on</span>
                                <input
                                  type="text"
                                  id="district"
                                  value={district}
                                  onChange={(e) => setDistrict(e.target.value)}
                                  placeholder="e.g. Hyderabad, Warangal"
                                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] transition-colors"
                                />
                              </div>
                            </div>

                            {/* Phone */}
                            <div>
                              <label htmlFor="phone" className="block text-xs font-semibold text-zinc-600 mb-1.5">Phone Number</label>
                              <div className="relative">
                                <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-base select-none">phone</span>
                                <input
                                  type="tel"
                                  id="phone"
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  placeholder="+91 9876543210"
                                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] transition-colors"
                                />
                              </div>
                            </div>

                            {/* Assigned School */}
                            <div>
                              <label htmlFor="assignedSchool" className="block text-xs font-semibold text-zinc-600 mb-1.5">
                                Assigned School <span className="text-zinc-400 font-normal">(optional)</span>
                              </label>
                              <div className="relative">
                                <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-base select-none">school</span>
                                <input
                                  type="text"
                                  id="assignedSchool"
                                  value={assignedSchool}
                                  onChange={(e) => setAssignedSchool(e.target.value)}
                                  placeholder="Will be assigned by admin"
                                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-md text-sm text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] transition-colors bg-zinc-50/50"
                                />
                              </div>
                              <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                                <span className="material-icons text-xs select-none">info</span>
                                This field will be assigned by the administrator.
                              </p>
                            </div>

                            {/* Address */}
                            <div className="sm:col-span-2">
                              <label htmlFor="address" className="block text-xs font-semibold text-zinc-600 mb-1.5">Address</label>
                              <div className="relative">
                                <span className="material-icons text-zinc-400 absolute left-3 top-3 text-base select-none">home</span>
                                <textarea
                                  id="address"
                                  value={address}
                                  onChange={(e) => setAddress(e.target.value)}
                                  placeholder="House No., Street, Area, City — Pincode"
                                  rows={3}
                                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] transition-colors resize-none"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Save Button */}
                          <div className="mt-6 flex items-center gap-3">
                            <button
                              type="submit"
                              disabled={isSavingProfile}
                              className="flex items-center gap-2 px-6 py-2.5 bg-[#002f6c] hover:bg-[#002352] text-white font-semibold rounded-md text-sm transition-colors shadow-sm disabled:opacity-50"
                            >
                              {isSavingProfile ? (
                                <><span className="material-icons animate-spin text-base select-none">sync</span>Saving...</>
                              ) : (
                                <><span className="material-icons text-base select-none">save</span>Save Changes</>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setDesignation(profile?.designation || ""); setDistrict(profile?.district || ""); setPhone(profile?.phone || ""); setAssignedSchool(profile?.assignedSchool || ""); setAddress(profile?.address || ""); setError(null); setSuccess(null); }}
                              className="px-4 py-2.5 border border-zinc-300 hover:bg-zinc-50 text-zinc-600 font-semibold rounded-md text-sm transition-colors"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Right: Change Password */}
                    <div className="lg:col-span-2">
                      <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm h-fit">
                        <h3 className="text-sm font-bold text-zinc-700 mb-1">Change Password</h3>
                        <p className="text-xs text-zinc-400 mb-5">Update your account login credentials.</p>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                          {[
                            { id: "emp-cur-pw", label: "Current Password", value: currentPassword, setValue: setCurrentPassword, show: showCurrent, setShow: setShowCurrent, icon: "lock" },
                            { id: "emp-new-pw", label: "New Password", value: newPassword, setValue: setNewPassword, show: showNew, setShow: setShowNew, icon: "lock_open" },
                            { id: "emp-cfm-pw", label: "Confirm New Password", value: confirmPassword, setValue: setConfirmPassword, show: showConfirm, setShow: setShowConfirm, icon: "lock_open" },
                          ].map(({ id, label, value, setValue, show, setShow, icon }) => (
                            <div key={id}>
                              <label htmlFor={id} className="block text-xs font-semibold text-zinc-600 mb-1.5">{label}</label>
                              <div className="relative">
                                <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-base select-none">{icon}</span>
                                <input
                                  type={show ? "text" : "password"}
                                  id={id}
                                  value={value}
                                  onChange={(e) => setValue(e.target.value)}
                                  placeholder="••••••••"
                                  required
                                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] transition-colors"
                                />
                                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none">
                                  <span className="material-icons text-base select-none">{show ? "visibility_off" : "visibility"}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                          <div className="pt-2 flex gap-3">
                            <button type="button" onClick={() => { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }} className="flex-1 py-2.5 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-semibold rounded-md text-sm transition-colors">Reset</button>
                            <button type="submit" disabled={isSavingPw} className="flex-1 py-2.5 bg-[#002f6c] hover:bg-[#002352] text-white font-semibold rounded-md text-sm transition-colors shadow-sm disabled:opacity-50">{isSavingPw ? "Saving..." : "Save Password"}</button>
                          </div>
                        </form>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
