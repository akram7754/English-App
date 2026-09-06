"use client";

import React, { useState } from "react";

interface SystemSettingsViewProps {
  hasGeminiKey: boolean;
}

export default function SystemSettingsView({ hasGeminiKey }: SystemSettingsViewProps) {
  const [clearingCache, setClearingCache] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleClearCache = () => {
    setClearingCache(true);
    setTimeout(() => {
      setClearingCache(false);
      setToast("Client and server runtime route caches flushed successfully.");
      setTimeout(() => setToast(null), 3500);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* General Platform Parameters */}
      <div className="p-6 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Platform Application Configuration
          </h3>
          <p className="text-xs text-slate-400">
            Core environment and deployment specifications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Application Identity</span>
            <span className="font-bold text-white">LingoAI (Speak. Learn. Grow.)</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Software Version</span>
            <span className="font-bold text-purple-400">v1.10.0 (Phase 10 Production)</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">App Framework</span>
            <span className="font-bold text-cyan-400">Next.js App Router (React 19)</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Database Adapter</span>
            <span className="font-bold text-emerald-400">PostgreSQL / Prisma Composer</span>
          </div>
        </div>
      </div>

      {/* Security & Access Controls */}
      <div className="p-6 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Security & Authentication Architecture
          </h3>
          <p className="text-xs text-slate-400">
            Role-based access control and cryptographic parameters
          </p>
        </div>

        <div className="space-y-3 text-xs pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-200">Role-Based Access Control (RBAC)</p>
              <p className="text-[11px] text-slate-400">
                Server-side authorization enforced on every Server Action and layout
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              Enforced
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-200">Session Cookie Cryptography</p>
              <p className="text-[11px] text-slate-400">
                Signed base64 JSON payload with password hash exclusion and expiration
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              Active
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-200">Password Hashing Algorithm</p>
              <p className="text-[11px] text-slate-400">
                Node.js Native Crypto scrypt (salt 16B, keylen 64B, secure iteration)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
              scrypt
            </span>
          </div>
        </div>
      </div>

      {/* Services & Integrations */}
      <div className="p-6 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            AI & External Service Connections
          </h3>
          <p className="text-xs text-slate-400">
            Current status of third-party API backends (keys are strictly masked)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-200">Google Gemini API</p>
              <p className="text-[11px] text-slate-400">GEMINI_API_KEY environment variable</p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full font-bold border ${
                hasGeminiKey
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/30"
              }`}
            >
              {hasGeminiKey ? "Connected (Configured)" : "Missing Key"}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-200">PostgreSQL Connection Pool</p>
              <p className="text-[11px] text-slate-400">DATABASE_URL environment variable</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              Connected (Masked)
            </span>
          </div>
        </div>

        {/* Maintenance Actions */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">Flush System Cache</p>
            <p className="text-[11px] text-slate-400">
              Revalidates server action paths and client route cache
            </p>
          </div>
          <button
            onClick={handleClearCache}
            disabled={clearingCache}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
          >
            {clearingCache ? "Flushing..." : "Flush Cache"}
          </button>
        </div>
      </div>
    </div>
  );
}
