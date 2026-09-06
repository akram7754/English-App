"use client";

import React from "react";
import type { AdminUserData, AdminPracticeAttemptData } from "../page";

// =========================================================================
// 1. USER GROWTH CHART (DYNAMIC REAL POSTGRESQL DATA)
// =========================================================================

interface UserGrowthChartProps {
  users?: AdminUserData[];
  attempts?: AdminPracticeAttemptData[];
}

export function UserGrowthChart({ users = [], attempts = [] }: UserGrowthChartProps) {
  // Generate 7 checkpoints across the last 30 days
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const daysOffsets = [30, 25, 20, 15, 10, 5, 0].reverse();

  const pointsData = daysOffsets.map((daysAgo) => {
    const date = new Date(now.getTime() - daysAgo * dayMs);
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const total = users.filter((u) => new Date(u.createdAt) <= date).length;
    const active = users.filter(
      (u) => u.role !== "admin" && new Date(u.createdAt) <= date
    ).length;
    return {
      label,
      date,
      totalUsers: total,
      activeUsers: active,
    };
  });

  const maxDataVal = Math.max(8, ...pointsData.map((p) => p.totalUsers));
  const maxY = Math.ceil(maxDataVal / 4) * 4;

  const yTicks = [
    { val: maxY.toLocaleString(), y: 30 },
    { val: Math.round(maxY * 0.75).toLocaleString(), y: 72 },
    { val: Math.round(maxY * 0.5).toLocaleString(), y: 115 },
    { val: Math.round(maxY * 0.25).toLocaleString(), y: 158 },
    { val: "0", y: 200 },
  ];

  const getY = (val: number) => {
    const ratio = Math.min(1, Math.max(0, val / maxY));
    return 200 - ratio * 170;
  };

  const totalUsersPts = pointsData.map((p, i) => ({
    x: 50 + i * 75,
    y: getY(p.totalUsers),
    val: p.totalUsers,
    label: p.label,
  }));

  const activeUsersPts = pointsData.map((p, i) => ({
    x: 50 + i * 75,
    y: getY(p.activeUsers),
    val: p.activeUsers,
    label: p.label,
  }));

  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const totalPath = buildSmoothPath(totalUsersPts);
  const activePath = buildSmoothPath(activeUsersPts);

  const latestPt = pointsData[pointsData.length - 1];

  return (
    <div className="flex flex-col h-full p-5 rounded-2xl bg-[#0F1424] border border-[#1B2238]">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">User Growth</h2>
          <p className="text-[11px] text-slate-400">Total and active users over the last 30 days</p>
        </div>

        {/* Dropdown button */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141B30] border border-[#212A4A] text-slate-300 text-xs font-medium cursor-pointer hover:border-purple-500/40 transition-colors">
          <span>Last 30 days</span>
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 my-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
          <span className="text-slate-300 font-medium">Total Users</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
          <span className="text-slate-300 font-medium">Active Users</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full flex-1 min-h-[190px]">
        <svg viewBox="0 0 540 220" className="w-full h-full overflow-visible">
          {/* Y-Axis Grid Lines & Labels */}
          {yTicks.map((grid, i) => (
            <g key={i}>
              <text
                x="35"
                y={grid.y + 4}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-sans"
              >
                {grid.val}
              </text>
              <line
                x1="45"
                y1={grid.y}
                x2="515"
                y2={grid.y}
                stroke="#1B2238"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            </g>
          ))}

          {/* Curves */}
          <path
            d={totalPath}
            fill="none"
            stroke="#38BDF8"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <path
            d={activePath}
            fill="none"
            stroke="#8B5CF6"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Points for Total Users (Cyan) */}
          {totalUsersPts.map((p, i) => (
            <circle
              key={`tot-${i}`}
              cx={p.x}
              cy={p.y}
              r={3.5}
              className="fill-[#38BDF8] stroke-[#0F1424] stroke-2 cursor-pointer"
            />
          ))}

          {/* Points for Active Users (Purple) */}
          {activeUsersPts.map((p, i) => (
            <circle
              key={`act-${i}`}
              cx={p.x}
              cy={p.y}
              r={3.5}
              className="fill-[#8B5CF6] stroke-[#0F1424] stroke-2 cursor-pointer"
            />
          ))}

          {/* Dynamic Real Tooltip */}
          <g transform="translate(305, 30)">
            <rect
              width="96"
              height="48"
              rx="8"
              fill="#141B33"
              stroke="#2B355A"
              strokeWidth={1}
              filter="drop-shadow(0px 4px 10px rgba(0,0,0,0.5))"
            />
            <text x="48" y="14" textAnchor="middle" className="text-[9px] fill-slate-400 font-semibold">
              {latestPt.label}, {now.getFullYear()}
            </text>
            <text x="12" y="28" className="text-[9px] fill-[#38BDF8] font-bold">
              Total Users: {latestPt.totalUsers}
            </text>
            <text x="12" y="40" className="text-[9px] fill-[#C084FC] font-bold">
              Active Users: {latestPt.activeUsers}
            </text>
          </g>

          {/* X-Axis Labels */}
          {pointsData.map((pt, i) => {
            const x = 50 + i * 75;
            return (
              <text
                key={i}
                x={x}
                y="215"
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-sans"
              >
                {pt.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// =========================================================================
// 2. PROFICIENCY DONUT (DYNAMIC REAL POSTGRESQL DATA)
// =========================================================================

interface ProficiencyDonutProps {
  beginnerCount?: number;
  intermediateCount?: number;
  advancedCount?: number;
  totalUsers?: number;
}

export function ProficiencyDonut({
  beginnerCount = 0,
  intermediateCount = 0,
  advancedCount = 0,
  totalUsers,
}: ProficiencyDonutProps = {}) {
  const computedTotal = totalUsers ?? (beginnerCount + intermediateCount + advancedCount);
  const total = computedTotal > 0 ? computedTotal : 0;

  const beginnerPct = total > 0 ? Math.round((beginnerCount / total) * 100) : 0;
  const intermediatePct = total > 0 ? Math.round((intermediateCount / total) * 100) : 0;
  const advancedPct = total > 0 ? Math.max(0, 100 - beginnerPct - intermediatePct) : 0;

  const radius = 55;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius; // ~345.57

  const beginnerDash = (beginnerPct / 100) * circumference;
  const intermediateDash = (intermediatePct / 100) * circumference;
  const advancedDash = (advancedPct / 100) * circumference;

  const intermediateOffset = -beginnerDash;
  const advancedOffset = -(beginnerDash + intermediateDash);

  return (
    <div className="flex flex-col h-full p-5 rounded-2xl bg-[#0F1424] border border-[#1B2238]">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-sm font-bold text-white tracking-tight">Users by Level</h2>
        <p className="text-[11px] text-slate-400">Distribution of learners across levels</p>
      </div>

      {/* Donut & Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-auto">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 150 150">
            {/* Background empty track */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              fill="transparent"
              stroke="#1B2238"
              strokeWidth={strokeWidth}
            />
            {/* Beginner (Purple) */}
            {beginnerDash > 0 && (
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="transparent"
                stroke="#8B5CF6"
                strokeWidth={strokeWidth}
                strokeDasharray={`${beginnerDash} ${circumference}`}
                strokeDashoffset={0}
              />
            )}
            {/* Intermediate (Cyan) */}
            {intermediateDash > 0 && (
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="transparent"
                stroke="#38BDF8"
                strokeWidth={strokeWidth}
                strokeDasharray={`${intermediateDash} ${circumference}`}
                strokeDashoffset={intermediateOffset}
              />
            )}
            {/* Advanced (Green) */}
            {advancedDash > 0 && (
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="transparent"
                stroke="#22C55E"
                strokeWidth={strokeWidth}
                strokeDasharray={`${advancedDash} ${circumference}`}
                strokeDashoffset={advancedOffset}
              />
            )}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-white leading-tight">
              {total.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Users</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3 w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
              <span className="text-xs text-slate-300 font-medium">Beginner</span>
            </div>
            <span className="text-xs font-bold text-white">{`${beginnerPct}%`}</span>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
              <span className="text-xs text-slate-300 font-medium">Intermediate</span>
            </div>
            <span className="text-xs font-bold text-white">{`${intermediatePct}%`}</span>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
              <span className="text-xs text-slate-300 font-medium">Advanced</span>
            </div>
            <span className="text-xs font-bold text-white">{`${advancedPct}%`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

