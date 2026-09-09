"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import UserSidebar from "../components/UserSidebar";
import MobileHeader from "../components/MobileHeader";
import ThemeSwitcher from "../components/ThemeSwitcher";
import {
  getNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "./actions";
import { getAuthUserRoleAction } from "../login/actions";
import { NotificationItem } from "../../lib/notification-engine";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "streak" | "achievement" | "system">("all");
  const [userName, setUserName] = useState("Learner");
  const [userInitials, setUserInitials] = useState("LE");
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      const res = await getNotificationsAction();
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAuthUserRoleAction().then((res) => {
      setIsAdmin(res.isAdmin);
      if (res.name) {
        setUserName(res.name);
        setUserInitials(
          res.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "LE"
        );
      }
    });
    loadData();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsReadAction(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await markAllNotificationsAsReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all read:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "streak") return n.type === "streak" || n.type === "daily_goal";
    if (filter === "achievement") return n.type === "achievement" || n.type === "milestone";
    if (filter === "system") return n.type === "system" || n.type === "security";
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "streak":
        return "🔥";
      case "achievement":
        return "🏆";
      case "srs_review":
        return "🧠";
      case "lesson_recommendation":
        return "📚";
      case "security":
        return "🛡️";
      default:
        return "🔔";
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-50 overflow-hidden">
      {/* 1. Sidebar Navigation (Canonical 11-Item Order Maintained) */}
      <UserSidebar activeNav="notifications" isAdmin={isAdmin} />

      {/* 2. Main Center */}
      <main className="flex-1 overflow-y-auto">
        <MobileHeader
          userName={userName}
          userInitials={userInitials}
          isAdmin={isAdmin}
          activeNav="notifications"
        />

        <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <span>🔔</span>
                Notifications & Reminders
                {unreadCount > 0 && (
                  <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
                    {unreadCount} new
                  </span>
                )}
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-1">
                Real-time activity milestones, streak safeguards, and personalized study reminders.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition cursor-pointer border border-indigo-200 dark:border-indigo-900/60"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: "all", label: "All" },
              { id: "unread", label: `Unread (${unreadCount})` },
              { id: "streak", label: "Streaks & Goals" },
              { id: "achievement", label: "Achievements" },
              { id: "system", label: "System & Security" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  filter === tab.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="py-20 text-center text-zinc-400 space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium">Loading notifications from database...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl mx-auto">
                ✨
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                No Notifications Found
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                {filter === "unread"
                  ? "You are all caught up! Zero unread notifications."
                  : "Complete lessons, practice speaking, and maintain your streak to trigger learning updates."}
              </p>
              <Link
                href="/lessons"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Go to Lessons
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition flex items-start gap-4 ${
                    !n.read
                      ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-xs"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-80"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-lg shrink-0 shadow-xs">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {n.title}
                      </h4>
                      <span className="text-[11px] text-zinc-400 shrink-0">
                        {new Date(n.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      {n.actionUrl && (
                        <Link
                          href={n.actionUrl}
                          onClick={() => !n.read && handleMarkAsRead(n.id)}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Take Action</span>
                          <span>&rarr;</span>
                        </Link>
                      )}

                      {!n.read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
