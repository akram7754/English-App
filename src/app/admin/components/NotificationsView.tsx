"use client";

import React, { useState } from "react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  timestamp: string;
  read: boolean;
}

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n-1",
      title: "New Student Registered",
      message: "Student 'Alex Smith' completed onboarding and set learning path Hindi ➔ English.",
      type: "success",
      timestamp: "10 minutes ago",
      read: false,
    },
    {
      id: "n-2",
      title: "Phonetic Evaluation Milestone",
      message: "Student 'Priya Patel' achieved a 94% pronunciation score on Lesson 2: Daily Greetings.",
      type: "info",
      timestamp: "1 hour ago",
      read: false,
    },
    {
      id: "n-3",
      title: "System Health Verified",
      message: "PostgreSQL connection pool healthy (12ms latency). All API services nominal.",
      type: "info",
      timestamp: "3 hours ago",
      read: false,
    },
    {
      id: "n-4",
      title: "Admin Session Logged",
      message: "Super Administrator '1akramshekh@gmail.com' authenticated successfully.",
      type: "success",
      timestamp: "Yesterday",
      read: true,
    },
  ]);

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = filter === "all" ? notifications : notifications.filter((n) => !n.read);

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === "unread"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Unread ({notifications.filter((n) => !n.read).length})
          </button>
        </div>

        <button
          onClick={markAllRead}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold hover:bg-slate-800 transition-all"
        >
          Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs rounded-2xl bg-[#0D1127]/80 border border-slate-800">
            No notifications in this view.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all ${
                n.read
                  ? "bg-[#0D1127]/60 border-slate-800/70 opacity-75"
                  : "bg-slate-900/90 border-purple-500/30 shadow-md shadow-purple-500/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 p-1.5 rounded-lg text-xs ${
                      n.type === "success"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : n.type === "warning"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-purple-500/20 text-purple-300"
                    }`}
                  >
                    {n.type === "success" ? "✓" : n.type === "warning" ? "!" : "ℹ"}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight mb-1">
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
