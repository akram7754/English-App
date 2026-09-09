"use client";

import React, { useState } from "react";
import Link from "next/link";
import UserPanelShell from "../components/UserPanelShell";
import { SUPPORTED_LANGUAGES } from "../../lib/languages";
import {
  updateFullProfileAction,
  changeProfilePasswordAction,
  triggerProfilePasswordResetAction,
  createProfileJournalPostAction,
} from "./actions";

export interface ProfileUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  level: string;
  dailyGoalMinutes: number;
  nativeLanguage: string;
  targetLanguage: string;
  createdAt?: string;
}

export interface ProfileStats {
  lessonsCompleted: number;
  vocabLearned: number;
  speakingAttempts: number;
  avgSpeakingScore: number;
  xp: number;
  streakDays: number;
}

export interface ProfilePost {
  id: number;
  title: string;
  content: string | null;
  createdAt: string;
  authorName?: string;
}

export interface ProfileClientProps {
  initialUser: ProfileUser;
  initialStats: ProfileStats;
  initialPosts: ProfilePost[];
}

type TabType = "preferences" | "security" | "stats" | "journal";

export default function ProfileClient({
  initialUser,
  initialStats,
  initialPosts,
}: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("preferences");

  // User details state
  const [user, setUser] = useState<ProfileUser>(initialUser);
  const [stats] = useState<ProfileStats>(initialStats);
  const [posts, setPosts] = useState<ProfilePost[]>(initialPosts);

  // Profile Form State
  const [name, setName] = useState(initialUser.name || "");
  const [username, setUsername] = useState(initialUser.username || "");
  const [level, setLevel] = useState(initialUser.level || "Beginner");
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(initialUser.dailyGoalMinutes || 15);
  const [nativeLanguage, setNativeLanguage] = useState(initialUser.nativeLanguage || "Hindi");
  const [targetLanguage, setTargetLanguage] = useState(initialUser.targetLanguage || "English");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");

  // Reset password state
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");
  const [resetErrorMsg, setResetErrorMsg] = useState("");

  // Journal form state
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [isPublishingEntry, setIsPublishingEntry] = useState(false);
  const [journalSuccessMsg, setJournalSuccessMsg] = useState("");
  const [journalErrorMsg, setJournalErrorMsg] = useState("");

  const userInitials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "US";

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg("");
    setProfileSuccessMsg("");

    if (!name.trim()) {
      setProfileErrorMsg("Full name is required.");
      return;
    }
    if (!username.trim()) {
      setProfileErrorMsg("Username handle is required.");
      return;
    }

    // Prevent selecting the same language for source and target
    if (nativeLanguage.trim().toLowerCase() === targetLanguage.trim().toLowerCase()) {
      setProfileErrorMsg(
        "Native language and target language cannot be the same. Please choose different languages for speaking and learning."
      );
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await updateFullProfileAction({
        name: name.trim(),
        username: username.trim(),
        level,
        dailyGoalMinutes,
        nativeLanguage,
        targetLanguage,
      });

      if (res.success) {
        setProfileSuccessMsg(res.message || "Profile preferences saved successfully!");
        setUser((prev) => ({
          ...prev,
          name: name.trim(),
          username: username.trim(),
          level,
          dailyGoalMinutes,
          nativeLanguage,
          targetLanguage,
        }));
        setTimeout(() => setProfileSuccessMsg(""), 4000);
      } else {
        setProfileErrorMsg(res.error || "Failed to update profile.");
      }
    } catch (err: any) {
      setProfileErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg("");
    setPasswordSuccessMsg("");

    if (!currentPassword) {
      setPasswordErrorMsg("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordErrorMsg("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg("New password and confirm password do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordErrorMsg("New password must be different from current password.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await changeProfilePasswordAction(currentPassword, newPassword, confirmPassword);
      if (res.success) {
        setPasswordSuccessMsg(res.message || "Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccessMsg(""), 4000);
      } else {
        setPasswordErrorMsg(res.error || "Failed to update password.");
      }
    } catch (err: any) {
      setPasswordErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Handle Trigger Password Reset
  const handleTriggerReset = async () => {
    setResetErrorMsg("");
    setResetSuccessMsg("");
    setIsSendingReset(true);
    try {
      const res = await triggerProfilePasswordResetAction();
      if (res.success) {
        setResetSuccessMsg(
          res.message || "A secure password reset link has been dispatched to your email address."
        );
      } else {
        setResetErrorMsg(res.error || "Failed to send reset link.");
      }
    } catch (err: any) {
      setResetErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSendingReset(false);
    }
  };

  // Handle Journal Post Publish
  const handlePublishJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    setJournalErrorMsg("");
    setJournalSuccessMsg("");

    if (!entryTitle.trim()) {
      setJournalErrorMsg("Please provide a title for your entry.");
      return;
    }
    if (!entryContent.trim()) {
      setJournalErrorMsg("Please write some content for your entry.");
      return;
    }

    setIsPublishingEntry(true);
    try {
      const res = await createProfileJournalPostAction(entryTitle, entryContent);
      if (res.success && res.data) {
        setJournalSuccessMsg("Journal entry published successfully!");
        const newPost: ProfilePost = {
          id: res.data.id,
          title: res.data.title,
          content: res.data.content,
          createdAt: res.data.createdAt || new Date().toISOString(),
          authorName: user.name,
        };
        setPosts((prev) => [newPost, ...prev]);
        setEntryTitle("");
        setEntryContent("");
        setTimeout(() => setJournalSuccessMsg(""), 4000);
      } else {
        setJournalErrorMsg(res.error || "Failed to publish entry.");
      }
    } catch (err: any) {
      setJournalErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setIsPublishingEntry(false);
    }
  };

  const formattedJoinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Aug 2026";

  const nativeLangConfig =
    SUPPORTED_LANGUAGES.find(
      (l) => l.name.toLowerCase() === user.nativeLanguage.toLowerCase()
    ) || SUPPORTED_LANGUAGES[0];

  const targetLangConfig =
    SUPPORTED_LANGUAGES.find(
      (l) => l.name.toLowerCase() === user.targetLanguage.toLowerCase()
    ) || SUPPORTED_LANGUAGES[1];

  return (
    <UserPanelShell
      activeNav="profile"
      userName={user.name}
      userEmail={user.email}
      userLevel={user.level}
      userInitials={userInitials}
      isAdmin={user.role === "admin"}
    >
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
        {/* ========================================================= */}
        {/* 1. PROFILE HEADER (REAL DB USER INFORMATION)              */}
        {/* ========================================================= */}
        <div className="relative bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 text-white border-b border-indigo-800/40 p-6 md:p-10 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Profile Avatar / Initial */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-xl shadow-indigo-950/60 flex items-center justify-center">
                  <div className="w-full h-full bg-indigo-950 rounded-[22px] flex items-center justify-center text-white text-2xl md:text-3xl font-extrabold tracking-wider">
                    {userInitials}
                  </div>
                </div>
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-3 border-indigo-950 rounded-full shadow-sm"
                  title="Online Session Active"
                />
              </div>

              {/* Identity & Languages (Exact Header Layout Spec) */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                    {user.name}
                  </h1>
                  {user.role === "admin" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-purple-500/25 text-purple-300 border border-purple-400/40">
                      Super Admin
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/25 text-indigo-200 border border-indigo-400/30">
                      Active Student
                    </span>
                  )}
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30">
                    {user.level}
                  </span>
                </div>

                <p className="text-sm text-indigo-200/80 font-mono">
                  @{user.username || user.email.split("@")[0]} • {user.email}
                </p>

                {/* Structured Speaking & Learning Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  {/* I Speak: */}
                  <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-2">
                    <span className="text-indigo-300 uppercase tracking-wider font-semibold text-[10px]">
                      I Speak:
                    </span>
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>{nativeLangConfig.flag}</span> {user.nativeLanguage}
                    </span>
                  </div>

                  {/* I Learn: */}
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 flex items-center gap-2">
                    <span className="text-emerald-300 uppercase tracking-wider font-semibold text-[10px]">
                      I Learn:
                    </span>
                    <span className="font-bold text-emerald-100 flex items-center gap-1.5">
                      <span>{targetLangConfig.flag}</span> {user.targetLanguage}
                    </span>
                  </div>

                  {/* Daily Goal: */}
                  <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 flex items-center gap-2">
                    <span className="text-purple-300 uppercase tracking-wider font-semibold text-[10px]">
                      Daily Goal:
                    </span>
                    <span className="font-bold text-purple-100">{user.dailyGoalMinutes} min</span>
                  </div>

                  {/* Joined: */}
                  <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-2">
                    <span className="text-indigo-300 uppercase tracking-wider font-semibold text-[10px]">
                      Joined:
                    </span>
                    <span className="font-bold text-white">{formattedJoinedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats mini card */}
            <div className="hidden lg:flex items-center gap-6 bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shrink-0">
              <div className="text-center">
                <p className="text-2xl font-black text-white">{stats.xp}</p>
                <p className="text-[11px] text-indigo-200 uppercase font-semibold">Total XP</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-400">{stats.streakDays}d</p>
                <p className="text-[11px] text-indigo-200 uppercase font-semibold">Streak</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-black text-sky-400">{stats.avgSpeakingScore}%</p>
                <p className="text-[11px] text-indigo-200 uppercase font-semibold">Speaking</p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. TAB NAVIGATION BAR                                     */}
        {/* ========================================================= */}
        <div className="sticky top-0 z-20 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 md:px-10 shadow-xs">
          <div className="max-w-7xl mx-auto flex gap-2 md:gap-4 overflow-x-auto py-2.5">
            <button
              onClick={() => setActiveTab("preferences")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "preferences"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Personal Info & Preferences</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "security"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Security & Password</span>
            </button>

            <button
              onClick={() => setActiveTab("stats")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "stats"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"
                />
              </svg>
              <span>Learning Achievements</span>
            </button>

            <button
              onClick={() => setActiveTab("journal")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "journal"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <span>Writing Journal</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {posts.length}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. TAB WORKSPACES                                         */}
        {/* ========================================================= */}
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
          {/* ========================================================= */}
          {/* TAB 1: PERSONAL INFORMATION & LEARNING PREFERENCES        */}
          {/* ========================================================= */}
          {activeTab === "preferences" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Notification Banners */}
              {profileSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{profileErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-8">
                {/* 1. Personal Information Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm space-y-6">
                  <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Personal Information
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Manage your personal identity details and learner handle
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Akram"
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    {/* Username Handle */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Username Handle
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-zinc-400 font-mono text-sm">
                          @
                        </span>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="akram"
                          className="w-full pl-8 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Email (Verified) */}
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                          Account Email
                        </label>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Verified Identity
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="email"
                          disabled
                          value={user.email}
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 text-sm text-zinc-500 dark:text-zinc-400 cursor-not-allowed font-mono"
                        />
                        <span className="absolute right-3.5 top-3.5 text-zinc-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Email cannot be changed directly to safeguard your account. Contact an administrator if an email update is needed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Learning Preferences Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm space-y-6">
                  <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Learning Preferences
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Configure your native tongue, learning language, CEFR level, and daily targets
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* I SPEAK: Native Language */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        I SPEAK: (Native Language)
                      </label>
                      <select
                        value={nativeLanguage}
                        onChange={(e) => setNativeLanguage(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                      >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <option
                            key={lang.code}
                            value={lang.name}
                            disabled={lang.name.toLowerCase() === targetLanguage.toLowerCase()}
                          >
                            {lang.flag} {lang.name} ({lang.nativeName})
                            {lang.name.toLowerCase() === targetLanguage.toLowerCase()
                              ? " (Currently Learning Focus)"
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* I WANT TO LEARN: Target Language */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        I WANT TO LEARN: (Target Language)
                      </label>
                      <select
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                      >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <option
                            key={lang.code}
                            value={lang.name}
                            disabled={lang.name.toLowerCase() === nativeLanguage.toLowerCase()}
                          >
                            {lang.flag} {lang.name} ({lang.nativeName})
                            {lang.name.toLowerCase() === nativeLanguage.toLowerCase()
                              ? " (Currently Native Language)"
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* CEFR Level Selector */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      LEVEL: (CEFR Proficiency)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Beginner */}
                      <button
                        type="button"
                        onClick={() => setLevel("Beginner")}
                        className={`p-5 rounded-2xl border text-left transition relative cursor-pointer ${
                          level === "Beginner"
                            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            A1 - A2
                          </span>
                          {level === "Beginner" && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                          Beginner
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                          Everyday essentials, greetings, simple sentence structures, and foundational vocabulary.
                        </p>
                      </button>

                      {/* Intermediate */}
                      <button
                        type="button"
                        onClick={() => setLevel("Intermediate")}
                        className={`p-5 rounded-2xl border text-left transition relative cursor-pointer ${
                          level === "Intermediate"
                            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300">
                            B1 - B2
                          </span>
                          {level === "Intermediate" && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                          Intermediate
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                          Spontaneous conversation, travel, workplace scenarios, idioms, and compound grammar.
                        </p>
                      </button>

                      {/* Advanced */}
                      <button
                        type="button"
                        onClick={() => setLevel("Advanced")}
                        className={`p-5 rounded-2xl border text-left transition relative cursor-pointer ${
                          level === "Advanced"
                            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300">
                            C1 - C2
                          </span>
                          {level === "Advanced" && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                          Advanced
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                          Nuanced debates, academic & professional registers, natural pacing, and advanced idioms.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* DAILY GOAL: Selector */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        DAILY GOAL: (Study Commitment)
                      </label>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        Active: {dailyGoalMinutes} minutes / day
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {[10, 15, 20, 30, 45, 60].map((mins) => {
                        const labels: Record<number, string> = {
                          10: "Quick",
                          15: "Casual",
                          20: "Steady",
                          30: "Regular",
                          45: "Intense",
                          60: "Immersion",
                        };
                        const isSelected = dailyGoalMinutes === mins;
                        return (
                          <button
                            type="button"
                            key={mins}
                            onClick={() => setDailyGoalMinutes(mins)}
                            className={`p-3.5 rounded-2xl border text-center transition cursor-pointer ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30 text-indigo-900 dark:text-indigo-200"
                                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            <span className="text-xl font-black block">{mins}m</span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider block mt-1 opacity-80">
                              {labels[mins]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Account Status Summary Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm space-y-4">
                  <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Account Status & System Roles
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Information verified against your PostgreSQL record
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60">
                      <span className="text-zinc-400 uppercase font-semibold text-[10px] block">
                        Account Role
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
                        {user.role === "admin" ? "Administrator" : "Student"}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60">
                      <span className="text-zinc-400 uppercase font-semibold text-[10px] block">
                        Member Since
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
                        {formattedJoinedDate}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60">
                      <span className="text-zinc-400 uppercase font-semibold text-[10px] block">
                        Database ID
                      </span>
                      <span className="font-mono text-zinc-600 dark:text-zinc-300 mt-1 block">
                        #{user.id} (Verified)
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60">
                      <span className="text-zinc-400 uppercase font-semibold text-[10px] block">
                        Security Layer
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                        bcrypt + HMAC-SHA256
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Action: [Save Changes] */}
                <div className="flex items-center justify-end gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/25 disabled:opacity-50 transition cursor-pointer flex items-center gap-2"
                  >
                    {isSavingProfile ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SECURITY & PASSWORD                                */}
          {/* ========================================================= */}
          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Notification Banners */}
              {passwordSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordErrorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{passwordErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Change Password Form */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm space-y-6">
                  <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Change Password
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Verify current password and create a new secure password
                    </p>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full px-4 py-3 pr-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
                        >
                          {showCurrentPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        New Password (minimum 6 characters)
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full px-4 py-3 pr-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
                        >
                          {showNewPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          className="w-full px-4 py-3 pr-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
                        >
                          {showConfirmPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>

                    {/* Criteria checklist */}
                    <div className="flex flex-wrap gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                      <span className={newPassword.length >= 6 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>
                        • At least 6 characters
                      </span>
                      <span className={newPassword && newPassword === confirmPassword ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>
                        • Passwords match
                      </span>
                    </div>

                    {/* Button: [Change Password] */}
                    <button
                      type="submit"
                      disabled={isSavingPassword}
                      className="w-full mt-4 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSavingPassword ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <span>Change Password</span>
                      )}
                    </button>
                  </form>
                </div>

                {/* 2. Password Reset Dispatcher */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        Forgot or Reset Password
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Dispatch a cryptographically secure, expiring reset link to your email
                      </p>
                    </div>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      If you ever forget your password or want to re-seed credentials, our system generates a single-use token hashed with SHA-256 in the database.
                    </p>

                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">
                        Registered Destination
                      </p>
                      <p className="text-sm font-bold text-indigo-950 dark:text-indigo-200 font-mono mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {resetSuccessMsg && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs">
                        {resetSuccessMsg}
                      </div>
                    )}

                    {resetErrorMsg && (
                      <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 text-xs">
                        {resetErrorMsg}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-4">
                    <button
                      type="button"
                      onClick={handleTriggerReset}
                      disabled={isSendingReset}
                      className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md shadow-sky-600/20 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSendingReset ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Dispatching Reset Link...</span>
                        </>
                      ) : (
                        <span>Send Password Reset Link to {user.email}</span>
                      )}
                    </button>

                    <Link
                      href={`/forgot-password?email=${encodeURIComponent(user.email)}`}
                      className="w-full py-2.5 rounded-xl text-xs font-medium text-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition block"
                    >
                      Open Full Forgot Password Page →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: LEARNING ACHIEVEMENTS                              */}
          {/* ========================================================= */}
          {activeTab === "stats" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Gamification Hub Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/20 dark:border-amber-400/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-2xl flex items-center justify-center shrink-0">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Gamification & Achievements Hub
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Explore all 16 milestone badges, unlock criteria, live progress bars, and XP architecture
                    </p>
                  </div>
                </div>
                <Link
                  href="/achievements"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 transition whitespace-nowrap"
                >
                  View All 16 Badges & Achievements →
                </Link>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Lessons Completed */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-2xl text-indigo-600 dark:text-indigo-400 shrink-0">
                    📖
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Lessons Completed
                    </p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {stats.lessonsCompleted}
                    </p>
                    <Link
                      href="/lessons"
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block"
                    >
                      Browse Lessons →
                    </Link>
                  </div>
                </div>

                {/* 2. Vocabulary Mastered */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-2xl text-emerald-600 dark:text-emerald-400 shrink-0">
                    🧠
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Vocabulary Learned
                    </p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {stats.vocabLearned} Words
                    </p>
                    <Link
                      href="/progress"
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-1 inline-block"
                    >
                      Spaced Repetition →
                    </Link>
                  </div>
                </div>

                {/* 3. Speaking Practice Attempts */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/15 flex items-center justify-center text-2xl text-purple-600 dark:text-purple-400 shrink-0">
                    🎙️
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Voice Practice
                    </p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {stats.speakingAttempts} Attempts
                    </p>
                    <Link
                      href="/voice-practice"
                      className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline mt-1 inline-block"
                    >
                      Practice Voice →
                    </Link>
                  </div>
                </div>

                {/* 4. Average Speaking Score */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/15 flex items-center justify-center text-2xl text-sky-600 dark:text-sky-400 shrink-0">
                    🎯
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Speaking Accuracy
                    </p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {stats.avgSpeakingScore}% Avg
                    </p>
                    <Link
                      href="/speaking-score"
                      className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline mt-1 inline-block"
                    >
                      Speaking Dashboard →
                    </Link>
                  </div>
                </div>

                {/* 5. XP */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center text-2xl text-amber-600 dark:text-amber-400 shrink-0">
                    ⭐
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Total Experience
                    </p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {stats.xp} XP
                    </p>
                    <Link
                      href="/achievements"
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline mt-1 inline-block"
                    >
                      View XP & Badges →
                    </Link>
                  </div>
                </div>

                {/* 6. Consecutive Streak */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/15 flex items-center justify-center text-2xl text-rose-600 dark:text-rose-400 shrink-0">
                    🔥
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Active Streak
                    </p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {stats.streakDays} Consecutive Days
                    </p>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 inline-block">
                      Goal: {user.dailyGoalMinutes}m / day
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Pathway summary */}
              <div className="bg-gradient-to-br from-indigo-950 to-purple-950 rounded-3xl p-8 text-white border border-indigo-800/40 shadow-xl space-y-6">
                <div>
                  <h3 className="text-xl font-bold">Curriculum Milestones</h3>
                  <p className="text-xs text-indigo-200 mt-1">
                    Your personalized journey from {user.nativeLanguage} to native-like {user.targetLanguage} fluency
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      1. Foundational Grammar
                    </span>
                    <p className="text-sm font-semibold text-white">Basic Sentence Patterns</p>
                    <p className="text-xs text-indigo-200/80">
                      Master subject-verb agreement, common tenses, and essential interrogatives.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                      2. Spoken Fluency
                    </span>
                    <p className="text-sm font-semibold text-white">Shadowing & Pronunciation</p>
                    <p className="text-xs text-indigo-200/80">
                      Live speech-to-text analysis with actionable syllable stress and pacing tips.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                      3. Applied Writing
                    </span>
                    <p className="text-sm font-semibold text-white">Essay Journaling</p>
                    <p className="text-xs text-indigo-200/80">
                      Write daily paragraphs in the journal tab to lock in new vocabulary.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: WRITING JOURNAL                                    */}
          {/* ========================================================= */}
          {activeTab === "journal" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
              {/* Left Column: Post Feed */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      My Writing Journal
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Your saved essays, practice paragraphs, and personal learning notes
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {posts.length} {posts.length === 1 ? "Entry" : "Entries"}
                  </span>
                </div>

                {/* Empty state */}
                {posts.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-3">
                    <span className="text-4xl">✍️</span>
                    <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                      No Journal Entries Yet
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Use the composer on the right to draft your first English practice essay, reflection, or vocabulary journal entry.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <article
                        key={post.id}
                        className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3 hover:border-indigo-300 dark:hover:border-indigo-800/60 transition"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                            {post.title}
                          </h3>
                          <span className="text-xs text-zinc-400 shrink-0 font-mono">
                            {new Date(post.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-300 text-sm whitespace-pre-line leading-relaxed">
                          {post.content}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
                          <span>Author: {post.authorName || user.name}</span>
                          <span className="text-[11px] font-mono text-indigo-500">Post #{post.id}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: New Entry Composer */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    New Journal Entry
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Write paragraphs to test your grammar and vocabulary
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  {journalSuccessMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{journalSuccessMsg}</span>
                    </div>
                  )}

                  {journalErrorMsg && (
                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{journalErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handlePublishJournal} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Entry Title
                      </label>
                      <input
                        type="text"
                        required
                        value={entryTitle}
                        onChange={(e) => setEntryTitle(e.target.value)}
                        placeholder="e.g. My Weekend Trip to the Coast"
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                          Content
                        </label>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {entryContent.trim().split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                      <textarea
                        required
                        rows={8}
                        value={entryContent}
                        onChange={(e) => setEntryContent(e.target.value)}
                        placeholder="Write your paragraphs here. Practice new vocabulary words and phrases..."
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isPublishingEntry}
                      className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isPublishingEntry ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Publishing to Database...</span>
                        </>
                      ) : (
                        <span>Publish Entry to Database</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserPanelShell>
  );
}
