"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface GoogleCredentialResponse {
  credential: string;
}

interface SavedEmployee {
  id: string;
  name: string;
  email: string;
  gender: string;
  password?: string;
}

type GoogleWindow = typeof window & {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (res: GoogleCredentialResponse) => void;
        }) => void;
        renderButton: (
          el: HTMLElement,
          opts: {
            theme: string;
            size: string;
            width: number;
            text: string;
            shape: string;
          }
        ) => void;
      };
    };
  };
};

export default function AdminPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Verification & reset password state hooks
  const [resetStep, setResetStep] = useState<"login" | "otp" | "reset">("login");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Tab Navigation state
  const [activeTab, setActiveTab] = useState<"overview" | "add-employee" | "schools" | "settings" | "timetable">("overview");

  // Schools state
  const [schools, setSchools] = useState<any[]>([]);
  const [isFetchingSchools, setIsFetchingSchools] = useState(false);
  const [showAddSchoolForm, setShowAddSchoolForm] = useState(false);
  const [isSavingSchool, setIsSavingSchool] = useState(false);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
  const [showSchoolExportMenu, setShowSchoolExportMenu] = useState(false);

  // Edit Employee state
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [editEmployeeName, setEditEmployeeName] = useState("");
  const [editEmployeeEmail, setEditEmployeeEmail] = useState("");
  const [editEmployeeGender, setEditEmployeeGender] = useState("");
  const [isUpdatingEmployee, setIsUpdatingEmployee] = useState(false);

  // Edit School state
  const [editingSchool, setEditingSchool] = useState<any | null>(null);

  // Timetable state
  const [timetable, setTimetable] = useState<any[]>([]);
  const [isFetchingTimetable, setIsFetchingTimetable] = useState(false);
  const [editingTimetableEntry, setEditingTimetableEntry] = useState<any | null>(null);
  const [isUpdatingTimetable, setIsUpdatingTimetable] = useState(false);

  // New School Form values
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolDistrict, setSchoolDistrict] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [principalPhone, setPrincipalPhone] = useState("");
  const [scoutInchargeName, setScoutInchargeName] = useState("");
  const [scoutInchargePhone, setScoutInchargePhone] = useState("");
  const [petName, setPetName] = useState("");
  const [petPhone, setPetPhone] = useState("");
  const [scoutingStarted, setScoutingStarted] = useState("");
  const [uniformsDistributed, setUniformsDistributed] = useState("");
  const [scarfsDistributed, setScarfsDistributed] = useState("");
  const [scoutMasterName, setScoutMasterName] = useState("");
  const [praveshikaRegisteredStudents, setPraveshikaRegisteredStudents] = useState("");
  const [praveshikaExamDate, setPraveshikaExamDate] = useState("");
  const [komalPadhRegisteredStudents, setKomalPadhRegisteredStudents] = useState("");
  const [komalPadhExamDate, setKomalPadhExamDate] = useState("");
  const [dhruvPadhRegisteredStudents, setDhruvPadhRegisteredStudents] = useState("");
  const [dhruvPadhExamDate, setDhruvPadhExamDate] = useState("");
  const [guruPadhRegisteredStudents, setGuruPadhRegisteredStudents] = useState("");
  const [guruPadhExamDate, setGuruPadhExamDate] = useState("");
  const [rajyaPuraskar, setRajyaPuraskar] = useState("");

  // Admin Profile state
  const [adminName, setAdminName] = useState("");
  const [adminDesignation, setAdminDesignation] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");

  // Employee Form state
  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeeGender, setEmployeeGender] = useState("");
  const [addedEmployee, setAddedEmployee] = useState<SavedEmployee | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Employees List state (for Overview Table)
  const [employees, setEmployees] = useState<SavedEmployee[]>([]);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);
  const [viewingEmployeeProfile, setViewingEmployeeProfile] = useState<any | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  const handleViewEmployeeDetails = async (empId: string) => {
    setIsFetchingProfile(true);
    try {
      const res = await fetch(`/api/employee/profile?id=${encodeURIComponent(empId)}`);
      if (!res.ok) throw new Error("Failed to fetch employee details.");
      const data = await res.json();
      setViewingEmployeeProfile(data);
    } catch (err) {
      console.error("View employee details error:", err);
      alert("Error fetching employee profile details.");
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const handleCredentialResponse = useCallback((response: GoogleCredentialResponse) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Decode the base64 URL encoded JWT token payload returned by Google
      const credential = response.credential;
      const base64Url = credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      const googleEmail = payload.email;

      if (typeof window !== "undefined") {
        localStorage.setItem("adminEmail", googleEmail);
      }

      setTimeout(() => {
        setIsLoading(false);
        setEmail(googleEmail);
        setSuccess("Google Authentication successful.");
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      setError("Failed to decode Google account profile data.");
      console.error(err);
    }
  }, []);

  const initializeGoogleSignIn = useCallback(() => {
    if (typeof window !== "undefined") {
      const gWindow = window as unknown as GoogleWindow;
      if (gWindow.google) {
        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1090382348508-3kfl97f58slad8bnd932d0asjdfp283d.apps.googleusercontent.com";
        gWindow.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
        });

        const btnElement = document.getElementById("google-signin-btn");
        if (btnElement) {
          gWindow.google.accounts.id.renderButton(btnElement, {
            theme: "outline",
            size: "large",
            width: 320,
            text: "signin_with",
            shape: "rectangular",
          });
        }
      }
    }
  }, [handleCredentialResponse]);

  // Synchronize local session storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("adminEmail");
      setTimeout(() => {
        setEmail(storedEmail);
        setIsChecking(false);
      }, 0);

      // Dynamically load Google GSI script if no session is stored
      if (!storedEmail) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        document.body.appendChild(script);
      }
    }
  }, [initializeGoogleSignIn]);

  // Poll for google SDK availability once GSI loads and the sign-in element renders
  useEffect(() => {
    if (!email && !isChecking) {
      const interval = setInterval(() => {
        if (typeof window !== "undefined") {
          const gWindow = window as unknown as GoogleWindow;
          if (gWindow.google) {
            initializeGoogleSignIn();
            clearInterval(interval);
          }
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [email, isChecking, initializeGoogleSignIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formEmail, password: formPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("adminEmail", formEmail);
      }
      setEmail(formEmail);
      setSuccess("Authentication successful. Loading portal...");
      setFormEmail("");
      setFormPassword("");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected authentication error occurred.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formEmail) {
      setError("Please enter your email address first to reset your password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Password reset failed.");
      }

      setSuccess(data.message || `A password reset passcode has been sent to ${formEmail}.`);
      setResetStep("otp");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to process forgot-password request.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formEmail, otp: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed.");
      }

      setSuccess("Verification successful. Create your new password.");
      setResetStep("reset");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "OTP verification failed.";
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
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formEmail,
          otp: otpCode,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Password reset failed.");
      }

      setSuccess("Password updated successfully. Please log in with your new credentials.");
      setResetStep("login");
      setOtpCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Password reset failed.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchools = async () => {
    setIsFetchingSchools(true);
    try {
      const res = await fetch("/api/admin/schools");
      const data = await res.json();
      if (res.ok) {
        setSchools(data);
      }
    } catch (err) {
      console.error("Error loading schools list:", err);
    } finally {
      setIsFetchingSchools(false);
    }
  };

  const handleExportCSV = () => {
    if (employees.length === 0) return;
    const headers = ["Employee ID", "Name", "Email Address", "Gender", "Status"];
    const rows = employees.map(emp => [emp.id, emp.name, emp.email, emp.gender, "Active"]);
    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "HSGA_Telangana_Employee_Directory.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (employees.length === 0) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const html = `
        <html>
          <head>
            <title>HSGA Telangana Employee List</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 40px; color: #1f2937; }
              .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #002f6c; padding-bottom: 20px; margin-bottom: 30px; }
              .logo { height: 70px; width: auto; object-fit: contain; }
              .title-group { line-height: 1.25; }
              .title { font-size: 24px; font-weight: 800; color: #002f6c; text-transform: uppercase; }
              .subtitle { font-size: 14px; font-weight: 600; color: #800020; margin-top: 4px; letter-spacing: 1px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #e5e7eb; padding: 12px 16px; text-align: left; font-size: 12px; }
              th { background-color: #002f6c; color: white; font-weight: bold; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
              tr:nth-child(even) { background-color: #f9fafb; }
              .status-badge { display: inline-flex; items-center; gap: 4px; color: #059669; font-weight: bold; }
              .footer { margin-top: 60px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title-group">
                <div class="title">Hindustan Scouts & Guides Association</div>
                <div class="subtitle">Telangana State Association</div>
              </div>
              <img src="https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png" class="logo" />
            </div>
            
            <h3 style="color: #374151; font-size: 16px; font-weight: 700; margin-bottom: 15px;">Active Employee List Report</h3>
            
            <table>
              <thead>
                <tr>
                  <th style="width: 25%;">Employee ID</th>
                  <th style="width: 25%;">Full Name</th>
                  <th style="width: 25%;">Registered Email</th>
                  <th style="width: 15%;">Gender</th>
                  <th style="width: 10%;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${employees.map(emp => `
                  <tr>
                    <td style="font-family: monospace; font-weight: bold; color: #111827;">${emp.id}</td>
                    <td style="font-weight: 600; color: #111827;">${emp.name}</td>
                    <td style="color: #4b5563;">${emp.email}</td>
                    <td style="color: #4b5563;">${emp.gender}</td>
                    <td>
                      <span class="status-badge">Active</span>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            
            <div class="footer">
              Report Generated on ${new Date().toLocaleString()} | Official Record of HSGA Telangana | Confidential Page 1 of 1
            </div>
            
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  const handleExportSchoolsCSV = () => {
    if (schools.length === 0) return;
    const headers = [
      "Name of the School", "Address", "District", "Principal Name", "Principal Ph.No",
      "Scout Incharge Name", "Scout Incharge Ph. No", "PET Name", "PET Ph. No",
      "Scouting Started", "No. of Uniforms Distributed", "No. of Scarfs Distributed",
      "Scout Master Name", "Praveshika Registered Students", "Praveshika Exam Date",
      "Komal Padh Registered Students", "Komal Padh Exam Date", "Dhruv Padh Registered Students",
      "Dhruv Padh Exam Date", "Guru Padh Registered Students", "Guru Padh Exam Date", "Rajya Puraskar"
    ];
    const rows = schools.map(sch => [
      sch.name, sch.address, sch.district, sch.principalName, sch.principalPhone,
      sch.scoutInchargeName, sch.scoutInchargePhone, sch.petName, sch.petPhone,
      sch.scoutingStarted, sch.uniformsDistributed, sch.scarfsDistributed,
      sch.scoutMasterName, sch.praveshikaRegisteredStudents, sch.praveshikaExamDate,
      sch.komalPadhRegisteredStudents, sch.komalPadhExamDate, sch.dhruvPadhRegisteredStudents,
      sch.dhruvPadhExamDate, sch.guruPadhRegisteredStudents, sch.guruPadhExamDate, sch.rajyaPuraskar
    ]);
    const csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "HSGA_Telangana_School_List.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSchoolsPDF = () => {
    if (schools.length === 0) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const html = `
        <html>
          <head>
            <title>HSGA Telangana School List</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 20px; color: #1f2937; }
              .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #002f6c; padding-bottom: 15px; margin-bottom: 20px; }
              .logo { height: 60px; width: auto; object-fit: contain; }
              .title-group { line-height: 1.25; }
              .title { font-size: 20px; font-weight: 800; color: #002f6c; text-transform: uppercase; }
              .subtitle { font-size: 12px; font-weight: 600; color: #800020; margin-top: 4px; letter-spacing: 1px; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th, td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; font-size: 10px; }
              th { background-color: #002f6c; color: white; font-weight: bold; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
              tr:nth-child(even) { background-color: #f9fafb; }
              .footer { margin-top: 40px; text-align: center; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title-group">
                <div class="title">Hindustan Scouts & Guides Association</div>
                <div class="subtitle">Telangana State Association</div>
              </div>
              <img src="https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png" class="logo" />
            </div>
            
            <h3 style="color: #374151; font-size: 14px; font-weight: 700; margin-bottom: 10px;">Registered School List Report</h3>
            
            <table>
              <thead>
                <tr>
                  <th style="width: 5%;">S.No</th>
                  <th style="width: 25%;">School Name</th>
                  <th style="width: 15%;">District</th>
                  <th style="width: 20%;">Principal Contact</th>
                  <th style="width: 20%;">Scout Incharge</th>
                  <th style="width: 15%;">Scouting Started</th>
                </tr>
              </thead>
              <tbody>
                ${schools.map((sch, index) => `
                  <tr>
                    <td style="font-weight: bold; text-align: center;">${index + 1}</td>
                    <td style="font-weight: 600; color: #111827;">${sch.name}</td>
                    <td>${sch.district}</td>
                    <td>${sch.principalName} (${sch.principalPhone})</td>
                    <td>${sch.scoutInchargeName} (${sch.scoutInchargePhone})</td>
                    <td>${sch.scoutingStarted}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            
            <div class="footer">
              Generated dynamically by HSGA TS Administration System on ${new Date().toLocaleDateString()}
            </div>
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  useEffect(() => {
    if (!showExportMenu) return;
    const handleClose = () => setShowExportMenu(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [showExportMenu]);

  useEffect(() => {
    if (!showSchoolExportMenu) return;
    const handleClose = () => setShowSchoolExportMenu(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, [showSchoolExportMenu]);

  // Load admin profile and employee list on mount
  useEffect(() => {
    if (email) {
      // Fetch Admin Profile
      fetch("/api/admin/profile")
        .then((res) => res.json())
        .then((data) => {
          setAdminName(data.name || "");
          setAdminDesignation(data.designation || "");
          setAdminPhone(data.phone || "");
          setAdminEmail(data.email || "webstrixx@gmail.com");
        })
        .catch((err) => console.error("Error loading admin profile:", err));

      // Fetch Employees asynchronously (microtask based to prevent cascading render warnings)
      const loadInitialEmployees = async () => {
        try {
          const res = await fetch("/api/admin/employees");
          const data = await res.json();
          if (res.ok) {
            setEmployees(data);
          }
        } catch (err) {
          console.error("Error loading employees list:", err);
        }
      };
      loadInitialEmployees();

      // Fetch Schools asynchronously
      const loadInitialSchools = async () => {
        try {
          const res = await fetch("/api/admin/schools");
          const data = await res.json();
          if (res.ok) {
            setSchools(data);
          }
        } catch (err) {
          console.error("Error loading schools list:", err);
        }
      };
      loadInitialSchools();

      // Fetch Timetable asynchronously
      const loadInitialTimetable = async () => {
        try {
          const res = await fetch("/api/admin/timetable");
          const data = await res.json();
          if (res.ok) {
            setTimetable(data);
          }
        } catch (err) {
          console.error("Error loading timetable:", err);
        }
      };
      loadInitialTimetable();
    }
  }, [email]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: adminName,
          designation: adminDesignation,
          phone: adminPhone,
          email: adminEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile settings.");
      }

      setSuccess("Profile settings updated successfully.");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to update profile settings.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newAdminPassword !== confirmAdminPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: adminName,
          designation: adminDesignation,
          phone: adminPhone,
          email: adminEmail,
          currentPassword,
          newPassword: newAdminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewAdminPassword("");
      setConfirmAdminPassword("");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to change password.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setAddedEmployee(null);

    if (!employeeGender) {
      setError("Please select a gender.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: employeeName,
          email: employeeEmail,
          gender: employeeGender,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register employee.");
      }

      setSuccess(`Employee ${employeeName} registered successfully!`);
      setAddedEmployee(data.employee);
      setEmployeeName("");
      setEmployeeEmail("");
      setEmployeeGender("");

      // Reload list asynchronously via simple microtask
      Promise.resolve().then(async () => {
        setIsFetchingEmployees(true);
        try {
          const res = await fetch("/api/admin/employees");
          const data = await res.json();
          if (res.ok) setEmployees(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsFetchingEmployees(false);
        }
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to register employee.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSchoolClick = (sch: any) => {
    setEditingSchool(sch);
    setSchoolName(sch.name);
    setSchoolAddress(sch.address);
    setSchoolDistrict(sch.district);
    setPrincipalName(sch.principalName);
    setPrincipalPhone(sch.principalPhone);
    setScoutInchargeName(sch.scoutInchargeName);
    setScoutInchargePhone(sch.scoutInchargePhone);
    setPetName(sch.petName);
    setPetPhone(sch.petPhone);
    setScoutingStarted(sch.scoutingStarted);
    setUniformsDistributed(String(sch.uniformsDistributed));
    setScarfsDistributed(String(sch.scarfsDistributed));
    setScoutMasterName(sch.scoutMasterName);
    setPraveshikaRegisteredStudents(String(sch.praveshikaRegisteredStudents));
    setPraveshikaExamDate(sch.praveshikaExamDate);
    setKomalPadhRegisteredStudents(String(sch.komalPadhRegisteredStudents));
    setKomalPadhExamDate(sch.komalPadhExamDate);
    setDhruvPadhRegisteredStudents(String(sch.dhruvPadhRegisteredStudents));
    setDhruvPadhExamDate(sch.dhruvPadhExamDate);
    setGuruPadhRegisteredStudents(String(sch.guruPadhRegisteredStudents));
    setGuruPadhExamDate(sch.guruPadhExamDate);
    setRajyaPuraskar(sch.rajyaPuraskar);

    setError(null);
    setSuccess(null);
    setShowAddSchoolForm(true);
  };

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Front-end validation that all fields must be filled
    if (
      !schoolName || !schoolAddress || !schoolDistrict || !principalName || !principalPhone ||
      !scoutInchargeName || !scoutInchargePhone || !petName || !petPhone ||
      !scoutingStarted || !uniformsDistributed || !scarfsDistributed ||
      !scoutMasterName || !praveshikaRegisteredStudents || !praveshikaExamDate ||
      !komalPadhRegisteredStudents || !komalPadhExamDate ||
      !dhruvPadhRegisteredStudents || !dhruvPadhExamDate ||
      !guruPadhRegisteredStudents || !guruPadhExamDate ||
      !rajyaPuraskar
    ) {
      setError("Please fill out all fields. Every field is required.");
      return;
    }

    const payload = {
      id: editingSchool ? editingSchool.id : undefined,
      name: schoolName,
      address: schoolAddress,
      district: schoolDistrict,
      principalName,
      principalPhone,
      scoutInchargeName,
      scoutInchargePhone,
      petName,
      petPhone,
      scoutingStarted,
      uniformsDistributed,
      scarfsDistributed,
      scoutMasterName,
      praveshikaRegisteredStudents,
      praveshikaExamDate,
      komalPadhRegisteredStudents,
      komalPadhExamDate,
      dhruvPadhRegisteredStudents,
      dhruvPadhExamDate,
      guruPadhRegisteredStudents,
      guruPadhExamDate,
      rajyaPuraskar,
    };

    setIsSavingSchool(true);
    try {
      const res = await fetch("/api/admin/schools", {
        method: editingSchool ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save school.");
      }

      setSuccess(`School "${schoolName}" ${editingSchool ? "updated" : "registered"} successfully!`);
      // Clear form fields
      setSchoolName("");
      setSchoolAddress("");
      setSchoolDistrict("");
      setPrincipalName("");
      setPrincipalPhone("");
      setScoutInchargeName("");
      setScoutInchargePhone("");
      setPetName("");
      setPetPhone("");
      setScoutingStarted("");
      setUniformsDistributed("");
      setScarfsDistributed("");
      setScoutMasterName("");
      setPraveshikaRegisteredStudents("");
      setPraveshikaExamDate("");
      setKomalPadhRegisteredStudents("");
      setKomalPadhExamDate("");
      setDhruvPadhRegisteredStudents("");
      setDhruvPadhExamDate("");
      setGuruPadhRegisteredStudents("");
      setGuruPadhExamDate("");
      setRajyaPuraskar("");

      setEditingSchool(null);
      setShowAddSchoolForm(false);
      fetchSchools();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save school.");
    } finally {
      setIsSavingSchool(false);
    }
  };

  const handleDeleteSchoolClick = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete school "${name}"?`)) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/schools?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete school.");
      }
      setSuccess(`School "${name}" deleted successfully.`);
      fetchSchools();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete school.");
    }
  };

  const handleEditEmployeeClick = (emp: any) => {
    setEditingEmployee(emp);
    setEditEmployeeName(emp.name);
    setEditEmployeeEmail(emp.email);
    setEditEmployeeGender(emp.gender);
    setError(null);
    setSuccess(null);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setError(null);
    setSuccess(null);

    setIsUpdatingEmployee(true);
    try {
      const res = await fetch("/api/admin/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingEmployee.id,
          name: editEmployeeName,
          email: editEmployeeEmail,
          gender: editEmployeeGender,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update employee.");
      }

      setSuccess(`Employee "${editEmployeeName}" updated successfully.`);
      setEditingEmployee(null);

      // Reload employees list
      Promise.resolve().then(async () => {
        setIsFetchingEmployees(true);
        try {
          const res = await fetch("/api/admin/employees");
          const data = await res.json();
          if (res.ok) setEmployees(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsFetchingEmployees(false);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update employee.");
    } finally {
      setIsUpdatingEmployee(false);
    }
  };

  const handleDeleteEmployeeClick = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete employee "${name}"?`)) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/employees?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete employee.");
      }
      setSuccess(`Employee "${name}" deleted successfully.`);

      // Reload employees list
      Promise.resolve().then(async () => {
        setIsFetchingEmployees(true);
        try {
          const res = await fetch("/api/admin/employees");
          const data = await res.json();
          if (res.ok) setEmployees(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsFetchingEmployees(false);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete employee.");
    }
  };

  const fetchTimetable = async () => {
    setIsFetchingTimetable(true);
    try {
      const res = await fetch("/api/admin/timetable");
      const data = await res.json();
      if (res.ok) {
        setTimetable(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingTimetable(false);
    }
  };

  const handleEditTimetableClick = (row: any) => {
    setEditingTimetableEntry({ ...row });
    setError(null);
    setSuccess(null);
  };

  const handleUpdateTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimetableEntry) return;
    setError(null);
    setSuccess(null);

    setIsUpdatingTimetable(true);
    try {
      const res = await fetch("/api/admin/timetable", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTimetableEntry),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update timetable.");
      }

      setSuccess(`Time table for "${editingTimetableEntry.employeeName}" updated successfully.`);
      setEditingTimetableEntry(null);
      fetchTimetable();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update timetable.");
    } finally {
      setIsUpdatingTimetable(false);
    }
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminEmail");
    }
    setEmail(null);
    setError(null);
    setSuccess(null);
    setActiveTab("overview");
    setAddedEmployee(null);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8eaf6]">
        <div className="flex flex-col items-center gap-2">
          <span className="material-icons animate-spin text-3xl text-[#002f6c]">sync</span>
          <p className="text-sm font-semibold text-zinc-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  // Case 1: No admin session exists -> Display the Admin Login Form
  if (!email) {
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

        <div className="flex-1 flex flex-col justify-center items-center px-4 py-16">
          <main className="w-full max-w-md">
            {/* Secure Login Card */}
            <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-8">
              <h2 className="text-xl font-bold text-zinc-800 mb-1 text-center">
                Admin
              </h2>
              <p className="text-xs text-zinc-500 mb-6 text-center">
                HSGA Telangana Gateway
              </p>

              {/* Status Messages */}
              {error && (
                <div className="mb-5 p-3.5 border-l-4 border-rose-600 bg-rose-50 text-rose-950 text-xs font-semibold flex items-start gap-2.5">
                  <span className="material-icons text-base text-rose-600 shrink-0 select-none">error_outline</span>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-5 p-3.5 border-l-4 border-emerald-600 bg-emerald-50 text-emerald-950 text-xs font-semibold flex items-start gap-2.5">
                  <span className="material-icons text-base text-emerald-600 shrink-0 select-none">check_circle_outline</span>
                  <span>{success}</span>
                </div>
              )}

              {resetStep === "login" && (
                <>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Input */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-zinc-700 mb-1.5"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">
                          mail
                        </span>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="name@hsgatelangana.in"
                          autoComplete="username"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-md text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label
                          htmlFor="current-password"
                          className="text-sm font-medium text-zinc-700"
                        >
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-xs text-blue-700 hover:text-blue-800 underline focus:outline-none font-semibold"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">
                          lock
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          id="current-password"
                          name="current-password"
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
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

                    {/* Remember Me Option */}
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded border-zinc-300 text-[#002f6c] focus:ring-[#002f6c] bg-white"
                      />
                      <label
                        htmlFor="remember-me"
                        className="ml-2 text-xs font-semibold text-zinc-600"
                      >
                        Remember this device
                      </label>
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
                  </form>

                  {/* Social Divider */}
                  <div className="mt-6 relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-zinc-200" />
                    </div>
                    <div className="relative flex justify-center text-xs font-semibold uppercase">
                      <span className="bg-white px-3 text-zinc-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Real Google Auth (GSI) Button Integration */}
                  <div className="mt-4 flex justify-center">
                    <div id="google-signin-btn" className="w-full max-w-xs flex justify-center"></div>
                  </div>
                </>
              )}

              {resetStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="text-center mb-2">
                    <span className="material-icons text-4xl text-[#002f6c] select-none">mark_email_unread</span>
                    <p className="text-xs text-zinc-500 mt-1.5">
                      We sent a 6-digit verification code to <strong className="text-zinc-800">{formEmail}</strong>.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-zinc-700 mb-1.5"
                    >
                      Verification Code (OTP)
                    </label>
                    <div className="relative">
                      <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">
                        vpn_key
                      </span>
                      <input
                        type="text"
                        id="otp"
                        name="otp"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="123456"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-md text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] tracking-widest font-mono text-center font-bold transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setResetStep("login");
                        setOtpCode("");
                        setError(null);
                        setSuccess(null);
                      }}
                      className="w-1/2 flex justify-center items-center py-2.5 px-4 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-semibold rounded-md text-sm focus:outline-none transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-1/2 flex justify-center items-center py-2.5 px-4 bg-[#002f6c] hover:bg-[#002352] text-white font-semibold rounded-md text-sm focus:outline-none transition-colors disabled:opacity-50"
                    >
                      {isLoading ? "Verifying..." : "Verify Code"}
                    </button>
                  </div>
                </form>
              )}

              {resetStep === "reset" && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="text-center mb-2">
                    <span className="material-icons text-4xl text-emerald-600 select-none">lock_reset</span>
                    <p className="text-xs text-zinc-500 mt-1.5">
                      OTP verified. Create your new administrator password.
                    </p>
                  </div>

                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-sm font-medium text-zinc-700 mb-1.5"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">
                        lock_open
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="new-password"
                        name="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        required
                        className="w-full pl-10 pr-12 py-2.5 bg-white border border-zinc-300 rounded-md text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none p-1 flex items-center"
                      >
                        <span className="material-icons text-lg select-none">
                          {showNewPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="block text-sm font-medium text-zinc-700 mb-1.5"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <span className="material-icons text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 text-lg select-none">
                        lock
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirm-password"
                        name="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        required
                        className="w-full pl-10 pr-12 py-2.5 bg-white border border-zinc-300 rounded-md text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none p-1 flex items-center"
                      >
                        <span className="material-icons text-lg select-none">
                          {showConfirmPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setResetStep("login");
                        setNewPassword("");
                        setConfirmPassword("");
                        setError(null);
                        setSuccess(null);
                      }}
                      className="w-1/2 flex justify-center items-center py-2.5 px-4 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-semibold rounded-md text-sm focus:outline-none transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-1/2 flex justify-center items-center py-2.5 px-4 bg-[#002f6c] hover:bg-[#002352] text-white font-semibold rounded-md text-sm focus:outline-none transition-colors disabled:opacity-50"
                    >
                      {isLoading ? "Saving..." : "Save Password"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Case 2: Signed in, but NOT the admin email (webstrixx@gmail.com)
  if (email.toLowerCase() !== "webstrixx@gmail.com") {
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

        <div className="flex-1 flex flex-col justify-center items-center px-4">
          <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-8 max-w-md w-full text-center">
            <span className="material-icons text-5xl text-rose-500 mb-4 select-none">no_accounts</span>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">Not Registered</h2>
            <p className="text-sm text-zinc-500 mb-6">
              The account <strong className="text-zinc-800">{email}</strong> is not registered as an administrator on this system.
            </p>
            <button
              onClick={handleSignOut}
              className="w-full py-2.5 bg-[#002f6c] hover:bg-[#002352] text-white font-semibold rounded-md text-sm transition-colors shadow-sm"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Admin account is webstrixx@gmail.com
  return (
    <div className="h-screen flex flex-col bg-[#e8eaf6] text-zinc-900 font-sans antialiased overflow-hidden">
      {/* Compact Top Bar */}
      <header className="sticky top-0 z-40 bg-[#f3f4f6] border-b border-zinc-200 py-1 px-4 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png"
            alt="HSGA Logo"
            className="h-11 md:h-13 w-auto object-contain select-none"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] md:text-xs text-zinc-500">Namaste,</span>
            <span className="text-xs md:text-sm font-bold text-zinc-950 truncate max-w-[150px] sm:max-w-none">{adminName || email}</span>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="p-2 text-zinc-600 hover:text-[#800020] hover:bg-zinc-200/50 rounded-full transition-colors focus:outline-none flex items-center justify-center"
          >
            <span className="material-icons text-xl select-none">exit_to_app</span>
          </button>
        </div>
      </header>

      {/* Dashboard Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="hidden md:flex w-16 hover:w-60 bg-white border-r border-zinc-200 flex-col shrink-0 transition-all duration-300 ease-in-out group z-20 overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-center group-hover:justify-between min-h-[57px] shrink-0">
            <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase hidden group-hover:block transition-all duration-300 whitespace-nowrap select-none">
              Navigation
            </p>
            <span className="material-icons text-zinc-400 text-lg select-none shrink-0">menu</span>
          </div>
          <nav className="flex-1 p-3 space-y-2">
            <button
              onClick={() => {
                setActiveTab("overview");
                setError(null);
                setSuccess(null);
              }}
              title="Overview"
              className={`w-full flex items-center justify-center group-hover:justify-start gap-4 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${activeTab === "overview"
                  ? "bg-[#002f6c]/10 text-[#002f6c]"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                }`}
            >
              <span className="material-icons text-lg shrink-0">dashboard</span>
              <span className="hidden group-hover:inline-block transition-all duration-300 whitespace-nowrap overflow-hidden text-xs">
                Overview
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("add-employee");
                setError(null);
                setSuccess(null);
              }}
              title="Add Employee"
              className={`w-full flex items-center justify-center group-hover:justify-start gap-4 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${activeTab === "add-employee"
                  ? "bg-[#002f6c]/10 text-[#002f6c]"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                }`}
            >
              <span className="material-icons text-lg shrink-0">person_add</span>
              <span className="hidden group-hover:inline-block transition-all duration-300 whitespace-nowrap overflow-hidden text-xs">
                Add Employee
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("schools");
                setError(null);
                setSuccess(null);
              }}
              title="School List"
              className={`w-full flex items-center justify-center group-hover:justify-start gap-4 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors cursor-pointer ${activeTab === "schools"
                  ? "bg-[#002f6c]/10 text-[#002f6c]"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                }`}
            >
              <span className="material-icons text-lg shrink-0">domain</span>
              <span className="hidden group-hover:inline-block transition-all duration-300 whitespace-nowrap overflow-hidden text-xs">
                School List
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("timetable");
                setError(null);
                setSuccess(null);
              }}
              title="Time Table"
              className={`w-full flex items-center justify-center group-hover:justify-start gap-4 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors cursor-pointer ${activeTab === "timetable"
                  ? "bg-[#002f6c]/10 text-[#002f6c]"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                }`}
            >
              <span className="material-icons text-lg shrink-0">calendar_today</span>
              <span className="hidden group-hover:inline-block transition-all duration-300 whitespace-nowrap overflow-hidden text-xs">
                Time Table
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("settings");
                setError(null);
                setSuccess(null);
              }}
              title="Profile & Settings"
              className={`w-full flex items-center justify-center group-hover:justify-start gap-4 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${activeTab === "settings"
                  ? "bg-[#002f6c]/10 text-[#002f6c]"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                }`}
            >
              <span className="material-icons text-lg shrink-0">settings</span>
              <span className="hidden group-hover:inline-block transition-all duration-300 whitespace-nowrap overflow-hidden text-xs">
                Profile & Settings
              </span>
            </button>
          </nav>
          <div className="p-3.5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-center group-hover:justify-start gap-3 overflow-hidden min-h-[65px] shrink-0">
            <div className="h-8 w-8 rounded-full bg-[#002f6c]/10 text-[#002f6c] flex items-center justify-center font-bold text-xs shrink-0 select-none">
              {adminName ? adminName.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="min-w-0 hidden group-hover:block transition-all duration-300">
              <p className="text-xs font-semibold text-zinc-700 truncate">{adminDesignation || "System Administrator"}</p>
              <p className="text-[9px] text-zinc-400 font-mono mt-0.5 truncate">{email}</p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-[#e8eaf6] overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
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

            {/* TAB CONTENT: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Profile Incompletion Alert if details are missing */}
                {(!adminName || !adminDesignation || !adminPhone) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 flex items-start gap-4 shadow-sm animate-pulse">
                    <span className="material-icons text-3xl text-amber-600 shrink-0 select-none font-semibold">assignment_ind</span>
                    <div>
                      <h3 className="font-bold text-amber-900 text-sm">Complete Your Profile</h3>
                      <p className="text-xs text-amber-700 mt-1">Please ensure your administrator name, designation, and phone number are fully completed in the Profile & Settings tab.</p>
                    </div>
                  </div>
                )}

                {/* Employees Table Card */}
                <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
                    <div>
                      <h2 className="text-lg font-bold text-zinc-800">Overview & Directory</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">List of registered active employees for HSGA Telangana.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("add-employee")}
                      className="flex items-center gap-1.5 py-2 px-3 bg-[#002f6c] hover:bg-[#002352] text-white rounded text-xs font-semibold shadow-sm transition-colors"
                    >
                      <span className="material-icons text-sm select-none">add</span>
                      New Employee
                    </button>
                  </div>

                  {isFetchingEmployees ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <span className="material-icons animate-spin text-3xl text-[#002f6c] select-none">sync</span>
                      <p className="text-xs text-zinc-500 font-semibold">Loading directory records...</p>
                    </div>
                  ) : employees.length === 0 ? (
                    <div className="py-12 border border-dashed border-zinc-200 rounded-lg text-center">
                      <span className="material-icons text-4xl text-zinc-300 select-none">group</span>
                      <p className="text-sm font-semibold text-zinc-500 mt-2">No employee records registered yet.</p>
                      <button
                        onClick={() => setActiveTab("add-employee")}
                        className="mt-3 text-xs text-blue-700 hover:underline font-semibold"
                      >
                        Add your first employee to get started
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-zinc-100 rounded-md">
                      <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
                        <thead className="bg-zinc-50 text-xs font-bold text-zinc-500 uppercase tracking-wider select-none">
                          <tr>
                            <th className="px-5 py-3">Employee ID</th>
                            <th className="px-5 py-3">Name</th>
                            <th className="px-5 py-3">Email Address</th>
                            <th className="px-5 py-3">Gender</th>
                            <th className="px-5 py-3">Demo Password</th>
                            <th className="px-5 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 bg-white text-zinc-700">
                          {employees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="px-5 py-3.5 font-mono font-bold text-zinc-900 text-xs">{emp.id}</td>
                              <td className="px-5 py-3.5 font-semibold text-zinc-950">{emp.name}</td>
                              <td className="px-5 py-3.5 text-zinc-600">{emp.email}</td>
                              <td className="px-5 py-3.5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${emp.gender.toLowerCase() === "male"
                                    ? "bg-blue-50 text-blue-800"
                                    : "bg-purple-50 text-purple-800"
                                  }`}>
                                  {emp.gender}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 font-mono text-xs font-bold text-amber-600">{emp.password || "N/A"}</td>
                              <td className="px-5 py-3.5">
                                <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                  Active
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Add Employee */}
            {activeTab === "add-employee" && (() => {
              if (isFetchingProfile) {
                return (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 select-none">
                    <span className="material-icons animate-spin text-3xl text-[#002f6c]">sync</span>
                    <p className="text-sm font-semibold text-zinc-500">Loading profile details...</p>
                  </div>
                );
              }

              if (viewingEmployeeProfile) {
                const isMale = viewingEmployeeProfile.id.includes("SM");
                const roleTitle = viewingEmployeeProfile.designation || (isMale ? "Scout Master" : "Guide Captain");
                const genderLabel = viewingEmployeeProfile.gender || (isMale ? "Male" : "Female");

                return (
                  <div className="space-y-6">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-white border border-zinc-200 px-4 py-2.5 rounded-lg shadow-sm w-fit select-none">
                      <span className="material-icons text-sm text-zinc-400">home</span>
                      <span className="hover:text-zinc-700 cursor-pointer" onClick={() => { setActiveTab("overview"); setViewingEmployeeProfile(null); }}>Admin Portal</span>
                      <span className="material-icons text-[10px] text-zinc-400">chevron_right</span>
                      <span className="hover:text-zinc-700 cursor-pointer" onClick={() => setViewingEmployeeProfile(null)}>Employee List</span>
                      <span className="material-icons text-[10px] text-zinc-400">chevron_right</span>
                      <span className="text-[#002f6c] font-bold">{viewingEmployeeProfile.name}</span>
                    </div>

                    {/* Dynamic Detail Card & Identity Badge Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none animate-fade-in">
                      {/* Detailed Info (Left 7 Cols) */}
                      <div className="lg:col-span-7 bg-white border border-zinc-200 shadow-sm rounded-lg p-6 space-y-6">
                        <div className="pb-4 border-b border-zinc-100 flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-bold text-zinc-800">Employee Details</h2>
                            <p className="text-xs text-zinc-500 mt-0.5">Full administrative profile details for this record.</p>
                          </div>
                          <button
                            onClick={() => setViewingEmployeeProfile(null)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold rounded-lg text-xs transition-colors shadow-sm w-fit cursor-pointer"
                          >
                            <span className="material-icons text-xs">arrow_back</span>
                            Back to Directory
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Employee ID</span>
                            <p className="text-sm font-mono font-bold text-zinc-900 mt-0.5">{viewingEmployeeProfile.id}</p>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Full Name</span>
                            <p className="text-sm font-bold text-zinc-800 mt-0.5">{viewingEmployeeProfile.name}</p>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Email Address</span>
                            <p className="text-sm font-semibold text-zinc-700 mt-0.5 break-all">{viewingEmployeeProfile.email}</p>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Designation / Role</span>
                            <p className="text-sm font-bold text-[#002f6c] mt-0.5">{roleTitle}</p>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Gender</span>
                            <p className="text-sm font-semibold text-zinc-700 mt-0.5">{genderLabel}</p>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Phone Number</span>
                            <p className="text-sm font-semibold text-zinc-700 mt-0.5">{viewingEmployeeProfile.phone || "Not Configured"}</p>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Assigned School</span>
                            <p className="text-sm font-semibold text-zinc-700 mt-0.5">{viewingEmployeeProfile.assignedSchool || "None Assigned"}</p>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">District Jurisdiction</span>
                            <p className="text-sm font-semibold text-zinc-700 mt-0.5">{viewingEmployeeProfile.district || "Not Configured"}</p>
                          </div>

                          <div>
                             <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Demo / Assigned Password</span>
                             <p className="text-sm font-mono font-bold text-amber-600 mt-0.5">{viewingEmployeeProfile.password || "N/A"}</p>
                          </div>

                          <div className="md:col-span-2">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Permanent Address</span>
                            <p className="text-sm font-semibold text-zinc-700 mt-0.5 leading-relaxed">{viewingEmployeeProfile.address || "Not Configured"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Identity Badge Preview (Right 5 Cols) */}
                      <div className="lg:col-span-5 bg-white border border-zinc-200 shadow-sm rounded-lg p-6 flex flex-col justify-between space-y-4">
                        <div>
                          <h2 className="text-lg font-bold text-zinc-800">Digital Identity Card</h2>
                          <p className="text-xs text-zinc-500 mt-0.5">Verification badge layout generated for this employee.</p>
                        </div>

                        <div className="flex justify-center">
                          <div className="w-full max-w-md">
                            {/* Card shell */}
                            <div id="hsga-id-card" className="w-full aspect-[1.586/1] bg-white border border-zinc-300 rounded-lg shadow-md overflow-hidden flex flex-col font-sans relative">
                              {/* Header: Navy band */}
                              <div className="bg-[#002f6c] px-4 py-2.5 flex items-center gap-3 shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://res.cloudinary.com/dsqqrpzfl/image/upload/v1770199908/1769454781522_pgepvr.png" alt="Logo" className="h-10 w-auto object-contain bg-white p-0.5 rounded-full" />
                                <div className="leading-none text-left">
                                  <span className="font-extrabold text-[11px] tracking-wide uppercase text-white block">Hindustan Scouts &amp; Guides</span>
                                  <span className="font-bold text-amber-400 text-[8px] tracking-widest uppercase block mt-0.5">Telangana State Association</span>
                                </div>
                              </div>

                              {/* Body with Indian Flag watermark */}
                              <div className="flex-1 p-4 flex gap-5 bg-white items-center relative overflow-hidden">
                                {/* Indian Flag Watermark */}
                                <div className="absolute inset-0 flex flex-col pointer-events-none opacity-[0.06] select-none">
                                  <div className="flex-1 bg-[#FF9933]"></div>
                                  <div className="flex-1 bg-white flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#000080]" fill="none" stroke="currentColor" strokeWidth="1.5">
                                      <circle cx="12" cy="12" r="10" />
                                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                                      {[...Array(24)].map((_, i) => (
                                        <line key={i} x1="12" y1="12"
                                          x2={12 + 10 * Math.cos(i * 15 * 0.017453292519943295)}
                                          y2={12 + 10 * Math.sin(i * 15 * 0.017453292519943295)}
                                          stroke="currentColor" strokeWidth="0.5"
                                        />
                                      ))}
                                    </svg>
                                  </div>
                                  <div className="flex-1 bg-[#138808]"></div>
                                </div>

                                {/* Photo + Barcode column */}
                                <div className="flex flex-col items-center justify-center shrink-0 w-24 gap-2 relative z-10">
                                  <div className="h-24 w-20 bg-zinc-50 border border-zinc-300 rounded overflow-hidden flex items-center justify-center shadow-inner">
                                    {viewingEmployeeProfile.imageUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={viewingEmployeeProfile.imageUrl} alt="Photo" className="h-full w-full object-cover" />
                                    ) : (
                                      <span className="material-icons text-5xl text-zinc-300 select-none">account_circle</span>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-center gap-0.5">
                                    <div className="flex items-center gap-0.5 h-3.5 select-none">
                                      {[1,2,1,3,1,2,4,1,2].map((w, i) => (
                                        <div key={i} style={{ width: `${w}px` }} className="h-full bg-zinc-950" />
                                      ))}
                                    </div>
                                    <span className="text-[7px] font-mono font-bold text-zinc-900 tracking-wider leading-none">{viewingEmployeeProfile.id}</span>
                                  </div>
                                </div>

                                {/* Details column */}
                                <div className="flex-1 flex flex-col justify-center gap-1.5 text-left text-zinc-800 relative z-10">
                                  <div>
                                    <span className="text-[7.5px] uppercase font-bold text-zinc-400 tracking-wider block leading-none">Employee Name</span>
                                    <span className="font-extrabold text-sm text-zinc-900 block mt-0.5 uppercase tracking-wide">{viewingEmployeeProfile.name}</span>
                                  </div>
                                  <div>
                                    <span className="text-[7.5px] uppercase font-bold text-zinc-400 tracking-wider block leading-none">Designation</span>
                                    <span className="font-bold text-[11px] text-zinc-700 block mt-0.5">{roleTitle}</span>
                                  </div>
                                  <div>
                                    <span className="text-[7.5px] uppercase font-bold text-zinc-400 tracking-wider block leading-none">Email Address</span>
                                    <span className="font-medium text-[10px] text-zinc-600 block mt-0.5 break-all">{viewingEmployeeProfile.email}</span>
                                  </div>
                                  {viewingEmployeeProfile.phone && (
                                    <div>
                                      <span className="text-[7.5px] uppercase font-bold text-zinc-400 tracking-wider block leading-none">Contact No</span>
                                      <span className="font-medium text-[10px] text-zinc-600 block mt-0.5">{viewingEmployeeProfile.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Footer strip */}
                              <div className="bg-zinc-100 border-t border-zinc-200 py-1.5 px-4 flex justify-between items-center text-[8px] uppercase tracking-wider font-bold text-zinc-500 shrink-0">
                                <span>Telangana State Association</span>
                                <span className="text-[#002f6c] font-black">Official ID Card</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {(() => {
                          const captureCard = async (scale: number): Promise<HTMLCanvasElement> => {
                            const html2canvas = (await import("html2canvas")).default;
                            const original = document.getElementById("hsga-id-card")!;
                            const rect = original.getBoundingClientRect();
                            const host = document.createElement("div");
                            host.style.cssText = [
                              "position:fixed","left:-99999px","top:0",
                              `width:${rect.width}px`,`height:${rect.height}px`,
                              "--background:#ffffff","--foreground:#1e293b",
                              "--card:#ffffff","--card-foreground:#1e293b",
                              "--primary:#002f6c","--primary-foreground:#ffffff",
                              "--secondary:#f4f4f5","--secondary-foreground:#18181b",
                              "--muted:#f4f4f5","--muted-foreground:#71717a",
                              "--accent:#f4f4f5","--accent-foreground:#18181b",
                              "--destructive:#ef4444","--border:#e4e4e7",
                              "--input:#e4e4e7","--ring:#a1a1aa",
                            ].join(";");
                            const clone = original.cloneNode(true) as HTMLElement;
                            clone.style.width = `${rect.width}px`;
                            clone.style.height = `${rect.height}px`;
                            clone.style.position = "relative";
                            host.appendChild(clone);
                            document.body.appendChild(host);

                            try {
                              return await html2canvas(clone, {
                                scale,
                                useCORS: true,
                                backgroundColor: "#ffffff",
                                logging: false,
                                width: rect.width,
                                height: rect.height,
                              });
                            } finally {
                              document.body.removeChild(host);
                            }
                          };

                          return (
                            <div className="flex items-center gap-3 pt-1">
                              <button
                                id="btn-download-idcard"
                                onClick={async () => {
                                  const canvas = await captureCard(3);
                                  const link = document.createElement("a");
                                  link.download = `HSGA_ID_${viewingEmployeeProfile.id}.png`;
                                  link.href = canvas.toDataURL("image/png");
                                  link.click();
                                }}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#002f6c] hover:bg-[#003f8c] text-white rounded-lg font-semibold text-sm shadow-sm transition-all active:scale-95"
                              >
                                <span className="material-icons text-base">download</span>
                                Download
                              </button>
                              <button
                                id="btn-print-idcard"
                                onClick={async () => {
                                  const canvas = await captureCard(4);
                                  const { jsPDF } = await import("jspdf");
                                  const imgData = canvas.toDataURL("image/jpeg", 1.0);
                                  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [85.6, 54] });
                                  pdf.addImage(imgData, "JPEG", 0, 0, 85.6, 54);
                                  pdf.autoPrint();
                                  window.open(pdf.output("bloburl"), "_blank");
                                }}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-700 rounded-lg font-semibold text-sm shadow-sm transition-all active:scale-95"
                              >
                                <span className="material-icons text-base">print</span>
                                Print
                              </button>
                            </div>
                          );
                        })()}
                        <p className="text-center text-[10px] text-zinc-400 leading-relaxed">
                          This card certifies that the individual is a registered HSGA Telangana staff member. PVC CR80 format ready.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-white border border-zinc-200 px-4 py-2.5 rounded-lg shadow-sm w-fit select-none">
                          <span className="material-icons text-sm text-zinc-400">home</span>
                          <span className="hover:text-zinc-700 cursor-pointer" onClick={() => setActiveTab("overview")}>Admin Portal</span>
                          <span className="material-icons text-[10px] text-zinc-400">chevron_right</span>
                          <span className="hover:text-zinc-700 cursor-pointer" onClick={() => { setShowAddForm(false); setAddedEmployee(null); }}>Employee List</span>
                          {showAddForm && (
                            <>
                              <span className="material-icons text-[10px] text-zinc-400">chevron_right</span>
                              <span className="text-emerald-700 font-bold">Add Employee</span>
                            </>
                          )}
                        </div>

                        {!showAddForm ? (
                          /* Mode A: Employee List (shown by default) */
                          <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-6">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
                              <div>
                                <h2 className="text-lg font-bold text-zinc-800">Employee List</h2>
                                <p className="text-xs text-zinc-500 mt-0.5">List of all registered employees. Click &quot;Add Employee&quot; to register a new account.</p>
                              </div>
                              <div className="flex items-center gap-3">
                                {/* Export Menu Dropdown */}
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowExportMenu(!showExportMenu);
                                    }}
                                    className="flex items-center gap-1.5 py-2.5 px-4 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 rounded text-xs font-semibold shadow-sm transition-colors"
                                  >
                                    <span className="material-icons text-sm select-none text-zinc-500">file_download</span>
                                    Export Data
                                    <span className="material-icons text-[12px] select-none text-zinc-400">keyboard_arrow_down</span>
                                  </button>

                                  {showExportMenu && (
                                    <div className="absolute right-0 mt-1.5 w-48 bg-white border border-zinc-200 rounded-md shadow-lg z-50 py-1 text-xs text-zinc-700">
                                      <button
                                        onClick={() => {
                                          handleExportCSV();
                                          setShowExportMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center gap-2"
                                      >
                                        <span className="material-icons text-sm text-zinc-400">table_view</span>
                                        Download in XLS
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleExportPDF();
                                          setShowExportMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center gap-2"
                                      >
                                        <span className="material-icons text-sm text-zinc-400">picture_as_pdf</span>
                                        Download in PDF Format
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <button
                                  onClick={() => {
                                    setShowAddForm(true);
                                    setAddedEmployee(null);
                                    setError(null);
                                    setSuccess(null);
                                  }}
                                  className="flex items-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                                >
                                  <span className="material-icons text-sm select-none">person_add</span>
                                  Add Employee
                                </button>
                              </div>
                            </div>

                            {employees.length === 0 ? (
                              <div className="py-12 text-center border border-dashed border-zinc-200 rounded-lg text-zinc-400">
                                <span className="material-icons text-4xl select-none">badge</span>
                                <p className="text-sm font-semibold mt-2">No employee records in the directory yet.</p>
                                <button
                                  onClick={() => setShowAddForm(true)}
                                  className="mt-3 text-xs text-emerald-700 hover:underline font-semibold"
                                >
                                  Add your first employee to get started
                                </button>
                              </div>
                            ) : (
                              <div className="overflow-x-auto border border-zinc-100 rounded-md">
                                <table className="min-w-full border-collapse border border-zinc-200 text-left text-sm">
                                  <thead className="bg-[#002f6c] text-white text-xs font-bold uppercase tracking-wider select-none">
                                    <tr>
                                      <th className="px-5 py-3.5 border border-zinc-200">Employee ID</th>
                                      <th className="px-5 py-3.5 border border-zinc-200">Name</th>
                                      <th className="px-5 py-3.5 border border-zinc-200">Email Address</th>
                                      <th className="px-5 py-3.5 border border-zinc-200">Gender</th>
                                      <th className="px-5 py-3.5 border border-zinc-200">Demo Password</th>
                                      <th className="px-5 py-3.5 border border-zinc-200">Status</th>
                                      <th className="px-5 py-3.5 border border-zinc-200 text-center">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white text-zinc-700">
                                    {employees.map((emp) => (
                                      <tr key={emp.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-5 py-3.5 border border-zinc-200 font-mono font-bold text-zinc-900 text-xs">{emp.id}</td>
                                        <td className="px-5 py-3.5 border border-zinc-200 font-semibold text-zinc-950">{emp.name}</td>
                                        <td className="px-5 py-3.5 border border-zinc-200 text-zinc-600">{emp.email}</td>
                                        <td className="px-5 py-3.5 border border-zinc-200">
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${emp.gender.toLowerCase() === "male"
                                              ? "bg-blue-50 text-blue-800"
                                              : "bg-purple-50 text-purple-800"
                                            }`}>
                                            {emp.gender}
                                          </span>
                                        </td>
                                        <td className="px-5 py-3.5 border border-zinc-200 font-mono text-xs font-bold text-amber-600">{emp.password || "N/A"}</td>
                                        <td className="px-5 py-3.5 border border-zinc-200">
                                          <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                            Active
                                          </span>
                                        </td>
                                        <td className="px-5 py-3.5 border border-zinc-200 text-center">
                                          <div className="flex items-center justify-center gap-2">
                                            <button
                                              onClick={() => handleViewEmployeeDetails(emp.id)}
                                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-900 rounded font-bold text-xs transition-colors cursor-pointer"
                                              title="View Details"
                                            >
                                              View
                                            </button>
                                            <button
                                              onClick={() => handleEditEmployeeClick(emp)}
                                              className="p-1 hover:bg-zinc-100 text-blue-600 hover:text-blue-800 rounded transition-colors cursor-pointer"
                                              title="Edit Employee"
                                            >
                                              <span className="material-icons text-sm select-none">edit</span>
                                            </button>
                                            <button
                                              onClick={() => handleDeleteEmployeeClick(emp.id, emp.name)}
                                              className="p-1 hover:bg-zinc-100 text-red-600 hover:text-red-800 rounded transition-colors cursor-pointer"
                                              title="Delete Employee"
                                            >
                                              <span className="material-icons text-sm select-none">delete</span>
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ) : addedEmployee ? (
                          /* Mode B: Success credentials screen */
                          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="material-icons text-3xl text-emerald-600 select-none">badge</span>
                              <div>
                                <h3 className="font-bold text-emerald-900 text-sm">Employee Registration Successful!</h3>
                                <p className="text-xs text-emerald-700">Account credentials generated dynamically by the system.</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-emerald-100 rounded-md p-4 mt-2">
                              <div className="p-3 border border-zinc-100 rounded">
                                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Username / ID</span>
                                <p className="font-mono font-bold text-zinc-900 text-sm mt-1">{addedEmployee.id}</p>
                              </div>
                              <div className="p-3 border border-zinc-100 rounded">
                                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Registered Email</span>
                                <p className="font-semibold text-zinc-800 text-sm mt-1 truncate">{addedEmployee.email}</p>
                              </div>
                              <div className="p-3 border border-zinc-100 rounded">
                                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Demo Password</span>
                                <p className="font-mono font-bold text-rose-700 text-sm mt-1">{addedEmployee.password}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5 mt-4">
                              <span className="material-icons text-base text-emerald-600 select-none">info</span>
                              <p className="text-xs text-emerald-800 leading-normal">
                                Give these credentials to the employee. They will be able to log in at the homepage using either their <strong>Employee ID</strong> or <strong>Email address</strong> along with this password.
                              </p>
                            </div>

                            <div className="mt-6 flex justify-end">
                              <button
                                onClick={() => {
                                  setAddedEmployee(null);
                                  setShowAddForm(false);
                                  setError(null);
                                  setSuccess(null);
                                }}
                                className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-sm transition-colors shadow-sm"
                              >
                                Back to Employee List
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Mode C: Create/Add Employee Form */
                          <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-6">
                            <div className="mb-6 pb-4 border-b border-zinc-100">
                              <h2 className="text-lg font-bold text-zinc-800">Add Employee</h2>
                              <p className="text-xs text-zinc-500 mt-0.5">Register a new worker profile. Sequential IDs will generate based on their gender.</p>
                            </div>

                            <form onSubmit={handleAddEmployee} className="space-y-5">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Name input */}
                                <div>
                                  <label htmlFor="emp-name" className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Full Name
                                  </label>
                                  <input
                                    type="text"
                                    id="emp-name"
                                    value={employeeName}
                                    onChange={(e) => setEmployeeName(e.target.value)}
                                    placeholder="e.g. Raj Kumar"
                                    required
                                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-shadow"
                                  />
                                </div>

                                {/* Email input */}
                                <div>
                                  <label htmlFor="emp-email" className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Email Address
                                  </label>
                                  <input
                                    type="email"
                                    id="emp-email"
                                    value={employeeEmail}
                                    onChange={(e) => setEmployeeEmail(e.target.value)}
                                    placeholder="e.g. raj@gmail.com"
                                    required
                                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-shadow"
                                  />
                                </div>

                                {/* Gender input */}
                                <div>
                                  <label htmlFor="emp-gender" className="block text-sm font-medium text-zinc-700 mb-1.5">
                                    Gender Selection
                                  </label>
                                  <select
                                    id="emp-gender"
                                    value={employeeGender}
                                    onChange={(e) => setEmployeeGender(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-shadow"
                                  >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                  </select>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAddForm(false);
                                    setError(null);
                                    setSuccess(null);
                                  }}
                                  className="py-2.5 px-6 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 rounded font-semibold text-sm transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={isLoading}
                                  className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-sm shadow-sm transition-colors disabled:opacity-50"
                                >
                                  {isLoading ? "Creating Account..." : "Create Employee Account"}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                      )
                      })()}

                      {/* TAB CONTENT: Schools List */}
                      {activeTab === "schools" && (() => {
                        const filteredSchools = schools.filter(sch => {
                          const query = schoolSearchQuery.toLowerCase();
                          return (
                            (sch.name || "").toLowerCase().includes(query) ||
                            (sch.district || "").toLowerCase().includes(query) ||
                            (sch.address || "").toLowerCase().includes(query) ||
                            (sch.principalName || "").toLowerCase().includes(query) ||
                            (sch.scoutMasterName || "").toLowerCase().includes(query)
                          );
                        });
                        return (
                          <div className="space-y-6">
                            {/* Breadcrumbs */}
                            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-white border border-zinc-200 px-4 py-2.5 rounded-lg shadow-sm w-fit select-none">
                              <span className="material-icons text-sm text-zinc-400">home</span>
                              <span className="hover:text-zinc-700 cursor-pointer" onClick={() => setActiveTab("overview")}>Admin Portal</span>
                              <span className="material-icons text-[10px] text-zinc-400">chevron_right</span>
                              <span className="text-emerald-700 font-bold">School List</span>
                            </div>

                            {/* Schools Table Card */}
                            <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-6">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-zinc-100 select-none">
                                <div>
                                  <h2 className="text-lg font-bold text-zinc-800">School List</h2>
                                  <p className="text-xs text-zinc-500 mt-0.5">Manage and view registered schools in the HSGA Telangana association.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                                  {/* Search Bar Input */}
                                  <div className="relative flex-1 sm:flex-initial">
                                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm select-none">search</span>
                                    <input
                                      type="text"
                                      placeholder="Search schools..."
                                      value={schoolSearchQuery}
                                      onChange={(e) => setSchoolSearchQuery(e.target.value)}
                                      className="pl-9 pr-4 py-2 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-[#002f6c] outline-none w-full sm:w-60 bg-white"
                                    />
                                  </div>

                                  {/* Export Button Dropdown */}
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowSchoolExportMenu(!showSchoolExportMenu);
                                      }}
                                      className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 rounded text-xs font-semibold shadow-sm transition-colors w-full"
                                    >
                                      <span className="material-icons text-sm select-none text-zinc-500">file_download</span>
                                      Export Data
                                      <span className="material-icons text-[12px] select-none text-zinc-400">keyboard_arrow_down</span>
                                    </button>

                                    {showSchoolExportMenu && (
                                      <div className="absolute right-0 mt-1.5 w-48 bg-white border border-zinc-200 rounded-md shadow-lg z-50 py-1 text-xs text-zinc-700">
                                        <button
                                          onClick={() => {
                                            handleExportSchoolsCSV();
                                            setShowSchoolExportMenu(false);
                                          }}
                                          className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center gap-2 cursor-pointer"
                                        >
                                          <span className="material-icons text-sm text-zinc-400">table_view</span>
                                          Download in XLS
                                        </button>
                                        <button
                                          onClick={() => {
                                            handleExportSchoolsPDF();
                                            setShowSchoolExportMenu(false);
                                          }}
                                          className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center gap-2 cursor-pointer"
                                        >
                                          <span className="material-icons text-sm text-zinc-400">picture_as_pdf</span>
                                          Download in PDF Format
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => { setError(null); setSuccess(null); setShowAddSchoolForm(true); }}
                                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#002f6c] hover:bg-[#002352] text-white rounded text-xs font-semibold shadow-sm transition-colors"
                                  >
                                    <span className="material-icons text-sm select-none">add</span>
                                    Add School
                                  </button>
                                </div>
                              </div>

                              {isFetchingSchools ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-2">
                                  <span className="material-icons animate-spin text-3xl text-[#002f6c] select-none">sync</span>
                                  <p className="text-xs text-zinc-500 font-semibold">Loading school list records...</p>
                                </div>
                              ) : schools.length === 0 ? (
                                <div className="py-12 border border-dashed border-zinc-200 rounded-lg text-center">
                                  <span className="material-icons text-4xl text-zinc-300 select-none font-semibold">domain</span>
                                  <p className="text-sm font-semibold text-zinc-500 mt-2">No schools registered yet.</p>
                                  <button
                                    onClick={() => { setError(null); setSuccess(null); setShowAddSchoolForm(true); }}
                                    className="mt-3 text-xs text-blue-700 hover:underline font-semibold"
                                  >
                                    Register your first school to get started
                                  </button>
                                </div>
                              ) : filteredSchools.length === 0 ? (
                                <div className="py-12 border border-dashed border-zinc-200 rounded-lg text-center">
                                  <span className="material-icons text-4xl text-zinc-300 select-none font-semibold">search_off</span>
                                  <p className="text-sm font-semibold text-zinc-500 mt-2">No schools match your search query.</p>
                                  <button
                                    onClick={() => setSchoolSearchQuery("")}
                                    className="mt-3 text-xs text-blue-700 hover:underline font-semibold"
                                  >
                                    Clear search filter
                                  </button>
                                </div>
                              ) : (
                                <div className="overflow-x-auto border border-zinc-200 rounded-md">
                                  <table className="min-w-full divide-y divide-zinc-200 text-left text-sm whitespace-nowrap">
                                    <thead className="bg-zinc-50 text-xs font-bold text-zinc-500 uppercase tracking-wider select-none">
                                      <tr className="divide-x divide-zinc-200">
                                        <th className="px-4 py-3">S.No</th>
                                        <th className="px-4 py-3">Name of the School</th>
                                        <th className="px-4 py-3">Address</th>
                                        <th className="px-4 py-3">District</th>
                                        <th className="px-4 py-3">Principal Name</th>
                                        <th className="px-4 py-3">Principal Ph.No</th>
                                        <th className="px-4 py-3">Scout Incharge Name (From School)</th>
                                        <th className="px-4 py-3">Scout Incharge Ph. No</th>
                                        <th className="px-4 py-3">PET Name</th>
                                        <th className="px-4 py-3">PET Ph. No</th>
                                        <th className="px-4 py-3">Scouting Started (Month & Year)</th>
                                        <th className="px-4 py-3">No. of Uniforms Distributed</th>
                                        <th className="px-4 py-3">No. of Scarfs Distributed</th>
                                        <th className="px-4 py-3">Scout Master Name</th>
                                        <th className="px-4 py-3">Praveshika No. of Registered Students</th>
                                        <th className="px-4 py-3">Praveshika Date of Exam</th>
                                        <th className="px-4 py-3">Komal Padh No. of Registered Students</th>
                                        <th className="px-4 py-3">Komal Padh Date of Exam</th>
                                        <th className="px-4 py-3">Dhruv Padh No. of Registered Students</th>
                                        <th className="px-4 py-3">Dhruv Padh Date of Exam</th>
                                        <th className="px-4 py-3">Guru Padh No. of Registered Students</th>
                                        <th className="px-4 py-3">Guru Padh Date of Exam</th>
                                        <th className="px-4 py-3">Rajya Puraskar</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 bg-white text-zinc-700">
                                      {filteredSchools.map((sch, index) => (
                                        <tr key={sch.id} className="hover:bg-zinc-50/50 transition-colors divide-x divide-zinc-200">
                                          <td className="px-4 py-3.5 font-bold text-zinc-900 text-xs text-center">{index + 1}</td>
                                          <td className="px-4 py-3.5 font-semibold text-zinc-950 max-w-[250px] truncate" title={sch.name}>{sch.name}</td>
                                          <td className="px-4 py-3.5 text-zinc-600 max-w-[200px] truncate" title={sch.address}>{sch.address}</td>
                                          <td className="px-4 py-3.5 text-zinc-600">{sch.district}</td>
                                          <td className="px-4 py-3.5 font-medium text-zinc-800">{sch.principalName}</td>
                                          <td className="px-4 py-3.5 text-zinc-600">{sch.principalPhone}</td>
                                          <td className="px-4 py-3.5 text-zinc-600">{sch.scoutInchargeName}</td>
                                          <td className="px-4 py-3.5 text-zinc-600">{sch.scoutInchargePhone}</td>
                                          <td className="px-4 py-3.5 text-zinc-600">{sch.petName}</td>
                                          <td className="px-4 py-3.5 text-zinc-600">{sch.petPhone}</td>
                                          <td className="px-4 py-3.5 text-zinc-600">{sch.scoutingStarted}</td>
                                          <td className="px-4 py-3.5 text-center font-semibold text-zinc-800">{sch.uniformsDistributed}</td>
                                          <td className="px-4 py-3.5 text-center font-semibold text-zinc-800">{sch.scarfsDistributed}</td>
                                          <td className="px-4 py-3.5 text-zinc-600">{sch.scoutMasterName}</td>
                                          <td className="px-4 py-3.5 text-center font-semibold text-zinc-800">{sch.praveshikaRegisteredStudents}</td>
                                          <td className="px-4 py-3.5 text-zinc-600">{sch.praveshikaExamDate}</td>
                                          <td className="px-4 py-3.5 text-center font-semibold text-zinc-800">{sch.komalPadhRegisteredStudents}</td>
                                          <td className="px-4 py-3.5 text-zinc-600">{sch.komalPadhExamDate}</td>
                                          <td className="px-4 py-3.5 text-center font-semibold text-zinc-800">{sch.dhruvPadhRegisteredStudents}</td>
                                          <td className="px-4 py-3.5 text-zinc-600">{sch.dhruvPadhExamDate}</td>
                                          <td className="px-4 py-3.5 text-center font-semibold text-zinc-800">{sch.guruPadhRegisteredStudents}</td>
                                          <td className="px-4 py-3.5 text-zinc-600">{sch.guruPadhExamDate}</td>
                                          <td className="px-4 py-3.5 text-zinc-600">{sch.rajyaPuraskar}</td>
                                          <td className="px-4 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                              <button
                                                onClick={() => handleEditSchoolClick(sch)}
                                                className="p-1 hover:bg-zinc-100 text-blue-600 hover:text-blue-800 rounded transition-colors cursor-pointer"
                                                title="Edit School"
                                              >
                                                <span className="material-icons text-sm select-none">edit</span>
                                              </button>
                                              <button
                                                onClick={() => handleDeleteSchoolClick(sch.id, sch.name)}
                                                className="p-1 hover:bg-zinc-100 text-red-600 hover:text-red-800 rounded transition-colors cursor-pointer"
                                                title="Delete School"
                                              >
                                                <span className="material-icons text-sm select-none">delete</span>
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* TAB CONTENT: Time Table */}
                      {activeTab === "timetable" && (() => {
                        const getCellBgClass = (val: string) => {
                          if (!val || val.trim() === "" || val.toLowerCase() === "free") {
                            return "bg-green-50 text-green-700 border-green-100/50";
                          }
                          return "bg-yellow-50 text-yellow-800 border-yellow-200/50 font-bold shadow-sm";
                        };

                        return (
                          <div className="space-y-6">
                            {/* Breadcrumbs */}
                            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-white border border-zinc-200 px-4 py-2.5 rounded-lg shadow-sm w-fit select-none">
                              <span className="material-icons text-sm text-zinc-400">home</span>
                              <span className="hover:text-zinc-700 cursor-pointer" onClick={() => setActiveTab("overview")}>Admin Portal</span>
                              <span className="material-icons text-[10px] text-zinc-400">chevron_right</span>
                              <span className="text-[#002f6c] font-bold">Time Table Matrix</span>
                            </div>

                            {/* Timetable Card */}
                            <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-6">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-zinc-100 select-none">
                                <div>
                                  <h2 className="text-lg font-bold text-zinc-800">Scout Master Time Table</h2>
                                  <p className="text-xs text-zinc-500 mt-0.5">Manage weekly teaching and scouting class schedules across association masters.</p>
                                </div>
                              </div>

                              {isFetchingTimetable ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-2">
                                  <span className="material-icons animate-spin text-3xl text-[#002f6c] select-none">sync</span>
                                  <p className="text-xs text-zinc-500 font-semibold">Loading weekly schedules...</p>
                                </div>
                              ) : timetable.length === 0 ? (
                                <div className="py-12 border border-dashed border-zinc-200 rounded-lg text-center">
                                  <span className="material-icons text-4xl text-zinc-300 select-none font-semibold">calendar_today</span>
                                  <p className="text-sm font-semibold text-zinc-500 mt-2">No timetable entries configured.</p>
                                </div>
                              ) : (
                                <div className="overflow-x-auto border border-zinc-200 rounded-md">
                                  <table className="min-w-full divide-y divide-zinc-200 text-left text-xs border-collapse whitespace-nowrap">
                                    <thead className="bg-[#002f6c] text-white font-bold select-none text-center">
                                      <tr className="divide-x divide-zinc-200">
                                        <th rowSpan={2} className="px-4 py-3.5 align-middle text-left font-bold text-xs sticky left-0 bg-[#002f6c] z-20">Scout Master</th>
                                        <th colSpan={4} className="px-2 py-2 border-b border-zinc-200/20 text-center font-bold">Monday</th>
                                        <th colSpan={4} className="px-2 py-2 border-b border-zinc-200/20 text-center font-bold">Tuesday</th>
                                        <th colSpan={4} className="px-2 py-2 border-b border-zinc-200/20 text-center font-bold">Wednesday</th>
                                        <th colSpan={4} className="px-2 py-2 border-b border-zinc-200/20 text-center font-bold">Thursday</th>
                                        <th colSpan={4} className="px-2 py-2 border-b border-zinc-200/20 text-center font-bold">Friday</th>
                                        <th colSpan={4} className="px-2 py-2 border-b border-zinc-200/20 text-center font-bold">Saturday</th>
                                        <th rowSpan={2} className="px-3 py-3.5 align-middle font-bold">Working Hours</th>
                                        <th rowSpan={2} className="px-4 py-3.5 align-middle font-bold text-center">Actions</th>
                                      </tr>
                                      <tr className="divide-x divide-zinc-200 bg-[#002352] text-[10px]">
                                        {/* Slots */}
                                        <th className="px-2 py-1.5 font-medium">8:30-10:30</th>
                                        <th className="px-2 py-1.5 font-medium">10:30-12:30</th>
                                        <th className="px-2 py-1.5 font-medium">1:30-3:30</th>
                                        <th className="px-2 py-1.5 font-medium">3:30-5:30</th>
                                        <th className="px-2 py-1.5 font-medium">8:30-10:30</th>
                                        <th className="px-2 py-1.5 font-medium">10:30-12:30</th>
                                        <th className="px-2 py-1.5 font-medium">1:30-3:30</th>
                                        <th className="px-2 py-1.5 font-medium">3:30-5:30</th>
                                        <th className="px-2 py-1.5 font-medium">8:30-10:30</th>
                                        <th className="px-2 py-1.5 font-medium">10:30-12:30</th>
                                        <th className="px-2 py-1.5 font-medium">1:30-3:30</th>
                                        <th className="px-2 py-1.5 font-medium">3:30-5:30</th>
                                        <th className="px-2 py-1.5 font-medium">8:30-10:30</th>
                                        <th className="px-2 py-1.5 font-medium">10:30-12:30</th>
                                        <th className="px-2 py-1.5 font-medium">1:30-3:30</th>
                                        <th className="px-2 py-1.5 font-medium">3:30-5:30</th>
                                        <th className="px-2 py-1.5 font-medium">8:30-10:30</th>
                                        <th className="px-2 py-1.5 font-medium">10:30-12:30</th>
                                        <th className="px-2 py-1.5 font-medium">1:30-3:30</th>
                                        <th className="px-2 py-1.5 font-medium">3:30-5:30</th>
                                        <th className="px-2 py-1.5 font-medium">8:30-10:30</th>
                                        <th className="px-2 py-1.5 font-medium">10:30-12:30</th>
                                        <th className="px-2 py-1.5 font-medium">1:30-3:30</th>
                                        <th className="px-2 py-1.5 font-medium">3:30-5:30</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 bg-white">
                                      {timetable.map((row) => (
                                        <tr key={row.id} className="hover:bg-zinc-50/50 transition-colors divide-x divide-zinc-200 text-center">
                                          <td className="px-4 py-3.5 font-bold text-zinc-900 text-left text-xs bg-zinc-50 sticky left-0 z-10 border-r border-zinc-200 select-none shadow-[2px_0_5px_rgba(0,0,0,0.03)]">{row.employeeName}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.monday_1)}`}>{row.monday_1}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.monday_2)}`}>{row.monday_2}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.monday_3)}`}>{row.monday_3}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.monday_4)}`}>{row.monday_4}</td>

                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.tuesday_1)}`}>{row.tuesday_1}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.tuesday_2)}`}>{row.tuesday_2}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.tuesday_3)}`}>{row.tuesday_3}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.tuesday_4)}`}>{row.tuesday_4}</td>

                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.wednesday_1)}`}>{row.wednesday_1}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.wednesday_2)}`}>{row.wednesday_2}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.wednesday_3)}`}>{row.wednesday_3}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.wednesday_4)}`}>{row.wednesday_4}</td>

                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.thursday_1)}`}>{row.thursday_1}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.thursday_2)}`}>{row.thursday_2}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.thursday_3)}`}>{row.thursday_3}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.thursday_4)}`}>{row.thursday_4}</td>

                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.friday_1)}`}>{row.friday_1}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.friday_2)}`}>{row.friday_2}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.friday_3)}`}>{row.friday_3}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.friday_4)}`}>{row.friday_4}</td>

                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.saturday_1)}`}>{row.saturday_1}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.saturday_2)}`}>{row.saturday_2}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.saturday_3)}`}>{row.saturday_3}</td>
                                          <td className={`px-2 py-3.5 border-r ${getCellBgClass(row.saturday_4)}`}>{row.saturday_4}</td>

                                          <td className="px-3 py-3.5 font-bold text-zinc-900">{row.workingHours} hrs</td>
                                          <td className="px-4 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                              <button
                                                onClick={() => handleEditTimetableClick(row)}
                                                className="p-1 hover:bg-zinc-100 text-blue-600 hover:text-blue-800 rounded transition-colors cursor-pointer"
                                                title="Edit Time Table"
                                              >
                                                <span className="material-icons text-sm select-none">edit</span>
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>

                            {/* Upcoming Class Live Status Card */}
                            {(() => {
                              const upcoming = (() => {
                                if (!timetable || timetable.length === 0) return null;

                                const DAYS_ORDER = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                                const slotsConfig = [
                                  { key: "1", label: "8:30 AM - 10:30 AM", start: 510, timeStr: "8:30 AM" },
                                  { key: "2", label: "10:30 AM - 12:30 PM", start: 630, timeStr: "10:30 AM" },
                                  { key: "3", label: "1:30 PM - 3:30 PM", start: 810, timeStr: "1:30 PM" },
                                  { key: "4", label: "3:30 PM - 5:30 PM", start: 930, timeStr: "3:30 PM" },
                                ];

                                const now = new Date();
                                const currentDayIdx = now.getDay();
                                const currentMinutes = now.getHours() * 60 + now.getMinutes();

                                for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
                                  const checkDayIdx = (currentDayIdx + dayOffset) % 7;
                                  const checkDayName = DAYS_ORDER[checkDayIdx];

                                  if (checkDayName === "sunday") continue;

                                  for (let slot of slotsConfig) {
                                    if (dayOffset === 0 && slot.start <= currentMinutes) {
                                      continue;
                                    }

                                    for (let row of timetable) {
                                      const fieldKey = `${checkDayName}_${slot.key}`;
                                      const val = row[fieldKey];
                                      if (val && val.toLowerCase() !== "free" && val.trim() !== "") {
                                        let dayLabel = checkDayName.charAt(0).toUpperCase() + checkDayName.slice(1);
                                        if (dayOffset === 0) {
                                          dayLabel = "Today";
                                        } else if (dayOffset === 1) {
                                          dayLabel = "Tomorrow";
                                        }
                                        return {
                                          schoolName: val,
                                          scoutMaster: row.employeeName,
                                          dayLabel,
                                          slotLabel: slot.label,
                                        };
                                      }
                                    }
                                  }
                                }
                                return null;
                              })();

                              if (!upcoming) {
                                return (
                                  <div className="bg-zinc-50 border border-zinc-200 text-zinc-500 rounded-lg p-5 text-center shadow-sm select-none">
                                    <span className="material-icons text-3xl text-zinc-300 mb-1 select-none">calendar_today</span>
                                    <p className="text-xs font-semibold">No upcoming classes scheduled for the remaining of the week.</p>
                                  </div>
                                );
                              }

                              return (
                                <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-5 select-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-extrabold uppercase bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded tracking-wide">
                                      Upcoming Scheduled Class
                                    </span>
                                    <h3 className="text-base font-bold text-zinc-800 mt-1 leading-tight">{upcoming.schoolName}</h3>
                                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                                      <span className="material-icons text-xs text-zinc-400">person</span>
                                      Scout Master: <strong className="text-zinc-700 font-semibold">{upcoming.scoutMaster}</strong>
                                    </p>
                                  </div>

                                  <div className="flex flex-col sm:items-end justify-center pt-2 sm:pt-0 border-t border-zinc-100 sm:border-t-0 w-full sm:w-auto text-xs">
                                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Scheduled Time</span>
                                    <p className="font-semibold mt-0.5 text-zinc-700 flex items-center gap-1.5">
                                      <span className="material-icons text-sm text-zinc-400">event</span>
                                      {upcoming.dayLabel} ({upcoming.slotLabel})
                                    </p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })()}

                      {/* TAB CONTENT: Settings & Profile */}
                      {activeTab === "settings" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Profile Edit Card */}
                          <div className="lg:col-span-2 bg-white border border-zinc-200 shadow-sm rounded-lg p-6">
                            <div className="mb-6 pb-4 border-b border-zinc-100">
                              <h2 className="text-base font-bold text-zinc-800">Admin Profile Settings</h2>
                              <p className="text-xs text-zinc-500 mt-0.5">Manage details of the administrative contact profile.</p>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                              <div>
                                <label htmlFor="admin-name" className="block text-xs font-semibold text-zinc-600 mb-1">
                                  Admin Name
                                </label>
                                <input
                                  type="text"
                                  id="admin-name"
                                  value={adminName}
                                  onChange={(e) => setAdminName(e.target.value)}
                                  placeholder="e.g. Ramesh Kumar"
                                  required
                                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c]"
                                />
                              </div>

                              <div>
                                <label htmlFor="admin-desig" className="block text-xs font-semibold text-zinc-600 mb-1">
                                  Designation
                                </label>
                                <input
                                  type="text"
                                  id="admin-desig"
                                  value={adminDesignation}
                                  onChange={(e) => setAdminDesignation(e.target.value)}
                                  placeholder="e.g. State Commissioner"
                                  required
                                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c]"
                                />
                              </div>

                              <div>
                                <label htmlFor="admin-phone" className="block text-xs font-semibold text-zinc-600 mb-1">
                                  Phone Number
                                </label>
                                <input
                                  type="tel"
                                  id="admin-phone"
                                  value={adminPhone}
                                  onChange={(e) => setAdminPhone(e.target.value)}
                                  placeholder="e.g. +91 99999 99999"
                                  required
                                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c]"
                                />
                              </div>

                              <div>
                                <label htmlFor="admin-email" className="block text-xs font-semibold text-zinc-600 mb-1">
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  id="admin-email"
                                  value={adminEmail}
                                  disabled
                                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-sm text-zinc-500 cursor-not-allowed"
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-3 py-2 px-4 bg-[#002f6c] hover:bg-[#002352] text-white font-semibold rounded text-sm shadow-sm transition-colors disabled:opacity-50"
                              >
                                Update Profile
                              </button>
                            </form>
                          </div>

                          {/* Change Password Card */}
                          <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-6">
                            <div className="mb-6 pb-4 border-b border-zinc-100">
                              <h2 className="text-base font-bold text-zinc-800">Change Credentials Password</h2>
                              <p className="text-xs text-zinc-500 mt-0.5">Establish a new customized secret password.</p>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                              <div>
                                <label htmlFor="curr-pass" className="block text-xs font-semibold text-zinc-600 mb-1">
                                  Current Password
                                </label>
                                <input
                                  type="password"
                                  id="curr-pass"
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  placeholder="••••••••"
                                  required
                                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c]"
                                />
                              </div>

                              <div>
                                <label htmlFor="new-pass" className="block text-xs font-semibold text-zinc-600 mb-1">
                                  New Password
                                </label>
                                <input
                                  type="password"
                                  id="new-pass"
                                  value={newAdminPassword}
                                  onChange={(e) => setNewAdminPassword(e.target.value)}
                                  placeholder="••••••••"
                                  required
                                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c]"
                                />
                              </div>

                              <div>
                                <label htmlFor="conf-pass" className="block text-xs font-semibold text-zinc-600 mb-1">
                                  Confirm New Password
                                </label>
                                <input
                                  type="password"
                                  id="conf-pass"
                                  value={confirmAdminPassword}
                                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                                  placeholder="••••••••"
                                  required
                                  className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#002f6c] focus:border-[#002f6c]"
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-3 py-2 px-4 bg-[#002f6c] hover:bg-[#002352] text-white font-semibold rounded text-sm shadow-sm transition-colors disabled:opacity-50"
                              >
                                Update Password
                              </button>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </main>
      </div>
          {/* ── Mobile Bottom Navigation Bar ── */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#F7F6F3] border-t border-zinc-200 flex items-center justify-around z-30 shadow-lg px-2">
            {[
              { key: "overview", icon: "dashboard", label: "Overview" },
              { key: "add-employee", icon: "person_add", label: "Add Master" },
              { key: "schools", icon: "domain", label: "School List" },
              { key: "timetable", icon: "calendar_today", label: "Time Table" },
              { key: "settings", icon: "settings", label: "Settings" },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key as typeof activeTab);
                  setError(null);
                  setSuccess(null);
                }}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${activeTab === key
                    ? "text-[#002f6c]"
                    : "text-zinc-500 hover:text-zinc-900"
                  }`}
              >
                <span className="material-icons text-xl select-none">{icon}</span>
                <span className="text-[10px] font-bold mt-0.5">{label}</span>
              </button>
            ))}
          </nav>

          {/* ── Add School Form Slide-over Panel ── */}
          {showAddSchoolForm && (
            <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
              {/* Backdrop with transition */}
              <div
                className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm transition-opacity"
                onClick={() => setShowAddSchoolForm(false)}
              />

              {/* Slide-over Panel */}
              <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col z-10 animate-slide-in overflow-y-auto">
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-20 select-none">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">{editingSchool ? "Edit School Info" : "Register New School"}</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">{editingSchool ? `Modify details for ${editingSchool.name}` : "All 22 fields are required to register a school."}</p>
                  </div>
                  <button
                    onClick={() => { setShowAddSchoolForm(false); setEditingSchool(null); }}
                    className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 rounded-full transition-colors"
                  >
                    <span className="material-icons select-none">close</span>
                  </button>
                </div>

                <form onSubmit={handleSaveSchool} className="flex-1 p-6 space-y-6">
                  {/* General Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">1. General Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Name of the School *</label>
                        <input
                          type="text"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          placeholder="e.g. HSGA Model School"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">District *</label>
                        <input
                          type="text"
                          value={schoolDistrict}
                          onChange={(e) => setSchoolDistrict(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          placeholder="e.g. Hyderabad"
                          required
                        />
                      </div>
                      <div className="flex flex-col md:col-span-2">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Address *</label>
                        <textarea
                          value={schoolAddress}
                          onChange={(e) => setSchoolAddress(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none h-16 resize-none"
                          placeholder="Full school address"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contacts & Roles Section */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">2. Contacts & Incharges</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Principal Name *</label>
                        <input
                          type="text"
                          value={principalName}
                          onChange={(e) => setPrincipalName(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Principal Ph.No *</label>
                        <input
                          type="tel"
                          value={principalPhone}
                          onChange={(e) => setPrincipalPhone(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Scout Incharge Name (From School) *</label>
                        <input
                          type="text"
                          value={scoutInchargeName}
                          onChange={(e) => setScoutInchargeName(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Scout Incharge Ph. No *</label>
                        <input
                          type="tel"
                          value={scoutInchargePhone}
                          onChange={(e) => setScoutInchargePhone(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">PET Name *</label>
                        <input
                          type="text"
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">PET Ph. No *</label>
                        <input
                          type="tel"
                          value={petPhone}
                          onChange={(e) => setPetPhone(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Scout Master Name *</label>
                        <input
                          type="text"
                          value={scoutMasterName}
                          onChange={(e) => setScoutMasterName(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Scouting Started (Month & Year) *</label>
                        <input
                          type="text"
                          value={scoutingStarted}
                          onChange={(e) => setScoutingStarted(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          placeholder="e.g. March 2024"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Uniforms & Scarfs */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">3. Inventory Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">No. of Uniforms Distributed *</label>
                        <input
                          type="number"
                          min="0"
                          value={uniformsDistributed}
                          onChange={(e) => setUniformsDistributed(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">No. of Scarfs Distributed *</label>
                        <input
                          type="number"
                          min="0"
                          value={scarfsDistributed}
                          onChange={(e) => setScarfsDistributed(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Registration & Exam Dates */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">4. Exam Details & Rajya Puraskar</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Praveshika No. of Registered Students *</label>
                        <input
                          type="number"
                          min="0"
                          value={praveshikaRegisteredStudents}
                          onChange={(e) => setPraveshikaRegisteredStudents(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Praveshika Date of Exam *</label>
                        <input
                          type="text"
                          value={praveshikaExamDate}
                          onChange={(e) => setPraveshikaExamDate(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          placeholder="e.g. 15-Aug-2025"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Komal Padh No. of Registered Students *</label>
                        <input
                          type="number"
                          min="0"
                          value={komalPadhRegisteredStudents}
                          onChange={(e) => setKomalPadhRegisteredStudents(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Komal Padh Date of Exam *</label>
                        <input
                          type="text"
                          value={komalPadhExamDate}
                          onChange={(e) => setKomalPadhExamDate(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Dhruv Padh No. of Registered Students *</label>
                        <input
                          type="number"
                          min="0"
                          value={dhruvPadhRegisteredStudents}
                          onChange={(e) => setDhruvPadhRegisteredStudents(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Dhruv Padh Date of Exam *</label>
                        <input
                          type="text"
                          value={dhruvPadhExamDate}
                          onChange={(e) => setDhruvPadhExamDate(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Guru Padh No. of Registered Students *</label>
                        <input
                          type="number"
                          min="0"
                          value={guruPadhRegisteredStudents}
                          onChange={(e) => setGuruPadhRegisteredStudents(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Guru Padh Date of Exam *</label>
                        <input
                          type="text"
                          value={guruPadhExamDate}
                          onChange={(e) => setGuruPadhExamDate(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col md:col-span-2">
                        <label className="text-xs font-semibold text-zinc-600 mb-1">Rajya Puraskar (Registered/Awards Details) *</label>
                        <input
                          type="text"
                          value={rajyaPuraskar}
                          onChange={(e) => setRajyaPuraskar(e.target.value)}
                          className="border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                          placeholder="e.g. 5 Registered / Awards details"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex gap-3 sticky bottom-0 bg-white z-20 pb-4">
                    <button
                      type="button"
                      onClick={() => { setShowAddSchoolForm(false); setEditingSchool(null); }}
                      className="flex-1 py-2.5 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-semibold rounded text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingSchool}
                      className="flex-1 py-2.5 bg-[#002f6c] hover:bg-[#002352] text-white font-semibold rounded text-xs transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isSavingSchool ? "Saving..." : editingSchool ? "Update School" : "Register School"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Edit Employee Modal ── */}
          {editingEmployee && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm transition-opacity"
                onClick={() => setEditingEmployee(null)}
              />

              {/* Modal Container */}
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full flex flex-col z-10 animate-fade-in border border-zinc-200">
                <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="text-base font-bold text-zinc-900">Edit Employee Profile</h3>
                  <button
                    onClick={() => setEditingEmployee(null)}
                    className="p-1 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 rounded-full transition-colors"
                  >
                    <span className="material-icons text-base select-none">close</span>
                  </button>
                </div>

                <form onSubmit={handleUpdateEmployee} className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Employee ID</label>
                    <input
                      type="text"
                      value={editingEmployee.id}
                      disabled
                      className="w-full bg-zinc-50 border border-zinc-200 rounded p-2 text-xs font-mono font-bold text-zinc-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={editEmployeeName}
                      onChange={(e) => setEditEmployeeName(e.target.value)}
                      required
                      className="w-full border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={editEmployeeEmail}
                      onChange={(e) => setEditEmployeeEmail(e.target.value)}
                      required
                      className="w-full border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Gender *</label>
                    <select
                      value={editEmployeeGender}
                      onChange={(e) => setEditEmployeeGender(e.target.value)}
                      required
                      className="w-full border border-zinc-200 rounded p-2 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingEmployee(null)}
                      className="flex-1 py-2 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-semibold rounded text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingEmployee}
                      className="flex-1 py-2 bg-[#002f6c] hover:bg-[#002352] text-white font-semibold rounded text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {isUpdatingEmployee ? "Saving..." : "Update Profile"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Edit Timetable Modal ── */}
          {editingTimetableEntry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm transition-opacity"
                onClick={() => setEditingTimetableEntry(null)}
              />

              {/* Modal Container */}
              <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full flex flex-col z-10 animate-fade-in border border-zinc-200 max-h-[90vh] overflow-y-auto">
                <div className="p-5 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900">Edit Time Table</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Configure time slots for <strong>{editingTimetableEntry.employeeName}</strong></p>
                  </div>
                  <button
                    onClick={() => setEditingTimetableEntry(null)}
                    className="p-1 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 rounded-full transition-colors"
                  >
                    <span className="material-icons text-base select-none">close</span>
                  </button>
                </div>

                <form onSubmit={handleUpdateTimetable} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map((day) => (
                      <div key={day} className="border border-zinc-100 rounded-lg p-4 bg-zinc-50/50 space-y-3.5">
                        <h4 className="text-xs font-bold text-[#002f6c] uppercase tracking-wider select-none border-b border-zinc-100 pb-1.5">{day}</h4>

                        {[
                          { label: "8:30-10:30", key: `${day}_1` },
                          { label: "10:30-12:30", key: `${day}_2` },
                          { label: "1:30-3:30", key: `${day}_3` },
                          { label: "3:30-5:30", key: `${day}_4` }
                        ].map((slot) => {
                          const val = editingTimetableEntry[slot.key] || "Free";
                          return (
                            <div key={slot.key} className="space-y-1">
                              <label className="block text-[10px] font-semibold text-zinc-500 uppercase">{slot.label}</label>
                              <select
                                value={val}
                                onChange={(e) => {
                                  setEditingTimetableEntry({
                                    ...editingTimetableEntry,
                                    [slot.key]: e.target.value
                                  });
                                }}
                                className="w-full bg-white border border-zinc-200 rounded p-1.5 text-xs focus:ring-1 focus:ring-[#002f6c] outline-none font-medium"
                              >
                                <option value="Free">Free</option>
                                {schools.map((sch) => (
                                  <option key={sch.id} value={sch.name}>{sch.name}</option>
                                ))}
                                {val !== "Free" && !schools.some(sch => sch.name === val) && (
                                  <option value={val}>{val}</option>
                                )}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex gap-3 justify-end bg-white sticky bottom-0 pb-1 z-10">
                    <button
                      type="button"
                      onClick={() => setEditingTimetableEntry(null)}
                      className="py-2.5 px-6 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-semibold rounded text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingTimetable}
                      className="flex-1 sm:flex-initial py-2.5 px-6 bg-[#002f6c] hover:bg-[#002352] text-white font-semibold rounded text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {isUpdatingTimetable ? "Saving Changes..." : "Save Time Table"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
      </div>
      );
}
