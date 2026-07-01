"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
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
  const [activeTab, setActiveTab] = useState<"overview" | "settings" | "schools" | "calls" | "media">("overview");

  // Profile view state — "view" | "edit" | "id-card" | "details" | "schedule"
  const [profileView, setProfileView] = useState<"view" | "edit" | "id-card" | "details" | "schedule">("view");

  // Selected day index in Daily Schedule view (defaults to today's index in IST)
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(() => {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const nowIST = new Date(utc + (3600000 * 5.5));
    return nowIST.getDay();
  });

  // Timetable State
  const [timetableEntry, setTimetableEntry] = useState<any>(null);
  const [isFetchingTimetable, setIsFetchingTimetable] = useState(false);

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
          // Clean/migrate ID loaded from local storage to match database pattern format
          const exactRegex = /^HSGA\/TG\/(SM|GC)\d{5}$/;
          if (!exactRegex.test(parsed.id)) {
            const digitsMatch = parsed.id.match(/\d+$/);
            if (digitsMatch) {
              const num = parseInt(digitsMatch[0], 10);
              const isMale = parsed.id.toLowerCase().includes("sm");
              const prefix = isMale ? "HSGA/TG/SM" : "HSGA/TG/GC";
              const paddedCounter = String(num).padStart(5, "0");
              parsed.id = prefix + paddedCounter;
              localStorage.setItem("employeeSession", JSON.stringify(parsed));
            }
          }
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

  // Fetch/refetch timetable entries for the logged-in employee name automatically when day is selected
  useEffect(() => {
    if (employee) {
      const loadTimetable = async () => {
        setIsFetchingTimetable(true);
        try {
          const res = await fetch("/api/admin/timetable");
          if (res.ok) {
            const data = await res.json();
            const myEntry = data.find((row: any) => row.employeeName.toLowerCase().trim() === employee.name.toLowerCase().trim());
            setTimetableEntry(myEntry || null);
          }
        } catch (err) {
          console.error("Error loading employee timetable:", err);
        } finally {
          setIsFetchingTimetable(false);
        }
      };
      loadTimetable();
    }
  }, [employee, profileView, selectedDayIdx]);

  // Compute upcoming session for the week in Indian Standard Time (IST)
  const upcomingSession = useMemo(() => {
    if (!timetableEntry) return null;

    const DAYS_ORDER = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const slotsConfig = [
      { key: "1", label: "8:30 AM - 10:30 AM", start: 510 },
      { key: "2", label: "10:30 AM - 12:30 PM", start: 630 },
      { key: "3", label: "1:30 PM - 3:30 PM", start: 810 },
      { key: "4", label: "3:30 PM - 5:30 PM", start: 930 },
    ];

    // Get current time adjusted to Indian Standard Time (IST, UTC+5:30)
    const getISTTime = () => {
      const d = new Date();
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      return new Date(utc + (3600000 * 5.5));
    };

    const nowIST = getISTTime();
    const currentDayIdx = nowIST.getDay();
    const currentMinutes = nowIST.getHours() * 60 + nowIST.getMinutes();

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const checkDayIdx = (currentDayIdx + dayOffset) % 7;
      const checkDayName = DAYS_ORDER[checkDayIdx];

      if (checkDayName === "sunday") continue;

      for (let slot of slotsConfig) {
        if (dayOffset === 0 && slot.start <= currentMinutes) {
          continue;
        }

        const fieldKey = `${checkDayName}_${slot.key}`;
        const val = timetableEntry[fieldKey];
        if (val && val.toLowerCase() !== "free" && val.trim() !== "") {
          const sessionDate = new Date(nowIST);
          sessionDate.setDate(nowIST.getDate() + dayOffset);

          const dayNumber = String(sessionDate.getDate()).padStart(2, "0");
          const monthName = sessionDate.toLocaleString("en-US", { month: "long" });

          return {
            schoolName: val,
            dayNumber,
            monthName,
            timeLabel: slot.label,
          };
        }
      }
    }
    return null;
  }, [timetableEntry]);

  // Fallback date info in Indian Standard Time (IST)
  const fallbackDate = useMemo(() => {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const nowIST = new Date(utc + (3600000 * 5.5));

    const dayNumber = String(nowIST.getDate()).padStart(2, "0");
    const monthName = nowIST.toLocaleString("en-US", { month: "long" });
    return { dayNumber, monthName };
  }, []);

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
      <div className="min-h-screen flex items-center justify-center bg-[#e8eaf6]">
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

  if (profileView === "schedule") {
    // Generate dates for current week (Sun-Sat) dynamically
    const getWeekDays = () => {
      const d = new Date();
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      const nowIST = new Date(utc + (3600000 * 5.5));
      const currentDay = nowIST.getDay();
      
      const startOfWeek = new Date(nowIST);
      startOfWeek.setDate(nowIST.getDate() - currentDay); // Go to Sunday
      
      const weekdaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weekdaysFull = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const days = [];
      for (let i = 0; i < 7; i++) {
        const dateObj = new Date(startOfWeek);
        dateObj.setDate(startOfWeek.getDate() + i);
        days.push({
          dayName: weekdaysShort[i],
          dayNameLong: weekdaysFull[i], // 'sunday', 'monday', etc.
          dayNumber: dateObj.getDate(),
          dayIndex: i,
          isToday: dateObj.toDateString() === nowIST.toDateString(),
        });
      }
      return days;
    };

    const days = getWeekDays();
    const selectedDay = days[selectedDayIdx];
    const dayKey = selectedDay.dayNameLong;

    // Fetch classes for the selected day from the employee's timetableEntry
    const dayClasses = (() => {
      if (!timetableEntry || dayKey === "sunday") return [];
      const slotsConfig = [
        { num: "1", label: "8:30 AM - 10:30 AM" },
        { num: "2", label: "10:30 AM - 12:30 PM" },
        { num: "3", label: "1:30 PM - 3:30 PM" },
        { num: "4", label: "3:30 PM - 5:30 PM" }
      ];
      
      const list = [];
      for (let slot of slotsConfig) {
        const val = timetableEntry[`${dayKey}_${slot.num}`];
        if (val && val.toLowerCase() !== "free" && val.trim() !== "") {
          list.push({
            slotLabel: slot.label,
            slotNum: slot.num,
            schoolName: val,
          });
        }
      }
      return list;
    })();

    return (
      <div className="h-screen w-full flex flex-col bg-[#F5F7FA] font-sans antialiased overflow-hidden select-none">
        {/* Header */}
        <header className="bg-white border-b border-zinc-200 px-4 py-4 flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setProfileView("view")}
            className="p-1 text-zinc-650 hover:bg-zinc-100 rounded-full transition-colors flex items-center justify-center cursor-pointer"
          >
            <span className="material-icons text-xl select-none">arrow_back</span>
          </button>
          <img 
            src="https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png" 
            alt="HSGA Logo" 
            className="h-10 w-10 object-contain select-none" 
          />
          <h2 className="text-lg font-bold text-zinc-950">Daily Schedule</h2>
        </header>

        {/* Calendar Horizontal Bar */}
        <div className="bg-white border-b border-zinc-200/50 px-3 py-4 flex justify-between items-center shrink-0">
          {days.map((day) => {
            const isSelected = selectedDayIdx === day.dayIndex;
            return (
              <div 
                key={day.dayIndex}
                onClick={() => setSelectedDayIdx(day.dayIndex)}
                className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
              >
                <span className={`text-[11px] font-bold tracking-wide transition-colors ${
                  isSelected ? "text-[#002f6c]" : "text-zinc-400 group-hover:text-zinc-655"
                }`}>
                  {day.dayName}
                </span>
                
                <div className="relative flex items-center justify-center h-8 w-8 select-none">
                  {isSelected ? (
                    <div className="absolute inset-0 bg-[#002f6c] rounded-full flex items-center justify-center shadow-md">
                      <span className="text-xs font-black text-white leading-none">
                        {day.dayNumber}
                      </span>
                    </div>
                  ) : (
                    <span className={`text-xs font-bold ${day.isToday ? "text-[#002f6c] font-black" : "text-zinc-700"} group-hover:text-zinc-950`}>
                      {day.dayNumber}
                    </span>
                  )}
                </div>

                {/* Indication bar under selected */}
                <div className={`h-1 w-6 rounded-full transition-all duration-150 ${
                  isSelected ? "bg-[#002f6c]" : "bg-transparent"
                }`} />
              </div>
            );
          })}
        </div>

        {/* Schedule List area */}
        <main className="flex-1 overflow-y-auto p-5">
          {dayClasses.length === 0 ? (
            <div className="bg-white border border-zinc-200 text-zinc-700 rounded-xl p-4 text-center text-sm font-bold shadow-sm select-none max-w-md mx-auto">
              No Schedule Available!
            </div>
          ) : (
            <div className="space-y-4 max-w-md mx-auto pb-10">
              {dayClasses.map((item) => (
                <div 
                  key={item.slotNum} 
                  className="bg-white border border-zinc-200 shadow-sm rounded-xl p-4 flex flex-col gap-2 hover:shadow transition-shadow relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#002f6c]" />
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                      {item.slotLabel}
                    </span>
                    <span className="text-[9px] font-extrabold text-[#800020] bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                      Slot {item.slotNum}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-zinc-900 leading-tight">
                    {item.schoolName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold mt-1">
                    <span className="material-icons text-sm text-zinc-400 select-none">location_on</span>
                    <span>Classroom / School Campus</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#e8eaf6] text-zinc-900 font-sans antialiased overflow-hidden">

      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 bg-[#f3f4f6] border-b border-zinc-200 py-1 px-4 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png" alt="HSGA Logo" className="h-11 md:h-13 w-auto object-contain select-none" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] md:text-xs text-zinc-500">Namaste,</span>
            <span className="text-xs md:text-sm font-bold text-zinc-950 truncate max-w-[150px] sm:max-w-none">{employee.name}</span>
          </div>
        </div>
        <div className="flex items-center">
          <button onClick={handleSignOut} title="Sign Out" className="p-2 text-zinc-600 hover:text-[#800020] hover:bg-zinc-200/50 rounded-full transition-colors focus:outline-none flex items-center justify-center">
            <span className="material-icons text-xl select-none">exit_to_app</span>
          </button>
        </div>
      </header>

      {/* ── Workspace ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Foldable Sidebar ── */}
        <aside className="hidden md:flex w-16 hover:w-60 bg-white border-r border-zinc-200 flex-col shrink-0 transition-all duration-300 ease-in-out group z-20 overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-center group-hover:justify-between min-h-[57px] shrink-0">
            <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase hidden group-hover:block whitespace-nowrap select-none">Navigation</p>
            <span className="material-icons text-zinc-400 text-lg select-none shrink-0">menu</span>
          </div>
          <nav className="flex-1 p-3 space-y-2">
            {[
              { key: "overview", icon: "team_dashboard", label: "Overview", cls: "material-symbols-outlined" },
              { key: "schools", icon: "book", label: "Schools", cls: "material-symbols-outlined" },
              { key: "calls", icon: "forms_add_on", label: "Calls", cls: "material-symbols-outlined" },
              { key: "media", icon: "perm_media", label: "Media", cls: "material-icons" },
              { key: "settings", icon: "account_circle", label: "Profile & Settings", cls: "material-symbols-outlined" },
            ].map(({ key, icon, label, cls }) => (
              <button
                key={key}
                onClick={() => { setActiveTab(key as typeof activeTab); setError(null); setSuccess(null); if (key === "settings") setProfileView("view"); }}
                title={label}
                className={`w-full flex items-center justify-center group-hover:justify-start gap-4 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${activeTab === key ? "bg-[#002f6c]/10 text-[#002f6c]" : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"}`}
              >
                <span className={`${cls} text-lg shrink-0`}>{icon}</span>
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
        <main className="flex-1 bg-[#e8eaf6] overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="w-full space-y-4 md:space-y-6">

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
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-[#F7F6F3] rounded-lg border border-zinc-200 p-6 flex flex-row items-center justify-between shadow-sm min-h-[220px]">
                  {/* Left side: Illustration */}
                  <div className="flex-1 flex justify-center sm:justify-start">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://ik.imagekit.io/dypkhqxip/Breathing%20exercise-cuate.svg"
                      alt="Attendance Illustration"
                      className="h-44 sm:h-52 w-auto object-contain select-none"
                    />
                  </div>
                  {/* Right side: Attendance Stats */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center pr-2 sm:pr-8">
                    <span className="text-5xl sm:text-6xl font-semibold text-zinc-900 tracking-tight leading-none">
                      0%
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-zinc-500 mt-2">
                      Attendance
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-zinc-200 shadow-sm grid grid-cols-3 divide-x divide-zinc-100 text-center">
                  <div className="flex flex-col items-center justify-center px-2 py-3 sm:px-4 sm:py-4">
                    <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-zinc-900 leading-tight select-all break-all">
                      {employee.id}
                    </span>
                    <span className="text-[9px] xs:text-[10px] sm:text-xs text-zinc-500 mt-1 font-medium">
                      Employee ID
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center px-2 py-3 sm:px-4 sm:py-4">
                    <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-zinc-900 leading-tight text-center">
                      {profile?.designation || roleTitle}
                    </span>
                    <span className="text-[9px] xs:text-[10px] sm:text-xs text-zinc-500 mt-1 font-medium">
                      Role
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center px-2 py-3 sm:px-4 sm:py-4">
                    <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-emerald-600 leading-tight">
                      Active
                    </span>
                    <span className="text-[9px] xs:text-[10px] sm:text-xs text-zinc-500 mt-1 font-medium">
                      Status
                    </span>
                  </div>
                </div>

                {/* Upcoming / Session Time Table Card */}
                {isFetchingTimetable ? (
                  <div className="bg-white rounded-lg border border-zinc-200 p-6 flex items-center justify-center gap-2 shadow-sm select-none">
                    <span className="material-icons animate-spin text-lg text-[#002f6c] select-none">sync</span>
                    <span className="text-xs text-zinc-500 font-semibold">Loading schedule...</span>
                  </div>
                ) : (
                  <div 
                    onClick={() => {
                      const d = new Date();
                      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
                      const nowIST = new Date(utc + (3600000 * 5.5));
                      setSelectedDayIdx(nowIST.getDay());
                      setProfileView("schedule");
                    }}
                    className="bg-white rounded-lg border border-zinc-200 shadow-sm p-4 flex flex-row items-stretch select-none cursor-pointer hover:border-[#002f6c]/55 hover:shadow transition-all"
                  >
                    {/* Left portion: Date and Up Next info */}
                    <div className="w-24 sm:w-28 flex-none flex flex-col items-center justify-center border-r border-zinc-100 pr-4 text-center">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Up Next</span>
                      <span className="text-2xl sm:text-3xl font-black text-zinc-800 leading-none mt-1.5">
                        {upcomingSession ? upcomingSession.dayNumber : fallbackDate.dayNumber}
                      </span>
                      <span className="text-[10px] sm:text-xs font-semibold text-zinc-400 mt-1">
                        {upcomingSession ? upcomingSession.monthName : fallbackDate.monthName}
                      </span>
                    </div>

                    {/* Right portion: Class Details */}
                    <div className="flex-1 pl-4 flex flex-col justify-center">
                      <h3 className="text-sm sm:text-base font-bold text-zinc-950 leading-tight">
                        {upcomingSession ? upcomingSession.schoolName : "No Sessions"}
                      </h3>
                      <p className="text-xs text-zinc-500 font-semibold mt-1">
                        {upcomingSession ? upcomingSession.schoolName : "NA"}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {upcomingSession ? `Time: ${upcomingSession.timeLabel}` : "Room no NA"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "schools" && (
              <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-6 min-h-[250px] flex flex-col items-center justify-center text-center select-none">
                <span className="material-symbols-outlined text-4xl text-[#002f6c] mb-2 select-none">book</span>
                <h3 className="text-base font-bold text-zinc-900">Schools</h3>
                <p className="text-xs text-zinc-500 mt-1">School details and classes information will be loaded here.</p>
              </div>
            )}

            {activeTab === "calls" && (
              <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-6 min-h-[250px] flex flex-col items-center justify-center text-center select-none">
                <span className="material-symbols-outlined text-4xl text-[#002f6c] mb-2 select-none">forms_add_on</span>
                <h3 className="text-base font-bold text-zinc-900">Calls</h3>
                <p className="text-xs text-zinc-500 mt-1">Call details and call history records will be loaded here.</p>
              </div>
            )}

            {activeTab === "media" && (
              <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-6 min-h-[250px] flex flex-col items-center justify-center text-center select-none">
                <span className="material-icons text-4xl text-[#002f6c] mb-2 select-none">perm_media</span>
                <h3 className="text-base font-bold text-zinc-900">Media</h3>
                <p className="text-xs text-zinc-500 mt-1">Upload and view photos, videos, and class documents here.</p>
              </div>
            )}

            {/* ═══ TAB: Settings ═══ */}
            {activeTab === "settings" && (
              <div className="space-y-6">

                {/* ── Breadcrumb ── */}
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="material-icons text-sm text-zinc-400 select-none">manage_accounts</span>
                  {profileView === "view" ? (
                    <span className="font-semibold text-[#002f6c]">Profile & Settings</span>
                  ) : (
                    <button
                      onClick={() => { setProfileView("view"); setError(null); setSuccess(null); }}
                      className="font-medium text-zinc-400 hover:text-[#002f6c] hover:underline"
                    >
                      Profile & Settings
                    </button>
                  )}
                  {profileView !== "view" && (
                    <>
                      <span className="text-zinc-300">›</span>
                      <span className="font-semibold text-[#002f6c]">
                        {profileView === "edit" && "Edit Profile"}
                        {profileView === "id-card" && "Digital ID Badge"}
                        {profileView === "details" && "Account Details"}
                      </span>
                    </>
                  )}
                </div>

                {isLoadingProfile ? (
                  <div className="flex items-center gap-3 py-8 justify-center">
                    <span className="material-icons animate-spin text-2xl text-[#002f6c] select-none">sync</span>
                    <p className="text-sm text-zinc-500 font-medium">Loading profile...</p>
                  </div>
                ) : profileView === "view" && profile ? (
                  /* ─── SAVED PROFILE VIEW (DHONDI-STYLE LIST VIEW) ─── */
                  <div className="max-w-md mx-auto space-y-4 pb-20">
                    
                    {/* ── Profile Header Card (Banner background with circular overlap) ── */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col items-center pb-6">
                      {/* Banner Background */}
                      <div className="h-24 w-full bg-[#e8eaf6]" />
                      
                      {/* Avatar Overlap */}
                      <div className="mb-4">
                        {imagePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imagePreview}
                            alt="Profile"
                            className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-md relative -mt-14 z-10 bg-white"
                          />
                        ) : (
                          <div className="h-28 w-28 rounded-full bg-[#002f6c] border-4 border-white shadow-md flex items-center justify-center text-3xl font-black text-white select-none relative -mt-14 z-10">
                            {employee.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Centered Name and Info details */}
                      <div className="text-center px-4 space-y-1">
                        <h2 className="text-xl font-bold text-[#002f6c] tracking-tight">{employee.name}</h2>
                        <p className="text-xs font-semibold text-zinc-500">
                          Employee ID - {employee.id}
                        </p>
                        <p className="text-xs font-medium text-zinc-500">
                          {profile.designation || roleTitle}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1 max-w-[280px] mx-auto truncate" title={profile.assignedSchool || "Telangana Institution"}>
                          {profile.assignedSchool || "Telangana Institution"}
                        </p>
                      </div>
                    </div>

                    {/* ── Navigation List Card ── */}
                    <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden divide-y divide-zinc-100">
                      {[
                        {
                          title: "Profile",
                          desc: "General, Contact, Qualifications, Details.",
                          icon: "account_circle",
                          onClick: () => { setProfileView("edit"); setError(null); setSuccess(null); }
                        },
                        {
                          title: "Digital ID Badge",
                          desc: "View your digital identity card.",
                          icon: "badge",
                          onClick: () => { setProfileView("id-card"); setError(null); setSuccess(null); }
                        },
                        {
                          title: "Account Details",
                          desc: "View full registry details.",
                          icon: "info",
                          onClick: () => { setProfileView("details"); setError(null); setSuccess(null); }
                        },
                        {
                          title: "My Permissions",
                          desc: "Permission related Details.",
                          icon: "gpp_maybe",
                          onClick: () => {
                            setSuccess("Permissions requested successfully.");
                          }
                        },
                        {
                          title: "Chat Support",
                          desc: "General and payment related issues.",
                          icon: "chat",
                          onClick: () => {
                            setSuccess("Support chat requested. Administrator will contact you shortly.");
                          }
                        },
                        {
                          title: "Terms and Conditions",
                          desc: "Terms and Conditions, Privacy Policy and Refunds.",
                          icon: "description",
                          onClick: () => {
                            setSuccess("Viewing Terms and Conditions policy documents.");
                          }
                        },
                        {
                          title: "Logout",
                          desc: "Sign off from your account.",
                          icon: "logout",
                          onClick: () => { handleSignOut(); }
                        }
                      ].map((item, index) => (
                        <button
                          key={index}
                          onClick={item.onClick}
                          className="w-full text-left p-4 hover:bg-[#e8eaf6]/30 transition-colors flex items-start gap-4"
                        >
                          <span className="material-icons text-[#002f6c] text-2xl shrink-0 mt-0.5 select-none">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 leading-tight">{item.title}</p>
                            <p className="text-xs text-zinc-500 mt-1 leading-normal">{item.desc}</p>
                          </div>
                          <span className="material-icons text-zinc-300 select-none shrink-0 self-center">chevron_right</span>
                        </button>
                      ))}
                    </div>

                  </div>
                ) : profileView === "id-card" ? (
                  /* ─── DIGITAL ID BADGE VIEW ─── */
                  <div className="max-w-md mx-auto space-y-4 pb-20">
                    <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                      <h2 className="text-sm font-bold text-zinc-800 mb-1">Digital Identity Badge</h2>
                      <p className="text-xs text-zinc-500 mb-6">Your official HSGA Telangana employee verification card.</p>
                      
                      <div className="flex justify-center">
                        <div className="w-full max-w-md">
                          <div className="w-full aspect-[1.586/1] bg-white border border-zinc-300 rounded-lg shadow-md overflow-hidden flex flex-col font-sans relative">
                            {/* Header: Government Navy Blue Band */}
                            <div className="bg-[#002f6c] px-4 py-2.5 flex items-center gap-3 border-b border-zinc-200/50">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src="https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png" 
                                alt="Logo" 
                                className="h-10 w-auto object-contain bg-white p-0.5 rounded-full" 
                              />
                              <div className="leading-none text-left">
                                <span className="font-extrabold text-[11px] tracking-wide uppercase text-white block">Hindustan Scouts & Guides</span>
                                <span className="font-bold text-amber-400 text-[8px] tracking-widest uppercase block mt-0.5">Telangana State Association</span>
                              </div>
                            </div>

                            {/* Body: Left side photo/barcode, Right side details */}
                            <div className="flex-1 p-4 flex gap-5 bg-white items-center relative overflow-hidden">
                              {/* Indian Flag Subtle Watermark Mask */}
                              <div className="absolute inset-0 flex flex-col pointer-events-none opacity-[0.06] select-none">
                                <div className="flex-1 bg-[#FF9933]"></div>
                                <div className="flex-1 bg-[#FFFFFF] flex items-center justify-center">
                                  <svg className="h-10 w-10 text-[#000080]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                                    {[...Array(24)].map((_, i) => (
                                      <line
                                        key={i}
                                        x1="12"
                                        y1="12"
                                        x2={12 + 10 * Math.cos(i * 15 * 0.017453292519943295)}
                                        y2={12 + 10 * Math.sin(i * 15 * 0.017453292519943295)}
                                        stroke="currentColor"
                                        strokeWidth="0.5"
                                      />
                                    ))}
                                  </svg>
                                </div>
                                <div className="flex-1 bg-[#138808]"></div>
                              </div>

                              {/* Left Column: Photo & Barcode */}
                              <div className="flex flex-col items-center justify-center shrink-0 w-24 gap-2 relative z-10">
                                <div className="h-24 w-20 bg-zinc-50 border border-zinc-300 rounded overflow-hidden relative shadow-inner flex items-center justify-center">
                                  {imagePreview ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={imagePreview} alt="Photo" className="h-full w-full object-cover" />
                                  ) : (
                                    <span className="material-icons text-5xl text-zinc-300 select-none">account_circle</span>
                                  )}
                                </div>
                                
                                {/* Barcode representation */}
                                <div className="flex flex-col items-center gap-0.5">
                                  <div className="flex items-center gap-0.5 h-3.5 select-none">
                                    {[1, 2, 1, 3, 1, 2, 4, 1, 2].map((w, i) => (
                                      <div key={i} style={{ width: `${w}px` }} className="h-full bg-zinc-950"></div>
                                    ))}
                                  </div>
                                  <span className="text-[7px] font-mono font-bold text-zinc-900 tracking-wider leading-none">{employee.id}</span>
                                </div>
                              </div>

                              {/* Right Column: Dynamic Profile Details */}
                              <div className="flex-1 flex flex-col justify-center gap-1.5 text-left text-zinc-800 relative z-10">
                                <div>
                                  <span className="text-[7.5px] uppercase font-bold text-zinc-400 tracking-wider block leading-none">Employee Name</span>
                                  <span className="font-extrabold text-sm text-zinc-900 block mt-0.5 uppercase tracking-wide">{employee.name}</span>
                                </div>
                                
                                <div>
                                  <span className="text-[7.5px] uppercase font-bold text-zinc-400 tracking-wider block leading-none">Designation</span>
                                  <span className="font-bold text-[11px] text-zinc-700 block mt-0.5">{profile?.designation || roleTitle}</span>
                                </div>

                                <div>
                                  <span className="text-[7.5px] uppercase font-bold text-zinc-400 tracking-wider block leading-none">Email Address</span>
                                  <span className="font-medium text-[10px] text-zinc-600 block mt-0.5 break-all">{employee.email}</span>
                                </div>

                                {profile?.phone && (
                                  <div>
                                    <span className="text-[7.5px] uppercase font-bold text-zinc-400 tracking-wider block leading-none">Contact No</span>
                                    <span className="font-medium text-[10px] text-zinc-600 block mt-0.5">{profile.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Footer Strip */}
                            <div className="bg-zinc-100 border-t border-zinc-200 py-1.5 px-4 flex justify-between items-center text-[8px] uppercase tracking-wider font-bold text-zinc-500">
                              <span>Telangana State Association</span>
                              <span className="text-[#002f6c] font-black">Official ID Card</span>
                            </div>
                          </div>

                          <p className="text-center text-[10px] text-zinc-400 mt-3 leading-relaxed">Scan this badge at any HSGA Telangana facility to verify your status.</p>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-center">
                        <button
                          onClick={() => setProfileView("view")}
                          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold rounded-md text-xs transition-colors flex items-center gap-1"
                        >
                          <span className="material-icons text-xs select-none">arrow_back</span>
                          Back to Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ) : profileView === "details" ? (
                  /* ─── ACCOUNT DETAILS VIEW ─── */
                  <div className="max-w-md mx-auto space-y-4 pb-20">
                    <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                      <h2 className="text-sm font-bold text-zinc-800 mb-3 pb-2 border-b border-zinc-100">Account Details</h2>
                      <div className="space-y-3">
                        {[
                          { label: "Full Name", value: employee.name },
                          { label: "Employee ID", value: employee.id, mono: true },
                          { label: "Email Address", value: employee.email },
                          { label: "Gender", value: genderLabel },
                          { label: "District", value: profile?.district || "—" },
                          { label: "Phone", value: profile?.phone || "—" },
                          { label: "Address", value: profile?.address || "—" },
                        ].map(({ label, value, mono }) => (
                          <div key={label} className="py-2 flex flex-col border-b border-zinc-100 last:border-0 text-left">
                            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">{label}</span>
                            <span className={`text-xs font-semibold text-zinc-800 mt-0.5 ${mono ? "font-mono select-all" : ""}`}>{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 flex justify-center">
                        <button
                          onClick={() => setProfileView("view")}
                          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold rounded-md text-xs transition-colors flex items-center gap-1"
                        >
                          <span className="material-icons text-xs select-none">arrow_back</span>
                          Back to Profile
                        </button>
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
      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#F7F6F3] border-t border-zinc-200 flex items-center justify-around z-30 shadow-lg px-2">
        {[
          { key: "overview", icon: "team_dashboard", label: "Overview", cls: "material-symbols-outlined" },
          { key: "schools", icon: "book", label: "Schools", cls: "material-symbols-outlined" },
          { key: "calls", icon: "forms_add_on", label: "Calls", cls: "material-symbols-outlined" },
          { key: "media", icon: "perm_media", label: "Media", cls: "material-icons" },
          { key: "settings", icon: "account_circle", label: "Settings", cls: "material-symbols-outlined" },
        ].map(({ key, icon, label, cls }) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key as typeof activeTab);
              setError(null);
              setSuccess(null);
              if (key === "settings") setProfileView("view");
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
              activeTab === key
                ? "text-[#002f6c]"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <span className={`${cls} text-xl select-none`}>{icon}</span>
            <span className="text-[10px] font-bold mt-0.5">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
