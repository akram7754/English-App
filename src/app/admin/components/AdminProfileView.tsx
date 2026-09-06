"use client";

import React from "react";

interface AdminProfileViewProps {
  userName: string;
  userInitials: string;
  adminEmail?: string;
  onLogout: () => void;
}

export default function AdminProfileView({
  userName,
  userInitials,
  adminEmail,
  onLogout,
}: AdminProfileViewProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#0D1127] to-[#0D1127] border border-purple-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-purple-500/30 ring-2 ring-purple-400/50">
            {userInitials}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {userName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Super Administrator
              </span>
            </div>
            <p className="text-xs text-slate-400">{adminEmail || "Super Admin"}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Session</span>
              </div>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400">Full System & RBAC Privileges</span>
            </div>
          </div>

          <div>
            <button
              onClick={onLogout}
              className="px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all shadow-sm"
            >
              Sign Out Session
            </button>
          </div>
        </div>
      </div>

      {/* Permissions & Security Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Granted Administrative Roles
          </h3>
          <div className="space-y-2.5 text-xs">
            {[
              "Complete User & Student Record Access",
              "Curriculum & Lesson Authoring (CRUD)",
              "Course & Module Configuration",
              "Lexical Vocabulary Bank Authoring",
              "AI Voice Practice Auditing & Feedback Access",
              "Platform Role Promotion & Demotion Safeguards",
              "System Health & Telemetry Diagnostics",
            ].map((perm, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{perm}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Security & Cryptography Overview
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Authentication Method</span>
              <p className="font-semibold text-white">HttpOnly Cookie + scrypt Salted Key Hash</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Session Scope</span>
              <p className="font-semibold text-white">Verified directly against PostgreSQL 'User.role'</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">API Key Safeguards</span>
              <p className="font-semibold text-emerald-400">Zero Client Exposure (100% Server Actions)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
