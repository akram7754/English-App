"use client";

import React from "react";
import { useTheme } from "../../lib/theme-context";

interface ThemeSwitcherProps {
  variant?: "icon" | "segmented" | "compact";
  className?: string;
}

export default function ThemeSwitcher({
  variant = "icon",
  className = "",
}: ThemeSwitcherProps) {
  const { theme, setTheme, toggleTheme, mounted } = useTheme();

  // Pre-hydration placeholder with identical dimensions to prevent layout shift
  if (!mounted) {
    if (variant === "segmented") {
      return (
        <div
          className={`flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 ${className}`}
          aria-hidden="true"
        >
          <div className="w-16 h-7 rounded-lg bg-transparent" />
          <div className="w-16 h-7 rounded-lg bg-transparent" />
        </div>
      );
    }
    return (
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-transparent border border-transparent ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  // Segmented control (suitable for mobile navigation drawers and settings)
  if (variant === "segmented") {
    return (
      <div
        role="group"
        aria-label="Theme selection"
        className={`flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/70 shadow-inner ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-pressed={!isDark}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer ${
            !isDark
              ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-700 dark:text-white"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <span aria-hidden="true">☀️</span>
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-pressed={isDark}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer ${
            isDark
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <span aria-hidden="true">🌙</span>
          <span>Dark</span>
        </button>
      </div>
    );
  }

  // Compact / Icon Button Toggle (for Desktop and Mobile Headers)
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`relative inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:ring-offset-1 dark:focus:ring-offset-zinc-900 cursor-pointer touch-manipulation ${
        isDark
          ? "bg-zinc-800/90 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 border border-zinc-700/80 shadow-xs"
          : "bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 hover:text-zinc-900 border border-zinc-200/80 shadow-xs"
      } ${className}`}
    >
      {isDark ? (
        // ☀️ Sun Icon (rendered in dark mode to switch back to light)
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
          />
        </svg>
      ) : (
        // 🌙 Moon Icon (rendered in light mode to switch to dark)
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-900 transition-transform duration-300 -rotate-12 hover:rotate-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}
