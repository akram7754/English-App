"use client";

import React, { useEffect } from "react";
import type { AdminTab } from "./AdminSidebar";
import ThemeSwitcher from "../../components/ThemeSwitcher";

interface AdminTopBarProps {
  onToggleSidebar: () => void;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  userName: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadNotificationsCount?: number;
}

export default function AdminTopBar({
  onToggleSidebar,
  setActiveTab,
  userName,
  searchQuery,
  setSearchQuery,
  unreadNotificationsCount = 3,
}: AdminTopBarProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const input = document.getElementById("admin-search-input") as HTMLInputElement | null;
        input?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const displayName = "Md Akram shekh";
  const avatarLetter = "A";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-[#080B17]/90 backdrop-blur-xl border-b border-[#1A2138]">
      {/* Left: Mobile hamburger + Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 border border-[#1A2138] lg:hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Exact search input as in design */}
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            id="admin-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users, lessons, vocabulary..."
            className="w-full py-2.5 pl-10 pr-16 text-xs rounded-xl bg-[#11162B] border border-[#1E2540] text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-[#1A213B] border border-[#273052] rounded-md">
              Ctrl K
            </span>
          </div>
        </div>
      </div>

      {/* Right: Theme Switcher + Notification Bell + Admin Profile Chip */}
      <div className="flex items-center gap-3">
        <ThemeSwitcher className="bg-[#11162B] text-slate-300 hover:text-white border-[#1E2540] hover:border-purple-500/40" />
        {/* Notification Bell */}
        <button
          onClick={() => setActiveTab("notifications")}
          className="relative p-2.5 rounded-full bg-[#11162B] text-slate-400 hover:text-white border border-[#1E2540] transition-all hover:border-purple-500/40"
          aria-label="View notifications"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full bg-rose-500 text-white shadow-md shadow-rose-500/50">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Super Admin Profile Chip */}
        <button
          onClick={() => setActiveTab("profile")}
          className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-[#11162B] transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm ring-2 ring-purple-500/30 shadow-md shadow-purple-600/20">
            {avatarLetter}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors leading-tight">
              {displayName}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">
              Super Admin
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
