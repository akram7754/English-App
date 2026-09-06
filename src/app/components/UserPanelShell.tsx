"use client";

import React from "react";
import Link from "next/link";
import { logoutAction } from "../login/actions";
import MobileHeader from "./MobileHeader";
import UserProfileDropdown from "./UserProfileDropdown";

export type UserPanelNavKey =
  | "dashboard"
  | "voice-conversation"
  | "progress"
  | "ai-tutor"
  | "ai-chat"
  | "voice-practice"
  | "lessons"
  | "grammar-correction"
  | "speaking-score"
  | "admin";

interface UserPanelShellProps {
  children: React.ReactNode;
  activeNav?: UserPanelNavKey;
  userName?: string;
  userEmail?: string;
  userLevel?: string;
  userInitials?: string;
  isAdmin?: boolean;
  searchPlaceholder?: string;
  fullHeightContent?: boolean;
}

export default function UserPanelShell({
  children,
  activeNav = "dashboard",
  userName = "Learner",
  userEmail,
  userLevel = "Beginner",
  userInitials = "LE",
  isAdmin = false,
  searchPlaceholder = "Search lessons, vocabulary, grammar...",
  fullHeightContent = false,
}: UserPanelShellProps) {
  const getItemClass = (key: UserPanelNavKey) => {
    const isActive = activeNav === key;
    return `flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
      isActive
        ? "bg-indigo-900 text-white font-medium shadow-sm"
        : "hover:bg-indigo-900/40 hover:text-white text-indigo-100"
    }`;
  };

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-50 overflow-hidden">
      {/* ========================================================= */}
      {/* 1. GLOBAL DESKTOP SIDEBAR NAVIGATION                      */}
      {/* ========================================================= */}
      <aside className="w-64 bg-indigo-950 text-indigo-100 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="p-6">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 mb-8">
            <Link
              href="/"
              className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-lg tracking-wider hover:opacity-90 transition shadow-md shadow-indigo-600/30"
            >
              AI
            </Link>
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-white hover:text-indigo-200 transition"
            >
              English AI
            </Link>
          </div>

          {/* Canonical 10 Navigation Items in Strict Specification Order */}
          <nav className="space-y-1.5">
            {/* 1. Dashboard */}
            <Link href="/" className={getItemClass("dashboard")}>
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
                />
              </svg>
              <span>Dashboard</span>
            </Link>

            {/* 2. AI Voice Tutor (HIGHLIGHTED on /voice-conversation) */}
            <Link href="/voice-conversation" className={getItemClass("voice-conversation")}>
              <span className="text-base shrink-0">🎙️</span>
              <span className="font-medium">AI Voice Tutor</span>
            </Link>

            {/* 3. My Progress */}
            <Link href="/progress" className={getItemClass("progress")}>
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"
                />
              </svg>
              <span>My Progress</span>
            </Link>

            {/* 4. AI Tutor */}
            <Link href="/ai-tutor" className={getItemClass("ai-tutor")}>
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>AI Tutor</span>
            </Link>

            {/* 5. AI Chat */}
            <Link href="/ai-chat" className={getItemClass("ai-chat")}>
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span>AI Chat</span>
            </Link>

            {/* 6. Voice Practice */}
            <Link href="/voice-practice" className={getItemClass("voice-practice")}>
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span>Voice Practice</span>
            </Link>

            {/* 7. Lessons / Skills */}
            <Link href="/lessons" className={getItemClass("lessons")}>
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span>Lessons / Skills</span>
            </Link>

            {/* 8. Grammar Check */}
            <Link href="/grammar-correction" className={getItemClass("grammar-correction")}>
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Grammar Check</span>
            </Link>

            {/* 9. Speaking Score */}
            <Link href="/speaking-score" className={getItemClass("speaking-score")}>
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"
                />
              </svg>
              <span>Speaking Score</span>
            </Link>

            {/* 10. Admin Panel (Strictly Admin Only) */}
            {isAdmin && (
              <Link href="/admin" className={getItemClass("admin")}>
                <svg className="w-5 h-5 shrink-0 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-purple-200">Admin Panel</span>
              </Link>
            )}

            {/* Logout / Exit */}
            <form action={logoutAction} className="w-full pt-1">
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white text-indigo-100 text-left transition cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout / Exit</span>
              </button>
            </form>
          </nav>
        </div>

        {/* Database Status footer */}
        <div className="p-6 border-t border-indigo-900/60 bg-indigo-950/50">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0" />
            <div className="text-xs text-indigo-200">
              <p className="font-semibold text-white">Learning Engine Active</p>
              <p className="opacity-75">AI Speaking & Writing</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN APPLICATION WORKSPACE AREA                        */}
      {/* ========================================================= */}
      <main className={`flex-1 flex flex-col min-w-0 ${fullHeightContent ? "overflow-hidden" : "overflow-y-auto"}`}>
        {/* Mobile Header (Rendered on mobile viewports) */}
        <MobileHeader
          userName={userName}
          userInitials={userInitials}
          userEmail={userEmail}
          userLevel={userLevel}
          isAdmin={isAdmin}
          activeNav={activeNav}
        />

        {/* Desktop Global Header (Search & UserProfileDropdown) */}
        <header className="h-16 border-b border-zinc-200/80 bg-white px-8 flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800/80 shrink-0 hidden md:flex z-10">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:border-zinc-700"
              />
              <svg
                className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <UserProfileDropdown
            userName={userName}
            userEmail={userEmail}
            userLevel={userLevel}
            userInitials={userInitials}
            isAdmin={isAdmin}
          />
        </header>

        {/* Page Children Content */}
        {children}
      </main>
    </div>
  );
}
