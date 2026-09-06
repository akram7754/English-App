"use client";

import React, { useState, useEffect } from "react";
import {
  createCourseAction,
  editCourseAction,
  createLessonAction,
  editLessonAction,
  createVocabularyAction,
  editVocabularyAction,
} from "../actions";

// =========================================================================
// 1. COURSE MODAL
// =========================================================================

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: { id?: number; title: string; description?: string | null };
  onSuccess: (course: any) => void;
}

export function CourseModal({ isOpen, onClose, initialData, onSuccess }: CourseModalProps) {
  const isEditing = Boolean(initialData?.id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && initialData?.id) {
        const res = await editCourseAction(initialData.id, title, description);
        if (res.success) {
          onSuccess(res.course);
          onClose();
        } else {
          setError(res.error || "Failed to update course");
        }
      } else {
        const res = await createCourseAction(title, description);
        if (res.success) {
          onSuccess(res.course);
          onClose();
        } else {
          setError(res.error || "Failed to create course");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0D1127] border border-slate-700/80 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">
            {isEditing ? "Edit Course Module" : "Create New Course Module"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. English for Real-World Conversations"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of this curriculum track..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// 2. LESSON MODAL
// =========================================================================

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: { id: number; title: string }[];
  initialData?: {
    id?: number;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    content: string;
    courseId?: number | null;
  };
  onSuccess: (lesson: any) => void;
}

export function LessonModal({
  isOpen,
  onClose,
  courses,
  initialData,
  onSuccess,
}: LessonModalProps) {
  const isEditing = Boolean(initialData?.id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Grammar");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [courseId, setCourseId] = useState<number | undefined>(undefined);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setCategory(initialData.category || "Grammar");
      setDifficulty(initialData.difficulty || "Beginner");
      setCourseId(initialData.courseId || undefined);
      setContent(initialData.content || "");
    } else {
      setTitle("");
      setDescription("");
      setCategory("Grammar");
      setDifficulty("Beginner");
      setCourseId(courses[0]?.id || undefined);
      setContent("");
    }
  }, [initialData, isOpen, courses]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && initialData?.id) {
        const res = await editLessonAction(
          initialData.id,
          title,
          description,
          category,
          difficulty,
          content,
          courseId || null
        );
        if (res.success) {
          onSuccess(res.lesson);
          onClose();
        } else {
          setError(res.error || "Failed to update lesson");
        }
      } else {
        const res = await createLessonAction(
          title,
          description,
          category,
          difficulty,
          content,
          courseId || null
        );
        if (res.success) {
          onSuccess(res.lesson);
          onClose();
        } else {
          setError(res.error || "Failed to create lesson");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0D1127] border border-slate-700/80 shadow-2xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">
            {isEditing ? "Edit Curriculum Lesson" : "Create New Lesson"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Lesson Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mastering Present Continuous"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Goal</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short explanation of concepts taught..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="Grammar">Grammar</option>
                <option value="Vocabulary">Vocabulary</option>
                <option value="Speaking">Speaking</option>
                <option value="Pronunciation">Pronunciation</option>
                <option value="Listening">Listening</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="Beginner">Beginner (A1-A2)</option>
                <option value="Intermediate">Intermediate (B1-B2)</option>
                <option value="Advanced">Advanced (C1-C2)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course Module</label>
              <select
                value={courseId || ""}
                onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="">No Course (Standalone)</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Lesson Content / Script</label>
            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Interactive lesson explanation, phrases to practice, rules, and tips..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : isEditing ? "Save Lesson" : "Publish Lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// 3. VOCABULARY MODAL
// =========================================================================

interface VocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    id?: number;
    word: string;
    definition: string;
    partOfSpeech?: string | null;
    example?: string | null;
  };
  onSuccess: (vocab: any) => void;
}

export function VocabularyModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: VocabularyModalProps) {
  const isEditing = Boolean(initialData?.id);
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("noun");
  const [example, setExample] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setWord(initialData.word || "");
      setDefinition(initialData.definition || "");
      setPartOfSpeech(initialData.partOfSpeech || "noun");
      setExample(initialData.example || "");
    } else {
      setWord("");
      setDefinition("");
      setPartOfSpeech("noun");
      setExample("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing && initialData?.id) {
        const res = await editVocabularyAction(
          initialData.id,
          word,
          definition,
          partOfSpeech,
          example
        );
        if (res.success) {
          onSuccess(res.vocab);
          onClose();
        } else {
          setError(res.error || "Failed to update vocabulary");
        }
      } else {
        const res = await createVocabularyAction(word, definition, partOfSpeech, example);
        if (res.success) {
          onSuccess(res.vocab);
          onClose();
        } else {
          setError(res.error || "Failed to create vocabulary");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0D1127] border border-slate-700/80 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">
            {isEditing ? "Edit Vocabulary Word" : "Add Vocabulary Word"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Word</label>
              <input
                type="text"
                required
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="e.g. Eloquent"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Part of Speech</label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
              >
                <option value="noun">noun</option>
                <option value="verb">verb</option>
                <option value="adjective">adjective</option>
                <option value="adverb">adverb</option>
                <option value="idiom">idiom</option>
                <option value="phrase">phrase</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Definition</label>
            <textarea
              rows={2}
              required
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="Clear, learner-friendly explanation..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Example Sentence</label>
            <textarea
              rows={2}
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="e.g. She gave an eloquent presentation to the board."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-purple-500 italic"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : isEditing ? "Save Word" : "Add Word"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
