"use client";

import React, { useState } from "react";
import type { AdminUserRecord } from "./UserModals";
import { toggleAdminRoleAction } from "../actions";

interface ManageAdminsViewProps {
  users: AdminUserRecord[];
  currentAdminId?: number;
  onRoleChanged: (userId: number, newRole: "admin" | "student") => void;
  onAddAdminClick: () => void;
}

export default function ManageAdminsView({
  users,
  currentAdminId,
  onRoleChanged,
  onAddAdminClick,
}: ManageAdminsViewProps) {
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const admins = users.filter((u) => u.role === "admin");
  const nonAdmins = users.filter((u) => u.role !== "admin");

  const handleDemote = async (admin: AdminUserRecord) => {
    if (admin.id === currentAdminId) {
      setError("You cannot revoke administrator privileges from your own active account.");
      return;
    }
    if (admins.length <= 1) {
      setError("Cannot demote the only remaining administrator on the platform.");
      return;
    }

    if (!confirm(`Are you sure you want to demote ${admin.name || admin.email} to Student?`)) {
      return;
    }

    setTogglingId(admin.id);
    setError(null);
    setSuccess(null);

    try {
      const res = await toggleAdminRoleAction(admin.id, "student");
      if (res.success) {
        onRoleChanged(admin.id, "student");
        setSuccess(`Demoted ${admin.name || admin.email} to Student.`);
      } else {
        setError(res.error || "Failed to demote admin.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to demote admin.");
    } finally {
      setTogglingId(null);
    }
  };

  const handlePromote = async (student: AdminUserRecord) => {
    if (!confirm(`Promote ${student.name || student.email} to Super Administrator?`)) {
      return;
    }

    setTogglingId(student.id);
    setError(null);
    setSuccess(null);

    try {
      const res = await toggleAdminRoleAction(student.id, "admin");
      if (res.success) {
        onRoleChanged(student.id, "admin");
        setSuccess(`Promoted ${student.name || student.email} to Administrator.`);
      } else {
        setError(res.error || "Failed to promote student.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to promote student.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">✕</button>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Super Admin List */}
      <div className="p-6 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Active Platform Administrators</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {admins.length} Super Admin{admins.length === 1 ? "" : "s"}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Accounts granted unrestricted administrative privileges
            </p>
          </div>

          <button
            onClick={onAddAdminClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Admin</span>
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {admins.map((adm) => {
            const isSelf = adm.id === currentAdminId;

            return (
              <div key={adm.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm ring-1 ring-purple-400/50">
                    {(adm.name || adm.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">
                        {adm.name || adm.username || "Super Admin"}
                      </p>
                      {isSelf && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Current Session
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{adm.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Member since {new Date(adm.createdAt).toLocaleDateString()}
                  </span>

                  {!isSelf && (
                    <button
                      onClick={() => handleDemote(adm)}
                      disabled={togglingId === adm.id}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {togglingId === adm.id ? "Demoting..." : "Demote to Student"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Eligible Students for Promotion */}
      <div className="p-6 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Promote Existing Student Account
          </h3>
          <p className="text-xs text-slate-400">
            Grant administrator access to an existing enrolled student
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {nonAdmins.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 col-span-full">
              No student accounts available for promotion.
            </p>
          ) : (
            nonAdmins.map((st) => (
              <div
                key={st.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-white truncate">{st.name || st.email}</p>
                  <p className="text-[10px] text-slate-400 truncate">{st.email}</p>
                </div>
                <button
                  onClick={() => handlePromote(st)}
                  disabled={togglingId === st.id}
                  className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {togglingId === st.id ? "..." : "Make Admin"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
