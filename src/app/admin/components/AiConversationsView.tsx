"use client";

import React, { useState, useMemo } from "react";

export interface PracticeAttemptItem {
  id: number;
  userId: number;
  phrase: string;
  score: number;
  difficulty: string;
  status: string;
  transcript?: string | null;
  grammarFeedback?: string | null;
  fluencyFeedback?: string | null;
  vocabFeedback?: string | null;
  createdAt: string;
}

interface AiConversationsViewProps {
  attempts: PracticeAttemptItem[];
  users: { id: number; name?: string | null; email: string }[];
}

export default function AiConversationsView({ attempts, users }: AiConversationsViewProps) {
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [selectedAttempt, setSelectedAttempt] = useState<PracticeAttemptItem | null>(null);

  const filtered = useMemo(() => {
    return attempts.filter((att) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        att.phrase.toLowerCase().includes(q) ||
        (att.transcript && att.transcript.toLowerCase().includes(q));

      const matchScore =
        scoreFilter === "all" ||
        (scoreFilter === "fluent" && att.score >= 80) ||
        (scoreFilter === "fair" && att.score >= 60 && att.score < 80) ||
        (scoreFilter === "low" && att.score < 60);

      return matchSearch && matchScore;
    });
  }, [attempts, search, scoreFilter]);

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800/80 shadow-xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
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
              placeholder="Search phrase, transcript, or feedback..."
              className="w-full py-2 pl-9 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Score Ranges</option>
            <option value="fluent">Fluent (80 - 100%)</option>
            <option value="fair">Developing (60 - 79%)</option>
            <option value="low">Needs Attention (&lt; 60%)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">
            {attempts.length} Total AI Speech Attempts Recorded
          </span>
        </div>
      </div>

      {/* Attempts Grid / Table */}
      <div className="overflow-hidden rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800/80 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Target Phrase</th>
                <th className="px-5 py-3.5">User Audio Transcript</th>
                <th className="px-5 py-3.5">Phonetic Score</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No speaking attempts found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((att) => {
                  const student = users.find((u) => u.id === att.userId);
                  const scoreColor =
                    att.score >= 80
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : att.score >= 60
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/30";

                  return (
                    <tr
                      key={att.id}
                      onClick={() => setSelectedAttempt(att)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-white group-hover:text-purple-300 transition-colors">
                          {student?.name || `Student #${att.userId}`}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {student?.email || "Registered Student"}
                        </p>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <p className="font-semibold text-slate-200 line-clamp-1">"{att.phrase}"</p>
                        <span className="text-[10px] text-slate-400">Tier: {att.difficulty}</span>
                      </td>

                      <td className="px-5 py-4 max-w-xs font-mono text-[11px] text-slate-300">
                        {att.transcript ? (
                          <span className="line-clamp-1">"{att.transcript}"</span>
                        ) : (
                          <span className="text-slate-400 italic">No transcript recorded</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg font-black text-xs border ${scoreColor}`}>
                          {att.score}%
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-400 text-[11px]">
                        {new Date(att.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAttempt(att);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-600/20 text-purple-300 border border-slate-800 text-xs font-medium transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attempt Details Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0D1127] border border-slate-700/80 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">AI Voice Evaluation Details</h3>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">Expected Target Phrase</span>
                <p className="text-sm font-bold text-white">"{selectedAttempt.phrase}"</p>
              </div>

              {selectedAttempt.transcript && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                  <span className="text-slate-400 block mb-1">Student Speech Recognition Transcript</span>
                  <p className="text-xs text-purple-300">"{selectedAttempt.transcript}"</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Calculated Score</span>
                  <span className="text-lg font-black text-emerald-400">{selectedAttempt.score}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Evaluation Status</span>
                  <span className="text-sm font-bold text-cyan-400">{selectedAttempt.status}</span>
                </div>
              </div>

              {selectedAttempt.grammarFeedback && (
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 text-purple-200">
                  <span className="font-bold text-purple-400 block mb-1">Grammar & Syntax Assessment</span>
                  <p>{selectedAttempt.grammarFeedback}</p>
                </div>
              )}

              {selectedAttempt.fluencyFeedback && (
                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-900/40 text-cyan-200">
                  <span className="font-bold text-cyan-400 block mb-1">Fluency & Cadence Assessment</span>
                  <p>{selectedAttempt.fluencyFeedback}</p>
                </div>
              )}

              {selectedAttempt.vocabFeedback && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-emerald-200">
                  <span className="font-bold text-emerald-400 block mb-1">Lexical Choice & Vocabulary</span>
                  <p>{selectedAttempt.vocabFeedback}</p>
                </div>
              )}

              <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Recorded: {new Date(selectedAttempt.createdAt).toLocaleString()}</span>
                <span>User ID: #{selectedAttempt.userId}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAttempt(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
