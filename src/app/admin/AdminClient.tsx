"use client";

import React, { useState } from "react";
import Link from "next/link";
import { logoutAction } from "../login/actions";
import MobileHeader from "../components/MobileHeader";
import {
  createCourseAction,
  editCourseAction,
  deleteCourseAction,
  createLessonAction,
  editLessonAction,
  deleteLessonAction,
  createVocabularyAction,
  editVocabularyAction,
  deleteVocabularyAction,
  getUserProgressDetailAction,
} from "./actions";

interface UserData {
  id: number;
  email: string;
  name?: string | null;
  username?: string | null;
  createdAt: string;
}

interface CourseData {
  id: number;
  title: string;
  description?: string | null;
  createdAt: string;
}

interface LessonData {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  content: string;
  courseId?: number | null;
  createdAt: string;
}

interface VocabularyData {
  id: number;
  word: string;
  definition: string;
  partOfSpeech?: string | null;
  example?: string | null;
  createdAt: string;
}

interface AdminClientProps {
  initialUsers: UserData[];
  initialCourses: CourseData[];
  initialLessons: LessonData[];
  initialVocabularies: VocabularyData[];
  initialAttemptsCount: number;
  initialPostsCount: number;
  userName: string;
  userInitials: string;
}

export default function AdminClient({
  initialUsers,
  initialCourses,
  initialLessons,
  initialVocabularies,
  initialAttemptsCount,
  initialPostsCount,
  userName,
  userInitials,
}: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "lessons" | "vocabulary" | "users">("overview");

  // Local state for records
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [courses, setCourses] = useState<CourseData[]>(initialCourses);
  const [lessons, setLessons] = useState<LessonData[]>(initialLessons);
  const [vocabularies, setVocabularies] = useState<VocabularyData[]>(initialVocabularies);
  const [attemptsCount, setAttemptsCount] = useState<number>(initialAttemptsCount);

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({ id: 0, title: "", description: "" });

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    id: 0,
    title: "",
    description: "",
    category: "Grammar",
    difficulty: "Beginner",
    content: "",
    courseId: "",
  });

  const [showVocabModal, setShowVocabModal] = useState(false);
  const [vocabForm, setVocabForm] = useState({
    id: 0,
    word: "",
    definition: "",
    partOfSpeech: "noun",
    example: "",
  });

  // User details state
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userDetails, setUserDetails] = useState<{
    lessonCompletions: any[];
    vocabProgress: any[];
    practiceAttempts: any[];
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // General Loading
  const [loading, setLoading] = useState(false);

  // ==========================================
  // COURSE CRUD HANDLERS
  // ==========================================
  const handleOpenCourseCreate = () => {
    setCourseForm({ id: 0, title: "", description: "" });
    setShowCourseModal(true);
  };

  const handleOpenCourseEdit = (course: CourseData) => {
    setCourseForm({ id: course.id, title: course.title, description: course.description || "" });
    setShowCourseModal(true);
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (courseForm.id === 0) {
      // Create
      const res = await createCourseAction(courseForm.title, courseForm.description);
      if (res.success && res.course) {
        setCourses((prev) => [...prev, res.course as unknown as CourseData]);
        setShowCourseModal(false);
      } else {
        alert(res.error || "Failed to create course");
      }
    } else {
      // Edit
      const res = await editCourseAction(courseForm.id, courseForm.title, courseForm.description);
      if (res.success && res.course) {
        setCourses((prev) => prev.map((c) => (c.id === courseForm.id ? (res.course as unknown as CourseData) : c)));
        setShowCourseModal(false);
      } else {
        alert(res.error || "Failed to edit course");
      }
    }
    setLoading(false);
  };

  const handleCourseDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this course? Lessons inside this course will be detached, not deleted.")) return;
    setLoading(true);
    const res = await deleteCourseAction(id);
    if (res.success) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
      // Reset detached lesson reference in UI
      setLessons((prev) => prev.map((l) => (l.courseId === id ? { ...l, courseId: null } : l)));
    } else {
      alert(res.error || "Failed to delete course");
    }
    setLoading(false);
  };

  // ==========================================
  // LESSON CRUD HANDLERS
  // ==========================================
  const handleOpenLessonCreate = () => {
    setLessonForm({ id: 0, title: "", description: "", category: "Grammar", difficulty: "Beginner", content: "", courseId: "" });
    setShowLessonModal(true);
  };

  const handleOpenLessonEdit = (lesson: LessonData) => {
    setLessonForm({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      category: lesson.category,
      difficulty: lesson.difficulty,
      content: lesson.content,
      courseId: lesson.courseId ? String(lesson.courseId) : "",
    });
    setShowLessonModal(true);
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const cId = lessonForm.courseId ? Number(lessonForm.courseId) : null;
    if (lessonForm.id === 0) {
      // Create
      const res = await createLessonAction(lessonForm.title, lessonForm.description, lessonForm.category, lessonForm.difficulty, lessonForm.content, cId);
      if (res.success && res.lesson) {
        setLessons((prev) => [...prev, res.lesson as unknown as LessonData]);
        setShowLessonModal(false);
      } else {
        alert(res.error || "Failed to create lesson");
      }
    } else {
      // Edit
      const res = await editLessonAction(lessonForm.id, lessonForm.title, lessonForm.description, lessonForm.category, lessonForm.difficulty, lessonForm.content, cId);
      if (res.success && res.lesson) {
        setLessons((prev) => prev.map((l) => (l.id === lessonForm.id ? (res.lesson as unknown as LessonData) : l)));
        setShowLessonModal(false);
      } else {
        alert(res.error || "Failed to edit lesson");
      }
    }
    setLoading(false);
  };

  const handleLessonDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lesson? This will clear all student completion history for this lesson.")) return;
    setLoading(true);
    const res = await deleteLessonAction(id);
    if (res.success) {
      setLessons((prev) => prev.filter((l) => l.id !== id));
    } else {
      alert(res.error || "Failed to delete lesson");
    }
    setLoading(false);
  };

  // ==========================================
  // VOCABULARY CRUD HANDLERS
  // ==========================================
  const handleOpenVocabCreate = () => {
    setVocabForm({ id: 0, word: "", definition: "", partOfSpeech: "noun", example: "" });
    setShowVocabModal(true);
  };

  const handleOpenVocabEdit = (vocab: VocabularyData) => {
    setVocabForm({
      id: vocab.id,
      word: vocab.word,
      definition: vocab.definition,
      partOfSpeech: vocab.partOfSpeech || "noun",
      example: vocab.example || "",
    });
    setShowVocabModal(true);
  };

  const handleVocabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (vocabForm.id === 0) {
      // Create
      const res = await createVocabularyAction(vocabForm.word, vocabForm.definition, vocabForm.partOfSpeech, vocabForm.example);
      if (res.success && res.vocab) {
        setVocabularies((prev) => [...prev, res.vocab as unknown as VocabularyData]);
        setShowVocabModal(false);
      } else {
        alert(res.error || "Failed to create vocabulary");
      }
    } else {
      // Edit
      const res = await editVocabularyAction(vocabForm.id, vocabForm.word, vocabForm.definition, vocabForm.partOfSpeech, vocabForm.example);
      if (res.success && res.vocab) {
        setVocabularies((prev) => prev.map((v) => (v.id === vocabForm.id ? (res.vocab as unknown as VocabularyData) : v)));
        setShowVocabModal(false);
      } else {
        alert(res.error || "Failed to edit vocabulary");
      }
    }
    setLoading(false);
  };

  const handleVocabDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vocabulary word? Student progress links will also be removed.")) return;
    setLoading(true);
    const res = await deleteVocabularyAction(id);
    if (res.success) {
      setVocabularies((prev) => prev.filter((v) => v.id !== id));
    } else {
      alert(res.error || "Failed to delete vocabulary");
    }
    setLoading(false);
  };

  // ==========================================
  // STUDENT INSPECT HANDLER
  // ==========================================
  const handleOpenUserDetail = async (user: UserData) => {
    setSelectedUser(user);
    setUserDetails(null);
    setLoadingDetails(true);
    const res = await getUserProgressDetailAction(user.id);
    setLoadingDetails(false);
    if (res.success && res.lessonCompletions && res.vocabProgress && res.practiceAttempts) {
      setUserDetails({
        lessonCompletions: res.lessonCompletions,
        vocabProgress: res.vocabProgress,
        practiceAttempts: res.practiceAttempts,
      });
    } else {
      alert(res.error || "Failed to load student progress details.");
      setSelectedUser(null);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-50 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-indigo-950 text-indigo-100 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/" className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-lg tracking-wider">
              AI
            </Link>
            <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-indigo-200 transition">
              English AI
            </Link>
          </div>

          <nav className="space-y-1.5">
            <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/lessons" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              Lessons / Skills
            </Link>
            <Link href="/ai-tutor" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              AI Tutor
            </Link>
            <Link href="/ai-chat" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              AI Chat
            </Link>
            <Link href="/voice-practice" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              Voice Practice
            </Link>
            <Link href="/grammar-correction" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              Grammar Check
            </Link>
            <Link href="/speaking-score" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              Speaking Score
            </Link>
            <Link href="/progress" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              Progress Track
            </Link>
            <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-indigo-900 text-white font-medium transition">
              Admin Panel
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              My Profile
            </Link>
            <form action={logoutAction} className="w-full">
              <button type="submit" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white text-left transition">
                Logout / Exit
              </button>
            </form>
          </nav>
        </div>

        <div className="p-6 border-t border-indigo-900/60 bg-indigo-950/50">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <div className="text-xs text-indigo-200">
              <p className="font-semibold text-white">Admin Console Live</p>
              <p className="opacity-75">{users.length} system users</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader userName={userName} userInitials={userInitials} />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 sm:p-8 space-y-8 flex-1">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Admin Control Center</h1>
              <p className="text-zinc-500 text-sm mt-1">Manage database records for Courses, Lessons, Vocabulary, and Student learning progress profiles.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl overflow-hidden overflow-x-auto shrink-0 pb-1">
              {(["overview", "courses", "lessons", "vocabulary", "users"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-6 text-xs font-bold uppercase tracking-wider transition shrink-0 ${
                    activeTab === tab
                      ? "bg-white border-b-2 border-indigo-600 text-indigo-600 dark:bg-zinc-900"
                      : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                  }`}
                >
                  {tab === "users" ? "Students" : tab}
                </button>
              ))}
            </div>

            {/* TAB OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {/* Users */}
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Total Students</p>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{users.length}</p>
                  </div>
                  {/* Courses */}
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Total Courses</p>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{courses.length}</p>
                  </div>
                  {/* Lessons */}
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Total Lessons</p>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{lessons.length}</p>
                  </div>
                  {/* Vocabulary */}
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Vocabulary words</p>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{vocabularies.length}</p>
                  </div>
                  {/* Practice Attempts */}
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider">Speaking Attempts</p>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{attemptsCount}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                  <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200 mb-2">Welcome to LingoAI Admin</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">Use the navigation tabs above to manage dynamic learning content or inspect registered user achievements. Changes take effect across the lessons directories and dashboard metrics instantly.</p>
                </div>
              </div>
            )}

            {/* TAB COURSES */}
            {activeTab === "courses" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Course Management</h3>
                  <button
                    onClick={handleOpenCourseCreate}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Add New Course
                  </button>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-500 dark:text-zinc-400">
                      <thead className="bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-wider dark:bg-zinc-950/40">
                        <tr>
                          <th className="px-6 py-3">ID</th>
                          <th className="px-6 py-3">Title</th>
                          <th className="px-6 py-3">Description</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {courses.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-zinc-400">No courses defined yet.</td>
                          </tr>
                        ) : (
                          courses.map((course) => (
                            <tr key={course.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10">
                              <td className="px-6 py-4 font-semibold text-zinc-400">#{course.id}</td>
                              <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">{course.title}</td>
                              <td className="px-6 py-4 max-w-xs truncate">{course.description || "N/A"}</td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button
                                  onClick={() => handleOpenCourseEdit(course)}
                                  className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded text-[10px] dark:bg-indigo-950/40 dark:text-indigo-400"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleCourseDelete(course.id)}
                                  className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded text-[10px] dark:bg-red-950/40 dark:text-red-400"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB LESSONS */}
            {activeTab === "lessons" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Lesson Management</h3>
                  <button
                    onClick={handleOpenLessonCreate}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Add New Lesson
                  </button>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-500 dark:text-zinc-400">
                      <thead className="bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-wider dark:bg-zinc-950/40">
                        <tr>
                          <th className="px-6 py-3">ID</th>
                          <th className="px-6 py-3">Title</th>
                          <th className="px-6 py-3">Category</th>
                          <th className="px-6 py-3">Difficulty</th>
                          <th className="px-6 py-3">Assigned Course</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {lessons.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">No lessons created yet.</td>
                          </tr>
                        ) : (
                          lessons.map((lesson) => {
                            const matchedCourse = courses.find((c) => c.id === lesson.courseId);
                            return (
                              <tr key={lesson.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10">
                                <td className="px-6 py-4 font-semibold text-zinc-400">#{lesson.id}</td>
                                <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">{lesson.title}</td>
                                <td className="px-6 py-4">{lesson.category}</td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-0.5 font-bold uppercase tracking-wider text-[9px] bg-zinc-100 text-zinc-600 rounded">
                                    {lesson.difficulty}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-semibold">
                                  {matchedCourse ? matchedCourse.title : "None"}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                  <button
                                    onClick={() => handleOpenLessonEdit(lesson)}
                                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded text-[10px] dark:bg-indigo-950/40 dark:text-indigo-400"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleLessonDelete(lesson.id)}
                                    className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded text-[10px] dark:bg-red-950/40 dark:text-red-400"
                                  >
                                    Delete
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
              </div>
            )}

            {/* TAB VOCABULARY */}
            {activeTab === "vocabulary" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Vocabulary Bank</h3>
                  <button
                    onClick={handleOpenVocabCreate}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Add Word
                  </button>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-500 dark:text-zinc-400">
                      <thead className="bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-wider dark:bg-zinc-950/40">
                        <tr>
                          <th className="px-6 py-3">ID</th>
                          <th className="px-6 py-3">Word</th>
                          <th className="px-6 py-3">Part of Speech</th>
                          <th className="px-6 py-3">Definition</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {vocabularies.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-zinc-400">No vocabulary words defined.</td>
                          </tr>
                        ) : (
                          vocabularies.map((vocab) => (
                            <tr key={vocab.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10">
                              <td className="px-6 py-4 font-semibold text-zinc-400">#{vocab.id}</td>
                              <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">{vocab.word}</td>
                              <td className="px-6 py-4 italic">{vocab.partOfSpeech || "N/A"}</td>
                              <td className="px-6 py-4 max-w-xs truncate">{vocab.definition}</td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button
                                  onClick={() => handleOpenVocabEdit(vocab)}
                                  className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded text-[10px] dark:bg-indigo-950/40 dark:text-indigo-400"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleVocabDelete(vocab.id)}
                                  className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded text-[10px] dark:bg-red-950/40 dark:text-red-400"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB USERS / STUDENTS */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Student Directory</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">Click on a user row to inspect their learning completions, streaks, and practice attempts history.</p>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-zinc-500 dark:text-zinc-400">
                      <thead className="bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-wider dark:bg-zinc-950/40">
                        <tr>
                          <th className="px-6 py-3">ID</th>
                          <th className="px-6 py-3">Name</th>
                          <th className="px-6 py-3">Email</th>
                          <th className="px-6 py-3">Joined Date</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10">
                            <td className="px-6 py-4 font-semibold text-zinc-400">#{user.id}</td>
                            <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">{user.name || "N/A"}</td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4">
                              {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleOpenUserDetail(user)}
                                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded text-[10px] dark:bg-indigo-950/40 dark:text-indigo-400 transition"
                              >
                                Inspect Progress
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ==========================================
          MODALS / DIALOGS
          ========================================== */}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
              {courseForm.id === 0 ? "Create Course" : "Edit Course"}
            </h3>
            <form onSubmit={handleCourseSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. Grammar Fundamentals"
                  className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-xl text-sm focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Course layout and target syllabus..."
                  className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-xl text-sm focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl text-xs text-zinc-550 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-xs transition"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
              {lessonForm.id === 0 ? "Create Lesson" : "Edit Lesson"}
            </h3>
            <form onSubmit={handleLessonSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    required
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="Lesson title..."
                    className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-xl text-sm focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Category</label>
                  <select
                    value={lessonForm.category}
                    onChange={(e) => setLessonForm({ ...lessonForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-xl text-sm focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    <option value="Grammar">Grammar</option>
                    <option value="Vocabulary">Vocabulary</option>
                    <option value="Speaking">Speaking</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Difficulty</label>
                  <select
                    value={lessonForm.difficulty}
                    onChange={(e) => setLessonForm({ ...lessonForm, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-xl text-sm focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Parent Course</label>
                  <select
                    value={lessonForm.courseId}
                    onChange={(e) => setLessonForm({ ...lessonForm, courseId: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-xl text-sm focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    <option value="">None / Unassigned</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  required
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  placeholder="Short overview sentence..."
                  className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-xl text-sm focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Content</label>
                <textarea
                  required
                  rows={6}
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  placeholder="Markdown lesson layout content..."
                  className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-xl text-sm focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl text-xs text-zinc-550 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-xs transition"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vocabulary Modal */}
      {showVocabModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
              {vocabForm.id === 0 ? "Add Vocabulary Word" : "Edit Vocabulary Word"}
            </h3>
            <form onSubmit={handleVocabSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Word</label>
                <input
                  type="text"
                  required
                  value={vocabForm.word}
                  onChange={(e) => setVocabForm({ ...vocabForm, word: e.target.value })}
                  placeholder="e.g. Ubiquitous"
                  className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-xl text-sm focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Part of Speech</label>
                <input
                  type="text"
                  value={vocabForm.partOfSpeech}
                  onChange={(e) => setVocabForm({ ...vocabForm, partOfSpeech: e.target.value })}
                  placeholder="e.g. adjective"
                  className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-xl text-sm focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Definition</label>
                <input
                  type="text"
                  required
                  value={vocabForm.definition}
                  onChange={(e) => setVocabForm({ ...vocabForm, definition: e.target.value })}
                  placeholder="Dictionary definition..."
                  className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-xl text-sm focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Example sentence</label>
                <input
                  type="text"
                  value={vocabForm.example}
                  onChange={(e) => setVocabForm({ ...vocabForm, example: e.target.value })}
                  placeholder="Phrase demonstrating correct usage..."
                  className="w-full px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-xl text-sm focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowVocabModal(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl text-xs text-zinc-550 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-xs transition"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details / Progress Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl space-y-6 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h3 className="font-extrabold text-xl text-zinc-900 dark:text-zinc-50">
                  Student Progress: {selectedUser.name || "N/A"}
                </h3>
                <p className="text-xs text-zinc-400">@{selectedUser.username} • {selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center font-bold text-zinc-500 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            {loadingDetails ? (
              <div className="text-center py-12 text-zinc-400 font-semibold animate-pulse">
                Querying student database log history...
              </div>
            ) : userDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Completions Panel */}
                <div className="bg-zinc-50 border border-zinc-100 p-5 rounded-2xl space-y-4 dark:bg-zinc-950/40 dark:border-zinc-800">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 border-b pb-2 dark:border-zinc-800">
                    Lessons Completed ({userDetails.lessonCompletions.length})
                  </h4>
                  {userDetails.lessonCompletions.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">No lessons completed yet.</p>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {userDetails.lessonCompletions.map((item) => (
                        <li key={item.id} className="flex justify-between items-center bg-white p-2 rounded border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[150px]">{item.lesson?.title}</span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(item.completedAt).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Vocabulary Learned Panel */}
                <div className="bg-zinc-50 border border-zinc-100 p-5 rounded-2xl space-y-4 dark:bg-zinc-950/40 dark:border-zinc-800">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 border-b pb-2 dark:border-zinc-800">
                    Vocabulary Saved ({userDetails.vocabProgress.length})
                  </h4>
                  {userDetails.vocabProgress.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">No vocabulary words saved.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {userDetails.vocabProgress.map((item) => (
                        <span key={item.id} className="text-[10px] bg-white border border-zinc-200 text-zinc-700 px-2 py-1 rounded-full dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 font-bold">
                          {item.vocab?.word}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Speaking attempts logs */}
                <div className="bg-zinc-50 border border-zinc-100 p-5 rounded-2xl space-y-4 dark:bg-zinc-950/40 dark:border-zinc-800">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 border-b pb-2 dark:border-zinc-800">
                    Speaking Attempts History ({userDetails.practiceAttempts.length})
                  </h4>
                  {userDetails.practiceAttempts.length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">No practice attempts recorded.</p>
                  ) : (
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                      {userDetails.practiceAttempts.map((item) => (
                        <div key={item.id} className="bg-white p-3 rounded-xl border border-zinc-200 text-xs space-y-1.5 dark:bg-zinc-900 dark:border-zinc-800">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-zinc-850 dark:text-zinc-250 truncate max-w-[120px]">"{item.phrase}"</span>
                            <span className={`font-bold ${item.score >= 90 ? "text-green-600" : item.score >= 75 ? "text-amber-500" : "text-red-500"}`}>
                              {item.score}%
                            </span>
                          </div>
                          {item.transcript && (
                            <p className="text-zinc-400 italic text-[10px]">Spoke: "{item.transcript}"</p>
                          )}
                          <p className="text-[9px] text-zinc-400 text-right">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-400 italic">
                No user history metrics found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
