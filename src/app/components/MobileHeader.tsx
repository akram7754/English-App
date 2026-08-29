"use client";

import React, { useState } from "react";
import Link from "next/link";
import { logoutAction } from "../login/actions";

interface MobileHeaderProps {
  userName: string;
  userInitials: string;
}

export default function MobileHeader({ userName, userInitials }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="md:hidden shrink-0">
      {/* Top Mobile Bar */}
      <header className="h-16 bg-indigo-950 text-indigo-100 px-6 flex items-center justify-between border-b border-indigo-900/60 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMenu}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-indigo-900 transition focus:outline-none"
            aria-label="Toggle Menu"
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

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white text-xs">
            {userInitials}
          </div>
        </div>
      </header>

      {/* Drawer Overlay Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div onClick={toggleMenu} className="fixed inset-0 bg-black/50 transition-opacity" />

          {/* Drawer Content */}
          <div className="relative w-64 max-w-xs bg-indigo-950 text-indigo-100 flex flex-col justify-between h-full p-6 shadow-2xl z-50">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-lg tracking-wider">
                    AI
                  </div>
                  <span className="text-xl font-bold tracking-tight text-white">English AI</span>
                </div>
                <button onClick={toggleMenu} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-900 transition focus:outline-none">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="space-y-1">
                <Link
                  href="/"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-900 transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/lessons"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-900 transition"
                >
                  Lessons / Skills
                </Link>
                <Link
                  href="/ai-tutor"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-900 transition"
                >
                  AI Tutor
                </Link>
                <Link
                  href="/ai-chat"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-900 transition"
                >
                  AI Chat
                </Link>
                <Link
                  href="/voice-practice"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-900 transition"
                >
                  Voice Practice
                </Link>
                <Link
                  href="/grammar-correction"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-900 transition"
                >
                  Grammar Check
                </Link>
                <Link
                  href="/speaking-score"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-900 transition"
                >
                  Speaking Score
                </Link>
                <Link
                  href="/progress"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-900 transition"
                >
                  Progress Track
                </Link>
                <Link
                  href="/admin"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-900 transition"
                >
                  Admin Panel
                </Link>
                <Link
                  href="/dashboard"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-indigo-900 transition"
                >
                  My Profile
                </Link>
                <form action={logoutAction} className="w-full pt-4 border-t border-indigo-900/60 mt-4">
                  <button type="submit" className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-950/45 hover:text-red-300 text-left transition">
                    Logout / Exit
                  </button>
                </form>
              </nav>
            </div>

            <div className="pt-6 border-t border-indigo-900/60">
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
