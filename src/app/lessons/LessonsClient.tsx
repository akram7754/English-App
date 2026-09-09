"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import UserPanelShell from "../components/UserPanelShell";
import { SUPPORTED_LANGUAGES, getLanguageByCode } from "../../lib/languages";
import {
  parseLessonContent,
  StructuredLessonContent,
  LessonItem,
  LessonStage,
} from "../../lib/lesson-curriculum";
import {
  completeLessonAction,
  learnVocabularyAction,
  learnLessonVocabularyListAction,
} from "./actions";
import { initTTS, resolveTTSLocale, speakMultilingualText } from "../../lib/tts";

interface CourseData {
  id: number;
  title: string;
  description?: string | null;
}

interface LessonsClientProps {
  initialLessons: LessonItem[];
  initialCourses?: CourseData[];
  userName?: string;
  userEmail?: string;
  userLevel?: string;
  nativeLanguage?: string;
  targetLanguage?: string;
  initialCompletedLessonIds?: number[];
  recommendedLessonId?: number | null;
  isAdmin?: boolean;
}

export default function LessonsClient({
  initialLessons = [],
  initialCourses = [],
  userName = "Learner",
  userEmail = "",
  userLevel = "Beginner",
  nativeLanguage = "Hindi",
  targetLanguage = "English",
  initialCompletedLessonIds = [],
  recommendedLessonId = null,
  isAdmin = false,
}: LessonsClientProps) {
  // Navigation & Language state
  const [selectedLearnLangCode, setSelectedLearnLangCode] = useState<string>(() => {
    const found = SUPPORTED_LANGUAGES.find(
      (l) => l.name.toLowerCase() === targetLanguage.toLowerCase()
    );
    return found ? found.code : "en";
  });

  const [selectedSpeakLangName, setSelectedSpeakLangName] = useState<string>(() => {
    const found = SUPPORTED_LANGUAGES.find(
      (l) => l.name.toLowerCase() === nativeLanguage.toLowerCase()
    );
    return found ? found.name : "Hindi";
  });

  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>(initialCompletedLessonIds);

  // Active interactive lesson player state
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);
  const [activeStage, setActiveStage] = useState<LessonStage>("intro");

  // Listening stage state
  const [listeningAnswers, setListeningAnswers] = useState<Record<number, number>>({});
  const [listeningSubmitted, setListeningSubmitted] = useState<Record<number, boolean>>({});

  // Speaking stage state
  const [isRecordingSpeech, setIsRecordingSpeech] = useState<boolean>(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>("");
  const [speakingAccuracy, setSpeakingAccuracy] = useState<number | null>(null);
  const [activeSpeakingIndex, setActiveSpeakingIndex] = useState<number>(0);

  // Practice state (backward compat)
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceSubmitted, setPracticeSubmitted] = useState<Record<string, boolean>>({});

  // Quiz state
  const [quizQuestionIndex, setQuizQuestionIndex] = useState<number>(0);
  const [quizSelectedAnswers, setQuizSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // SRS Vocab saved state
  const [savedVocabWords, setSavedVocabWords] = useState<Record<string, boolean>>({});
  const [isSavingVocab, setIsSavingVocab] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  // TTS playback
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [speakingText, setSpeakingText] = useState<string>("");

  useEffect(() => {
    initTTS();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const currentLearnLang = useMemo(
    () => getLanguageByCode(selectedLearnLangCode),
    [selectedLearnLangCode]
  );

  // Language Pair Rule (L_speak != L_learn) with Auto-Switching
  const handleSelectLearnLang = (newCode: string) => {
    const chosen = getLanguageByCode(newCode);
    setSelectedLearnLangCode(newCode);
    // If native language matches the new learn language, auto switch it
    if (selectedSpeakLangName.toLowerCase() === chosen.name.toLowerCase()) {
      const alternative = SUPPORTED_LANGUAGES.find((l) => l.code !== newCode);
      if (alternative) setSelectedSpeakLangName(alternative.name);
    }
  };

  const handleSelectSpeakLang = (newName: string) => {
    setSelectedSpeakLangName(newName);
    // If target language matches the new native language, auto switch it
    if (currentLearnLang.name.toLowerCase() === newName.toLowerCase()) {
      const alternative = SUPPORTED_LANGUAGES.find(
        (l) => l.name.toLowerCase() !== newName.toLowerCase()
      );
      if (alternative) setSelectedLearnLangCode(alternative.code);
    }
  };

  const speakText = (text: string) => {
    if (!text) return;
    const resolved = resolveTTSLocale(text, selectedLearnLangCode);
    speakMultilingualText(text, resolved, {
      rate: 0.95,
      onStart: () => setSpeakingText(text),
      onEnd: () => setSpeakingText(""),
      onError: () => setSpeakingText(""),
    });
  };

  // Speech Recognition for Speaking Practice
  const handleRecordSpeech = (targetPhrase: string) => {
    if (typeof window === "undefined") return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert(
        "Speech recognition is not supported in this browser. Please read the phrase aloud with confidence!"
      );
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.lang = currentLearnLang.sttLang || "en-US";
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        setIsRecordingSpeech(true);
        setSpokenTranscript("");
        setSpeakingAccuracy(null);
      };

      rec.onresult = (evt: any) => {
        const text = evt.results[0][0].transcript;
        setSpokenTranscript(text);
        setIsRecordingSpeech(false);

        const cleanTarget = targetPhrase.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
        const cleanSpoken = text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
        if (cleanTarget === cleanSpoken) {
          setSpeakingAccuracy(100);
        } else {
          const minLen = Math.min(cleanTarget.length, cleanSpoken.length);
          const maxLen = Math.max(cleanTarget.length, cleanSpoken.length, 1);
          const ratio = Math.round((minLen / maxLen) * 95);
          setSpeakingAccuracy(Math.max(65, ratio));
        }
      };

      rec.onerror = () => {
        setIsRecordingSpeech(false);
      };

      rec.onend = () => {
        setIsRecordingSpeech(false);
      };

      rec.start();
    } catch {
      setIsRecordingSpeech(false);
    }
  };

  // Filter lessons based on Level, Course, and Search
  const filteredLessons = useMemo(() => {
    return initialLessons.filter((l) => {
      const matchLevel =
        selectedLevel === "All" || l.difficulty.toLowerCase() === selectedLevel.toLowerCase();
      const matchCourse =
        selectedCourseId === "all" || String(l.courseId) === selectedCourseId;
      return matchLevel && matchCourse;
    });
  }, [initialLessons, selectedLevel, selectedCourseId]);

  // Determine progress metrics
  const totalLessonsCount = filteredLessons.length;
  const completedInViewCount = filteredLessons.filter((l) =>
    completedLessonIds.includes(l.id)
  ).length;
  const progressPercent =
    totalLessonsCount > 0 ? Math.round((completedInViewCount / totalLessonsCount) * 100) : 0;

  // Find current active lesson to recommend or continue
  const nextUncompletedLesson = useMemo(() => {
    if (recommendedLessonId) {
      const rec = initialLessons.find((l) => l.id === recommendedLessonId);
      if (rec && !completedLessonIds.includes(rec.id)) return rec;
    }
    return initialLessons.find((l) => !completedLessonIds.includes(l.id)) || initialLessons[0] || null;
  }, [initialLessons, completedLessonIds, recommendedLessonId]);

  // Check if a specific lesson is unlocked in sequential order
  const isLessonUnlocked = (lessonId: number, indexInList: number): boolean => {
    if (indexInList === 0) return true;
    if (completedLessonIds.includes(lessonId)) return true;
    const prevLesson = filteredLessons[indexInList - 1];
    return prevLesson ? completedLessonIds.includes(prevLesson.id) : true;
  };

  // Structured content for currently active lesson
  const structuredContent: StructuredLessonContent | null = useMemo(() => {
    if (!activeLesson) return null;
    return parseLessonContent(activeLesson, selectedSpeakLangName, currentLearnLang.name);
  }, [activeLesson, selectedSpeakLangName, currentLearnLang]);

  // Open a lesson to play
  const handleOpenLesson = (lesson: LessonItem) => {
    setActiveLesson(lesson);
    setActiveStage("intro");
    setListeningAnswers({});
    setListeningSubmitted({});
    setIsRecordingSpeech(false);
    setSpokenTranscript("");
    setSpeakingAccuracy(null);
    setActiveSpeakingIndex(0);
    setPracticeAnswers({});
    setPracticeSubmitted({});
    setQuizQuestionIndex(0);
    setQuizSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const handleCloseLesson = () => {
    if (synthRef.current) synthRef.current.cancel();
    setActiveLesson(null);
  };

  // Handle marking vocabulary as learned
  const handleLearnSingleWord = async (word: string, def: string, pos?: string, ex?: string) => {
    setSavedVocabWords((prev) => ({ ...prev, [word]: true }));
    try {
      await learnVocabularyAction(word);
    } catch (e) {
      console.error("Failed to save vocabulary:", e);
    }
  };

  const handleLearnAllVocab = async () => {
    if (!structuredContent || isSavingVocab) return;
    setIsSavingVocab(true);
    const words = structuredContent.vocabulary.map((v) => ({
      word: v.word,
      definition: v.meaning[selectedSpeakLangName] || v.meaning["English"] || "Lesson vocabulary",
      partOfSpeech: v.partOfSpeech,
      example: v.example,
    }));
    try {
      await learnLessonVocabularyListAction(words);
      const newSaved: Record<string, boolean> = {};
      words.forEach((w) => (newSaved[w.word] = true));
      setSavedVocabWords((prev) => ({ ...prev, ...newSaved }));
    } catch (e) {
      console.error("Failed to save all vocabulary:", e);
    } finally {
      setIsSavingVocab(false);
    }
  };

  // Handle Listening submission
  const handleSelectListeningOption = (exerciseIdx: number, optionIdx: number) => {
    setListeningAnswers((prev) => ({ ...prev, [exerciseIdx]: optionIdx }));
    setListeningSubmitted((prev) => ({ ...prev, [exerciseIdx]: true }));
  };

  // Handle Practice submission (backward compat)
  const handleSelectPracticeOption = (exerciseId: string, answer: string) => {
    setPracticeAnswers((prev) => ({ ...prev, [exerciseId]: answer }));
    setPracticeSubmitted((prev) => ({ ...prev, [exerciseId]: true }));
  };

  // Handle Quiz answer
  const handleSelectQuizAnswer = (questionIdx: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizSelectedAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  // Finish Quiz & Evaluate
  const handleFinishQuiz = async () => {
    if (!structuredContent || !activeLesson || isCompleting) return;
    setIsCompleting(true);

    let correctCount = 0;
    structuredContent.quiz.forEach((q, idx) => {
      if (quizSelectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    setQuizScore(correctCount);
    setQuizSubmitted(true);
    setActiveStage("complete");

    // Save completion to database (+50 XP and sequential unlock)
    try {
      await completeLessonAction(activeLesson.id, correctCount);
      setCompletedLessonIds((prev) =>
        prev.includes(activeLesson.id) ? prev : [...prev, activeLesson.id]
      );
    } catch (err) {
      console.error("Failed to complete lesson:", err);
    } finally {
      setIsCompleting(false);
    }
  };

  // Advance to next lesson after completion
  const handleStartNextLesson = () => {
    if (!activeLesson) return;
    const currentIdx = initialLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIdx >= 0 && currentIdx < initialLessons.length - 1) {
      const nextL = initialLessons[currentIdx + 1];
      handleOpenLesson(nextL);
    } else {
      handleCloseLesson();
    }
  };

  return (
    <UserPanelShell
      activeNav="lessons"
      userName={userName}
      userEmail={userEmail}
      userLevel={userLevel}
      isAdmin={isAdmin}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* ====================================================
            1. TOP HEADER & CURRICULUM SELECTORS
           ==================================================== */}
        <div className="bg-gradient-to-r from-[#0d0c22] via-[#12112a] to-[#161436] border border-[#232048] rounded-3xl p-5 sm:p-7 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
                  Multilingual Learning System
                </span>
                <span className="text-xs text-zinc-400">
                  {currentLearnLang.flag} {currentLearnLang.name}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Lessons &amp; Skills
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                8-Stage Interactive Multilingual Curriculum:{" "}
                <span className="text-indigo-400 font-semibold">
                  Intro → Vocab → Grammar → Listening → Speaking → Conversation → Quiz → Complete
                </span>
              </p>
            </div>

            {/* Language & Level Selectors with Strict Pair Rule */}
            <div className="flex flex-wrap items-center gap-3 bg-[#0a091a]/80 p-3 rounded-2xl border border-[#27234e] shrink-0">
              {/* Target Language Dropdown (I Want to Learn) */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  I Want to Learn
                </label>
                <select
                  value={selectedLearnLangCode}
                  onChange={(e) => handleSelectLearnLang(e.target.value)}
                  className="bg-[#151430] border border-[#2f2b5a] text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option
                      key={lang.code}
                      value={lang.code}
                      disabled={lang.name.toLowerCase() === selectedSpeakLangName.toLowerCase()}
                    >
                      {lang.flag} {lang.name}{" "}
                      {lang.name.toLowerCase() === selectedSpeakLangName.toLowerCase()
                        ? "(I Speak)"
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Native Explanation Language (I Speak) */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  I Speak (Explanations)
                </label>
                <select
                  value={selectedSpeakLangName}
                  onChange={(e) => handleSelectSpeakLang(e.target.value)}
                  className="bg-[#151430] border border-[#2f2b5a] text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option
                      key={lang.code}
                      value={lang.name}
                      disabled={lang.code === selectedLearnLangCode}
                    >
                      {lang.flag} {lang.name}{" "}
                      {lang.code === selectedLearnLangCode ? "(Learning Focus)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Level
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="bg-[#151430] border border-[#2f2b5a] text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Progress Bar & Recommended Next Lesson Banner */}
          <div className="mt-6 pt-5 border-t border-[#232048]/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 w-full md:max-w-md">
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-zinc-300">
                  Curriculum Progress: {completedInViewCount} / {totalLessonsCount} Lessons Completed
                </span>
                <span className="text-indigo-400 font-extrabold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#181634] rounded-full h-2 overflow-hidden border border-[#27234d]">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Continue Button */}
            {nextUncompletedLesson && (
              <button
                onClick={() => handleOpenLesson(nextUncompletedLesson)}
                className="w-full md:w-auto px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
              >
                <span>▶ Continue:</span>
                <span className="truncate max-w-[200px]">{nextUncompletedLesson.title}</span>
              </button>
            )}
          </div>
        </div>

        {/* ====================================================
            2. COURSE SELECTOR TABS
           ==================================================== */}
        <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setSelectedCourseId("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCourseId === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
            }`}
          >
            All Courses ({initialLessons.length})
          </button>
          {initialCourses.map((c) => {
            const count = initialLessons.filter((l) => l.courseId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCourseId(String(c.id))}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCourseId === String(c.id)
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {c.title} ({count})
              </button>
            );
          })}
        </div>

        {/* ====================================================
            3. SEQUENTIAL LESSONS GRID / LIST
           ==================================================== */}
        {filteredLessons.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3">
            <span className="text-4xl">📚</span>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              No lessons match your current filters
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Try switching your level to &quot;All Levels&quot; or selecting &quot;All Courses&quot; to view available content.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLessons.map((lesson, idx) => {
              const isCompleted = completedLessonIds.includes(lesson.id);
              const isUnlocked = isLessonUnlocked(lesson.id, idx);
              const isCurrent = !isCompleted && isUnlocked;

              return (
                <div
                  key={lesson.id}
                  className={`rounded-3xl border p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                    isCompleted
                      ? "bg-white dark:bg-[#0c0b1e] border-emerald-500/30 shadow-md"
                      : isCurrent
                      ? "bg-white dark:bg-[#100f28] border-indigo-500/50 shadow-lg ring-1 ring-indigo-500/20"
                      : "bg-zinc-50/80 dark:bg-[#080714]/80 border-zinc-200 dark:border-zinc-850 opacity-75"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Badges & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                          {lesson.category || "General"}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {lesson.difficulty}
                        </span>
                      </div>

                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                          <span>✓</span> Completed
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-[11px] font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                          Unlocked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 bg-zinc-500/10 border border-zinc-500/20 px-2 py-0.5 rounded-full">
                          <span>🔒</span> Locked
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white line-clamp-1">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                        {lesson.description || "Master essential vocabulary and key sentences."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                      <span>⏱️</span> 10-12 mins
                    </span>

                    {isUnlocked ? (
                      <button
                        onClick={() => handleOpenLesson(lesson)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isCompleted
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
                        }`}
                      >
                        <span>{isCompleted ? "Review" : "Start"}</span>
                        <span>{isCompleted ? "↻" : "▶"}</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-200/50 dark:bg-zinc-800/50 text-zinc-400 cursor-not-allowed flex items-center gap-1.5"
                      >
                        <span>🔒</span>
                        <span>Locked</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ====================================================
          4. INTERACTIVE 8-STAGE LESSON MODAL
         ==================================================== */}
      {activeLesson && structuredContent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-[#0e0d24] border border-[#232048] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Top Header */}
            <div className="px-6 py-4 border-b border-[#211e44] flex items-center justify-between bg-[#131230] shrink-0">
              <div className="space-y-0.5 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    {activeLesson.category || "Lesson"}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {currentLearnLang.flag} {currentLearnLang.name} Focus
                  </span>
                </div>
                <h3 className="text-lg font-black text-white truncate">{activeLesson.title}</h3>
              </div>

              <button
                onClick={handleCloseLesson}
                className="w-8 h-8 rounded-full bg-[#1e1c40] hover:bg-[#2e2a60] text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
                title="Close Lesson"
              >
                ✕
              </button>
            </div>

            {/* 8-Stage Stepper Bar */}
            <div className="px-4 sm:px-6 py-2 bg-[#090817] border-b border-[#181630] flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs shrink-0">
              {(
                [
                  { key: "intro", label: "1. Intro", icon: "📖" },
                  { key: "vocab", label: "2. Vocab", icon: "📚" },
                  { key: "grammar", label: "3. Grammar", icon: "✍️" },
                  { key: "listening", label: "4. Listening", icon: "🎧" },
                  { key: "speaking", label: "5. Speaking", icon: "🎙️" },
                  { key: "conversation", label: "6. AI Chat", icon: "💬" },
                  { key: "quiz", label: "7. Quiz", icon: "🎯" },
                  { key: "complete", label: "8. Done", icon: "🎉" },
                ] as const
              ).map((stage) => {
                const isActive =
                  activeStage === stage.key ||
                  (stage.key === "intro" && activeStage === "learn");
                return (
                  <button
                    key={stage.key}
                    onClick={() => setActiveStage(stage.key)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-[#161434]"
                    }`}
                  >
                    <span>{stage.icon}</span>
                    <span>{stage.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body Container (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              {/* ====================================================
                  STAGE 1: INTRODUCTION
                 ==================================================== */}
              {(activeStage === "intro" || activeStage === "learn") && (
                <div className="space-y-6">
                  <div className="bg-[#121128] border border-[#26234e] rounded-2xl p-5 space-y-2">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      Lesson Overview
                    </h4>
                    <p className="text-sm text-zinc-200 leading-relaxed">
                      {structuredContent.introduction.summary}
                    </p>
                  </div>

                  {/* Key Phrases with Read & Native Translation */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Core Key Phrases
                    </h4>
                    <div className="space-y-3">
                      {structuredContent.introduction.keyPhrases.map((phrase, idx) => (
                        <div
                          key={idx}
                          className="bg-[#0f0e24] border border-[#211e44] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 w-full">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                dir={structuredContent.isRTL ? "rtl" : "ltr"}
                                className={`text-base font-extrabold text-white ${
                                  structuredContent.isRTL ? "text-right block w-full" : ""
                                }`}
                              >
                                {phrase.target}
                              </span>
                              <button
                                onClick={() => speakText(phrase.target)}
                                className="text-indigo-400 hover:text-indigo-300 p-1 cursor-pointer transition shrink-0"
                                title="Listen to pronunciation"
                              >
                                {speakingText === phrase.target ? "🔊..." : "🔊"}
                              </button>
                            </div>
                            <p className="text-xs text-indigo-300/90 font-mono" dir="ltr">
                              READ: {phrase.read}
                            </p>
                            <p className="text-xs text-zinc-400" dir="ltr">
                              {selectedSpeakLangName} Meaning:{" "}
                              <span className="text-zinc-300 font-medium">
                                {phrase.meaning[selectedSpeakLangName] ||
                                  phrase.meaning["English"] ||
                                  phrase.target}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stage Advance Button */}
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setActiveStage("vocab")}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition"
                    >
                      <span>Next: Vocabulary</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ====================================================
                  STAGE 2: VOCABULARY & SRS INTEGRATION
                 ==================================================== */}
              {activeStage === "vocab" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#211e44]">
                    <div>
                      <h4 className="text-base font-extrabold text-white">Essential Vocabulary</h4>
                      <p className="text-xs text-zinc-400">
                        Study native pronunciation and add words to your Spaced Repetition System (SRS).
                      </p>
                    </div>

                    <button
                      onClick={handleLearnAllVocab}
                      disabled={isSavingVocab}
                      className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    >
                      <span>💾</span>
                      <span>{isSavingVocab ? "Saving..." : "Add All to My SRS"}</span>
                    </button>
                  </div>

                  {/* Vocabulary Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {structuredContent.vocabulary.map((vocab, idx) => {
                      const isSaved = savedVocabWords[vocab.word];
                      return (
                        <div
                          key={idx}
                          className="bg-[#0f0e24] border border-[#211e44] rounded-2xl p-4 flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                dir={structuredContent.isRTL ? "rtl" : "ltr"}
                                className="text-lg font-black text-white"
                              >
                                {vocab.word}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                                {vocab.partOfSpeech}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-indigo-300 font-mono" dir="ltr">
                              <span>READ: {vocab.read}</span>
                              <button
                                onClick={() => speakText(vocab.word)}
                                className="text-indigo-400 hover:text-indigo-200 cursor-pointer"
                                title="Listen"
                              >
                                🔊
                              </button>
                            </div>

                            <p className="text-xs text-zinc-300" dir="ltr">
                              <strong className="text-zinc-400">Meaning:</strong>{" "}
                              {vocab.meaning[selectedSpeakLangName] ||
                                vocab.meaning["English"] ||
                                "Key definition"}
                            </p>

                            <p
                              dir={structuredContent.isRTL ? "rtl" : "ltr"}
                              className="text-xs text-zinc-400 italic bg-[#0a091a] p-2 rounded-lg border border-[#1b1936]"
                            >
                              &quot;{vocab.example}&quot;
                            </p>
                          </div>

                          {/* SRS Save Button */}
                          <button
                            onClick={() =>
                              handleLearnSingleWord(
                                vocab.word,
                                vocab.meaning[selectedSpeakLangName] || "Vocabulary word",
                                vocab.partOfSpeech,
                                vocab.example
                              )
                            }
                            disabled={isSaved}
                            className={`w-full py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              isSaved
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-[#181638] hover:bg-[#232050] text-zinc-300 border border-[#2a2656]"
                            }`}
                          >
                            <span>{isSaved ? "✓ Added to SRS" : "➕ Add to SRS"}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Stage Advance Button */}
                  <div className="pt-4 flex justify-between">
                    <button
                      onClick={() => setActiveStage("intro")}
                      className="px-4 py-2 rounded-xl bg-[#181634] text-zinc-300 hover:bg-[#252250] text-xs font-bold cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setActiveStage("grammar")}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition"
                    >
                      <span>Next: Grammar</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ====================================================
                  STAGE 3: GRAMMAR COACH
                 ==================================================== */}
              {activeStage === "grammar" && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-white">
                      {structuredContent.grammar.title}
                    </h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {structuredContent.grammar.explanation}
                    </p>
                  </div>

                  {/* Rule Formula Box */}
                  <div className="bg-[#12112c] border-2 border-indigo-500/40 rounded-2xl p-4 text-center space-y-1 shadow-inner">
                    <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">
                      Grammar Formula / Pattern
                    </span>
                    <p className="text-sm sm:text-base font-black text-white font-mono">
                      {structuredContent.grammar.rule}
                    </p>
                  </div>

                  {/* Sentence Examples */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Illustrated Sentence Examples
                    </h5>
                    <div className="space-y-2.5">
                      {structuredContent.grammar.examples.map((ex, idx) => (
                        <div
                          key={idx}
                          className="bg-[#0f0e24] border border-[#211e44] rounded-2xl p-3.5 space-y-1"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              dir={structuredContent.isRTL ? "rtl" : "ltr"}
                              className="text-xs sm:text-sm font-extrabold text-emerald-400"
                            >
                              {ex.sentence}
                            </span>
                            <button
                              onClick={() => speakText(ex.sentence)}
                              className="text-zinc-400 hover:text-white p-1 cursor-pointer"
                              title="Listen"
                            >
                              🔊
                            </button>
                          </div>
                          <p className="text-xs text-zinc-400">{ex.breakdown}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tip Alert Box */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-300 text-xs">
                    <span className="text-base">💡</span>
                    <div>
                      <strong className="font-bold">Important Tip: </strong>
                      <span>{structuredContent.grammar.tip}</span>
                    </div>
                  </div>

                  {/* Stage Advance Button */}
                  <div className="pt-4 flex justify-between">
                    <button
                      onClick={() => setActiveStage("vocab")}
                      className="px-4 py-2 rounded-xl bg-[#181634] text-zinc-300 hover:bg-[#252250] text-xs font-bold cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setActiveStage("listening")}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition"
                    >
                      <span>Next: Listening</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ====================================================
                  STAGE 4: LISTENING COMPREHENSION
                 ==================================================== */}
              {activeStage === "listening" && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-white">
                      Listening Comprehension
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Listen to native spoken dialogues at natural speed and verify your comprehension.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {structuredContent.listening.map((ex, idx) => {
                      const selectedIdx = listeningAnswers[idx];
                      const isSubmitted = listeningSubmitted[idx];
                      const isCorrect = selectedIdx === ex.correctIndex;

                      return (
                        <div
                          key={idx}
                          className="bg-[#0f0e24] border border-[#211e44] rounded-2xl p-5 space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131230] p-4 rounded-xl border border-[#232048]">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                                Speaker: {ex.speakerRole}
                              </span>
                              <p className="text-xs text-zinc-300">
                                Click play to listen to the dialogue in {currentLearnLang.name}:
                              </p>
                            </div>

                            <button
                              onClick={() => speakText(ex.audioPrompt)}
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer shrink-0"
                            >
                              <span>{speakingText === ex.audioPrompt ? "🔊 Playing..." : "▶ Play Audio"}</span>
                            </button>
                          </div>

                          <div className="space-y-2 pt-1">
                            <h5 className="text-xs sm:text-sm font-bold text-white">
                              {ex.comprehensionQuestion}
                            </h5>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {ex.options.map((opt, optIdx) => {
                                const isThisSelected = selectedIdx === optIdx;
                                let btnStyle =
                                  "bg-[#181636] hover:bg-[#23204e] border-[#292556] text-zinc-200";

                                if (isSubmitted) {
                                  if (optIdx === ex.correctIndex) {
                                    btnStyle =
                                      "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold";
                                  } else if (isThisSelected) {
                                    btnStyle = "bg-red-600/20 border-red-500 text-red-300";
                                  }
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => handleSelectListeningOption(idx, optIdx)}
                                    className={`p-3 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                                  >
                                    <span>{opt}</span>
                                    {isSubmitted && optIdx === ex.correctIndex && (
                                      <span className="text-emerald-400">✓</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {isSubmitted && (
                              <div
                                className={`p-3 rounded-xl text-xs flex items-start gap-2 mt-2 ${
                                  isCorrect
                                    ? "bg-emerald-950/30 border border-emerald-500/30 text-emerald-300"
                                    : "bg-red-950/30 border border-red-500/30 text-red-300"
                                }`}
                              >
                                <span>{isCorrect ? "✅ Excellent comprehension!" : "❌ Note:"}</span>
                                <span>{ex.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Stage Advance Button */}
                  <div className="pt-4 flex justify-between">
                    <button
                      onClick={() => setActiveStage("grammar")}
                      className="px-4 py-2 rounded-xl bg-[#181634] text-zinc-300 hover:bg-[#252250] text-xs font-bold cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setActiveStage("speaking")}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition"
                    >
                      <span>Next: Speaking</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ====================================================
                  STAGE 5: SPEAKING & PRONUNCIATION
                 ==================================================== */}
              {activeStage === "speaking" && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-white">
                      Speaking &amp; Pronunciation Practice
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Read aloud in {currentLearnLang.name} to receive immediate pronunciation guidance.
                    </p>
                  </div>

                  {structuredContent.speaking.map((sp, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0f0e24] border border-[#211e44] rounded-2xl p-5 space-y-4"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">
                          Target Phrase to Speak
                        </span>
                        <h3
                          dir={structuredContent.isRTL ? "rtl" : "ltr"}
                          className={`text-lg sm:text-xl font-black text-white ${
                            structuredContent.isRTL ? "text-right" : ""
                          }`}
                        >
                          {sp.promptPhrase}
                        </h3>
                        <p className="text-xs text-indigo-300 font-mono" dir="ltr">
                          READ: {sp.phoneticGuide}
                        </p>
                        <p className="text-xs text-zinc-400" dir="ltr">
                          {selectedSpeakLangName}:{" "}
                          <span className="text-zinc-200">
                            {sp.translation[selectedSpeakLangName] ||
                              sp.translation["English"] ||
                              sp.promptPhrase}
                          </span>
                        </p>
                      </div>

                      {/* Controls: Listen & Record */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          onClick={() => speakText(sp.promptPhrase)}
                          className="px-4 py-2 rounded-xl bg-[#181636] hover:bg-[#23204e] text-zinc-200 border border-[#292556] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>🔊 Listen Example</span>
                        </button>

                        <button
                          onClick={() => handleRecordSpeech(sp.promptPhrase)}
                          disabled={isRecordingSpeech}
                          className={`px-5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shadow-md ${
                            isRecordingSpeech
                              ? "bg-red-600 text-white animate-pulse"
                              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                          }`}
                        >
                          <span>{isRecordingSpeech ? "🎙️ Listening..." : "🎙️ Speak Now"}</span>
                        </button>
                      </div>

                      {/* Transcribed text & Accuracy feedback */}
                      {spokenTranscript && (
                        <div className="bg-[#12112a] border border-[#24214c] rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400">You Spoke:</span>
                            {speakingAccuracy !== null && (
                              <span
                                className={`font-black px-2.5 py-0.5 rounded-full text-[11px] ${
                                  speakingAccuracy >= 85
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-amber-500/20 text-amber-300"
                                }`}
                              >
                                {speakingAccuracy}% Accuracy •{" "}
                                {speakingAccuracy >= 85 ? "Excellent!" : "Good effort"}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-white">&quot;{spokenTranscript}&quot;</p>
                        </div>
                      )}

                      {/* Tip Box */}
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-300 flex items-start gap-2">
                        <span>💡</span>
                        <div>
                          <strong className="font-semibold">Pronunciation Tip: </strong>
                          <span>{sp.pronunciationTip}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Stage Advance Button */}
                  <div className="pt-4 flex justify-between">
                    <button
                      onClick={() => setActiveStage("listening")}
                      className="px-4 py-2 rounded-xl bg-[#181634] text-zinc-300 hover:bg-[#252250] text-xs font-bold cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setActiveStage("conversation")}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition"
                    >
                      <span>Next: AI Conversation</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ====================================================
                  STAGE 6: AI CONVERSATION
                 ==================================================== */}
              {activeStage === "conversation" && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-white">
                      Interactive AI Conversation
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Engage in a practical situational roleplay to test your spontaneous communication.
                    </p>
                  </div>

                  <div className="bg-[#0f0e24] border border-[#211e44] rounded-2xl p-5 space-y-4">
                    {/* Scenario card */}
                    <div className="bg-[#131230] border border-[#24214c] rounded-xl p-4 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                          Role: {structuredContent.conversation.role}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          Partner: {structuredContent.conversation.aiRole}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-200">
                        {structuredContent.conversation.scenario}
                      </p>
                    </div>

                    {/* Starter prompt */}
                    <div className="bg-[#12112a] border border-[#232048] rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          Conversation Starter
                        </span>
                        <button
                          onClick={() => speakText(structuredContent.conversation.starterPrompt)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
                        >
                          🔊 Listen
                        </button>
                      </div>
                      <p
                        dir={structuredContent.isRTL ? "rtl" : "ltr"}
                        className="text-sm font-bold text-white"
                      >
                        &quot;{structuredContent.conversation.starterPrompt}&quot;
                      </p>
                    </div>

                    {/* Suggested reply phrases */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Suggested Responses:
                      </span>
                      <div className="space-y-1.5">
                        {structuredContent.conversation.suggestedPhrases.map((phrase, idx) => (
                          <div
                            key={idx}
                            className="bg-[#181636] border border-[#292556] rounded-xl p-2.5 text-xs text-zinc-200 flex items-center justify-between"
                          >
                            <span dir={structuredContent.isRTL ? "rtl" : "ltr"}>{phrase}</span>
                            <button
                              onClick={() => speakText(phrase)}
                              className="text-indigo-400 hover:text-indigo-300 text-xs px-2 py-0.5 rounded cursor-pointer"
                            >
                              🔊
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deep-link action buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <Link
                        href="/voice-conversation"
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/30 transition cursor-pointer"
                      >
                        <span>🎙️ Practice in AI Voice Tutor</span>
                      </Link>

                      <Link
                        href="/ai-chat"
                        className="px-4 py-2.5 rounded-xl bg-[#181636] hover:bg-[#252250] text-zinc-200 border border-[#292556] font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                      >
                        <span>💬 Text Chat with AI Tutor</span>
                      </Link>
                    </div>
                  </div>

                  {/* Stage Advance Button */}
                  <div className="pt-4 flex justify-between">
                    <button
                      onClick={() => setActiveStage("speaking")}
                      className="px-4 py-2 rounded-xl bg-[#181634] text-zinc-300 hover:bg-[#252250] text-xs font-bold cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setActiveStage("quiz")}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition"
                    >
                      <span>Take Graded Quiz</span>
                      <span>🎯</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ====================================================
                  STAGE 7: GRADED QUIZ
                 ==================================================== */}
              {activeStage === "quiz" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#211e44] pb-3">
                    <div>
                      <h4 className="text-base font-extrabold text-white">Lesson Graded Quiz</h4>
                      <p className="text-xs text-zinc-400">
                        Score at least 80% to demonstrate proficiency and unlock the next lesson.
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/20 px-3 py-1 rounded-full">
                      Question {quizQuestionIndex + 1} of {structuredContent.quiz.length}
                    </span>
                  </div>

                  {/* Current Quiz Question Card */}
                  {structuredContent.quiz[quizQuestionIndex] && (
                    <div className="bg-[#0f0e24] border border-[#211e44] rounded-2xl p-6 space-y-4">
                      <h5 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                        {structuredContent.quiz[quizQuestionIndex].question}
                      </h5>

                      <div className="space-y-2 pt-2">
                        {structuredContent.quiz[quizQuestionIndex].options.map(
                          (option, optionIdx) => {
                            const isSelected =
                              quizSelectedAnswers[quizQuestionIndex] === optionIdx;

                            return (
                              <button
                                key={optionIdx}
                                onClick={() =>
                                  handleSelectQuizAnswer(quizQuestionIndex, optionIdx)
                                }
                                className={`w-full p-3.5 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? "bg-indigo-600 text-white border-indigo-400 shadow-md"
                                    : "bg-[#181636] hover:bg-[#201d46] border-[#292556] text-zinc-200"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                                      isSelected
                                        ? "bg-white text-indigo-900"
                                        : "bg-[#252250] text-zinc-400"
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optionIdx)}
                                  </span>
                                  <span>{option}</span>
                                </div>
                                {isSelected && <span>✓</span>}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons for Quiz */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      onClick={() => setQuizQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={quizQuestionIndex === 0}
                      className="px-4 py-2 rounded-xl bg-[#181634] disabled:opacity-40 text-zinc-300 hover:bg-[#252250] text-xs font-bold cursor-pointer"
                    >
                      ← Previous
                    </button>

                    {quizQuestionIndex < structuredContent.quiz.length - 1 ? (
                      <button
                        onClick={() =>
                          setQuizQuestionIndex((prev) =>
                            Math.min(structuredContent.quiz.length - 1, prev + 1)
                          )
                        }
                        disabled={quizSelectedAnswers[quizQuestionIndex] === undefined}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 disabled:opacity-40 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                      >
                        <span>Next Question</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleFinishQuiz}
                        disabled={
                          quizSelectedAnswers[quizQuestionIndex] === undefined || isCompleting
                        }
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
                      >
                        <span>{isCompleting ? "Saving..." : "Submit & Complete Lesson"}</span>
                        <span>🎉</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ====================================================
                  STAGE 8: LESSON COMPLETE SCREEN
                 ==================================================== */}
              {activeStage === "complete" && (
                <div className="text-center py-6 space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/10">
                    🎉
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-black text-white">Lesson Completed!</h3>
                    <p className="text-xs text-zinc-400">
                      Great effort! Your progress and vocabulary have been saved.
                    </p>
                  </div>

                  {/* Quiz Score Badge */}
                  <div className="bg-[#12112c] border border-[#232048] rounded-2xl p-5 max-w-sm mx-auto space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-wider">
                      Quiz Result
                    </span>
                    <div className="text-3xl font-black text-emerald-400">
                      {quizScore} / {structuredContent.quiz.length}
                    </div>
                    <p className="text-xs text-zinc-300">
                      {Math.round((quizScore / structuredContent.quiz.length) * 100)}% Accuracy •{" "}
                      <span className="text-amber-300 font-semibold">+50 XP Earned</span>
                    </p>
                  </div>

                  {/* Recommended Next Lesson Card */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={handleCloseLesson}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#181634] hover:bg-[#252250] text-zinc-300 font-bold text-xs cursor-pointer transition"
                    >
                      Back to Lessons List
                    </button>
                    <button
                      onClick={handleStartNextLesson}
                      className="w-full sm:w-auto px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      <span>Start Next Lesson</span>
                      <span>▶</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </UserPanelShell>
  );
}
