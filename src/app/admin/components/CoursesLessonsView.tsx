"use client";

import React, { useState, useMemo } from "react";
import { deleteCourseAction, deleteLessonAction } from "../actions";

interface CourseItem {
  id: number;
  title: string;
  description?: string | null;
  createdAt: string;
}

interface LessonItem {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  content: string;
  courseId?: number | null;
  createdAt: string;
}

interface CoursesLessonsViewProps {
  courses: CourseItem[];
  lessons: LessonItem[];
  onAddCourse: () => void;
  onEditCourse: (course: CourseItem) => void;
  onCourseDeleted: (courseId: number) => void;
  onAddLesson: () => void;
  onEditLesson: (lesson: LessonItem) => void;
  onLessonDeleted: (lessonId: number) => void;
}

export default function CoursesLessonsView({
  courses,
  lessons,
  onAddCourse,
  onEditCourse,
  onCourseDeleted,
  onAddLesson,
  onEditLesson,
  onLessonDeleted,
}: CoursesLessonsViewProps) {
  const [activeTab, setActiveTab] = useState<"lessons" | "courses">("lessons");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q);

      const matchCategory =
        categoryFilter === "all" || l.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchDifficulty =
        difficultyFilter === "all" || l.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

      return matchSearch && matchCategory && matchDifficulty;
    });
  }, [lessons, search, categoryFilter, difficultyFilter]);

  const handleDeleteCourse = async (c: CourseItem) => {
    if (!confirm(`Are you sure you want to delete course "${c.title}"? Lessons linked to it will become standalone.`)) {
      return;
    }

    setDeletingId(c.id);
    setActionError(null);
    try {
      const res = await deleteCourseAction(c.id);
      if (res.success) {
        onCourseDeleted(c.id);
      } else {
        setActionError(res.error || "Failed to delete course");
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to delete course");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteLesson = async (l: LessonItem) => {
    if (!confirm(`Delete lesson "${l.title}"? Note: If students have already completed this lesson, it will be protected to preserve their records.`)) {
      return;
    }

    setDeletingId(l.id);
    setActionError(null);
    try {
      const res = await deleteLessonAction(l.id);
      if (res.success) {
        onLessonDeleted(l.id);
      } else {
        setActionError(res.error || "Failed to delete lesson");
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to delete lesson");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Tab Switcher & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab("lessons")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "lessons"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Curriculum Lessons ({lessons.length})
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "courses"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Course Modules ({courses.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "lessons" ? (
            <button
              onClick={onAddLesson}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Lesson</span>
            </button>
          ) : (
            <button
              onClick={onAddCourse}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Course</span>
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* LESSONS VIEW */}
      {activeTab === "lessons" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-[#0D1127]/80 border border-slate-800">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lessons by title or topic..."
                className="w-full py-1.5 pl-9 pr-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="Grammar">Grammar</option>
              <option value="Speaking">Speaking</option>
              <option value="Vocabulary">Vocabulary</option>
              <option value="Pronunciation">Pronunciation</option>
              <option value="Listening">Listening</option>
              <option value="Business">Business</option>
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Lessons Table */}
          <div className="overflow-hidden rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800/80 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Lesson</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Difficulty</th>
                    <th className="px-5 py-3.5">Module Course</th>
                    <th className="px-5 py-3.5">Created</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLessons.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                        No lessons found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLessons.map((l) => {
                      const course = courses.find((c) => c.id === l.courseId);

                      return (
                        <tr key={l.id} className="hover:bg-slate-800/40 transition-colors group">
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-bold text-white group-hover:text-purple-300 transition-colors">
                                {l.title}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate max-w-sm">
                                {l.description}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-purple-300 border border-purple-500/20">
                              {l.category}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                l.difficulty === "Advanced"
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : l.difficulty === "Intermediate"
                                  ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                  : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                              }`}
                            >
                              {l.difficulty}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-slate-300">
                            {course ? (
                              <span className="font-medium text-slate-300">{course.title}</span>
                            ) : (
                              <span className="text-slate-400 italic">Standalone</span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-slate-400 text-[11px]">
                            {new Date(l.createdAt).toLocaleDateString()}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onEditLesson(l)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-600/20 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
                                title="Edit Lesson"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(l)}
                                disabled={deletingId === l.id}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-600/20 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors disabled:opacity-50"
                                title="Delete Lesson"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
      )}

      {/* COURSES VIEW */}
      {activeTab === "courses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 text-xs">
              No courses created yet. Click "+ New Course" to add one.
            </div>
          ) : (
            courses.map((c) => {
              const courseLessons = lessons.filter((l) => l.courseId === c.id);

              return (
                <div
                  key={c.id}
                  className="flex flex-col justify-between p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800/80 shadow-xl hover:border-purple-500/40 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {courseLessons.length} Lesson{courseLessons.length === 1 ? "" : "s"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">#{c.id}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors mb-2">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 mb-4">
                      {c.description || "No description provided for this course module."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditCourse(c)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c)}
                        disabled={deletingId === c.id}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-rose-300 text-xs font-semibold border border-rose-900/40 transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
