"use client";

import React, { useState } from "react";
import type { AdminUserRecord } from "./UserModals";
import type { PracticeAttemptItem } from "./AiConversationsView";

interface ReportsViewProps {
  users: AdminUserRecord[];
  lessons: any[];
  vocabularies: any[];
  attempts: PracticeAttemptItem[];
}

export default function ReportsView({
  users,
  lessons,
  vocabularies,
  attempts,
}: ReportsViewProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadFile = (content: string, filename: string, type: "csv" | "json") => {
    const mime = type === "csv" ? "text/csv;charset=utf-8," : "application/json;charset=utf-8,";
    const encodedUri = encodeURI(`data:${mime}${content}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportUsers = (format: "csv" | "json") => {
    setDownloading("users");
    setTimeout(() => {
      const stamp = new Date().toISOString().slice(0, 10);
      if (format === "csv") {
        const headers = ["ID", "Email", "Name", "Role", "CEFR Level", "Native Language", "Target Language", "Created At"];
        const rows = users.map((u) => [
          u.id,
          `"${u.email}"`,
          `"${u.name || ""}"`,
          u.role || "student",
          u.level || "Beginner",
          `"${u.nativeLanguage || "Hindi"}"`,
          `"${u.targetLanguage || "English"}"`,
          `"${u.createdAt}"`,
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        downloadFile(csv, `lingoai_students_${stamp}.csv`, "csv");
      } else {
        const json = JSON.stringify(users, null, 2);
        downloadFile(json, `lingoai_students_${stamp}.json`, "json");
      }
      setDownloading(null);
    }, 400);
  };

  const handleExportAttempts = (format: "csv" | "json") => {
    setDownloading("attempts");
    setTimeout(() => {
      const stamp = new Date().toISOString().slice(0, 10);
      if (format === "csv") {
        const headers = ["ID", "UserId", "Phrase", "Score", "Difficulty", "Status", "Transcript", "CreatedAt"];
        const rows = attempts.map((a) => [
          a.id,
          a.userId,
          `"${a.phrase.replace(/"/g, '""')}"`,
          a.score,
          a.difficulty,
          a.status,
          `"${(a.transcript || "").replace(/"/g, '""')}"`,
          `"${a.createdAt}"`,
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        downloadFile(csv, `lingoai_speaking_attempts_${stamp}.csv`, "csv");
      } else {
        const json = JSON.stringify(attempts, null, 2);
        downloadFile(json, `lingoai_speaking_attempts_${stamp}.json`, "json");
      }
      setDownloading(null);
    }, 400);
  };

  const handleExportContent = (format: "csv" | "json") => {
    setDownloading("content");
    setTimeout(() => {
      const stamp = new Date().toISOString().slice(0, 10);
      if (format === "csv") {
        const headers = ["Type", "ID", "Title/Word", "Category/POS", "Description/Definition"];
        const lessonRows = lessons.map((l) => [
          "Lesson",
          l.id,
          `"${l.title.replace(/"/g, '""')}"`,
          l.category,
          `"${l.description.replace(/"/g, '""')}"`,
        ]);
        const vocabRows = vocabularies.map((v) => [
          "Vocabulary",
          v.id,
          `"${v.word.replace(/"/g, '""')}"`,
          v.partOfSpeech || "noun",
          `"${v.definition.replace(/"/g, '""')}"`,
        ]);
        const csv = [headers.join(","), ...lessonRows.map((r) => r.join(",")), ...vocabRows.map((r) => r.join(","))].join("\n");
        downloadFile(csv, `lingoai_curriculum_content_${stamp}.csv`, "csv");
      } else {
        const json = JSON.stringify({ lessons, vocabularies }, null, 2);
        downloadFile(json, `lingoai_curriculum_content_${stamp}.json`, "json");
      }
      setDownloading(null);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="p-6 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl">
        <h3 className="text-base font-bold text-white tracking-tight">
          Reports & Export Center
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Generate structured CSV and JSON exports for academic review, accreditation, and administrative archiving.
        </p>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Users Export */}
        <div className="p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 text-lg">👥</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {users.length} Records
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Student Demographics</h4>
            <p className="text-xs text-slate-400 mb-4">
              All registered student profiles, proficiency tiers, language pairs, and join timestamps.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => handleExportUsers("csv")}
              disabled={downloading === "users"}
              className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              CSV
            </button>
            <button
              onClick={() => handleExportUsers("json")}
              disabled={downloading === "users"}
              className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-colors disabled:opacity-50"
            >
              JSON
            </button>
          </div>
        </div>

        {/* Practice Attempts Export */}
        <div className="p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-lg">🎙️</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {attempts.length} Records
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Speaking Performance</h4>
            <p className="text-xs text-slate-400 mb-4">
              Voice attempts, target phrases, transcripts, AI phonetic scores, and difficulty ranks.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => handleExportAttempts("csv")}
              disabled={downloading === "attempts"}
              className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              CSV
            </button>
            <button
              onClick={() => handleExportAttempts("json")}
              disabled={downloading === "attempts"}
              className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-colors disabled:opacity-50"
            >
              JSON
            </button>
          </div>
        </div>

        {/* Curriculum Content Export */}
        <div className="p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-lg">📚</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {lessons.length + vocabularies.length} Records
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Curriculum Inventory</h4>
            <p className="text-xs text-slate-400 mb-4">
              Complete inventory of lessons, categories, vocabulary words, definitions, and POS.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => handleExportContent("csv")}
              disabled={downloading === "content"}
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              CSV
            </button>
            <button
              onClick={() => handleExportContent("json")}
              disabled={downloading === "content"}
              className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-colors disabled:opacity-50"
            >
              JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
