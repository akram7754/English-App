"use client";

import React from "react";

export interface ActivityItem {
  id: string;
  type: "attempt" | "user" | "lesson";
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  timestamp: string;
}

interface RecentActivityFeedProps {
  activities?: ActivityItem[];
  onViewAll?: () => void;
}

export default function RecentActivityFeed({ activities = [], onViewAll }: RecentActivityFeedProps) {
  const displayItems = React.useMemo(() => {
    return activities.slice(0, 5).map((a) => {
      let iconBg = "bg-purple-500/20 text-purple-400";
      let icon = (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      );

      if (a.type === "attempt") {
        iconBg = "bg-blue-500/20 text-blue-400";
        icon = (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        );
      } else if (a.type === "lesson") {
        iconBg = "bg-teal-500/20 text-teal-400";
        icon = (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      }

      return {
        title: a.title,
        subtitle: a.subtitle,
        time: a.timestamp,
        iconBg,
        icon,
      };
    });
  }, [activities]);

  return (
    <div className="flex flex-col h-full p-5 rounded-2xl bg-[#0F1424] border border-[#1B2238]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">Recent Activity</h2>
          <p className="text-[11px] text-slate-400">Latest platform activities</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
        >
          View All →
        </button>
      </div>

      {/* Activity Items */}
      <div className="space-y-3 my-auto">
        {displayItems.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No recent activity recorded yet.
          </p>
        ) : (
          displayItems.map((a, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${a.iconBg}`}>
                  {a.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white leading-tight truncate">
                    {a.title}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight truncate mt-0.5">
                    {a.subtitle}
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 flex-shrink-0">
                {a.time}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
