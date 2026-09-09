"use client";

import React from "react";
import MobileHeader from "./MobileHeader";
import UserProfileDropdown from "./UserProfileDropdown";
import NotificationDropdown from "./NotificationDropdown";
import ThemeSwitcher from "./ThemeSwitcher";
import UserSidebar from "./UserSidebar";
import { UserPanelNavKey } from "./userNavigation";

export type { UserPanelNavKey };

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
  return (
    <div className="flex min-h-screen lg:h-screen bg-zinc-50 text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-50 overflow-x-hidden lg:overflow-hidden">
      {/* ========================================================= */}
      {/* 1. GLOBAL DESKTOP SIDEBAR NAVIGATION                      */}
      {/* ========================================================= */}
      <UserSidebar activeNav={activeNav} isAdmin={isAdmin} />

      {/* ========================================================= */}
      {/* 2. MAIN APPLICATION WORKSPACE AREA                        */}
      {/* ========================================================= */}
      <main className={`flex-1 flex flex-col min-w-0 min-h-0 ${fullHeightContent ? "h-auto lg:h-full overflow-visible lg:overflow-hidden" : "overflow-y-auto"}`}>
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

          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <NotificationDropdown variant="desktop" />
            <UserProfileDropdown
              userName={userName}
              userEmail={userEmail}
              userLevel={userLevel}
              userInitials={userInitials}
              isAdmin={isAdmin}
            />
          </div>
        </header>

        {/* Page Children Content */}
        {children}
      </main>
    </div>
  );
}
