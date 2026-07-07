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

  // Schools count and detail state for Schools tab
  const [schoolsCount, setSchoolsCount] = useState<number>(0);
  const [isFetchingSchoolsCount, setIsFetchingSchoolsCount] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);

  // Sub-modules state in Schools Tab
  const [activeSchoolModule, setActiveSchoolModule] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Local storage lists
  const [visitsList, setVisitsList] = useState<any[]>([]);
  const [registersList, setRegistersList] = useState<any[]>([]);
  const [enrolmentsList, setEnrolmentsList] = useState<any[]>([]);
  const [distributionsList, setDistributionsList] = useState<any[]>([]);
  const [registeredSchools, setRegisteredSchools] = useState<any[]>([]);

  // Form field states for School Visits
  const [visitSchoolName, setVisitSchoolName] = useState("");
  const [visitDistrict, setVisitDistrict] = useState("");
  const [visitDemo, setVisitDemo] = useState(false);
  const [visitVisited, setVisitVisited] = useState(false);
  const [visitPrincipal, setVisitPrincipal] = useState("");
  const [visitPhone, setVisitPhone] = useState("");
  const [visitAddress, setVisitAddress] = useState("");

  // Form field states for Daily Registers
  const [regSchoolName, setRegSchoolName] = useState("");
  const [regDate, setRegDate] = useState("");
  const [regTopic, setRegTopic] = useState("");
  const [regAttendance, setRegAttendance] = useState("");

  // Form field states for Student Enrolment
  const [studName, setStudName] = useState("");
  const [studAge, setStudAge] = useState("");
  const [studSchool, setStudSchool] = useState("");
  const [studId, setStudId] = useState("");

  // Form field states for Uniform Distribution
  const [distSchool, setDistSchool] = useState("");
  const [distType, setDistType] = useState<"bulk" | "individual">("bulk");
  const [bulkMaleCount, setBulkMaleCount] = useState("");
  const [bulkFemaleCount, setBulkFemaleCount] = useState("");
  const [bulkAmount, setBulkAmount] = useState("");
  const [indStudentName, setIndStudentName] = useState("");
  const [indClass, setIndClass] = useState("");
  const [indGender, setIndGender] = useState("Male");
  const [indAmount, setIndAmount] = useState("");

  // Sub-modules state in Calls Tab
  const [activeCallModule, setActiveCallModule] = useState<string | null>(null);
  const [showCallAddForm, setShowCallAddForm] = useState(false);

  // Local storage lists for Calls
  const [mouList, setMouList] = useState<any[]>([]);
  const [officeCallsList, setOfficeCallsList] = useState<any[]>([]);
  const [homeCallsList, setHomeCallsList] = useState<any[]>([]);
  const [prList, setPrList] = useState<any[]>([]);

  // Form field states for MoU
  const [mouSchool, setMouSchool] = useState("");
  const [mouPrincipal, setMouPrincipal] = useState("");
  const [mouDateInit, setMouDateInit] = useState("");
  const [mouStrength, setMouStrength] = useState("");
  const [mouStatus, setMouStatus] = useState("Pending");
  const [mouSignedDate, setMouSignedDate] = useState("");
  const [mouFollowUp, setMouFollowUp] = useState("");
  const [mouStaff, setMouStaff] = useState("");

  // Form field states for Office Calls
  const [ocDate, setOcDate] = useState("");
  const [ocSchool, setOcSchool] = useState("");
  const [ocPrincipal, setOcPrincipal] = useState("");
  const [ocPhone, setOcPhone] = useState("");
  const [ocPurpose, setOcPurpose] = useState("");
  const [ocResponse, setOcResponse] = useState("");
  const [ocMeetingFixed, setOcMeetingFixed] = useState(false);
  const [ocFollowUpReq, setOcFollowUpReq] = useState(false);

  // Form field states for Home Calls
  const [hcDate, setHcDate] = useState("");
  const [hcSchool, setHcSchool] = useState("");
  const [hcPersonContacted, setHcPersonContacted] = useState("");
  const [hcPurpose, setHcPurpose] = useState("");
  const [hcResponse, setHcResponse] = useState("");
  const [hcFollowUp, setHcFollowUp] = useState(false);
  const [hcStaff, setHcStaff] = useState("");

  // Form field states for Public Relations
  const [prDate, setPrDate] = useState("");
  const [prPersonBodyMet, setPrPersonBodyMet] = useState("");
  const [prCategory, setPrCategory] = useState("Government");
  const [prPurpose, setPrPurpose] = useState("");
  const [prOutcome, setPrOutcome] = useState("");
  const [prStaff, setPrStaff] = useState("");

  // Sub-modules state in Media Tab
  const [activeMediaModule, setActiveMediaModule] = useState<string | null>(null);
  const [showMediaAddForm, setShowMediaAddForm] = useState(false);

  // Lists for Media
  const [socialList, setSocialList] = useState<any[]>([]);
  const [videosList, setVideosList] = useState<any[]>([]);
  const [financeList, setFinanceList] = useState<any[]>([]);
  const [problemsList, setProblemsList] = useState<any[]>([]);
  const [documentsList, setDocumentsList] = useState<any[]>([]);

  // Form field states for Social Media
  const [smDate, setSmDate] = useState("");
  const [smPlatform, setSmPlatform] = useState("Facebook");
  const [smTitle, setSmTitle] = useState("");
  const [smReach, setSmReach] = useState("");
  const [smLikes, setSmLikes] = useState("");
  const [smLink, setSmLink] = useState("");

  // Form field states for Student Videos
  const [svDate, setSvDate] = useState("");
  const [svSchool, setSvSchool] = useState("");
  const [svTitle, setSvTitle] = useState("");
  const [svPlatform, setSvPlatform] = useState("YouTube");
  const [svViews, setSvViews] = useState("");
  const [svLikes, setSvLikes] = useState("");
  const [svLink, setSvLink] = useState("");

  // Form field states for Financial Register
  const [finDate, setFinDate] = useState("");
  const [finHead, setFinHead] = useState("");
  const [finType, setFinType] = useState("Income");
  const [finAmount, setFinAmount] = useState("");
  const [finBillUploaded, setFinBillUploaded] = useState(""); // Holds file name or mock file URL
  const [finRemarks, setFinRemarks] = useState("");

  // Form field states for Problem Register
  const [probDate, setProbDate] = useState("");
  const [probCategory, setProbCategory] = useState("Infrastructure");
  const [probDescription, setProbDescription] = useState("");
  const [probSupportRequired, setProbSupportRequired] = useState("Yes");
  const [probStatus, setProbStatus] = useState("Open");
  const [probRaisedBy, setProbRaisedBy] = useState("");

  // Form field states for Documents
  const [docDate, setDocDate] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState("Syllabus");
  const [docLink, setDocLink] = useState("");
  const [docUploadedBy, setDocUploadedBy] = useState("");

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

  // Load local registers from localStorage and fetch registered schools
  useEffect(() => {
    if (employee) {
      const email = employee.email;

      // Optimistic offline-first load
      setVisitsList(JSON.parse(localStorage.getItem(`visits_${email}`) || "[]"));
      setRegistersList(JSON.parse(localStorage.getItem(`registers_${email}`) || "[]"));
      setEnrolmentsList(JSON.parse(localStorage.getItem(`enrolments_${email}`) || "[]"));
      setDistributionsList(JSON.parse(localStorage.getItem(`distributions_${email}`) || "[]"));
      setMouList(JSON.parse(localStorage.getItem(`mou_${email}`) || "[]"));
      setOfficeCallsList(JSON.parse(localStorage.getItem(`officecalls_${email}`) || "[]"));
      setHomeCallsList(JSON.parse(localStorage.getItem(`homecalls_${email}`) || "[]"));
      setPrList(JSON.parse(localStorage.getItem(`pr_${email}`) || "[]"));
      setSocialList(JSON.parse(localStorage.getItem(`social_${email}`) || "[]"));
      setVideosList(JSON.parse(localStorage.getItem(`videos_${email}`) || "[]"));
      setFinanceList(JSON.parse(localStorage.getItem(`finance_${email}`) || "[]"));
      setProblemsList(JSON.parse(localStorage.getItem(`problems_${email}`) || "[]"));
      setDocumentsList(JSON.parse(localStorage.getItem(`documents_${email}`) || "[]"));

      // Sync online updates
      const fetchModuleData = async (moduleName: string, setter: any, localKey: string) => {
        try {
          const res = await fetch(`/api/employee/data/${moduleName}?email=${encodeURIComponent(email)}`);
          if (res.ok) {
            const data = await res.json();
            setter(data);
            localStorage.setItem(localKey, JSON.stringify(data));
          }
        } catch (err) {
          console.error(`Failed to fetch ${moduleName} online:`, err);
        }
      };

      fetchModuleData("visits", setVisitsList, `visits_${email}`);
      fetchModuleData("registers", setRegistersList, `registers_${email}`);
      fetchModuleData("enrolments", setEnrolmentsList, `enrolments_${email}`);
      fetchModuleData("distributions", setDistributionsList, `distributions_${email}`);
      fetchModuleData("mou", setMouList, `mou_${email}`);
      fetchModuleData("officecalls", setOfficeCallsList, `officecalls_${email}`);
      fetchModuleData("homecalls", setHomeCallsList, `homecalls_${email}`);
      fetchModuleData("pr", setPrList, `pr_${email}`);
      fetchModuleData("social", setSocialList, `social_${email}`);
      fetchModuleData("videos", setVideosList, `videos_${email}`);
      fetchModuleData("finance", setFinanceList, `finance_${email}`);
      fetchModuleData("problems", setProblemsList, `problems_${email}`);
      fetchModuleData("documents", setDocumentsList, `documents_${email}`);

      const loadAllSchools = async () => {
        try {
          const res = await fetch("/api/admin/schools");
          if (res.ok) {
            const data = await res.json();
            setRegisteredSchools(data);
          }
        } catch (err) {
          console.error("Error loading schools list:", err);
        }
      };
      loadAllSchools();
    }
  }, [employee]);

  // Load enrolled schools count automatically when schools tab opens
  useEffect(() => {
    if (employee && activeTab === "schools") {
      const loadSchoolsCount = async () => {
        setIsFetchingSchoolsCount(true);
        try {
          const res = await fetch("/api/admin/schools");
          if (res.ok) {
            const data = await res.json();
            setSchoolsCount(data.length);
          }
        } catch (err) {
          console.error("Error loading schools list count:", err);
        } finally {
          setIsFetchingSchoolsCount(false);
        }
      };
      loadSchoolsCount();
    }
  }, [employee, activeTab]);

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

  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitSchoolName || !employee) return;
    try {
      const res = await fetch("/api/employee/data/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: employee.email,
          schoolName: visitSchoolName,
          district: visitDistrict,
          demonstration: visitDemo,
          visited: visitVisited,
          principalName: visitPrincipal,
          phone: visitPhone,
          address: visitAddress,
        }),
      });
      if (res.ok) {
        const record = await res.json();
        const updated = [record, ...visitsList];
        setVisitsList(updated);
        localStorage.setItem(`visits_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
    // Reset form fields
    setVisitSchoolName("");
    setVisitDistrict("");
    setVisitDemo(false);
    setVisitVisited(false);
    setVisitPrincipal("");
    setVisitPhone("");
    setVisitAddress("");
    setShowAddForm(false);
  };

  const handleDeleteVisit = async (id: string) => {
    if (!employee) return;
    try {
      const res = await fetch(`/api/employee/data/visits?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = visitsList.filter(item => item.id !== id);
        setVisitsList(updated);
        localStorage.setItem(`visits_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regSchoolName || !employee) return;
    try {
      const res = await fetch("/api/employee/data/registers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: employee.email,
          schoolName: regSchoolName,
          date: regDate || new Date().toISOString().split("T")[0],
          topicCovered: regTopic,
          attendanceCount: parseInt(regAttendance, 10) || 0,
        }),
      });
      if (res.ok) {
        const record = await res.json();
        const updated = [record, ...registersList];
        setRegistersList(updated);
        localStorage.setItem(`registers_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
    // Reset form fields
    setRegSchoolName("");
    setRegDate("");
    setRegTopic("");
    setRegAttendance("");
    setShowAddForm(false);
  };

  const handleDeleteRegister = async (id: string) => {
    if (!employee) return;
    try {
      const res = await fetch(`/api/employee/data/registers?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = registersList.filter(item => item.id !== id);
        setRegistersList(updated);
        localStorage.setItem(`registers_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studName || !studSchool || !employee) return;
    try {
      const res = await fetch("/api/employee/data/enrolments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: employee.email,
          studentName: studName,
          age: parseInt(studAge, 10) || 0,
          schoolName: studSchool,
          validId: studId,
        }),
      });
      if (res.ok) {
        const record = await res.json();
        const updated = [record, ...enrolmentsList];
        setEnrolmentsList(updated);
        localStorage.setItem(`enrolments_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
    // Reset form fields
    setStudName("");
    setStudAge("");
    setStudSchool("");
    setStudId("");
    setShowAddForm(false);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!employee) return;
    try {
      const res = await fetch(`/api/employee/data/enrolments?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = enrolmentsList.filter(item => item.id !== id);
        setEnrolmentsList(updated);
        localStorage.setItem(`enrolments_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDistribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distSchool || !employee) return;
    
    const body: any = {
      employeeEmail: employee.email,
      schoolName: distSchool,
      distributionType: distType,
    };
    
    if (distType === "bulk") {
      body.maleCount = parseInt(bulkMaleCount, 10) || 0;
      body.femaleCount = parseInt(bulkFemaleCount, 10) || 0;
      body.amount = parseFloat(bulkAmount) || 0;
    } else {
      body.studentName = indStudentName;
      body.class = indClass;
      body.gender = indGender;
      body.amount = parseFloat(indAmount) || 0;
    }

    try {
      const res = await fetch("/api/employee/data/distributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const record = await res.json();
        const updated = [record, ...distributionsList];
        setDistributionsList(updated);
        localStorage.setItem(`distributions_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }

    // Reset fields
    setBulkMaleCount("");
    setBulkFemaleCount("");
    setBulkAmount("");
    setIndStudentName("");
    setIndClass("");
    setIndGender("Male");
    setIndAmount("");
    setShowAddForm(false);
  };

  const handleDeleteDistribution = async (id: string) => {
    if (!employee) return;
    try {
      const res = await fetch(`/api/employee/data/distributions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = distributionsList.filter(item => item.id !== id);
        setDistributionsList(updated);
        localStorage.setItem(`distributions_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMou = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mouSchool || !employee) return;
    try {
      const res = await fetch("/api/employee/data/mou", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: employee.email,
          school: mouSchool,
          principal: mouPrincipal,
          dateInitiated: mouDateInit || new Date().toISOString().split("T")[0],
          studentStrength: parseInt(mouStrength, 10) || 0,
          status: mouStatus,
          signedDate: mouSignedDate || "",
          nextFollowUp: mouFollowUp || "",
          staff: mouStaff || employee.name || "",
        }),
      });
      if (res.ok) {
        const record = await res.json();
        const updated = [record, ...mouList];
        setMouList(updated);
        localStorage.setItem(`mou_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
    // Reset form fields
    setMouSchool("");
    setMouPrincipal("");
    setMouDateInit("");
    setMouStrength("");
    setMouStatus("Pending");
    setMouSignedDate("");
    setMouFollowUp("");
    setMouStaff("");
    setShowCallAddForm(false);
  };

  const handleDeleteMou = async (id: string) => {
    if (!employee) return;
    try {
      const res = await fetch(`/api/employee/data/mou?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = mouList.filter(item => item.id !== id);
        setMouList(updated);
        localStorage.setItem(`mou_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddOfficeCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ocSchool || !employee) return;
    try {
      const res = await fetch("/api/employee/data/officecalls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: employee.email,
          date: ocDate || new Date().toISOString().split("T")[0],
          school: ocSchool,
          principal: ocPrincipal,
          phone: ocPhone,
          purpose: ocPurpose,
          response: ocResponse,
          meetingFixed: ocMeetingFixed,
          followUpReq: ocFollowUpReq,
        }),
      });
      if (res.ok) {
        const record = await res.json();
        const updated = [record, ...officeCallsList];
        setOfficeCallsList(updated);
        localStorage.setItem(`officecalls_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
    // Reset form fields
    setOcDate("");
    setOcSchool("");
    setOcPrincipal("");
    setOcPhone("");
    setOcPurpose("");
    setOcResponse("");
    setOcMeetingFixed(false);
    setOcFollowUpReq(false);
    setShowCallAddForm(false);
  };

  const handleDeleteOfficeCall = async (id: string) => {
    if (!employee) return;
    try {
      const res = await fetch(`/api/employee/data/officecalls?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = officeCallsList.filter(item => item.id !== id);
        setOfficeCallsList(updated);
        localStorage.setItem(`officecalls_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddHomeCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hcSchool || !employee) return;
    try {
      const res = await fetch("/api/employee/data/homecalls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: employee.email,
          date: hcDate || new Date().toISOString().split("T")[0],
          school: hcSchool,
          personContacted: hcPersonContacted,
          purpose: hcPurpose,
          response: hcResponse,
          followUp: hcFollowUp,
          staff: hcStaff || employee.name || "",
        }),
      });
      if (res.ok) {
        const record = await res.json();
        const updated = [record, ...homeCallsList];
        setHomeCallsList(updated);
        localStorage.setItem(`homecalls_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
    // Reset form fields
    setHcDate("");
    setHcSchool("");
    setHcPersonContacted("");
    setHcPurpose("");
    setHcResponse("");
    setHcFollowUp(false);
    setHcStaff("");
    setShowCallAddForm(false);
  };

  const handleDeleteHomeCall = async (id: string) => {
    if (!employee) return;
    try {
      const res = await fetch(`/api/employee/data/homecalls?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = homeCallsList.filter(item => item.id !== id);
        setHomeCallsList(updated);
        localStorage.setItem(`homecalls_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prPersonBodyMet || !employee) return;
    try {
      const res = await fetch("/api/employee/data/pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: employee.email,
          date: prDate || new Date().toISOString().split("T")[0],
          personBodyMet: prPersonBodyMet,
          category: prCategory,
          purpose: prPurpose,
          outcome: prOutcome,
          staff: prStaff || employee.name || "",
        }),
      });
      if (res.ok) {
        const record = await res.json();
        const updated = [record, ...prList];
        setPrList(updated);
        localStorage.setItem(`pr_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
    // Reset form fields
    setPrDate("");
    setPrPersonBodyMet("");
    setPrCategory("Government");
    setPrPurpose("");
    setPrOutcome("");
    setPrStaff("");
    setShowCallAddForm(false);
  };

  const handleDeletePr = async (id: string) => {
    if (!employee) return;
    try {
      const res = await fetch(`/api/employee/data/pr?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = prList.filter(item => item.id !== id);
        setPrList(updated);
        localStorage.setItem(`pr_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    const body = {
      employeeEmail: employee.email,
      date: smDate,
      platform: smPlatform,
      postTitle: smTitle,
      reach: smReach,
      likes: smLikes,
      link: smLink,
    };
    try {
      const res = await fetch("/api/employee/data/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const newRecord = await res.json();
        const updated = [newRecord, ...socialList];
        setSocialList(updated);
        localStorage.setItem(`social_${employee.email}`, JSON.stringify(updated));
      } else {
        const mockRecord = { id: Date.now().toString(), ...body, createdAt: new Date().toISOString() };
        const updated = [mockRecord, ...socialList];
        setSocialList(updated);
        localStorage.setItem(`social_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      const mockRecord = { id: Date.now().toString(), ...body, createdAt: new Date().toISOString() };
      const updated = [mockRecord, ...socialList];
      setSocialList(updated);
      localStorage.setItem(`social_${employee.email}`, JSON.stringify(updated));
    }
    setSmDate("");
    setSmPlatform("Facebook");
    setSmTitle("");
    setSmReach("");
    setSmLikes("");
    setSmLink("");
    setShowMediaAddForm(false);
  };

  const handleDeleteSocial = async (id: string) => {
    if (!employee) return;
    try {
      const res = await fetch(`/api/employee/data/social?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = socialList.filter(item => item.id !== id);
        setSocialList(updated);
        localStorage.setItem(`social_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    const body = {
      employeeEmail: employee.email,
      date: svDate,
      school: svSchool,
      title: svTitle,
      platform: svPlatform,
      views: svViews,
      likes: svLikes,
      link: svLink,
    };
    try {
      const res = await fetch("/api/employee/data/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const newRecord = await res.json();
        const updated = [newRecord, ...videosList];
        setVideosList(updated);
        localStorage.setItem(`videos_${employee.email}`, JSON.stringify(updated));
      } else {
        const mockRecord = { id: Date.now().toString(), ...body, createdAt: new Date().toISOString() };
        const updated = [mockRecord, ...videosList];
        setVideosList(updated);
        localStorage.setItem(`videos_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      const mockRecord = { id: Date.now().toString(), ...body, createdAt: new Date().toISOString() };
      const updated = [mockRecord, ...videosList];
      setVideosList(updated);
      localStorage.setItem(`videos_${employee.email}`, JSON.stringify(updated));
    }
    setSvDate("");
    setSvSchool("");
    setSvTitle("");
    setSvPlatform("YouTube");
    setSvViews("");
    setSvLikes("");
    setSvLink("");
    setShowMediaAddForm(false);
  };

  const handleDeleteVideo = async (id: string) => {
    if (!employee) return;
    try {
      const res = await fetch(`/api/employee/data/videos?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = videosList.filter(item => item.id !== id);
        setVideosList(updated);
        localStorage.setItem(`videos_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFinance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    const body = {
      employeeEmail: employee.email,
      date: finDate,
      head: finHead,
      type: finType,
      amount: finAmount,
      billUrl: finBillUploaded || "N/A",
      remarks: finRemarks,
    };
    try {
      const res = await fetch("/api/employee/data/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const newRecord = await res.json();
        const updated = [newRecord, ...financeList];
        setFinanceList(updated);
        localStorage.setItem(`finance_${employee.email}`, JSON.stringify(updated));
      } else {
        const mockRecord = { id: Date.now().toString(), ...body, createdAt: new Date().toISOString() };
        const updated = [mockRecord, ...financeList];
        setFinanceList(updated);
        localStorage.setItem(`finance_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      const mockRecord = { id: Date.now().toString(), ...body, createdAt: new Date().toISOString() };
      const updated = [mockRecord, ...financeList];
      setFinanceList(updated);
      localStorage.setItem(`finance_${employee.email}`, JSON.stringify(updated));
    }
    setFinDate("");
    setFinHead("");
    setFinType("Income");
    setFinAmount("");
    setFinBillUploaded("");
    setFinRemarks("");
    setShowMediaAddForm(false);
  };

  const handleDeleteFinance = async (id: string) => {
    if (!employee) return;
    try {
      const res = await fetch(`/api/employee/data/finance?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = financeList.filter(item => item.id !== id);
        setFinanceList(updated);
        localStorage.setItem(`finance_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    const body = {
      employeeEmail: employee.email,
      date: probDate,
      category: probCategory,
      description: probDescription,
      supportRequired: probSupportRequired,
      status: probStatus,
      raisedBy: probRaisedBy,
    };
    try {
      const res = await fetch("/api/employee/data/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const newRecord = await res.json();
        const updated = [newRecord, ...problemsList];
        setProblemsList(updated);
        localStorage.setItem(`problems_${employee.email}`, JSON.stringify(updated));
      } else {
        const mockRecord = { id: Date.now().toString(), ...body, createdAt: new Date().toISOString() };
        const updated = [mockRecord, ...problemsList];
        setProblemsList(updated);
        localStorage.setItem(`problems_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      const mockRecord = { id: Date.now().toString(), ...body, createdAt: new Date().toISOString() };
      const updated = [mockRecord, ...problemsList];
      setProblemsList(updated);
      localStorage.setItem(`problems_${employee.email}`, JSON.stringify(updated));
    }
    setProbDate("");
    setProbCategory("Infrastructure");
    setProbDescription("");
    setProbSupportRequired("Yes");
    setProbStatus("Open");
    setProbRaisedBy("");
    setShowMediaAddForm(false);
  };

  const handleDeleteProblem = async (id: string) => {
    if (!employee) return;
    try {
      const res = await fetch(`/api/employee/data/problems?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = problemsList.filter(item => item.id !== id);
        setProblemsList(updated);
        localStorage.setItem(`problems_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    const body = {
      employeeEmail: employee.email,
      date: docDate,
      title: docTitle,
      category: docCategory,
      link: docLink || "N/A",
      uploadedBy: docUploadedBy,
    };
    try {
      const res = await fetch("/api/employee/data/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const newRecord = await res.json();
        const updated = [newRecord, ...documentsList];
        setDocumentsList(updated);
        localStorage.setItem(`documents_${employee.email}`, JSON.stringify(updated));
      } else {
        const mockRecord = { id: Date.now().toString(), ...body, createdAt: new Date().toISOString() };
        const updated = [mockRecord, ...documentsList];
        setDocumentsList(updated);
        localStorage.setItem(`documents_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      const mockRecord = { id: Date.now().toString(), ...body, createdAt: new Date().toISOString() };
      const updated = [mockRecord, ...documentsList];
      setDocumentsList(updated);
      localStorage.setItem(`documents_${employee.email}`, JSON.stringify(updated));
    }
    setDocDate("");
    setDocTitle("");
    setDocCategory("Syllabus");
    setDocLink("");
    setDocUploadedBy("");
    setShowMediaAddForm(false);
  };

  const handleDeleteDocument = async (id: string) => {
    if (!employee) return;
    try {
      const res = await fetch(`/api/employee/data/documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = documentsList.filter(item => item.id !== id);
        setDocumentsList(updated);
        localStorage.setItem(`documents_${employee.email}`, JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8eaf6]">
        <div className="flex flex-col items-center gap-4">
          <style>{`
            @keyframes lineProgress {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(0%); }
              100% { transform: translateX(100%); }
            }
            .animate-line-loader {
              animation: lineProgress 1.4s infinite ease-in-out;
            }
          `}</style>
          <div className="w-40 h-1 bg-zinc-300 rounded-full overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#002f6c] rounded-full animate-line-loader" />
          </div>
          <p className="text-xs font-bold text-[#002f6c] tracking-wide select-none">Loading portal...</p>
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
                <div className="bg-white rounded-lg border border-zinc-200 shadow-sm grid grid-cols-2 divide-x divide-zinc-100 text-center">
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

                {/* Quick Access 4-Box Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2">
                  {/* Card 1: Applications */}
                  <div 
                    onClick={() => {
                      setActiveTab("calls");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="bg-white rounded-lg border border-zinc-200 shadow-sm p-3 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer select-none hover:border-[#002f6c]/55 hover:shadow transition-all group min-h-[120px] sm:min-h-[135px]"
                  >
                    <div className="flex-1 flex items-center justify-center w-full mb-2 group-hover:scale-105 transition-transform duration-200">
                      <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="60" cy="70" r="8" fill="#3F3D56"/>
                        <path d="M60 78c-8 0-14 6-14 14v18h28V92c0-8-6-14-14-14z" fill="#3F3D56"/>
                        <path d="M54 110h12v15H54z" fill="#3F3D56"/>
                        <rect x="90" y="30" width="80" height="60" rx="4" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2"/>
                        <rect x="95" y="35" width="70" height="5" rx="1" fill="#E6E6E6"/>
                        <circle cx="102" cy="55" r="10" fill="#E6E6E6"/>
                        <path d="M102 55 L102 45 A10 10 0 0 1 112 55 Z" fill="#002f6c"/>
                        <rect x="120" y="50" width="8" height="25" rx="1" fill="#800020"/>
                        <rect x="132" y="45" width="8" height="30" rx="1" fill="#002f6c"/>
                        <rect x="144" y="58" width="8" height="17" rx="1" fill="#3F3D56"/>
                        <path d="M52 125h6v3h-6zM62 125h6v3h-6z" fill="#3F3D56"/>
                      </svg>
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-zinc-800 group-hover:text-[#002f6c] transition-colors">
                      Applications
                    </span>
                  </div>

                  {/* Card 2: Daily Schedule */}
                  <div 
                    onClick={() => {
                      const d = new Date();
                      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
                      const nowIST = new Date(utc + (3600000 * 5.5));
                      setSelectedDayIdx(nowIST.getDay());
                      setProfileView("schedule");
                    }}
                    className="bg-white rounded-lg border border-zinc-200 shadow-sm p-3 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer select-none hover:border-[#002f6c]/55 hover:shadow transition-all group min-h-[120px] sm:min-h-[135px]"
                  >
                    <div className="flex-1 flex items-center justify-center w-full mb-2 group-hover:scale-105 transition-transform duration-200">
                      <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="40" y="30" width="80" height="60" rx="4" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2"/>
                        <line x1="40" y1="45" x2="120" y2="45" stroke="#3F3D56" strokeWidth="2"/>
                        <circle cx="50" cy="37" r="2.5" fill="#800020"/>
                        <circle cx="60" cy="37" r="2.5" fill="#800020"/>
                        <circle cx="70" cy="37" r="2.5" fill="#800020"/>
                        <path d="M48 56l3 3 5-5" stroke="#002f6c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M68 56l3 3 5-5" stroke="#002f6c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M88 56l3 3 5-5" stroke="#002f6c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M48 76l3 3 5-5" stroke="#002f6c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M68 76l3 3 5-5" stroke="#002f6c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="145" cy="75" r="8" fill="#3F3D56"/>
                        <path d="M145 83c-8 0-14 6-14 14v18h28V97c0-8-6-14-14-14z" fill="#3F3D56"/>
                        <path d="M139 115h12v10H139z" fill="#3F3D56"/>
                      </svg>
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-zinc-800 group-hover:text-[#002f6c] transition-colors">
                      Daily Schedule
                    </span>
                  </div>

                  {/* Card 3: Schools */}
                  <div 
                    onClick={() => {
                      setActiveTab("schools");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="bg-white rounded-lg border border-zinc-200 shadow-sm p-3 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer select-none hover:border-[#002f6c]/55 hover:shadow transition-all group min-h-[120px] sm:min-h-[135px]"
                  >
                    <div className="flex-1 flex items-center justify-center w-full mb-2 group-hover:scale-105 transition-transform duration-200">
                      <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="50" y="45" width="100" height="65" rx="2" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2"/>
                        <path d="M45 45 L100 20 L155 45 Z" fill="#800020" stroke="#3F3D56" strokeWidth="2" strokeLinejoin="round"/>
                        <circle cx="100" cy="35" r="6" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="1.5"/>
                        <line x1="100" y1="35" x2="100" y2="31" stroke="#3F3D56" strokeWidth="1"/>
                        <line x1="100" y1="35" x2="103" y2="35" stroke="#3F3D56" strokeWidth="1"/>
                        <rect x="62" y="60" width="10" height="35" fill="#E6E6E6" stroke="#3F3D56" strokeWidth="1.5"/>
                        <rect x="128" y="60" width="10" height="35" fill="#E6E6E6" stroke="#3F3D56" strokeWidth="1.5"/>
                        <path d="M90 110 V85 C90 80 110 80 110 85 V110 Z" fill="#002f6c" stroke="#3F3D56" strokeWidth="2"/>
                        <rect x="78" y="60" width="12" height="15" rx="1" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="1.5"/>
                        <rect x="110" y="60" width="12" height="15" rx="1" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="1.5"/>
                        <line x1="100" y1="20" x2="100" y2="5" stroke="#3F3D56" strokeWidth="1.5"/>
                        <path d="M100 5 L115 10 L100 15 Z" fill="#002f6c"/>
                      </svg>
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-zinc-800 group-hover:text-[#002f6c] transition-colors">
                      Schools
                    </span>
                  </div>

                  {/* Card 4: ID Card */}
                  <div 
                    onClick={() => {
                      setActiveTab("settings");
                      setProfileView("id-card");
                      setError(null);
                      setSuccess(null);
                    }}
                    className="bg-white rounded-lg border border-zinc-200 shadow-sm p-3 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer select-none hover:border-[#002f6c]/55 hover:shadow transition-all group min-h-[120px] sm:min-h-[135px]"
                  >
                    <div className="flex-1 flex items-center justify-center w-full mb-2 group-hover:scale-105 transition-transform duration-200">
                      <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="80" y="35" width="75" height="55" rx="3" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2"/>
                        <line x1="85" y1="62" x2="150" y2="62" stroke="#E6E6E6" strokeWidth="1"/>
                        <line x1="85" y1="72" x2="130" y2="72" stroke="#E6E6E6" strokeWidth="1"/>
                        <rect x="90" y="42" width="15" height="15" rx="1" fill="#002f6c" opacity="0.8"/>
                        <rect x="110" y="42" width="35" height="4" fill="#800020"/>
                        <rect x="110" y="50" width="25" height="3" fill="#3F3D56"/>
                        <circle cx="50" cy="70" r="8" fill="#3F3D56"/>
                        <path d="M50 78c-8 0-14 6-14 14v18h28V92c0-8-6-14-14-14z" fill="#3F3D56"/>
                        <path d="M44 110h12v15H44z" fill="#3F3D56"/>
                      </svg>
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-zinc-800 group-hover:text-[#002f6c] transition-colors">
                      ID Card
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "schools" && (
              <div className="space-y-3 sm:space-y-4">
                {activeSchoolModule === null ? (
                  <>
                    {/* School Enrolled Header Card (Overview Style) */}
                    <div className="bg-[#F7F6F3] rounded-lg border border-zinc-200 p-6 flex flex-row items-center justify-between shadow-sm min-h-[220px] select-none">
                      {/* Left side: Illustration */}
                      <div className="flex-1 flex justify-center sm:justify-start">
                        <svg viewBox="0 0 200 150" className="h-44 sm:h-52 w-auto object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="50" y="45" width="100" height="65" rx="2" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2"/>
                          <path d="M45 45 L100 20 L155 45 Z" fill="#800020" stroke="#3F3D56" strokeWidth="2" strokeLinejoin="round"/>
                          <circle cx="100" cy="35" r="6" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="1.5"/>
                          <line x1="100" y1="35" x2="100" y2="31" stroke="#3F3D56" strokeWidth="1"/>
                          <line x1="100" y1="35" x2="103" y2="35" stroke="#3F3D56" strokeWidth="1"/>
                          <rect x="62" y="60" width="10" height="35" fill="#E6E6E6" stroke="#3F3D56" strokeWidth="1.5"/>
                          <rect x="128" y="60" width="10" height="35" fill="#E6E6E6" stroke="#3F3D56" strokeWidth="1.5"/>
                          <path d="M90 110 V85 C90 80 110 80 110 85 V110 Z" fill="#002f6c" stroke="#3F3D56" strokeWidth="2"/>
                          <rect x="78" y="60" width="12" height="15" rx="1" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="1.5"/>
                          <rect x="110" y="60" width="12" height="15" rx="1" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="1.5"/>
                          <line x1="100" y1="20" x2="100" y2="5" stroke="#3F3D56" strokeWidth="1.5"/>
                          <path d="M100 5 L115 10 L100 15 Z" fill="#002f6c"/>
                        </svg>
                      </div>
                      {/* Right side: Live Schools Count Stats */}
                      <div className="flex-1 flex flex-col items-center justify-center text-center pr-2 sm:pr-8">
                        {isFetchingSchoolsCount ? (
                          <span className="material-icons animate-spin text-4xl text-[#002f6c] select-none">sync</span>
                        ) : (
                          <span className="text-5xl sm:text-6xl font-semibold text-zinc-900 tracking-tight leading-none">
                            {schoolsCount}
                          </span>
                        )}
                        <span className="text-sm sm:text-base font-semibold text-zinc-500 mt-2">
                          Schools Enrolled
                        </span>
                      </div>
                    </div>

                    {/* 4-Box Grid (Overview Style) */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2">
                      {[
                        {
                          title: "School Visits and Demonstrations",
                          icon: "hail",
                          color: "text-amber-500 bg-amber-50 border-amber-100",
                          description: "Track and log school visitation notes and scout demonstrations.",
                          svg: (
                            <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="75" y="30" width="75" height="50" rx="3" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2"/>
                              <path d="M75 55 h75" stroke="#E6E6E6" strokeWidth="1"/>
                              <path d="M85 70 L105 50 L125 65 L145 42" stroke="#002f6c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="145" cy="42" r="3" fill="#800020"/>
                              <circle cx="50" cy="65" r="8" fill="#3F3D56"/>
                              <path d="M50 73c-7 0-12 5-12 12v15h24V85c0-7-5-12-12-12z" fill="#3F3D56"/>
                              <path d="M44 100h12v15H44z" fill="#3F3D56"/>
                            </svg>
                          )
                        },
                        {
                          title: "Daily Class Register",
                          icon: "fact_check",
                          color: "text-emerald-500 bg-emerald-50 border-emerald-100",
                          description: "Mark attendee rosters and manage daily session logs.",
                          svg: (
                            <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="60" y="25" width="80" height="100" rx="4" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2"/>
                              <rect x="90" y="15" width="20" height="10" rx="1" fill="#3F3D56"/>
                              <line x1="75" y1="45" x2="125" y2="45" stroke="#E6E6E6" strokeWidth="2"/>
                              <line x1="75" y1="65" x2="125" y2="65" stroke="#E6E6E6" strokeWidth="2"/>
                              <line x1="75" y1="85" x2="125" y2="85" stroke="#E6E6E6" strokeWidth="2"/>
                              <line x1="75" y1="105" x2="125" y2="105" stroke="#E6E6E6" strokeWidth="2"/>
                              <circle cx="75" cy="45" r="4" fill="#002f6c"/>
                              <circle cx="75" cy="65" r="4" fill="#800020"/>
                              <circle cx="75" cy="85" r="4" fill="#002f6c"/>
                              <circle cx="75" cy="105" r="4" fill="#E6E6E6"/>
                            </svg>
                          )
                        },
                        {
                          title: "Student Enrolment",
                          icon: "person_add",
                          color: "text-blue-500 bg-blue-50 border-blue-100",
                          description: "Register new praveshika or komal/dhruv padh candidates.",
                          svg: (
                            <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="100" cy="55" r="30" fill="#E6E6E6" opacity="0.5"/>
                              <path d="M100 25 L145 42 L100 59 L55 42 Z" fill="#002f6c" stroke="#3F3D56" strokeWidth="2" strokeLinejoin="round"/>
                              <rect x="80" y="55" width="40" height="20" fill="#800020" stroke="#3F3D56" strokeWidth="2"/>
                              <path d="M100 42 L125 55 L125 70" fill="none" stroke="#800020" strokeWidth="1.5" strokeLinecap="round"/>
                              <circle cx="125" cy="70" r="2.5" fill="#800020"/>
                              <circle cx="100" cy="98" r="8" fill="#3F3D56"/>
                              <path d="M100 106c-8 0-14 6-14 14v10h28v-10c0-8-6-14-14-14z" fill="#3F3D56"/>
                            </svg>
                          )
                        },
                        {
                          title: "Uniform Distribution",
                          icon: "checkroom",
                          color: "text-rose-500 bg-rose-50 border-rose-100",
                          description: "Monitor distribution logs of uniforms and state scarfs.",
                          svg: (
                            <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M100 35 C100 25 110 25 110 30 C110 35 100 35 100 42" fill="none" stroke="#3F3D56" strokeWidth="2" strokeLinecap="round"/>
                              <path d="M70 50 L100 45 L130 50 L145 65 L130 70 L125 65 V110 H75 V65 L70 70 L55 65 Z" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2" strokeLinejoin="round"/>
                              <path d="M95 46 L100 65 L105 46 Z" fill="#800020"/>
                              <path d="M97 65 L100 95 L103 65 Z" fill="#002f6c"/>
                            </svg>
                          )
                        },
                      ].map((box, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            const moduleKeys = ["visits", "register", "enrolment", "uniforms"];
                            setActiveSchoolModule(moduleKeys[idx]);
                            setShowAddForm(false);
                          }}
                          className="bg-white rounded-lg border border-zinc-200 shadow-sm p-3 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer select-none hover:border-[#002f6c]/55 hover:shadow transition-all group min-h-[120px] sm:min-h-[135px] relative"
                        >
                          {/* Top right corner arrow */}
                          <span className="material-symbols-outlined text-[14px] text-zinc-400 absolute top-2.5 right-2.5 select-none group-hover:text-[#002f6c] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                            north_east
                          </span>

                          {/* SVG Illustration Placeholder */}
                          <div className="flex-1 flex items-center justify-center w-full mb-2 group-hover:scale-105 transition-transform duration-200">
                            {box.svg}
                          </div>

                          {/* Title */}
                          <span className="text-[11px] sm:text-xs font-bold text-zinc-800 group-hover:text-[#002f6c] transition-colors">
                            {box.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {/* Navigation Top Bar */}
                    <div className="flex items-center justify-between bg-[#F7F6F3] border border-zinc-200 rounded-lg p-2 sm:p-3 select-none gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <button 
                          onClick={() => {
                            setActiveSchoolModule(null);
                            setError(null);
                            setSuccess(null);
                          }}
                          className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-zinc-200 text-zinc-700 hover:text-[#002f6c] transition-colors cursor-pointer shrink-0"
                          title="Back"
                        >
                          <span className="material-icons text-lg font-bold">arrow_back</span>
                        </button>
                        <div className="h-5 w-px bg-zinc-300 shrink-0" />
                        <h3 className="text-[10px] sm:text-xs font-black text-zinc-800 uppercase tracking-wider truncate">
                          {activeSchoolModule === "visits" && "School Visits & Demonstrations"}
                          {activeSchoolModule === "register" && "Daily Class Register"}
                          {activeSchoolModule === "enrolment" && "Student Enrolment"}
                          {activeSchoolModule === "uniforms" && "Uniform Distribution"}
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          setShowAddForm(!showAddForm);
                          setError(null);
                          setSuccess(null);
                        }}
                        className="flex items-center gap-1 py-1 px-2.5 sm:px-3 bg-[#002f6c] hover:bg-[#002352] text-white rounded text-[9px] sm:text-[10px] font-bold shadow-sm transition-colors uppercase tracking-wider shrink-0"
                      >
                        <span className="material-icons text-xs sm:text-sm font-bold">{showAddForm ? "close" : "add"}</span>
                        {showAddForm ? "Cancel" : "Add Record"}
                      </button>
                    </div>

                    {/* ──── MODULE 1: School Visits ──── */}
                    {activeSchoolModule === "visits" && (
                      <div className="space-y-4 text-left">
                        {showAddForm && (
                          <form onSubmit={handleAddVisit} className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
                            <h4 className="text-xs font-bold text-zinc-800 border-b border-zinc-150 pb-2 uppercase tracking-wide">Record New School Visit</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wide mb-1">School Name</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={visitSchoolName} 
                                  onChange={(e) => setVisitSchoolName(e.target.value)}
                                  placeholder="e.g. Govt High School" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wide mb-1">District</label>
                                <input 
                                  type="text" 
                                  value={visitDistrict} 
                                  onChange={(e) => setVisitDistrict(e.target.value)}
                                  placeholder="e.g. Hyderabad" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wide mb-1">Principal Name</label>
                                <input 
                                  type="text" 
                                  value={visitPrincipal} 
                                  onChange={(e) => setVisitPrincipal(e.target.value)}
                                  placeholder="e.g. Dr. Ram" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wide mb-1">Phone Number</label>
                                <input 
                                  type="tel" 
                                  value={visitPhone} 
                                  onChange={(e) => setVisitPhone(e.target.value)}
                                  placeholder="e.g. +91 98765 43210" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wide mb-1">School Address</label>
                              <textarea 
                                value={visitAddress} 
                                onChange={(e) => setVisitAddress(e.target.value)}
                                placeholder="Enter school street and village details..." 
                                className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900 h-16"
                              />
                            </div>

                            <div className="flex gap-6 pt-1 select-none">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={visitDemo} 
                                  onChange={(e) => setVisitDemo(e.target.checked)}
                                  className="h-4 w-4 text-[#002f6c] focus:ring-[#002f6c] border-zinc-300 rounded cursor-pointer"
                                />
                                <span className="text-xs font-bold text-zinc-700">Demonstration Done</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={visitVisited} 
                                  onChange={(e) => setVisitVisited(e.target.checked)}
                                  className="h-4 w-4 text-[#002f6c] focus:ring-[#002f6c] border-zinc-300 rounded cursor-pointer"
                                />
                                <span className="text-xs font-bold text-zinc-700">School Visited</span>
                              </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
                              <button 
                                type="button" 
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded text-xs font-bold hover:bg-zinc-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                className="px-4 py-2 bg-[#002f6c] hover:bg-[#002352] text-white rounded text-xs font-bold shadow-sm transition-colors"
                              >
                                Save Visit Log
                              </button>
                            </div>
                          </form>
                        )}

                        {/* List display */}
                        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-4">
                          <h4 className="text-xs font-bold text-zinc-800 mb-3 border-b border-zinc-100 pb-2 uppercase tracking-wide">Visits History ({visitsList.length})</h4>
                          {visitsList.length === 0 ? (
                            <div className="py-8 text-center text-zinc-400 text-xs font-medium">No school visit logs registered yet. Click Add Record to insert one.</div>
                          ) : (
                            <div className="space-y-3">
                              {visitsList.map((item) => (
                                <div key={item.id} className="border border-zinc-150 rounded-lg p-3 bg-zinc-50/50 flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-zinc-900">{item.schoolName}</span>
                                      {item.district && <span className="bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded text-[10px] font-bold">{item.district}</span>}
                                    </div>
                                    <p className="text-zinc-500 font-medium">{item.address}</p>
                                    <div className="text-[10px] text-zinc-655 font-bold flex gap-4 pt-1">
                                      {item.principalName && <span>Principal: {item.principalName}</span>}
                                      {item.phone && <span>Phone: {item.phone}</span>}
                                    </div>
                                  </div>
                                  <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-200/60 justify-between select-none">
                                    <div className="flex gap-1.5">
                                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${item.demonstration ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-600 border border-zinc-200"}`}>
                                        Demo: {item.demonstration ? "Done" : "Not Done"}
                                      </span>
                                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${item.visited ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-zinc-100 text-zinc-600 border border-zinc-200"}`}>
                                        Visited: {item.visited ? "Yes" : "No"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-[10px] text-zinc-400 font-bold">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</span>
                                      <button 
                                        onClick={() => handleDeleteVisit(item.id)}
                                        className="text-rose-650 hover:text-rose-800 transition-colors font-bold text-[10px] uppercase cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ──── MODULE 2: Daily Class Register ──── */}
                    {activeSchoolModule === "register" && (
                      <div className="space-y-4 text-left">
                        {showAddForm && (
                          <form onSubmit={handleAddRegister} className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
                            <h4 className="text-xs font-bold text-zinc-800 border-b border-zinc-150 pb-2 uppercase tracking-wide">Add Class Register Log</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wide mb-1">School Name</label>
                                <select 
                                  required 
                                  value={regSchoolName} 
                                  onChange={(e) => setRegSchoolName(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                >
                                  <option value="">-- Select Enrolled School --</option>
                                  {registeredSchools.map((sch) => (
                                    <option key={sch.id} value={sch.name}>{sch.name}</option>
                                  ))}
                                  <option value="Other Manual School">Other Manual School Entry</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wide mb-1">Date</label>
                                <input 
                                  type="date" 
                                  required 
                                  value={regDate} 
                                  onChange={(e) => setRegDate(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wide mb-1">Topic Covered</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={regTopic} 
                                  onChange={(e) => setRegTopic(e.target.value)}
                                  placeholder="e.g. Praveshika Syllabus Part-1" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Attendee / Student Count</label>
                                <input 
                                  type="number" 
                                  required 
                                  min="0" 
                                  value={regAttendance} 
                                  onChange={(e) => setRegAttendance(e.target.value)}
                                  placeholder="e.g. 24" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
                              <button 
                                type="button" 
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded text-xs font-bold hover:bg-zinc-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                className="px-4 py-2 bg-[#002f6c] hover:bg-[#002352] text-white rounded text-xs font-bold shadow-sm transition-colors"
                              >
                                Save Entry
                              </button>
                            </div>
                          </form>
                        )}

                        {/* List display */}
                        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-4">
                          <h4 className="text-xs font-bold text-zinc-800 mb-3 border-b border-zinc-100 pb-2 uppercase tracking-wide">Class Logs ({registersList.length})</h4>
                          {registersList.length === 0 ? (
                            <div className="py-8 text-center text-zinc-400 text-xs font-medium">No registers logged yet. Click Add Record to start.</div>
                          ) : (
                            <div className="space-y-3">
                              {registersList.map((item) => (
                                <div key={item.id} className="border border-zinc-150 rounded-lg p-3 bg-zinc-50/50 flex items-center justify-between gap-3 text-xs">
                                  <div className="space-y-1">
                                    <span className="font-black text-zinc-900">{item.schoolName}</span>
                                    <p className="text-zinc-650 font-bold text-[11px]">{item.topicCovered}</p>
                                    <span className="text-[10px] text-zinc-450 block font-semibold">Date: {item.date}</span>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-black text-[10px] border border-emerald-250 select-none">
                                      {item.attendanceCount} Students
                                    </span>
                                    <button 
                                      onClick={() => handleDeleteRegister(item.id)}
                                      className="text-rose-650 hover:text-rose-800 transition-colors font-bold text-[10px] uppercase cursor-pointer block mt-1.5 text-right ml-auto"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ──── MODULE 3: Student Enrolment ──── */}
                    {activeSchoolModule === "enrolment" && (
                      <div className="space-y-4 text-left">
                        {showAddForm && (
                          <form onSubmit={handleAddStudent} className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
                            <h4 className="text-xs font-bold text-zinc-800 border-b border-zinc-150 pb-2 uppercase tracking-wide">Enroll New Student</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wide mb-1">Student Name</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={studName} 
                                  onChange={(e) => setStudName(e.target.value)}
                                  placeholder="e.g. Amit Kumar" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wide mb-1">Age</label>
                                <input 
                                  type="number" 
                                  required 
                                  min="4" 
                                  max="25" 
                                  value={studAge} 
                                  onChange={(e) => setStudAge(e.target.value)}
                                  placeholder="e.g. 14" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wide mb-1">School Name</label>
                                <select 
                                  required 
                                  value={studSchool} 
                                  onChange={(e) => setStudSchool(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                >
                                  <option value="">-- Select Enrolled School --</option>
                                  {registeredSchools.map((sch) => (
                                    <option key={sch.id} value={sch.name}>{sch.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wide mb-1">Valid ID (Aadhaar / Card ID)</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={studId} 
                                  onChange={(e) => setStudId(e.target.value)}
                                  placeholder="e.g. 1234-5678-9012" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
                              <button 
                                type="button" 
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded text-xs font-bold hover:bg-zinc-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                className="px-4 py-2 bg-[#002f6c] hover:bg-[#002352] text-white rounded text-xs font-bold shadow-sm transition-colors"
                              >
                                Enrol Student
                              </button>
                            </div>
                          </form>
                        )}

                        {/* List display */}
                        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-4">
                          <h4 className="text-xs font-bold text-zinc-800 mb-3 border-b border-zinc-100 pb-2 uppercase tracking-wide">Enrolled Students ({enrolmentsList.length})</h4>
                          {enrolmentsList.length === 0 ? (
                            <div className="py-8 text-center text-zinc-400 text-xs font-medium">No students enrolled yet. Click Add Record to register.</div>
                          ) : (
                            <div className="space-y-3">
                              {enrolmentsList.map((item) => (
                                <div key={item.id} className="border border-zinc-150 rounded-lg p-3 bg-zinc-50/50 flex items-center justify-between gap-3 text-xs">
                                  <div className="space-y-1">
                                    <span className="font-black text-zinc-900">{item.studentName}</span>
                                    <p className="text-zinc-500 font-semibold">{item.schoolName}</p>
                                    <span className="text-[10px] text-zinc-450 block font-semibold">Valid ID: {item.validId}</span>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[10px] border border-blue-200 select-none">
                                      Age: {item.age}
                                    </span>
                                    <button 
                                      onClick={() => handleDeleteStudent(item.id)}
                                      className="text-rose-655 hover:text-rose-800 transition-colors font-bold text-[10px] uppercase cursor-pointer block mt-1.5 text-right ml-auto"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ──── MODULE 4: Uniform Distribution ──── */}
                    {activeSchoolModule === "uniforms" && (
                      <div className="space-y-4 text-left">
                        {/* School Selector Dropdown - MANDATORY FIRST STEP */}
                        <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm space-y-3">
                          <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider select-none">Select School for Uniforms</label>
                          <select 
                            value={distSchool} 
                            onChange={(e) => {
                              setDistSchool(e.target.value);
                            }}
                            className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900 font-bold"
                          >
                            <option value="">-- Choose Registered School --</option>
                            {registeredSchools.map((sch) => (
                              <option key={sch.id} value={sch.name}>{sch.name}</option>
                            ))}
                          </select>
                        </div>

                        {distSchool ? (
                          <>
                            {/* Mode selector: Bulk vs Individual */}
                            <div className="flex border border-zinc-200 rounded-lg p-1 bg-zinc-100 select-none">
                              <button
                                onClick={() => setDistType("bulk")}
                                className={`flex-1 text-center py-2 text-xs font-bold rounded-md transition-colors ${distType === "bulk" ? "bg-white text-[#002f6c] shadow-sm" : "text-zinc-650 hover:bg-zinc-200/50"}`}
                              >
                                Bulk Distribution
                              </button>
                              <button
                                onClick={() => setDistType("individual")}
                                className={`flex-1 text-center py-2 text-xs font-bold rounded-md transition-colors ${distType === "individual" ? "bg-white text-[#002f6c] shadow-sm" : "text-zinc-650 hover:bg-zinc-200/50"}`}
                              >
                                Individual Distribution
                              </button>
                            </div>

                            {/* Show Form when showAddForm is active */}
                            {showAddForm && (
                              <form onSubmit={handleAddDistribution} className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
                                <h4 className="text-xs font-bold text-zinc-800 border-b border-zinc-150 pb-2 uppercase tracking-wide">
                                  {distType === "bulk" ? "Record Bulk Distribution" : "Record Individual Distribution"}
                                </h4>

                                {distType === "bulk" ? (
                                  /* Bulk distribution form */
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                      <div>
                                        <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Male Uniforms Qty</label>
                                        <input 
                                          type="number" 
                                          required 
                                          min="0"
                                          value={bulkMaleCount} 
                                          onChange={(e) => setBulkMaleCount(e.target.value)}
                                          placeholder="e.g. 50" 
                                          className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Female Uniforms Qty</label>
                                        <input 
                                          type="number" 
                                          required 
                                          min="0"
                                          value={bulkFemaleCount} 
                                          onChange={(e) => setBulkFemaleCount(e.target.value)}
                                          placeholder="e.g. 40" 
                                          className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Total Amount taken</label>
                                        <input 
                                          type="number" 
                                          required 
                                          min="0" 
                                          value={bulkAmount} 
                                          onChange={(e) => setBulkAmount(e.target.value)}
                                          placeholder="e.g. 25000" 
                                          className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  /* Individual distribution form */
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Student Name</label>
                                        <input 
                                          type="text" 
                                          required 
                                          value={indStudentName} 
                                          onChange={(e) => setIndStudentName(e.target.value)}
                                          placeholder="e.g. Rahul Reddy" 
                                          className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Class / Standard</label>
                                        <input 
                                          type="text" 
                                          required 
                                          value={indClass} 
                                          onChange={(e) => setIndClass(e.target.value)}
                                          placeholder="e.g. Class 8-B" 
                                          className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1 font-semibold select-none">Gender</label>
                                        <select 
                                          value={indGender} 
                                          onChange={(e) => setIndGender(e.target.value)}
                                          className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                        >
                                          <option value="Male">Male</option>
                                          <option value="Female">Female</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Amount Taken</label>
                                        <input 
                                          type="number" 
                                          required 
                                          min="0" 
                                          value={indAmount} 
                                          onChange={(e) => setIndAmount(e.target.value)}
                                          placeholder="e.g. 350" 
                                          className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
                                  <button 
                                    type="button" 
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded text-xs font-bold hover:bg-zinc-50 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-[#002f6c] hover:bg-[#002352] text-white rounded text-xs font-bold shadow-sm transition-colors"
                                  >
                                    Save Distribution Record
                                  </button>
                                </div>
                              </form>
                            )}

                            {/* List display matching the selected school */}
                            <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-4">
                              <h4 className="text-xs font-bold text-zinc-800 mb-3 border-b border-zinc-100 pb-2 uppercase tracking-wide">
                                Distributions - {distSchool} ({distributionsList.filter(item => item.schoolName === distSchool).length})
                              </h4>
                              {distributionsList.filter(item => item.schoolName === distSchool).length === 0 ? (
                                <div className="py-8 text-center text-zinc-400 text-xs font-medium">No uniform distribution records registered for this school yet.</div>
                              ) : (
                                <div className="space-y-3">
                                  {distributionsList.filter(item => item.schoolName === distSchool).map((item) => (
                                    <div key={item.id} className="border border-zinc-150 rounded-lg p-3 bg-zinc-50/50 flex items-center justify-between gap-3 text-xs">
                                      {item.distributionType === "bulk" ? (
                                        <div className="space-y-1">
                                          <span className="font-black text-zinc-900 uppercase text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1 rounded select-none">Bulk Register</span>
                                          <div className="pt-1 text-zinc-750 font-bold flex gap-4">
                                            <span>Male: {item.maleCount} uniforms</span>
                                            <span>Female: {item.femaleCount} uniforms</span>
                                          </div>
                                          <span className="text-[10px] text-zinc-400 block font-semibold">Logged: {item.createdAt}</span>
                                        </div>
                                      ) : (
                                        <div className="space-y-1">
                                          <span className="font-black text-zinc-900 uppercase text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-1 rounded select-none font-semibold">Individual Register</span>
                                          <p className="pt-1 text-zinc-900 font-black">{item.studentName} ({item.class})</p>
                                          <span className="text-[10px] text-zinc-400 block font-semibold">Gender: {item.gender} | Logged: {item.createdAt}</span>
                                        </div>
                                      )}
                                      <div className="text-right shrink-0">
                                        <span className="font-black text-xs text-zinc-900 block font-bold">₹{item.amount}</span>
                                        <span className="text-[9px] font-bold text-zinc-400 font-semibold mb-1 block">Total Charged</span>
                                        <button 
                                          onClick={() => handleDeleteDistribution(item.id)}
                                          className="text-rose-650 hover:text-rose-800 transition-colors font-bold text-[10px] uppercase cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-lg py-12 text-center select-none text-zinc-400 text-xs font-semibold">
                            Please select a registered school from the dropdown to continue.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "calls" && (
              <div className="space-y-3 sm:space-y-4">
                {activeCallModule === null ? (
                  <>
                    {/* 4-Box Grid (Overview/Schools/Calls Style) */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        {
                          title: "MoU Register",
                          icon: "history_edu",
                          color: "text-amber-500 bg-amber-50 border-amber-100",
                          description: "Access and review signed Memorandums of Understanding for local school associations.",
                          svg: (
                            <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="60" y="25" width="80" height="100" rx="3" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2"/>
                              <circle cx="115" cy="100" r="10" fill="#800020" opacity="0.8"/>
                              <circle cx="115" cy="100" r="6" stroke="#FFFFFF" strokeWidth="1"/>
                              <line x1="75" y1="45" x2="125" y2="45" stroke="#E6E6E6" strokeWidth="2.5"/>
                              <line x1="75" y1="60" x2="125" y2="60" stroke="#E6E6E6" strokeWidth="2.5"/>
                              <line x1="75" y1="75" x2="105" y2="75" stroke="#E6E6E6" strokeWidth="2.5"/>
                              <path d="M75 105 Q85 95 95 105 T105 100" fill="none" stroke="#002f6c" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          )
                        },
                        {
                          title: "Office Calls",
                          icon: "call",
                          color: "text-emerald-500 bg-emerald-50 border-emerald-100",
                          description: "Log official administrative phone discussions and internal office calls.",
                          svg: (
                            <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="65" y="65" width="70" height="45" rx="3" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2"/>
                              <rect x="75" y="75" width="10" height="10" rx="1" fill="#E6E6E6"/>
                              <rect x="90" y="75" width="10" height="10" rx="1" fill="#E6E6E6"/>
                              <rect x="75" y="90" width="10" height="10" rx="1" fill="#E6E6E6"/>
                              <rect x="90" y="90" width="10" height="10" rx="1" fill="#E6E6E6"/>
                              <path d="M50 50 C55 35 145 35 150 50 L140 60 C135 50 65 50 60 60 Z" fill="#002f6c" stroke="#3F3D56" strokeWidth="2"/>
                              <path d="M125 90 Q145 105 135 120 T115 110" fill="none" stroke="#800020" strokeWidth="2"/>
                            </svg>
                          )
                        },
                        {
                          title: "Home Calls",
                          icon: "contact_phone",
                          color: "text-blue-500 bg-blue-50 border-blue-100",
                          description: "Record phone log details and consultation responses with scout families.",
                          svg: (
                            <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M60 110 V70 L100 40 L140 70 V110 Z" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2"/>
                              <rect x="90" y="85" width="20" height="25" fill="#800020"/>
                              <circle cx="80" cy="65" r="4" fill="#002f6c"/>
                              <circle cx="120" cy="65" r="4" fill="#002f6c"/>
                              <path d="M120 30 C120 15 150 15 150 30 C150 35 140 40 135 45 L135 50 L130 45 C120 45 120 35 120 30 Z" fill="#002f6c"/>
                            </svg>
                          )
                        },
                        {
                          title: "Public Relations",
                          icon: "campaign",
                          color: "text-rose-500 bg-rose-50 border-rose-100",
                          description: "Manage outreach reports, announcements, and local community relations.",
                          svg: (
                            <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M65 75 L125 50 V100 Z" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2" strokeLinejoin="round"/>
                              <path d="M125 50 C130 50 135 60 135 75 C135 90 130 100 125 100" fill="none" stroke="#3F3D56" strokeWidth="2"/>
                              <rect x="75" y="85" width="12" height="25" rx="1" fill="#800020" stroke="#3F3D56" strokeWidth="2" transform="rotate(15 75 85)"/>
                              <path d="M148 60 A20 20 0 0 1 148 90" stroke="#002f6c" strokeWidth="2" strokeLinecap="round"/>
                              <path d="M158 50 A35 35 0 0 1 158 100" stroke="#002f6c" strokeWidth="3" strokeLinecap="round"/>
                            </svg>
                          )
                        },
                      ].map((box, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            const callKeys = ["mou", "office", "home", "pr"];
                            setActiveCallModule(callKeys[idx]);
                            setShowCallAddForm(false);
                          }}
                          className="bg-white rounded-lg border border-zinc-200 shadow-sm p-3 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer select-none hover:border-[#002f6c]/55 hover:shadow transition-all group min-h-[120px] sm:min-h-[135px] relative"
                        >
                          {/* Top right corner arrow */}
                          <span className="material-symbols-outlined text-[14px] text-zinc-400 absolute top-2.5 right-2.5 select-none group-hover:text-[#002f6c] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                            north_east
                          </span>

                          {/* SVG Illustration Placeholder */}
                          <div className="flex-1 flex items-center justify-center w-full mb-2 group-hover:scale-105 transition-transform duration-200">
                            {box.svg}
                          </div>

                          {/* Title */}
                          <span className="text-[11px] sm:text-xs font-bold text-zinc-800 group-hover:text-[#002f6c] transition-colors">
                            {box.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {/* Navigation Top Bar */}
                    <div className="flex items-center justify-between bg-[#F7F6F3] border border-zinc-200 rounded-lg p-2 sm:p-3 select-none gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <button 
                          onClick={() => {
                            setActiveCallModule(null);
                            setError(null);
                            setSuccess(null);
                          }}
                          className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-zinc-200 text-zinc-700 hover:text-[#002f6c] transition-colors cursor-pointer shrink-0"
                          title="Back"
                        >
                          <span className="material-icons text-lg font-bold">arrow_back</span>
                        </button>
                        <div className="h-5 w-px bg-zinc-300 shrink-0" />
                        <h3 className="text-[10px] sm:text-xs font-black text-zinc-800 uppercase tracking-wider truncate">
                          {activeCallModule === "mou" && "MoU Register"}
                          {activeCallModule === "office" && "Office Calls Logger"}
                          {activeCallModule === "home" && "Home Calls Logger"}
                          {activeCallModule === "pr" && "Public Relations Tracker"}
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          setShowCallAddForm(!showCallAddForm);
                          setError(null);
                          setSuccess(null);
                        }}
                        className="flex items-center gap-1 py-1 px-2.5 sm:px-3 bg-[#002f6c] hover:bg-[#002352] text-white rounded text-[9px] sm:text-[10px] font-bold shadow-sm transition-colors uppercase tracking-wider shrink-0"
                      >
                        <span className="material-icons text-xs sm:text-sm font-bold">{showCallAddForm ? "close" : "add"}</span>
                        {showCallAddForm ? "Cancel" : "Add Record"}
                      </button>
                    </div>

                    {/* ──── CALL SUB-MODULE 1: MoU Register ──── */}
                    {activeCallModule === "mou" && (
                      <div className="space-y-4 text-left">
                        {showCallAddForm && (
                          <form onSubmit={handleAddMou} className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
                            <h4 className="text-xs font-bold text-zinc-800 border-b border-zinc-150 pb-2 uppercase tracking-wide">Record New Memorandum of Understanding</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wide mb-1">School</label>
                                <select 
                                  required 
                                  value={mouSchool} 
                                  onChange={(e) => setMouSchool(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900 font-medium"
                                >
                                  <option value="">-- Select Registered School --</option>
                                  {registeredSchools.map((sch) => (
                                    <option key={sch.id} value={sch.name}>{sch.name}</option>
                                  ))}
                                  <option value="Other Manual School">Other School (Manual Entry)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Principal Name</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={mouPrincipal} 
                                  onChange={(e) => setMouPrincipal(e.target.value)}
                                  placeholder="e.g. Dr. K. Rao" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Date Initiated</label>
                                <input 
                                  type="date" 
                                  required 
                                  value={mouDateInit} 
                                  onChange={(e) => setMouDateInit(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Student Strength</label>
                                <input 
                                  type="number" 
                                  required 
                                  min="0"
                                  placeholder="e.g. 120"
                                  value={mouStrength} 
                                  onChange={(e) => setMouStrength(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">MoU Status</label>
                                <select 
                                  value={mouStatus} 
                                  onChange={(e) => setMouStatus(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Signed">Signed</option>
                                  <option value="Terminated">Terminated</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Signed Date (If applicable)</label>
                                <input 
                                  type="date" 
                                  value={mouSignedDate} 
                                  onChange={(e) => setMouSignedDate(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Next Follow-up Date</label>
                                <input 
                                  type="date" 
                                  value={mouFollowUp} 
                                  onChange={(e) => setMouFollowUp(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Staff Member</label>
                                <input 
                                  type="text" 
                                  value={mouStaff} 
                                  onChange={(e) => setMouStaff(e.target.value)}
                                  placeholder={employee?.name || "Enter staff name"} 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
                              <button 
                                type="button" 
                                onClick={() => setShowCallAddForm(false)}
                                className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded text-xs font-bold hover:bg-zinc-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                className="px-4 py-2 bg-[#002f6c] hover:bg-[#002352] text-white rounded text-xs font-bold shadow-sm transition-colors"
                              >
                                Save MoU
                              </button>
                            </div>
                          </form>
                        )}

                        {/* MoU Table List display */}
                        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-4 overflow-x-auto">
                          <h4 className="text-xs font-bold text-zinc-800 mb-3 border-b border-zinc-100 pb-2 uppercase tracking-wide">MoU Log History ({mouList.length})</h4>
                          {mouList.length === 0 ? (
                            <div className="py-8 text-center text-zinc-400 text-xs font-medium">No MoU records registered yet. Click Add Record to insert one.</div>
                          ) : (
                            <table className="min-w-full divide-y divide-zinc-200 text-left text-xs text-zinc-700 select-none">
                              <thead className="bg-zinc-50 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                <tr>
                                  <th className="px-3 py-2">School</th>
                                  <th className="px-3 py-2">Principal Name</th>
                                  <th className="px-3 py-2">Date Initiated</th>
                                  <th className="px-3 py-2">Student Strength</th>
                                  <th className="px-3 py-2">MoU Status</th>
                                  <th className="px-3 py-2 font-semibold">Signed Date</th>
                                  <th className="px-3 py-2">Next Follow-up</th>
                                  <th className="px-3 py-2">Staff</th>
                                  <th className="px-3 py-2 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-200 bg-white font-medium">
                                {mouList.map((item) => (
                                  <tr key={item.id} className="hover:bg-zinc-50/50">
                                    <td className="px-3 py-2.5 font-bold text-zinc-900">{item.school}</td>
                                    <td className="px-3 py-2.5">{item.principal}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap">{item.dateInitiated}</td>
                                    <td className="px-3 py-2.5 text-center">{item.studentStrength}</td>
                                    <td className="px-3 py-2.5">
                                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                        item.status === "Signed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                        item.status === "In Progress" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                                        item.status === "Terminated" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                                        "bg-amber-50 text-amber-700 border border-amber-200"
                                      }`}>
                                        {item.status}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5 whitespace-nowrap">{item.signedDate || "-"}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap">{item.nextFollowUp || "-"}</td>
                                    <td className="px-3 py-2.5">{item.staff}</td>
                                    <td className="px-3 py-2.5 text-center">
                                      <button 
                                        onClick={() => handleDeleteMou(item.id)}
                                        className="text-rose-650 hover:text-rose-800 transition-colors font-black text-[10px] uppercase cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ──── CALL SUB-MODULE 2: Office Calls ──── */}
                    {activeCallModule === "office" && (
                      <div className="space-y-4 text-left">
                        {showCallAddForm && (
                          <form onSubmit={handleAddOfficeCall} className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
                            <h4 className="text-xs font-bold text-zinc-800 border-b border-zinc-150 pb-2 uppercase tracking-wide">Log New Office Call</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Date</label>
                                <input 
                                  type="date" 
                                  required 
                                  value={ocDate} 
                                  onChange={(e) => setOcDate(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wide mb-1">School</label>
                                <select 
                                  required 
                                  value={ocSchool} 
                                  onChange={(e) => setOcSchool(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900 font-medium"
                                >
                                  <option value="">-- Select School --</option>
                                  {registeredSchools.map((sch) => (
                                    <option key={sch.id} value={sch.name}>{sch.name}</option>
                                  ))}
                                  <option value="Other Manual School">Other School (Manual Entry)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Principal Name</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={ocPrincipal} 
                                  onChange={(e) => setOcPrincipal(e.target.value)}
                                  placeholder="Principal Name" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Phone Number</label>
                                <input 
                                  type="tel" 
                                  required 
                                  value={ocPhone} 
                                  onChange={(e) => setOcPhone(e.target.value)}
                                  placeholder="e.g. 9876543210" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Purpose</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={ocPurpose} 
                                  onChange={(e) => setOcPurpose(e.target.value)}
                                  placeholder="e.g. MoU follow-up, Uniform check" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Response</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={ocResponse} 
                                  onChange={(e) => setOcResponse(e.target.value)}
                                  placeholder="e.g. Principal agreed, Will visit" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                            </div>

                            <div className="flex gap-6 pt-1 select-none">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={ocMeetingFixed} 
                                  onChange={(e) => setOcMeetingFixed(e.target.checked)}
                                  className="h-4 w-4 text-[#002f6c] focus:ring-[#002f6c] border-zinc-300 rounded cursor-pointer"
                                />
                                <span className="text-xs font-bold text-zinc-700">Meeting Fixed</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={ocFollowUpReq} 
                                  onChange={(e) => setOcFollowUpReq(e.target.checked)}
                                  className="h-4 w-4 text-[#002f6c] focus:ring-[#002f6c] border-zinc-300 rounded cursor-pointer"
                                />
                                <span className="text-xs font-bold text-zinc-700">Follow-up Required</span>
                              </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
                              <button 
                                type="button" 
                                onClick={() => setShowCallAddForm(false)}
                                className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded text-xs font-bold hover:bg-zinc-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                className="px-4 py-2 bg-[#002f6c] hover:bg-[#002352] text-white rounded text-xs font-bold shadow-sm transition-colors"
                              >
                                Log Office Call
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Office Calls Table display */}
                        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-4 overflow-x-auto">
                          <h4 className="text-xs font-bold text-zinc-800 mb-3 border-b border-zinc-100 pb-2 uppercase tracking-wide">Office Call Records ({officeCallsList.length})</h4>
                          {officeCallsList.length === 0 ? (
                            <div className="py-8 text-center text-zinc-400 text-xs font-medium">No office call records logged yet. Click Add Record to start.</div>
                          ) : (
                            <table className="min-w-full divide-y divide-zinc-200 text-left text-xs text-zinc-700 select-none">
                              <thead className="bg-zinc-50 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                <tr>
                                  <th className="px-3 py-2">Date</th>
                                  <th className="px-3 py-2">School</th>
                                  <th className="px-3 py-2">Principal</th>
                                  <th className="px-3 py-2">Phone Number</th>
                                  <th className="px-3 py-2">Purpose</th>
                                  <th className="px-3 py-2">Response</th>
                                  <th className="px-3 py-2">Meeting Fixed</th>
                                  <th className="px-3 py-2 font-semibold">Follow-up Required</th>
                                  <th className="px-3 py-2 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-200 bg-white font-medium">
                                {officeCallsList.map((item) => (
                                  <tr key={item.id} className="hover:bg-zinc-50/50">
                                    <td className="px-3 py-2.5 whitespace-nowrap">{item.date}</td>
                                    <td className="px-3 py-2.5 font-bold text-zinc-900">{item.school}</td>
                                    <td className="px-3 py-2.5">{item.principal}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap">{item.phone}</td>
                                    <td className="px-3 py-2.5">{item.purpose}</td>
                                    <td className="px-3 py-2.5">{item.response}</td>
                                    <td className="px-3 py-2.5">
                                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${item.meetingFixed ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-500 border border-zinc-200"}`}>
                                        {item.meetingFixed ? "Yes" : "No"}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5">
                                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${item.followUpReq ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-zinc-100 text-zinc-505 border border-zinc-200"}`}>
                                        {item.followUpReq ? "Yes" : "No"}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                      <button 
                                        onClick={() => handleDeleteOfficeCall(item.id)}
                                        className="text-rose-650 hover:text-rose-800 transition-colors font-black text-[10px] uppercase cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ──── CALL SUB-MODULE 3: Home Calls ──── */}
                    {activeCallModule === "home" && (
                      <div className="space-y-4 text-left">
                        {showCallAddForm && (
                          <form onSubmit={handleAddHomeCall} className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
                            <h4 className="text-xs font-bold text-zinc-800 border-b border-zinc-150 pb-2 uppercase tracking-wide">Log New Home Call</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Date</label>
                                <input 
                                  type="date" 
                                  required 
                                  value={hcDate} 
                                  onChange={(e) => setHcDate(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-650 uppercase tracking-wide mb-1">School</label>
                                <select 
                                  required 
                                  value={hcSchool} 
                                  onChange={(e) => setHcSchool(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900 font-medium"
                                >
                                  <option value="">-- Select School --</option>
                                  {registeredSchools.map((sch) => (
                                    <option key={sch.id} value={sch.name}>{sch.name}</option>
                                  ))}
                                  <option value="Other Manual School">Other School (Manual Entry)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Person Contacted</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={hcPersonContacted} 
                                  onChange={(e) => setHcPersonContacted(e.target.value)}
                                  placeholder="e.g. Student Father / Mother" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Purpose</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={hcPurpose} 
                                  onChange={(e) => setHcPurpose(e.target.value)}
                                  placeholder="e.g. Class attendance check" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Response</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={hcResponse} 
                                  onChange={(e) => setHcResponse(e.target.value)}
                                  placeholder="e.g. Promised to send child tomorrow" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Staff Member</label>
                                <input 
                                  type="text" 
                                  value={hcStaff} 
                                  onChange={(e) => setHcStaff(e.target.value)}
                                  placeholder={employee?.name || "Enter staff name"} 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                            </div>

                            <div className="pt-1 select-none">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={hcFollowUp} 
                                  onChange={(e) => setHcFollowUp(e.target.checked)}
                                  className="h-4 w-4 text-[#002f6c] focus:ring-[#002f6c] border-zinc-300 rounded cursor-pointer"
                                />
                                <span className="text-xs font-bold text-zinc-700">Follow-up Required</span>
                              </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
                              <button 
                                type="button" 
                                onClick={() => setShowCallAddForm(false)}
                                className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded text-xs font-bold hover:bg-zinc-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                className="px-4 py-2 bg-[#002f6c] hover:bg-[#002352] text-white rounded text-xs font-bold shadow-sm transition-colors"
                              >
                                Log Home Call
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Home Calls Table display */}
                        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-4 overflow-x-auto">
                          <h4 className="text-xs font-bold text-zinc-800 mb-3 border-b border-zinc-100 pb-2 uppercase tracking-wide">Home Call Records ({homeCallsList.length})</h4>
                          {homeCallsList.length === 0 ? (
                            <div className="py-8 text-center text-zinc-400 text-xs font-medium">No home calls logged yet. Click Add Record to start.</div>
                          ) : (
                            <table className="min-w-full divide-y divide-zinc-200 text-left text-xs text-zinc-700 select-none">
                              <thead className="bg-zinc-50 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                <tr>
                                  <th className="px-3 py-2">Date</th>
                                  <th className="px-3 py-2">School</th>
                                  <th className="px-3 py-2">Person Contacted</th>
                                  <th className="px-3 py-2">Purpose</th>
                                  <th className="px-3 py-2">Response</th>
                                  <th className="px-3 py-2">Follow-up</th>
                                  <th className="px-3 py-2 font-semibold">Staff</th>
                                  <th className="px-3 py-2 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-200 bg-white font-medium">
                                {homeCallsList.map((item) => (
                                  <tr key={item.id} className="hover:bg-zinc-50/50">
                                    <td className="px-3 py-2.5 whitespace-nowrap">{item.date}</td>
                                    <td className="px-3 py-2.5 font-bold text-zinc-900">{item.school}</td>
                                    <td className="px-3 py-2.5">{item.personContacted}</td>
                                    <td className="px-3 py-2.5">{item.purpose}</td>
                                    <td className="px-3 py-2.5">{item.response}</td>
                                    <td className="px-3 py-2.5">
                                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${item.followUp ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-zinc-100 text-zinc-500 border border-zinc-200"}`}>
                                        {item.followUp ? "Yes" : "No"}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5">{item.staff}</td>
                                    <td className="px-3 py-2.5 text-center">
                                      <button 
                                        onClick={() => handleDeleteHomeCall(item.id)}
                                        className="text-rose-650 hover:text-rose-800 transition-colors font-black text-[10px] uppercase cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ──── CALL SUB-MODULE 4: Public Relations ──── */}
                    {activeCallModule === "pr" && (
                      <div className="space-y-4 text-left">
                        {showCallAddForm && (
                          <form onSubmit={handleAddPr} className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
                            <h4 className="text-xs font-bold text-zinc-800 border-b border-zinc-150 pb-2 uppercase tracking-wide">Record PR Engagement / Meeting</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Date</label>
                                <input 
                                  type="date" 
                                  required 
                                  value={prDate} 
                                  onChange={(e) => setPrDate(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Person / Body Met</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={prPersonBodyMet} 
                                  onChange={(e) => setPrPersonBodyMet(e.target.value)}
                                  placeholder="e.g. Press Reporter / Sarpanch" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1 font-semibold select-none">Category</label>
                                <select 
                                  value={prCategory} 
                                  onChange={(e) => setPrCategory(e.target.value)}
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900 font-medium"
                                >
                                  <option value="Government">Government Officials</option>
                                  <option value="Press / Media">Press / Media</option>
                                  <option value="NGO / Trust">NGO / Social Trust</option>
                                  <option value="Community Leader">Community Leaders</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Purpose</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={prPurpose} 
                                  onChange={(e) => setPrPurpose(e.target.value)}
                                  placeholder="e.g. Scout week press release" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Outcome</label>
                                <input 
                                  type="text" 
                                  required 
                                  value={prOutcome} 
                                  onChange={(e) => setPrOutcome(e.target.value)}
                                  placeholder="e.g. Published in local daily news" 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-zinc-655 uppercase tracking-wide mb-1">Staff Member</label>
                                <input 
                                  type="text" 
                                  value={prStaff} 
                                  onChange={(e) => setPrStaff(e.target.value)}
                                  placeholder={employee?.name || "Enter staff name"} 
                                  className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] bg-white text-zinc-900"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
                              <button 
                                type="button" 
                                onClick={() => setShowCallAddForm(false)}
                                className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded text-xs font-bold hover:bg-zinc-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                className="px-4 py-2 bg-[#002f6c] hover:bg-[#002352] text-white rounded text-xs font-bold shadow-sm transition-colors"
                              >
                                Log PR Engagement
                              </button>
                            </div>
                          </form>
                        )}

                        {/* PR Table List display */}
                        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-4 overflow-x-auto">
                          <h4 className="text-xs font-bold text-zinc-800 mb-3 border-b border-zinc-100 pb-2 uppercase tracking-wide">PR Records List ({prList.length})</h4>
                          {prList.length === 0 ? (
                            <div className="py-8 text-center text-zinc-400 text-xs font-medium">No PR engagement records logged yet. Click Add Record to start.</div>
                          ) : (
                            <table className="min-w-full divide-y divide-zinc-200 text-left text-xs text-zinc-700 select-none">
                              <thead className="bg-zinc-50 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                <tr>
                                  <th className="px-3 py-2">Date</th>
                                  <th className="px-3 py-2">Person / Body Met</th>
                                  <th className="px-3 py-2 font-semibold">Category</th>
                                  <th className="px-3 py-2">Purpose</th>
                                  <th className="px-3 py-2">Outcome</th>
                                  <th className="px-3 py-2">Staff</th>
                                  <th className="px-3 py-2 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-200 bg-white font-medium">
                                {prList.map((item) => (
                                  <tr key={item.id} className="hover:bg-zinc-50/50">
                                    <td className="px-3 py-2.5 whitespace-nowrap">{item.date}</td>
                                    <td className="px-3 py-2.5 font-bold text-zinc-900">{item.personBodyMet}</td>
                                    <td className="px-3 py-2.5">
                                      <span className="inline-flex px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold uppercase">
                                        {item.category}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2.5">{item.purpose}</td>
                                    <td className="px-3 py-2.5">{item.outcome}</td>
                                    <td className="px-3 py-2.5">{item.staff}</td>
                                    <td className="px-3 py-2.5 text-center">
                                      <button 
                                        onClick={() => handleDeletePr(item.id)}
                                        className="text-rose-650 hover:text-rose-800 transition-colors font-black text-[10px] uppercase cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "media" && (
              <div className="space-y-3 sm:space-y-4">
                {activeMediaModule === null ? (
                  <>
                    {/* Media Overview Banner */}
                    <div className="bg-[#F7F6F3] rounded-lg border border-zinc-200 p-6 flex flex-row items-center justify-between shadow-sm min-h-[160px] select-none">
                      <div className="flex-1 flex justify-center sm:justify-start">
                        <svg viewBox="0 0 200 150" className="h-32 sm:h-36 w-auto object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="40" y="35" width="120" height="85" rx="6" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2.5"/>
                          <rect x="50" y="45" width="100" height="50" rx="2" fill="#E6E6E6"/>
                          <circle cx="100" cy="70" r="14" fill="#800020" stroke="#3F3D56" strokeWidth="2"/>
                          <path d="M96 64 L108 70 L96 76 Z" fill="#FFFFFF"/>
                          <rect x="50" y="102" width="25" height="8" rx="1.5" fill="#002f6c"/>
                          <rect x="80" y="102" width="40" height="8" rx="1.5" fill="#3F3D56"/>
                        </svg>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center text-center pr-2 sm:pr-8">
                        <span className="text-4xl font-extrabold text-zinc-900 tracking-tight leading-none">
                          Media & Logs
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2 block">
                          Official Records
                        </span>
                      </div>
                    </div>

                    {/* 5-Box Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      {[
                        {
                          key: "social",
                          title: "Social Media",
                          icon: "share",
                          color: "text-amber-500 bg-amber-50 border-amber-100",
                          description: "Manage state outreach, official announcements, and shared media channels.",
                          svg: (
                            <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="100" cy="75" r="28" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2"/>
                              <circle cx="100" cy="75" r="12" stroke="#E6E6E6" strokeWidth="1"/>
                              <circle cx="70" cy="55" r="6" fill="#002f6c"/>
                              <circle cx="130" cy="55" r="6" fill="#800020"/>
                              <circle cx="100" cy="110" r="6" fill="#002f6c"/>
                              <line x1="75" y1="58" x2="95" y2="70" stroke="#3F3D56" strokeWidth="1.5"/>
                              <line x1="125" y1="58" x2="105" y2="70" stroke="#3F3D56" strokeWidth="1.5"/>
                              <line x1="100" y1="104" x2="100" y2="85" stroke="#3F3D56" strokeWidth="1.5"/>
                            </svg>
                          )
                        },
                        {
                          key: "videos",
                          title: "Student Videos",
                          icon: "smart_display",
                          color: "text-emerald-500 bg-emerald-50 border-emerald-100",
                          description: "Upload and organize student scout training sessions and class activity videos.",
                          svg: (
                            <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="55" y="40" width="90" height="70" rx="4" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2"/>
                              <rect x="60" y="46" width="6" height="8" rx="0.5" fill="#E6E6E6" />
                              <rect x="60" y="62" width="6" height="8" rx="0.5" fill="#E6E6E6" />
                              <rect x="60" y="78" width="6" height="8" rx="0.5" fill="#E6E6E6" />
                              <rect x="60" y="94" width="6" height="8" rx="0.5" fill="#E6E6E6" />
                              <rect x="134" y="46" width="6" height="8" rx="0.5" fill="#E6E6E6" />
                              <rect x="134" y="62" width="6" height="8" rx="0.5" fill="#E6E6E6" />
                              <rect x="134" y="78" width="6" height="8" rx="0.5" fill="#E6E6E6" />
                              <rect x="134" y="94" width="6" height="8" rx="0.5" fill="#E6E6E6" />
                              <path d="M92 62 L115 75 L92 88 Z" fill="#002f6c" stroke="#3F3D56" strokeWidth="2" strokeLinejoin="round"/>
                            </svg>
                          )
                        },
                        {
                          key: "finance",
                          title: "Financial Register",
                          icon: "account_balance_wallet",
                          color: "text-blue-500 bg-blue-50 border-blue-100",
                          description: "Track uniform distribution costs, class activity receipts, and branch funds.",
                          svg: (
                            <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="60" y="35" width="80" height="80" rx="3" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2"/>
                              <circle cx="100" cy="75" r="16" fill="#800020" opacity="0.8"/>
                              <circle cx="100" cy="75" r="12" stroke="#FFFFFF" strokeWidth="1.5"/>
                              <path d="M95 70 H105 M95 75 H105 M98 70 L98 83 M102 70 A4 4 0 0 1 102 78 L95 83" fill="none" stroke="#FFFFFF" strokeWidth="1.5"/>
                              <line x1="70" y1="45" x2="130" y2="45" stroke="#E6E6E6" strokeWidth="2"/>
                              <line x1="70" y1="105" x2="130" y2="105" stroke="#E6E6E6" strokeWidth="2"/>
                            </svg>
                          )
                        },
                        {
                          key: "problems",
                          title: "Problem Register",
                          icon: "report_problem",
                          color: "text-rose-500 bg-rose-50 border-rose-100",
                          description: "Report class disruptions, equipment shortages, or campus infrastructure issues.",
                          svg: (
                            <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="60" y="25" width="80" height="100" rx="4" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2"/>
                              <path d="M100 45 L118 78 H82 Z" fill="#800020" stroke="#3F3D56" strokeWidth="2" strokeLinejoin="round"/>
                              <circle cx="100" cy="74" r="1.5" fill="#FFFFFF"/>
                              <line x1="100" y1="56" x2="100" y2="68" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                              <line x1="75" y1="90" x2="125" y2="90" stroke="#E6E6E6" strokeWidth="2.5"/>
                              <line x1="75" y1="105" x2="110" y2="105" stroke="#E6E6E6" strokeWidth="2.5"/>
                            </svg>
                          )
                        },
                        {
                          key: "documents",
                          title: "Documents",
                          icon: "folder_open",
                          color: "text-purple-500 bg-purple-50 border-purple-100",
                          description: "View state guidelines, syllabus booklets, and class reporting forms.",
                          svg: (
                            <svg viewBox="0 0 200 150" className="w-auto h-12 sm:h-14 object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M80 30 H135 L145 42 V115 H80 Z" fill="#E6E6E6" stroke="#3F3D56" strokeWidth="2"/>
                              <path d="M60 45 H115 L125 57 V130 H60 Z" fill="#FFFFFF" stroke="#3F3D56" strokeWidth="2"/>
                              <path d="M115 45 V57 H125" fill="#002f6c" stroke="#3F3D56" strokeWidth="2"/>
                              <line x1="75" y1="70" x2="110" y2="70" stroke="#E6E6E6" strokeWidth="2"/>
                              <line x1="75" y1="85" x2="115" y2="85" stroke="#E6E6E6" strokeWidth="2"/>
                              <line x1="75" y1="100" x2="105" y2="100" stroke="#E6E6E6" strokeWidth="2"/>
                            </svg>
                          )
                        },
                      ].map((box) => (
                        <div
                          key={box.key}
                          onClick={() => {
                            setActiveMediaModule(box.key);
                            setShowMediaAddForm(false);
                            setError(null);
                            setSuccess(null);
                          }}
                          className="bg-white rounded-lg border border-zinc-200 shadow-sm p-3 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer select-none hover:border-[#002f6c]/55 hover:shadow transition-all group min-h-[120px] sm:min-h-[135px] relative"
                        >
                          <span className="material-symbols-outlined text-[14px] text-zinc-400 absolute top-2.5 right-2.5 select-none group-hover:text-[#002f6c] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                            north_east
                          </span>
                          <div className="flex-1 flex items-center justify-center w-full mb-2 group-hover:scale-105 transition-transform duration-200">
                            {box.svg}
                          </div>
                          <span className="text-[11px] sm:text-xs font-bold text-zinc-800 group-hover:text-[#002f6c] transition-colors">
                            {box.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 text-left">
                    {/* Navigation Top Bar */}
                    <div className="flex items-center justify-between bg-[#F7F6F3] border border-zinc-200 rounded-lg p-2.5 sm:p-3 select-none gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <button 
                          onClick={() => {
                            setActiveMediaModule(null);
                            setShowMediaAddForm(false);
                            setError(null);
                            setSuccess(null);
                          }}
                          className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-zinc-200 text-zinc-700 hover:text-[#002f6c] transition-colors cursor-pointer shrink-0"
                          title="Back"
                        >
                          <span className="material-icons text-lg font-bold">arrow_back</span>
                        </button>
                        <div className="h-5 w-px bg-zinc-300 shrink-0" />
                        <h3 className="text-[10px] sm:text-xs font-black text-zinc-800 uppercase tracking-wider truncate">
                          {activeMediaModule === "social" && "Social Media"}
                          {activeMediaModule === "videos" && "Student Videos"}
                          {activeMediaModule === "finance" && "Financial Register"}
                          {activeMediaModule === "problems" && "Problem Register"}
                          {activeMediaModule === "documents" && "Documents"}
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          setShowMediaAddForm(!showMediaAddForm);
                          setError(null);
                          setSuccess(null);
                        }}
                        className="flex items-center gap-1 py-1 px-2.5 sm:px-3 bg-[#002f6c] hover:bg-[#002352] text-white rounded text-[9px] sm:text-[10px] font-bold shadow-sm transition-colors uppercase tracking-wider shrink-0"
                      >
                        <span className="material-icons text-xs sm:text-sm font-bold">{showMediaAddForm ? "close" : "add"}</span>
                        {showMediaAddForm ? "Cancel" : "Add Record"}
                      </button>
                    </div>

                    {/* ──── MEDIA FORMS ──── */}
                    {showMediaAddForm && (
                      <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm max-w-xl mx-auto select-none">
                        <h3 className="text-sm font-extrabold text-zinc-850 mb-4 pb-2 border-b border-zinc-100 flex items-center gap-1.5 uppercase tracking-wide">
                          <span className="material-icons text-base text-[#002f6c]">playlist_add</span>
                          Add New Record
                        </h3>

                        {/* 1. SOCIAL MEDIA FORM */}
                        {activeMediaModule === "social" && (
                          <form onSubmit={handleAddSocial} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Date</label>
                                <input type="date" required value={smDate} onChange={(e) => setSmDate(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#002f6c]" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Platform</label>
                                <select value={smPlatform} onChange={(e) => setSmPlatform(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#002f6c]">
                                  <option value="Facebook">Facebook</option>
                                  <option value="Instagram">Instagram</option>
                                  <option value="YouTube">YouTube</option>
                                  <option value="WhatsApp">WhatsApp</option>
                                  <option value="Twitter/X">Twitter/X</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-zinc-600 mb-1">Post Title</label>
                              <input type="text" required placeholder="e.g. Scout Jamboree Launch Post" value={smTitle} onChange={(e) => setSmTitle(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Reach</label>
                                <input type="number" required placeholder="e.g. 1500" value={smReach} onChange={(e) => setSmReach(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Likes</label>
                                <input type="number" required placeholder="e.g. 240" value={smLikes} onChange={(e) => setSmLikes(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-zinc-600 mb-1">Post Link (URL)</label>
                              <input type="url" required placeholder="https://..." value={smLink} onChange={(e) => setSmLink(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                            </div>
                            <button type="submit" className="w-full py-2 bg-[#002f6c] hover:bg-[#002352] text-white text-xs font-bold rounded shadow transition-colors">Submit Record</button>
                          </form>
                        )}

                        {/* 2. STUDENT VIDEOS FORM */}
                        {activeMediaModule === "videos" && (
                          <form onSubmit={handleAddVideo} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Date</label>
                                <input type="date" required value={svDate} onChange={(e) => setSvDate(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">School</label>
                                <select required value={svSchool} onChange={(e) => setSvSchool(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-xs focus:outline-none">
                                  <option value="">-- Choose School --</option>
                                  {registeredSchools.map((sch) => (
                                    <option key={sch.id} value={sch.schoolName}>{sch.schoolName}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Video Title</label>
                                <input type="text" required placeholder="e.g. Uniform Knots Training" value={svTitle} onChange={(e) => setSvTitle(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Platform</label>
                                <select value={svPlatform} onChange={(e) => setSvPlatform(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-xs focus:outline-none">
                                  <option value="YouTube">YouTube</option>
                                  <option value="Google Drive">Google Drive</option>
                                  <option value="Instagram">Instagram</option>
                                  <option value="Local File">Local File</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Views</label>
                                <input type="number" required placeholder="e.g. 500" value={svViews} onChange={(e) => setSvViews(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Likes</label>
                                <input type="number" required placeholder="e.g. 85" value={svLikes} onChange={(e) => setSvLikes(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-zinc-600 mb-1">Video Link (URL)</label>
                              <input type="url" required placeholder="https://..." value={svLink} onChange={(e) => setSvLink(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                            </div>
                            <button type="submit" className="w-full py-2 bg-[#002f6c] hover:bg-[#002352] text-white text-xs font-bold rounded shadow transition-colors">Submit Record</button>
                          </form>
                        )}

                        {/* 3. FINANCIAL REGISTER FORM */}
                        {activeMediaModule === "finance" && (
                          <form onSubmit={handleAddFinance} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Date</label>
                                <input type="date" required value={finDate} onChange={(e) => setFinDate(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Type</label>
                                <select value={finType} onChange={(e) => setFinType(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-xs focus:outline-none">
                                  <option value="Income">Income / Credit</option>
                                  <option value="Expense">Expense / Debit</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Head / Particulars</label>
                                <input type="text" required placeholder="e.g. Scout Camp Uniforms" value={finHead} onChange={(e) => setFinHead(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Amount (₹)</label>
                                <input type="number" required step="any" placeholder="e.g. 4500" value={finAmount} onChange={(e) => setFinAmount(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-zinc-600 mb-1">Remarks</label>
                              <input type="text" placeholder="Remarks (optional)" value={finRemarks} onChange={(e) => setFinRemarks(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                            </div>

                            {/* Drag & Drop File Zone */}
                            <div>
                              <label className="block text-xs font-bold text-zinc-600 mb-1.5">Bill Upload (Drag & Drop)</label>
                              <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDragging(false);
                                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    setFinBillUploaded(e.dataTransfer.files[0].name);
                                  }
                                }}
                                className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center transition-all ${
                                  isDragging ? "border-[#002f6c] bg-[#002f6c]/5 scale-[0.99]" : "border-zinc-300 hover:border-zinc-400 bg-zinc-50"
                                }`}
                              >
                                <span className="material-icons text-2xl text-zinc-400 mb-1">receipt_long</span>
                                <p className="text-[10px] font-bold text-zinc-600">Drag & drop your receipt bill here or</p>
                                <label className="text-[10px] font-black text-[#002f6c] hover:underline cursor-pointer mt-0.5">
                                  Browse Files
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        setFinBillUploaded(e.target.files[0].name);
                                      }
                                    }}
                                  />
                                </label>
                                {finBillUploaded && (
                                  <div className="mt-2.5 flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-250">
                                    <span className="material-icons text-xs">check_circle</span>
                                    {finBillUploaded}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button type="submit" className="w-full py-2 bg-[#002f6c] hover:bg-[#002352] text-white text-xs font-bold rounded shadow transition-colors">Submit Financial Record</button>
                          </form>
                        )}

                        {/* 4. PROBLEM REGISTER FORM */}
                        {activeMediaModule === "problems" && (
                          <form onSubmit={handleAddProblem} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Date</label>
                                <input type="date" required value={probDate} onChange={(e) => setProbDate(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Category</label>
                                <select value={probCategory} onChange={(e) => setProbCategory(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-xs focus:outline-none">
                                  <option value="Infrastructure">Infrastructure</option>
                                  <option value="Materials Shortage">Materials Shortage</option>
                                  <option value="Attendance / Scouter">Attendance / Scouter</option>
                                  <option value="Administrative Support">Administrative Support</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-zinc-600 mb-1">Issue Description</label>
                              <textarea required placeholder="Explain the problem in detail..." value={probDescription} onChange={(e) => setProbDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Support Required</label>
                                <select value={probSupportRequired} onChange={(e) => setProbSupportRequired(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-xs focus:outline-none">
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                  <option value="Pending">Pending</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Status</label>
                                <select value={probStatus} onChange={(e) => setProbStatus(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-xs focus:outline-none">
                                  <option value="Open">Open</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Resolved">Resolved</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Raised By</label>
                                <input type="text" required placeholder="Name / Designation" value={probRaisedBy} onChange={(e) => setProbRaisedBy(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                              </div>
                            </div>
                            <button type="submit" className="w-full py-2 bg-[#002f6c] hover:bg-[#002352] text-white text-xs font-bold rounded shadow transition-colors">Submit Issue</button>
                          </form>
                        )}

                        {/* 5. DOCUMENTS FORM */}
                        {activeMediaModule === "documents" && (
                          <form onSubmit={handleAddDocument} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Date</label>
                                <input type="date" required value={docDate} onChange={(e) => setDocDate(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Category</label>
                                <select value={docCategory} onChange={(e) => setDocCategory(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded text-xs focus:outline-none">
                                  <option value="Syllabus">Syllabus</option>
                                  <option value="Circular">Circular</option>
                                  <option value="Permission Letter">Permission Letter</option>
                                  <option value="Reporting Form">Reporting Form</option>
                                  <option value="Scout Photos">Scout Photos</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Document Title</label>
                                <input type="text" required placeholder="e.g. Scouting Syllabus 2026" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-zinc-600 mb-1">Uploaded By</label>
                                <input type="text" required placeholder="Employee Name / Email" value={docUploadedBy} onChange={(e) => setDocUploadedBy(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-zinc-600 mb-1">Reference / Link (URL or dropped filename)</label>
                              <input type="text" placeholder="https://... or auto-filled by drop" value={docLink} onChange={(e) => setDocLink(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded text-xs focus:outline-none" />
                            </div>

                            {/* Drag & Drop Zone */}
                            <div>
                              <label className="block text-xs font-bold text-zinc-600 mb-1.5">Upload Document File (Drag & Drop)</label>
                              <div
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDragging(false);
                                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    const f = e.dataTransfer.files[0];
                                    setDocLink(f.name);
                                  }
                                }}
                                className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center transition-all ${
                                  isDragging ? "border-[#002f6c] bg-[#002f6c]/5 scale-[0.99]" : "border-zinc-300 hover:border-zinc-400 bg-zinc-50"
                                }`}
                              >
                                <span className="material-icons text-2xl text-zinc-400 mb-1">description</span>
                                <p className="text-[10px] font-bold text-zinc-600">Drag & drop your document file here or</p>
                                <label className="text-[10px] font-black text-[#002f6c] hover:underline cursor-pointer mt-0.5">
                                  Browse Files
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        setDocLink(e.target.files[0].name);
                                      }
                                    }}
                                  />
                                </label>
                                {docLink && (
                                  <div className="mt-2.5 flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-250">
                                    <span className="material-icons text-xs">check_circle</span>
                                    {docLink}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button type="submit" className="w-full py-2 bg-[#002f6c] hover:bg-[#002352] text-white text-xs font-bold rounded shadow transition-colors">Submit Document</button>
                          </form>
                        )}
                      </div>
                    )}

                    {/* ──── MEDIA TABLES/LISTS ──── */}
                    {!showMediaAddForm && (
                      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-4 overflow-x-auto select-none">
                        {/* 1. SOCIAL MEDIA LOGS */}
                        {activeMediaModule === "social" && (
                          <>
                            <h4 className="text-xs font-bold text-zinc-800 mb-3 uppercase tracking-wide">Social Media Logged Records ({socialList.length})</h4>
                            {socialList.length === 0 ? (
                              <div className="py-8 text-center text-zinc-400 text-xs">No social media records found.</div>
                            ) : (
                              <table className="min-w-full divide-y divide-zinc-200 text-left text-xs">
                                <thead className="bg-zinc-50 font-extrabold text-[10px] uppercase text-zinc-500 tracking-wider">
                                  <tr>
                                    <th className="px-3 py-2">Date</th>
                                    <th className="px-3 py-2">Platform</th>
                                    <th className="px-3 py-2">Post Title</th>
                                    <th className="px-3 py-2">Reach</th>
                                    <th className="px-3 py-2">Likes</th>
                                    <th className="px-3 py-2">Link</th>
                                    <th className="px-3 py-2">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 bg-white font-medium text-zinc-700">
                                  {socialList.map((item) => (
                                    <tr key={item.id}>
                                      <td className="px-3 py-2.5 whitespace-nowrap">{item.date}</td>
                                      <td className="px-3 py-2.5">
                                        <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">{item.platform}</span>
                                      </td>
                                      <td className="px-3 py-2.5 font-bold text-zinc-900">{item.postTitle}</td>
                                      <td className="px-3 py-2.5">{item.reach}</td>
                                      <td className="px-3 py-2.5">{item.likes}</td>
                                      <td className="px-3 py-2.5 truncate max-w-[150px]"><a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.link}</a></td>
                                      <td className="px-3 py-2.5">
                                        <button onClick={() => handleDeleteSocial(item.id)} className="text-rose-600 hover:text-rose-800 hover:underline text-[10px] font-bold">Delete</button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </>
                        )}

                        {/* 2. STUDENT VIDEOS LOGS */}
                        {activeMediaModule === "videos" && (
                          <>
                            <h4 className="text-xs font-bold text-zinc-800 mb-3 uppercase tracking-wide">Student Videos Recorded ({videosList.length})</h4>
                            {videosList.length === 0 ? (
                              <div className="py-8 text-center text-zinc-400 text-xs">No video records found.</div>
                            ) : (
                              <table className="min-w-full divide-y divide-zinc-200 text-left text-xs">
                                <thead className="bg-zinc-50 font-extrabold text-[10px] uppercase text-zinc-500 tracking-wider">
                                  <tr>
                                    <th className="px-3 py-2">Date</th>
                                    <th className="px-3 py-2">School</th>
                                    <th className="px-3 py-2">Video Title</th>
                                    <th className="px-3 py-2">Platform</th>
                                    <th className="px-3 py-2">Views</th>
                                    <th className="px-3 py-2">Likes</th>
                                    <th className="px-3 py-2">Video Link</th>
                                    <th className="px-3 py-2">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 bg-white font-medium text-zinc-700">
                                  {videosList.map((item) => (
                                    <tr key={item.id}>
                                      <td className="px-3 py-2.5 whitespace-nowrap">{item.date}</td>
                                      <td className="px-3 py-2.5 font-bold text-zinc-900">{item.school}</td>
                                      <td className="px-3 py-2.5">{item.title}</td>
                                      <td className="px-3 py-2.5">
                                        <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-250 uppercase">{item.platform}</span>
                                      </td>
                                      <td className="px-3 py-2.5">{item.views}</td>
                                      <td className="px-3 py-2.5">{item.likes}</td>
                                      <td className="px-3 py-2.5 truncate max-w-[150px]"><a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{item.link}</a></td>
                                      <td className="px-3 py-2.5">
                                        <button onClick={() => handleDeleteVideo(item.id)} className="text-rose-600 hover:text-rose-800 hover:underline text-[10px] font-bold">Delete</button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </>
                        )}

                        {/* 3. FINANCIAL REGISTER LOGS */}
                        {activeMediaModule === "finance" && (
                          <>
                            <h4 className="text-xs font-bold text-zinc-800 mb-3 uppercase tracking-wide">Financial Register Ledgers ({financeList.length})</h4>
                            {financeList.length === 0 ? (
                              <div className="py-8 text-center text-zinc-400 text-xs">No financial records found.</div>
                            ) : (
                              <table className="min-w-full divide-y divide-zinc-200 text-left text-xs">
                                <thead className="bg-zinc-50 font-extrabold text-[10px] uppercase text-zinc-500 tracking-wider">
                                  <tr>
                                    <th className="px-3 py-2">Date</th>
                                    <th className="px-3 py-2">Head / Particulars</th>
                                    <th className="px-3 py-2">Type</th>
                                    <th className="px-3 py-2">Amount</th>
                                    <th className="px-3 py-2">Bill Uploaded</th>
                                    <th className="px-3 py-2">Remarks</th>
                                    <th className="px-3 py-2">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 bg-white font-medium text-zinc-700">
                                  {financeList.map((item) => (
                                    <tr key={item.id}>
                                      <td className="px-3 py-2.5 whitespace-nowrap">{item.date}</td>
                                      <td className="px-3 py-2.5 font-bold text-zinc-900">{item.head}</td>
                                      <td className="px-3 py-2.5">
                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                          item.type === "Income" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                                        }`}>
                                          {item.type}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2.5 font-extrabold">₹{item.amount}</td>
                                      <td className="px-3 py-2.5 text-zinc-500 font-mono text-[10px]">{item.billUrl || "N/A"}</td>
                                      <td className="px-3 py-2.5 text-zinc-500">{item.remarks || "-"}</td>
                                      <td className="px-3 py-2.5">
                                        <button onClick={() => handleDeleteFinance(item.id)} className="text-rose-600 hover:text-rose-800 hover:underline text-[10px] font-bold">Delete</button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </>
                        )}

                        {/* 4. PROBLEM REGISTER LOGS */}
                        {activeMediaModule === "problems" && (
                          <>
                            <h4 className="text-xs font-bold text-zinc-800 mb-3 uppercase tracking-wide">Problems Reported Logs ({problemsList.length})</h4>
                            {problemsList.length === 0 ? (
                              <div className="py-8 text-center text-zinc-400 text-xs">No problem logs found.</div>
                            ) : (
                              <table className="min-w-full divide-y divide-zinc-200 text-left text-xs">
                                <thead className="bg-zinc-50 font-extrabold text-[10px] uppercase text-zinc-500 tracking-wider">
                                  <tr>
                                    <th className="px-3 py-2">Date</th>
                                    <th className="px-3 py-2">Category</th>
                                    <th className="px-3 py-2">Issue Description</th>
                                    <th className="px-3 py-2">Support Required</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Raised By</th>
                                    <th className="px-3 py-2">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 bg-white font-medium text-zinc-700">
                                  {problemsList.map((item) => (
                                    <tr key={item.id}>
                                      <td className="px-3 py-2.5 whitespace-nowrap">{item.date}</td>
                                      <td className="px-3 py-2.5">
                                        <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#800020]/10 text-[#800020] border border-[#800020]/20 uppercase">{item.category}</span>
                                      </td>
                                      <td className="px-3 py-2.5 text-zinc-800">{item.description}</td>
                                      <td className="px-3 py-2.5">
                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold ${item.supportRequired === "Yes" ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-zinc-100 text-zinc-550"}`}>{item.supportRequired}</span>
                                      </td>
                                      <td className="px-3 py-2.5">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                          item.status === "Resolved" ? "bg-emerald-50 text-emerald-800 border border-emerald-250" :
                                          item.status === "In Progress" ? "bg-blue-50 text-blue-800 border border-blue-200" :
                                          "bg-rose-50 text-rose-805 border border-rose-200"
                                        }`}>{item.status}</span>
                                      </td>
                                      <td className="px-3 py-2.5">{item.raisedBy}</td>
                                      <td className="px-3 py-2.5">
                                        <button onClick={() => handleDeleteProblem(item.id)} className="text-rose-600 hover:text-rose-800 hover:underline text-[10px] font-bold">Delete</button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </>
                        )}

                        {/* 5. DOCUMENTS LOGS */}
                        {activeMediaModule === "documents" && (
                          <>
                            <h4 className="text-xs font-bold text-zinc-800 mb-3 uppercase tracking-wide">Scout Documents Repository ({documentsList.length})</h4>
                            {documentsList.length === 0 ? (
                              <div className="py-8 text-center text-zinc-400 text-xs">No documents registered.</div>
                            ) : (
                              <table className="min-w-full divide-y divide-zinc-200 text-left text-xs">
                                <thead className="bg-zinc-50 font-extrabold text-[10px] uppercase text-zinc-500 tracking-wider">
                                  <tr>
                                    <th className="px-3 py-2">Date</th>
                                    <th className="px-3 py-2">Document Title</th>
                                    <th className="px-3 py-2">Category</th>
                                    <th className="px-3 py-2">Reference / Link</th>
                                    <th className="px-3 py-2">Uploaded By</th>
                                    <th className="px-3 py-2">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 bg-white font-medium text-zinc-700">
                                  {documentsList.map((item) => (
                                    <tr key={item.id}>
                                      <td className="px-3 py-2.5 whitespace-nowrap">{item.date}</td>
                                      <td className="px-3 py-2.5 font-bold text-zinc-900">{item.title}</td>
                                      <td className="px-3 py-2.5">
                                        <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-800 border border-purple-200 uppercase">{item.category}</span>
                                      </td>
                                      <td className="px-3 py-2.5 text-blue-600 max-w-[180px] truncate">
                                        {item.link && (item.link.startsWith("http://") || item.link.startsWith("https://")) ? (
                                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.link}</a>
                                        ) : (
                                          <span className="font-mono text-[10px] text-zinc-500">{item.link}</span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2.5">{item.uploadedBy}</td>
                                      <td className="px-3 py-2.5">
                                        <button onClick={() => handleDeleteDocument(item.id)} className="text-rose-600 hover:text-rose-800 hover:underline text-[10px] font-bold">Delete</button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
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

      {/* Module Details Modal Overlay */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg border border-zinc-200 w-full max-w-md p-6 relative overflow-hidden select-none">
            {/* Top Right Close Button */}
            <button 
              onClick={() => setSelectedModule(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1 hover:bg-zinc-100 rounded-full transition-colors flex items-center justify-center cursor-pointer"
            >
              <span className="material-icons text-xl select-none">close</span>
            </button>

            {/* Icon */}
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${selectedModule.color.split(" ")[1]} ${selectedModule.color.split(" ")[2]} mb-4`}>
              <span className={`material-symbols-outlined text-2xl ${selectedModule.color.split(" ")[0]}`}>{selectedModule.icon}</span>
            </div>

            {/* Content */}
            <h3 className="text-base font-extrabold text-zinc-950 leading-tight mb-2">
              {selectedModule.title}
            </h3>
            <p className="text-xs text-zinc-500 font-semibold mb-6">
              {selectedModule.description}
            </p>

            <div className="bg-[#e8eaf6]/40 border border-zinc-200/50 rounded-lg p-3 text-[11px] text-zinc-655 font-semibold leading-relaxed flex gap-2">
              <span className="material-icons text-base text-[#002f6c] shrink-0 select-none">info</span>
              <span>This class management module is currently being configured for your state association credentials. Live reporting data will sync automatically.</span>
            </div>

            {/* Close action */}
            <button 
              onClick={() => setSelectedModule(null)}
              className="w-full mt-6 py-2.5 bg-[#002f6c] hover:bg-[#002352] text-white text-xs font-bold rounded-md transition-colors shadow-sm cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
