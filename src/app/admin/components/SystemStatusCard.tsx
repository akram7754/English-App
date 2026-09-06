"use client";

import React from "react";

interface SystemStatusCardProps {
  onAddLesson: () => void;
  onAddUser: () => void;
  onViewReports: () => void;
}

export default function SystemStatusCard({
  onAddLesson,
  onAddUser,
  onViewReports,
}: SystemStatusCardProps) {
  const services = [
    { name: "Website", status: "Online" },
    { name: "Database", status: "Online" },
    { name: "AI Service (Gemini)", status: "Online" },
    { name: "Speech Processing", status: "Online" },
    { name: "Email Service", status: "Online" },
    { name: "File Storage", status: "Online" },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 1. System Status Card */}
      <div className="p-4 rounded-2xl bg-[#0F1424] border border-[#1B2238] flex-1 flex flex-col justify-between">
        <div className="mb-2">
          <h2 className="text-sm font-bold text-white tracking-tight">System Status</h2>
          <p className="text-[11px] text-slate-400">All services are running smoothly</p>
        </div>

        <div className="space-y-2 py-1">
          {services.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-300 font-medium">{s.name}</span>
              </div>
              <span className="text-emerald-400 font-bold text-[11px]">{s.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Quick Actions Card */}
      <div className="p-4 rounded-2xl bg-[#0F1424] border border-[#1B2238]">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-amber-400 text-xs">⚡</span>
          <h2 className="text-sm font-bold text-white tracking-tight">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Add Lesson */}
          <button
            onClick={onAddLesson}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#141B33] hover:bg-[#1C2547] border border-[#212B4F] hover:border-purple-500/40 text-slate-200 transition-all group"
          >
            <span className="text-blue-400 mb-1.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            <span className="text-[10px] font-bold text-slate-300 group-hover:text-white">
              Add Lesson
            </span>
          </button>

          {/* Add User */}
          <button
            onClick={onAddUser}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#141B33] hover:bg-[#1C2547] border border-[#212B4F] hover:border-purple-500/40 text-slate-200 transition-all group"
          >
            <span className="text-purple-400 mb-1.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <span className="text-[10px] font-bold text-slate-300 group-hover:text-white">
              Add User
            </span>
          </button>

          {/* View Reports */}
          <button
            onClick={onViewReports}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#141B33] hover:bg-[#1C2547] border border-[#212B4F] hover:border-purple-500/40 text-slate-200 transition-all group"
          >
            <span className="text-blue-400 mb-1.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            <span className="text-[10px] font-bold text-slate-300 group-hover:text-white">
              View Reports
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
