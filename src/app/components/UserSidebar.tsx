"use client";

import React from "react";
import Link from "next/link";
import { logoutAction } from "../login/actions";
import { USER_NAVIGATION, UserPanelNavKey } from "./userNavigation";

interface UserSidebarProps {
  activeNav?: UserPanelNavKey | string;
  isAdmin?: boolean;
}

export default function UserSidebar({
  activeNav = "dashboard",
  isAdmin = false,
}: UserSidebarProps) {
  const getItemClass = (key: string) => {
    const isActive = activeNav === key;
    return `flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
      isActive
        ? "bg-indigo-900 text-white font-medium shadow-sm dark:bg-indigo-600/30 dark:text-indigo-200 dark:border dark:border-indigo-500/40"
        : "hover:bg-indigo-900/40 hover:text-white text-indigo-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:hover:text-white"
    }`;
  };

  return (
    <aside className="w-64 bg-indigo-950 text-indigo-100 dark:bg-[#090b14] dark:border-r dark:border-zinc-800/80 dark:text-zinc-200 flex flex-col justify-between hidden md:flex shrink-0">
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

        {/* Canonical Fixed Navigation Items */}
        <nav className="space-y-1.5">
          {USER_NAVIGATION.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={getItemClass(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Admin Panel (Strictly Admin Only) */}
          {isAdmin && (
            <Link href="/admin" className={getItemClass("admin")}>
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
              <span className="text-purple-200">Admin Panel</span>
            </Link>
          )}

          {/* 11. Logout / Exit */}
          <form action={logoutAction} className="w-full pt-1">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white text-indigo-100 text-left transition cursor-pointer"
            >
              <svg
                className="w-5 h-5 shrink-0 text-indigo-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
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

      {/* Status Footer */}
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
  );
}
