"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { logoutAction, changePasswordAction, getAuthUserRoleAction } from "../login/actions";
import { requestPasswordResetAction } from "../forgot-password/actions";

export interface UserProfileDropdownProps {
  userName?: string;
  userEmail?: string;
  userLevel?: string;
  userInitials?: string;
  isAdmin?: boolean;
  variant?: "desktop" | "mobile";
}

export default function UserProfileDropdown({
  userName = "Learner",
  userEmail = "",
  userLevel = "Beginner",
  userInitials = "US",
  isAdmin = false,
  variant = "desktop",
}: UserProfileDropdownProps) {
  const [dynName, setDynName] = useState(userName);
  const [dynEmail, setDynEmail] = useState(userEmail);
  const [dynLevel, setDynLevel] = useState(userLevel);
  const [dynInitials, setDynInitials] = useState(userInitials);
  const [dynIsAdmin, setDynIsAdmin] = useState(isAdmin);

  const [isOpen, setIsOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    if (userName && userName !== "Learner" && userName !== "Sarah Jenkins") setDynName(userName);
    if (userEmail) setDynEmail(userEmail);
    if (userLevel) setDynLevel(userLevel);
    if (userInitials && userInitials !== "US" && userInitials !== "SJ") setDynInitials(userInitials);
    if (isAdmin !== undefined) setDynIsAdmin(isAdmin);
  }, [userName, userEmail, userLevel, userInitials, isAdmin]);

  useEffect(() => {
    if (!dynEmail || dynName === "Learner" || dynName === "Sarah Jenkins") {
      getAuthUserRoleAction().then((res) => {
        if (res.email) setDynEmail(res.email);
        if (res.name) {
          setDynName(res.name);
          const initials = res.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          if (initials) setDynInitials(initials);
        }
        if (res.level) setDynLevel(res.level);
        if (res.isAdmin !== undefined) setDynIsAdmin(res.isAdmin);
      });
    }
  }, [dynEmail, dynName]);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Reset Password State
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsChangePasswordOpen(false);
        setIsResetModalOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const res = await changePasswordAction(currentPassword, newPassword, confirmPassword);
      if (res.success) {
        setPasswordSuccess(res.message || "Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setIsChangePasswordOpen(false);
          setPasswordSuccess("");
        }, 2200);
      } else {
        setPasswordError(res.error || "Failed to update password.");
      }
    } catch (err: any) {
      setPasswordError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleTriggerReset = async () => {
    setResetError("");
    setResetMessage("");
    setIsSendingReset(true);
    try {
      const res = await requestPasswordResetAction(dynEmail);
      if (res.success) {
        setResetMessage(res.message || "A secure password reset link has been sent to your email!");
      } else {
        setResetError(res.error || "Failed to send reset link.");
      }
    } catch (err: any) {
      setResetError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      {variant === "mobile" ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs ring-2 ring-indigo-500/30 hover:ring-indigo-400 transition-all focus:outline-none cursor-pointer shadow-md"
          aria-label="User Profile Menu"
          aria-expanded={isOpen}
        >
          {dynInitials}
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-3 p-1.5 pl-3 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/60 focus:outline-none cursor-pointer"
          aria-label="User Profile Menu"
          aria-expanded={isOpen}
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
              {dynName}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-400 font-medium">
              Level: {dynLevel}
            </p>
          </div>

          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full border-2 border-indigo-400/40 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              {dynInitials}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
          </div>

          {/* Chevron */}
          <svg
            className={`w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-indigo-500" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Futuristic Dark Glassmorphic Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#0d0c22]/95 backdrop-blur-2xl border border-indigo-500/30 shadow-2xl shadow-indigo-950/80 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-white"
          style={{
            boxShadow: "0 20px 40px -15px rgba(13, 10, 36, 0.9), 0 0 25px -5px rgba(99, 102, 241, 0.2)",
          }}
        >
          {/* Dropdown Header */}
          <div className="p-3 bg-gradient-to-br from-indigo-950/60 to-purple-950/40 rounded-xl border border-indigo-500/20 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-indigo-500/25 shrink-0">
                {dynInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-white truncate">{dynName}</h4>
                  {dynIsAdmin ? (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/25 text-purple-300 border border-purple-500/40 rounded-full shrink-0">
                      Admin
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full shrink-0">
                      Student
                    </span>
                  )}
                </div>
                <p className="text-xs text-indigo-200/80 truncate font-mono mt-0.5" title={dynEmail}>
                  {dynEmail}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Level: {dynLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links / Action Menu */}
          <div className="space-y-1">
            {/* 1. My Profile */}
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-zinc-200 hover:text-white hover:bg-indigo-600/20 hover:border-indigo-500/30 border border-transparent transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold leading-none">My Profile</p>
                <p className="text-[11px] text-zinc-400 mt-1">View personal learning stats</p>
              </div>
              <svg className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* 2. Change Password */}
            <button
              onClick={() => {
                setIsOpen(false);
                setPasswordError("");
                setPasswordSuccess("");
                setIsChangePasswordOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-zinc-200 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/30 border border-transparent transition-all group text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold leading-none">Change Password</p>
                <p className="text-[11px] text-zinc-400 mt-1">Update login credentials</p>
              </div>
              <svg className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 3. Reset Password */}
            <button
              onClick={() => {
                setIsOpen(false);
                setResetError("");
                setResetMessage("");
                setIsResetModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-zinc-200 hover:text-white hover:bg-sky-600/20 hover:border-sky-500/30 border border-transparent transition-all group text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold leading-none">Reset Password</p>
                <p className="text-[11px] text-zinc-400 mt-1">Receive reset link via email</p>
              </div>
              <svg className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Admin Panel Link (if Admin) */}
            {dynIsAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-purple-300 hover:text-white hover:bg-purple-600/30 hover:border-purple-500/40 border border-transparent transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold leading-none">Admin Panel</p>
                  <p className="text-[11px] text-purple-300/70 mt-1">Super Administrator Console</p>
                </div>
                <svg className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          <div className="my-2 border-t border-indigo-900/60" />

          {/* 4. Logout */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-red-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 border border-transparent transition-all group cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold leading-none">Logout</p>
                <p className="text-[11px] text-red-300/70 mt-1">Sign out of your session</p>
              </div>
            </button>
          </form>
        </div>
      )}

      {/* =========================================================
          CHANGE PASSWORD MODAL (Futuristic Dark Glassmorphism)
         ========================================================= */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md rounded-3xl bg-[#0e0c24] border border-indigo-500/30 p-6 sm:p-8 shadow-2xl shadow-indigo-950 text-white animate-in zoom-in-95 duration-200"
            style={{
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px -5px rgba(99, 102, 241, 0.25)",
            }}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setIsChangePasswordOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Change Password</h3>
                <p className="text-xs text-indigo-300/80">Account: {dynEmail}</p>
              </div>
            </div>

            {/* Status Messages */}
            {passwordError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5">
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{passwordSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 pr-11 bg-white/5 border border-indigo-500/25 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showCurrentPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 pr-11 bg-white/5 border border-indigo-500/25 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2.5 pr-11 bg-white/5 border border-indigo-500/25 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Password Rule Badges */}
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-zinc-400">
                <span className={`inline-flex items-center gap-1 ${newPassword.length >= 6 ? "text-emerald-400" : ""}`}>
                  • Minimum 6 characters
                </span>
                <span className={`inline-flex items-center gap-1 ${newPassword && newPassword === confirmPassword ? "text-emerald-400" : ""}`}>
                  • Passwords match
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-indigo-900/60">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmittingPassword ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          RESET PASSWORD CONFIRMATION MODAL
         ========================================================= */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md rounded-3xl bg-[#0e0c24] border border-indigo-500/30 p-6 sm:p-8 shadow-2xl shadow-indigo-950 text-white animate-in zoom-in-95 duration-200"
            style={{
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px -5px rgba(99, 102, 241, 0.25)",
            }}
          >
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Reset Password</h3>
                <p className="text-xs text-sky-300/80">Send link to registered email</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
              We will send an expiring, single-use password reset link to your registered email address:
            </p>

            <div className="p-3.5 bg-indigo-950/60 border border-indigo-500/25 rounded-xl font-mono text-xs text-indigo-200 break-all mb-4">
              {dynEmail}
            </div>

            {resetError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{resetError}</span>
              </div>
            )}

            {resetMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{resetMessage}</span>
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleTriggerReset}
                disabled={isSendingReset}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-600/30 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSendingReset ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link to {dynEmail}</span>
                )}
              </button>

              <Link
                href={`/forgot-password?email=${encodeURIComponent(dynEmail)}`}
                onClick={() => setIsResetModalOpen(false)}
                className="w-full py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors block text-center"
              >
                Or open full Reset Password page
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
