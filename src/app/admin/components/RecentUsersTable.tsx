"use client";

import React from "react";
import type { AdminUserData } from "../page";

interface RecentUsersTableProps {
  realUsers?: AdminUserData[];
  onViewAll?: () => void;
}

export default function RecentUsersTable({ realUsers = [], onViewAll }: RecentUsersTableProps) {
  const usersToDisplay = React.useMemo(() => {
    const sorted = [...realUsers].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const avatarColors = [
      "bg-purple-600/30 text-purple-300",
      "bg-cyan-600/30 text-cyan-300",
      "bg-emerald-600/30 text-emerald-300",
      "bg-blue-600/30 text-blue-300",
      "bg-amber-600/30 text-amber-300",
    ];

    return sorted.slice(0, 5).map((u, i) => {
      const displayName = u.name || u.username || u.email.split("@")[0];
      const initials =
        displayName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "U";

      const lvl = (u.level || "Beginner").toLowerCase();
      let levelBadge = "bg-blue-500/15 text-blue-400 border border-blue-500/20";
      let levelLabel = "Beginner";

      if (lvl.includes("inter")) {
        levelBadge = "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20";
        levelLabel = "Intermediate";
      } else if (lvl.includes("adv")) {
        levelBadge = "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
        levelLabel = "Advanced";
      }

      const joinedDate = u.createdAt
        ? new Date(u.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Recent";

      return {
        initials,
        initialsBg: avatarColors[i % avatarColors.length],
        name: displayName,
        email: u.email,
        level: levelLabel,
        levelBadge,
        joined: joinedDate,
      };
    });
  }, [realUsers]);

  return (
    <div className="flex flex-col h-full p-5 rounded-2xl bg-[#0F1424] border border-[#1B2238]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">Recent Users</h2>
          <p className="text-[11px] text-slate-400">Latest registered users on the platform</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
        >
          View All →
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-400 font-semibold text-[11px] border-b border-[#1B2238]">
            <tr>
              <th className="pb-2.5 font-normal">Name</th>
              <th className="pb-2.5 font-normal">Email</th>
              <th className="pb-2.5 font-normal">Level</th>
              <th className="pb-2.5 font-normal text-right">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#182035]">
            {usersToDisplay.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                  No users found in database.
                </td>
              </tr>
            ) : (
              usersToDisplay.map((u, i) => (
                <tr key={i} className="hover:bg-[#13192F] transition-colors">
                  {/* Name with Initials Avatar */}
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${u.initialsBg}`}
                      >
                        {u.initials}
                      </div>
                      <span className="font-semibold text-slate-200 truncate">{u.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-2.5 pr-3 text-slate-400 font-normal">
                    {u.email}
                  </td>

                  {/* Level Badge */}
                  <td className="py-2.5 pr-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${u.levelBadge}`}>
                      {u.level}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="py-2.5 text-right text-slate-400 text-[11px]">
                    {u.joined}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
