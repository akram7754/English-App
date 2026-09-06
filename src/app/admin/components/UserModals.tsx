"use client";

import React, { useState, useEffect } from "react";
import { updateUserAction, createUserAction, getUserProgressDetailAction } from "../actions";
import { SUPPORTED_LANGUAGES } from "../../../lib/languages";

export interface AdminUserRecord {
  id: number;
  email: string;
  name?: string | null;
  username?: string | null;
  role?: string | null;
  level?: string | null;
  nativeLanguage?: string | null;
  targetLanguage?: string | null;
  dailyGoalMinutes?: number | null;
  createdAt: string;
}

// =========================================================================
// 1. DETAILED USER INSPECTION MODAL
// =========================================================================

interface UserDetailModalProps {
  user: AdminUserRecord | null;
  onClose: () => void;
  onEdit: (user: AdminUserRecord) => void;
}

export function UserDetailModal({ user, onClose, onEdit }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "attempts" | "lessons" | "vocab">("overview");
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    setLoading(true);
    getUserProgressDetailAction(user.id)
      .then((res) => {
        if (isMounted && res.success) {
          setDetails(res);
        }
      })
      .catch((err) => console.error("Failed to load user progress:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) return null;

  const attempts = details?.practiceAttempts || [];
  const lessonProgress = details?.lessonCompletions || [];
  const vocabProgress = details?.vocabProgress || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#0D1127] border border-slate-700/80 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-purple-900/30 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg ring-1 ring-purple-400/50">
              {(user.name || user.username || user.email).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {user.name || user.username || "Anonymous User"}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    user.role === "admin"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  }`}
                >
                  {user.role === "admin" ? "Super Admin" : "Student"}
                </span>
              </div>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(user);
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all"
            >
              Edit Profile
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/40">
          {(
            [
              { id: "overview", label: "Student Profile" },
              { id: "attempts", label: `Speaking Practice (${attempts.length})` },
              { id: "lessons", label: `Lessons Completed (${lessonProgress.length})` },
              { id: "vocab", label: `Vocabulary Mastered (${vocabProgress.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-purple-500 text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <svg className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Querying database history...</span>
            </div>
          ) : activeTab === "overview" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">User ID</span>
                  <span className="text-sm font-bold text-white">#{user.id}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">CEFR Level</span>
                  <span className="text-sm font-bold text-cyan-400">{user.level || "Beginner"}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Daily Target</span>
                  <span className="text-sm font-bold text-emerald-400">{user.dailyGoalMinutes || 30} mins/day</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">I Speak (Native)</span>
                  <span className="text-sm font-bold text-white">{user.nativeLanguage || "Hindi"}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">I Learn (Target)</span>
                  <span className="text-sm font-bold text-purple-400">{user.targetLanguage || "English"}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Member Since</span>
                  <span className="text-sm font-bold text-slate-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Progress Summary Cards */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Voice & Curriculum Highlights</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Recorded across all interactive lessons and Gemini sessions
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-center">
                    <span className="text-lg font-black text-white block">{attempts.length}</span>
                    <span className="text-[10px] text-slate-400">Attempts</span>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-black text-cyan-400 block">{lessonProgress.length}</span>
                    <span className="text-[10px] text-slate-400">Lessons</span>
                  </div>
                  <div className="text-center">
                    <span className="text-lg font-black text-emerald-400 block">{vocabProgress.length}</span>
                    <span className="text-[10px] text-slate-400">Words</span>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "attempts" ? (
            <div className="space-y-3">
              {attempts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No voice practice attempts recorded yet for this student.
                </div>
              ) : (
                attempts.map((att: any) => (
                  <div
                    key={att.id}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        Target Phrase: <span className="text-purple-300">"{att.phrase}"</span>
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-black rounded-lg ${
                          att.score >= 80
                            ? "bg-emerald-500/20 text-emerald-300"
                            : att.score >= 60
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        Score: {att.score}%
                      </span>
                    </div>

                    {att.transcript && (
                      <p className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg font-mono">
                        <span className="text-slate-400 select-none">Transcript: </span>
                        {att.transcript}
                      </p>
                    )}

                    {(att.grammarFeedback || att.fluencyFeedback || att.vocabFeedback) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]">
                        {att.grammarFeedback && (
                          <div className="p-2 rounded bg-purple-950/30 border border-purple-900/40 text-purple-200">
                            <span className="font-bold block text-purple-400">Grammar:</span>
                            {att.grammarFeedback}
                          </div>
                        )}
                        {att.fluencyFeedback && (
                          <div className="p-2 rounded bg-cyan-950/30 border border-cyan-900/40 text-cyan-200">
                            <span className="font-bold block text-cyan-400">Fluency:</span>
                            {att.fluencyFeedback}
                          </div>
                        )}
                        {att.vocabFeedback && (
                          <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900/40 text-emerald-200">
                            <span className="font-bold block text-emerald-400">Vocabulary:</span>
                            {att.vocabFeedback}
                          </div>
                        )}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {new Date(att.createdAt).toLocaleString()} • Difficulty: {att.difficulty}
                    </span>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === "lessons" ? (
            <div className="space-y-2">
              {lessonProgress.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No lessons completed yet by this student.
                </div>
              ) : (
                lessonProgress.map((prog: any) => (
                  <div
                    key={prog.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">
                        {prog.lesson?.title || `Lesson #${prog.lessonId}`}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {prog.lesson?.category || "General"} • {prog.lesson?.difficulty || "Beginner"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400">
                        {prog.score !== undefined ? `${prog.score}%` : "Completed"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(prog.updatedAt || prog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {vocabProgress.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No vocabulary words saved yet by this student.
                </div>
              ) : (
                vocabProgress.map((v: any) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800"
                  >
                    <div>
                      <span className="text-xs font-bold text-white">
                        {v.vocab?.word || `Word #${v.vocabId}`}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {v.vocab?.definition || "Vocabulary term"}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      Mastery Tier: {v.masteryLevel || 1}/5
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. EDIT USER MODAL
// =========================================================================

interface EditUserModalProps {
  user: AdminUserRecord | null;
  onClose: () => void;
  onSuccess: (updated: any) => void;
}

export function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    level: "Beginner",
    role: "student",
    nativeLanguage: "Hindi",
    targetLanguage: "English",
    dailyGoalMinutes: 30,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || user.username || "",
        level: user.level || "Beginner",
        role: user.role || "student",
        nativeLanguage: user.nativeLanguage || "Hindi",
        targetLanguage: user.targetLanguage || "English",
        dailyGoalMinutes: user.dailyGoalMinutes || 30,
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await updateUserAction(user.id, formData);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setError(res.error || "Failed to update user");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0D1127] border border-slate-700/80 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Edit User: {user.email}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="student">Student</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CEFR Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="Beginner">Beginner (A1-A2)</option>
                <option value="Intermediate">Intermediate (B1-B2)</option>
                <option value="Advanced">Advanced (C1-C2)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">I Speak (Native)</label>
              <select
                value={formData.nativeLanguage}
                onChange={(e) => setFormData({ ...formData, nativeLanguage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">I Learn (Target)</label>
              <select
                value={formData.targetLanguage}
                onChange={(e) => setFormData({ ...formData, targetLanguage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Target (Minutes)</label>
            <input
              type="number"
              min="5"
              max="180"
              value={formData.dailyGoalMinutes}
              onChange={(e) => setFormData({ ...formData, dailyGoalMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// 3. CREATE NEW STUDENT / ADMIN MODAL
// =========================================================================

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (created: any) => void;
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    level: "Beginner",
    nativeLanguage: "Hindi",
    targetLanguage: "English",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await createUserAction(formData);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "student",
          level: "Beginner",
          nativeLanguage: "Hindi",
          targetLanguage: "English",
        });
      } else {
        setError(res.error || "Failed to create user");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0D1127] border border-slate-700/80 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Create New Account</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="e.g. student@lingoai.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password (min 6 characters)</label>
            <input
              type="password"
              placeholder="Defaults to 123456 if empty"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Account Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="student">Student</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Starting Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">I Speak (Native)</label>
              <select
                value={formData.nativeLanguage}
                onChange={(e) => setFormData({ ...formData, nativeLanguage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">I Learn (Target)</label>
              <select
                value={formData.targetLanguage}
                onChange={(e) => setFormData({ ...formData, targetLanguage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.name}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
