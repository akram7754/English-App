"use client";

import React, { useState, useMemo } from "react";
import type { AdminUserRecord } from "./UserModals";
import { toggleAdminRoleAction } from "../actions";

interface UsersViewProps {
  users: AdminUserRecord[];
  onViewUser: (user: AdminUserRecord) => void;
  onEditUser: (user: AdminUserRecord) => void;
  onAddUser: () => void;
  onRoleChanged: (userId: number, newRole: "admin" | "student") => void;
  currentAdminId?: number;
}

export default function UsersView({
  users,
  onViewUser,
  onEditUser,
  onAddUser,
  onRoleChanged,
  currentAdminId,
}: UsersViewProps) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        u.email.toLowerCase().includes(q) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q));

      const matchLevel =
        levelFilter === "all" || (u.level && u.level.toLowerCase() === levelFilter.toLowerCase());

      const matchRole =
        roleFilter === "all" || (u.role && u.role.toLowerCase() === roleFilter.toLowerCase());

      return matchSearch && matchLevel && matchRole;
    });
  }, [users, search, levelFilter, roleFilter]);

  const handleToggleRole = async (user: AdminUserRecord) => {
    const isCurrentlyAdmin = user.role === "admin";
    const nextRole = isCurrentlyAdmin ? "student" : "admin";

    if (isCurrentlyAdmin && user.id === currentAdminId) {
      alert("You cannot demote your own active administrator account.");
      return;
    }

    const confirmMsg = isCurrentlyAdmin
      ? `Are you sure you want to demote ${user.name || user.email} from Admin to Student?`
      : `Promote ${user.name || user.email} to Super Administrator? They will have full access to the Admin Panel.`;

    if (!confirm(confirmMsg)) return;

    setTogglingId(user.id);
    setRoleError(null);

    try {
      const res = await toggleAdminRoleAction(user.id, nextRole);
      if (res.success) {
        onRoleChanged(user.id, nextRole);
      } else {
        setRoleError(res.error || "Failed to change admin role.");
      }
    } catch (err: any) {
      setRoleError(err.message || "Failed to toggle role.");
    } finally {
      setTogglingId(null);
    }
  };

  const exportCsv = () => {
    const headers = ["ID", "Email", "Name", "Role", "Level", "Native Language", "Target Language", "Created At"];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.email}"`,
      `"${u.name || ""}"`,
      u.role || "student",
      u.level || "Beginner",
      `"${u.nativeLanguage || "Hindi"}"`,
      `"${u.targetLanguage || "English"}"`,
      `"${u.createdAt}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lingoai_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800/80 shadow-xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or username..."
              className="w-full py-2 pl-9 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All CEFR Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold hover:bg-slate-800 transition-all"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export CSV</span>
          </button>
          <button
            onClick={onAddUser}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Student</span>
          </button>
        </div>
      </div>

      {roleError && (
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
          {roleError}
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800/80 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Languages</th>
                <th className="px-5 py-3.5">CEFR Level</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Joined</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin = u.role === "admin";
                  const isToggling = togglingId === u.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name & Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                            {(u.name || u.email).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-purple-300 transition-colors">
                              {u.name || u.username || "Anonymous"}
                            </p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Languages */}
                      <td className="px-5 py-4 text-slate-300">
                        <span className="font-semibold text-slate-200">
                          {u.nativeLanguage || "Hindi"}
                        </span>{" "}
                        <span className="text-purple-400 font-bold">➔</span>{" "}
                        <span className="font-semibold text-purple-300">
                          {u.targetLanguage || "English"}
                        </span>
                      </td>

                      {/* CEFR Level */}
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                            u.level === "Advanced"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : u.level === "Intermediate"
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                              : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                          }`}
                        >
                          {u.level || "Beginner"}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                            isAdmin
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {isAdmin ? "Super Admin" : "Student"}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="px-5 py-4 text-slate-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewUser(u)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-purple-600/20 text-slate-400 hover:text-purple-300 border border-slate-800 transition-colors"
                            title="Inspect Student Progress & Audio History"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => onEditUser(u)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-600/20 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
                            title="Edit User Profile"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleToggleRole(u)}
                            disabled={isToggling}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                              isAdmin
                                ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
                                : "bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30"
                            } disabled:opacity-50`}
                            title={isAdmin ? "Demote to Student" : "Promote to Super Admin"}
                          >
                            {isToggling ? "..." : isAdmin ? "Demote" : "Make Admin"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
