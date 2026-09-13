"use client";

import React, { useState } from "react";
import Link from "next/link";
import { logoutAction } from "../login/actions";
import UserProfileDropdown from "./UserProfileDropdown";
import NotificationDropdown from "./NotificationDropdown";
import ThemeSwitcher from "./ThemeSwitcher";
import { USER_NAVIGATION } from "./userNavigation";

interface MobileHeaderProps {
  userName: string;
  userInitials: string;
  userEmail?: string;
  userLevel?: string;
  isAdmin?: boolean;
  activeNav?: string;
}

export default function MobileHeader({
  userName,
  userInitials,
  userEmail,
  userLevel,
  isAdmin = false,
  activeNav,
}: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const getMobileItemClass = (key: string) => {
    const isActive = activeNav === key;
    return `flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
      isActive
        ? "bg-indigo-900 text-white font-medium shadow-sm dark:bg-indigo-600/30 dark:text-indigo-200 dark:border dark:border-indigo-500/40"
        : "hover:bg-indigo-900/40 hover:text-white text-indigo-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:hover:text-white"
    }`;
  };

  return (
    <div className="md:hidden shrink-0 sticky top-0 z-40">
      {/* Top Mobile Bar */}
      <header className="h-16 bg-indigo-950 text-indigo-100 dark:bg-[#090b14] dark:border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between border-b border-indigo-900/60 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMenu}
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-indigo-900 transition focus:outline-none touch-manipulation cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <span className="text-lg font-bold tracking-tight text-white">English AI</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeSwitcher variant="compact" className="text-white hover:bg-indigo-900/70 border-indigo-800/60" />
          <NotificationDropdown variant="mobile" />
          <UserProfileDropdown
            userName={userName}
            userInitials={userInitials}
            userEmail={userEmail}
            userLevel={userLevel}
            isAdmin={isAdmin}
            variant="mobile"
          />
        </div>
      </header>

      {/* Drawer Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div onClick={toggleMenu} className="fixed inset-0 bg-black/50 transition-opacity" />

          {/* Drawer Content */}
          <div className="relative w-64 max-w-xs bg-indigo-950 text-indigo-100 dark:bg-[#090b14] dark:text-zinc-200 dark:border-r dark:border-zinc-800/80 flex flex-col justify-between h-full p-6 shadow-2xl z-50 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-lg tracking-wider">
                    AI
                  </div>
                  <span className="text-xl font-bold tracking-tight text-white">English AI</span>
                </div>
                <button onClick={toggleMenu} aria-label="Close Menu" className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-indigo-900 transition focus:outline-none cursor-pointer">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="space-y-1">
                {USER_NAVIGATION.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={toggleMenu}
                    className={getMobileItemClass(item.key)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}

                {/* Admin Panel (Admin Only) */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={toggleMenu}
                    className={getMobileItemClass("admin")}
                  >
                    <svg
                      className="w-5 h-5 shrink-0 text-purple-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
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
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* Logout / Exit */}
                <form action={logoutAction} className="w-full pt-4 border-t border-indigo-900/60 mt-4">
                  <button type="submit" className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-950/45 hover:text-red-300 text-left transition">
                    Logout / Exit
                  </button>
                </form>
              </nav>
            </div>

            <div className="pt-4 border-t border-indigo-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-200">Theme</span>
                <ThemeSwitcher variant="segmented" />
              </div>

              <div className="text-xs text-indigo-200">
                <p className="font-semibold text-white">Student: {userName}</p>
                <p className="opacity-75">English AI writing & speech</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
