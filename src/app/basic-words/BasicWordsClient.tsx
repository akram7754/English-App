"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  BASIC_WORDS_CATEGORIES,
  BASIC_WORDS_CURRICULUM,
  BasicWordItem,
  BasicWordLevel,
  filterBasicWords,
} from "../../lib/basic-words-data";
import {
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
  LanguageConfig,
} from "../../lib/languages";
import { isRtlText } from "../../lib/transliteration";
import { initTTS, resolveTTSLocale, speakMultilingualText, stopTTS } from "../../lib/tts";
import {
  getBasicWordsProgressAction,
  recordBasicWordAttemptAction,
  toggleBasicWordFavoriteAction,
  toggleBasicWordLearnedAction,
  BasicWordsUserStats,
} from "./actions";

interface ISpeechRecognition {
  start: () => void;
  abort: () => void;
  stop?: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onresult: (e: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onerror: (e: any) => void;
  onend: () => void;
}

interface Props {
  initialStats?: BasicWordsUserStats;
}

export default function BasicWordsClient({ initialStats }: Props) {
  // Multilingual Configuration
  const [sourceLangCode, setSourceLangCode] = useState<string>("hi");
  const [targetLangCode, setTargetLangCode] = useState<string>("en");

  // Filtering & Search
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"all" | "revision" | "favorites" | "learned" | "unlearned">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // User Progress & Stats
  const [stats, setStats] = useState<BasicWordsUserStats>(
    initialStats || {
      wordsLearnedCount: 0,
      phrasesLearnedCount: 0,
      wordsPracticedCount: 0,
      speakingAttemptsCount: 0,
      correctAttemptsCount: 0,
      needsPracticeCount: 0,
      dailyGoalCompleted: 0,
      dailyGoalTarget: 10,
      learnedIds: [],
      favoriteIds: [],
      needsPracticeIds: [],
    }
  );

  // Audio / Speech State
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);
  const [activePracticeItem, setActivePracticeItem] = useState<BasicWordItem | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [attemptResult, setAttemptResult] = useState<{
    score: number;
    status: "Correct" | "Almost Correct" | "Needs Practice";
    feedback: any;
    guidance: any[];
    transcript: string;
  } | null>(null);
  const [micError, setMicError] = useState<string>("");

  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const targetLang: LanguageConfig = useMemo(() => getLanguageByCode(targetLangCode), [targetLangCode]);
  const sourceLang: LanguageConfig = useMemo(() => getLanguageByCode(sourceLangCode), [sourceLangCode]);

  // Initialize TTS & load user progress on mount
  useEffect(() => {
    initTTS();
    async function loadStats() {
      const res = await getBasicWordsProgressAction();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    }
    loadStats();
  }, []);

  // Handle source and target language switching without duplicate
  const handleSourceLangChange = (code: string) => {
    if (code === targetLangCode) {
      const alternate = SUPPORTED_LANGUAGES.find((l) => l.code !== code)?.code || "en";
      setTargetLangCode(alternate);
    }
    setSourceLangCode(code);
  };

  const handleTargetLangChange = (code: string) => {
    if (code === sourceLangCode) {
      const alternate = SUPPORTED_LANGUAGES.find((l) => l.code !== code)?.code || "hi";
      setSourceLangCode(alternate);
    }
    setTargetLangCode(code);
  };

  const handleSwapLanguages = () => {
    const prevSource = sourceLangCode;
    const prevTarget = targetLangCode;
    setSourceLangCode(prevTarget);
    setTargetLangCode(prevSource);
  };

  // Play audio for word or phrase
  const handleListen = (text: string, id: string) => {
    stopTTS();
    setPlayingWordId(id);
    const locale = resolveTTSLocale(text, targetLang.code, targetLang.ttsLang);
    speakMultilingualText(text, locale, {
      onStart: () => setPlayingWordId(id),
      onEnd: () => setPlayingWordId(null),
      onError: (err) => {
        setPlayingWordId(null);
        setMicError(err);
        setTimeout(() => setMicError(""), 4000);
      },
    });
  };

  // Toggle favorite
  const handleToggleFavorite = async (item: BasicWordItem) => {
    const isFav = stats.favoriteIds.includes(item.id);
    const newFav = !isFav;

    // Optimistic state update
    setStats((prev) => ({
      ...prev,
      favoriteIds: newFav
        ? [...prev.favoriteIds, item.id]
        : prev.favoriteIds.filter((id) => id !== item.id),
    }));

    await toggleBasicWordFavoriteAction({
      wordId: item.id,
      isFavorite: newFav,
      category: item.category,
    });
  };

  // Toggle learned status manually
  const handleToggleLearned = async (item: BasicWordItem) => {
    const isLearned = stats.learnedIds.includes(item.id);
    const newLearned = !isLearned;

    // Optimistic update
    setStats((prev) => {
      const updatedLearned = newLearned
        ? [...prev.learnedIds, item.id]
        : prev.learnedIds.filter((id) => id !== item.id);
      return {
        ...prev,
        learnedIds: updatedLearned,
        wordsLearnedCount: item.type === "word" ? prev.wordsLearnedCount + (newLearned ? 1 : -1) : prev.wordsLearnedCount,
        phrasesLearnedCount: item.type === "phrase" ? prev.phrasesLearnedCount + (newLearned ? 1 : -1) : prev.phrasesLearnedCount,
      };
    });

    await toggleBasicWordLearnedAction({
      wordId: item.id,
      learned: newLearned,
      category: item.category,
    });
  };

  // Start Speaking Practice for an Item
  const handleOpenPractice = (item: BasicWordItem) => {
    stopTTS();
    setActivePracticeItem(item);
    setAttemptResult(null);
    setLiveTranscript("");
    setMicError("");
  };

  const handleStartSpeaking = (item: BasicWordItem) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition: ISpeechRecognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Listen in the target language being learned!
      recognition.lang = targetLang.sttLang || "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;

      let finalTranscript = "";

      recognition.onstart = () => {
        setIsRecording(true);
        setMicError("");
        setLiveTranscript("");
      };

      recognition.onresult = (e: any) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalTranscript = t;
          } else {
            interim += t;
          }
        }
        setLiveTranscript(finalTranscript || interim);
      };

      recognition.onerror = (e: any) => {
        setIsRecording(false);
        if (e.error !== "no-speech") {
          setMicError(`Microphone error: ${e.error || "Recognition failed"}`);
        }
      };

      recognition.onend = async () => {
        setIsRecording(false);
        const spoken = finalTranscript.trim() || liveTranscript.trim();
        if (spoken) {
          await submitPracticeAttempt(item, spoken);
        }
      };

      recognition.start();
    } catch (err: any) {
      setIsRecording(false);
      setMicError(err.message || "Failed to start microphone.");
    }
  };

  const handleStopSpeaking = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop?.();
    }
    setIsRecording(false);
  };

  const submitPracticeAttempt = async (item: BasicWordItem, spokenText: string) => {
    setIsEvaluating(true);
    setMicError("");

    const targetPhrase = item.translations[targetLang.code]?.text || item.translations.en?.text;

    try {
      const res = await recordBasicWordAttemptAction({
        wordId: item.id,
        targetPhrase,
        userTranscript: spokenText,
        difficulty: item.level,
        targetLangCode: targetLang.code,
        sourceLangCode: sourceLang.code,
        category: item.category,
        type: item.type,
      });

      if (res.success && res.score !== undefined) {
        setAttemptResult({
          score: res.score,
          status: res.status as any,
          feedback: res.feedback,
          guidance: res.guidance || [],
          transcript: spokenText,
        });

        // Update local stats
        setStats((prev) => {
          const wasLearned = prev.learnedIds.includes(item.id);
          const isNowLearned = res.score >= 60 || wasLearned;
          const updatedLearned = isNowLearned && !wasLearned ? [...prev.learnedIds, item.id] : prev.learnedIds;

          // Smart revision: remove from needs practice if score >= 85, add if < 60
          let updatedNeedsPractice = [...prev.needsPracticeIds];
          if (res.score < 60) {
            if (!updatedNeedsPractice.includes(item.id)) {
              updatedNeedsPractice.push(item.id);
            }
          } else if (res.score >= 85) {
            updatedNeedsPractice = updatedNeedsPractice.filter((id) => id !== item.id);
          }

          return {
            ...prev,
            learnedIds: updatedLearned,
            needsPracticeIds: updatedNeedsPractice,
            speakingAttemptsCount: prev.speakingAttemptsCount + 1,
            correctAttemptsCount: res.status === "Correct" ? prev.correctAttemptsCount + 1 : prev.correctAttemptsCount,
            wordsLearnedCount:
              item.type === "word" && isNowLearned && !wasLearned ? prev.wordsLearnedCount + 1 : prev.wordsLearnedCount,
            phrasesLearnedCount:
              item.type === "phrase" && isNowLearned && !wasLearned ? prev.phrasesLearnedCount + 1 : prev.phrasesLearnedCount,
            dailyGoalCompleted: Math.min(10, prev.dailyGoalCompleted + 1),
          };
        });
      } else {
        setMicError(res.error || "Evaluation failed. Please try again.");
      }
    } catch (err: any) {
      setMicError(err.message || "Failed to process attempt.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Filter items based on activeTab, category, level, and search query
  const filteredItems = useMemo(() => {
    let items = filterBasicWords(BASIC_WORDS_CURRICULUM, {
      category: selectedCategory,
      level: selectedLevel,
      query: searchQuery,
      targetLangCode: targetLang.code,
      sourceLangCode: sourceLang.code,
    });

    if (activeTab === "revision") {
      items = items.filter((item) => stats.needsPracticeIds.includes(item.id));
    } else if (activeTab === "favorites") {
      items = items.filter((item) => stats.favoriteIds.includes(item.id));
    } else if (activeTab === "learned") {
      items = items.filter((item) => stats.learnedIds.includes(item.id));
    } else if (activeTab === "unlearned") {
      items = items.filter((item) => !stats.learnedIds.includes(item.id));
    }

    return items;
  }, [selectedCategory, selectedLevel, searchQuery, activeTab, stats, targetLang.code, sourceLang.code]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 min-w-0 overflow-x-hidden">
      {/* 1. TOP HEADER & LANGUAGE CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4 bg-white dark:bg-zinc-900 p-3.5 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📖</span>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Basic Words & Phrases
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Master essential vocabulary, everyday phrases, and pronunciation in 17 topics.
          </p>
        </div>

        {/* Multilingual Selector: SPEAK: [Hindi] → LEARN: [Arabic] */}
        <div className="w-full md:w-auto bg-zinc-50 dark:bg-zinc-800/80 p-2.5 sm:p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 min-w-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3 min-w-0">
            {/* Left: SPEAK */}
            <div className="min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
              <span className="text-[10px] sm:text-xs font-black tracking-wider text-zinc-500 dark:text-zinc-400 shrink-0">
                SPEAK:
              </span>
              <div className="min-w-0 w-full relative">
                <select
                  value={sourceLangCode}
                  onChange={(e) => handleSourceLangChange(e.target.value)}
                  aria-label="Source Language"
                  className="w-full min-w-0 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-bold rounded-xl px-2 sm:px-2.5 py-1.5 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate cursor-pointer shadow-2xs"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Center: Swap / Directional Arrow */}
            <div className="flex items-center justify-center pt-3.5 sm:pt-0 shrink-0">
              <button
                type="button"
                onClick={handleSwapLanguages}
                title="Swap Languages (SPEAK ⇄ LEARN)"
                aria-label="Swap Languages"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm shadow-2xs transition cursor-pointer active:scale-90 shrink-0"
              >
                <span>→</span>
              </button>
            </div>

            {/* Right: LEARN */}
            <div className="min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
              <span className="text-[10px] sm:text-xs font-black tracking-wider text-indigo-600 dark:text-indigo-400 shrink-0">
                LEARN:
              </span>
              <div className="min-w-0 w-full relative">
                <select
                  value={targetLangCode}
                  onChange={(e) => handleTargetLangChange(e.target.value)}
                  aria-label="Target Language"
                  className="w-full min-w-0 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-bold rounded-xl px-2 sm:px-2.5 py-1.5 text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate cursor-pointer shadow-2xs"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DAILY GOAL & PROGRESS SUMMARY BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Daily Goal Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-4 sm:p-5 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs uppercase font-bold tracking-wider text-indigo-200">Daily Goal</span>
              <span className="text-[11px] sm:text-xs font-black bg-white/20 px-2 py-0.5 rounded-full">
                {stats.dailyGoalCompleted >= 10 ? "Goal Met! 🎉" : "In Progress"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold">Learn 10 words today</h3>
            <p className="text-[11px] sm:text-xs text-indigo-100 mt-1">
              Practice words daily to build long-term fluency and retention.
            </p>
          </div>

          <div className="mt-3.5 sm:mt-4">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span>Progress</span>
              <span>{stats.dailyGoalCompleted} / 10 completed</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.dailyGoalCompleted / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 5 Stats Counter Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
          <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-center flex flex-col justify-center">
            <span className="text-[11px] sm:text-xs text-zinc-400 font-semibold mb-1">Words Learned</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.wordsLearnedCount}
            </span>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-center flex flex-col justify-center">
            <span className="text-[11px] sm:text-xs text-zinc-400 font-semibold mb-1">Phrases Learned</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
              {stats.phrasesLearnedCount}
            </span>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-center flex flex-col justify-center">
            <span className="text-[11px] sm:text-xs text-zinc-400 font-semibold mb-1">Total Practiced</span>
            <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
              {stats.wordsPracticedCount}
            </span>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-center flex flex-col justify-center">
            <span className="text-[11px] sm:text-xs text-zinc-400 font-semibold mb-1">Speaking Attempts</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
              {stats.speakingAttemptsCount}
            </span>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-center flex flex-col justify-center col-span-2 sm:col-span-1">
            <div className="flex items-center justify-center gap-1">
              <span className="text-[11px] sm:text-xs text-zinc-400 font-semibold mb-1">Practice Again</span>
              {stats.needsPracticeCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 mb-1 animate-pulse" />
              )}
            </div>
            <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
              {stats.needsPracticeCount}
            </span>
          </div>
        </div>
      </div>

      {/* 3. TABS & SMART FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
        <div className="-mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            All Items ({BASIC_WORDS_CURRICULUM.length})
          </button>
          <button
            onClick={() => setActiveTab("revision")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "revision"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span>🔄 Practice Again</span>
            {stats.needsPracticeCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {stats.needsPracticeCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "favorites"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span>⭐ Favorites</span>
            {stats.favoriteIds.length > 0 && (
              <span className="bg-amber-400/30 text-amber-200 text-[10px] px-1.5 py-0.2 rounded-full">
                {stats.favoriteIds.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("learned")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === "learned"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            Learned ({stats.learnedIds.length})
          </button>
          <button
            onClick={() => setActiveTab("unlearned")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === "unlearned"
                ? "bg-zinc-700 text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            Not Learned
          </button>
        </div>

        {/* Level filter & search bar */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold rounded-lg px-2.5 py-2 sm:py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none flex-1 sm:flex-initial min-w-0 max-w-[130px] sm:max-w-none cursor-pointer"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Elementary">Elementary</option>
            <option value="Intermediate">Intermediate</option>
          </select>

          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              placeholder="Search words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-2 sm:py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="absolute left-2.5 top-2.5 sm:top-2 text-zinc-400 text-xs">🔍</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 sm:top-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs cursor-pointer p-0.5"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. CATEGORY PILLS (All 17 Categories) */}
      <div className="-mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer border ${
            selectedCategory === "All"
              ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-xs"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
          }`}
        >
          ✨ All Categories
        </button>
        {BASIC_WORDS_CATEGORIES.map((cat) => {
          const isSel = selectedCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer border flex items-center gap-1.5 ${
                isSel
                  ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-xs"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* 5. WORD & PHRASE CARDS GRID */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-12 text-center">
          <span className="text-3xl sm:text-4xl mb-3 block">🔍</span>
          <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">No items found</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Try adjusting your category, level filter, or search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredItems.map((item) => {
            const targetEntry = item.translations[targetLang.code] || item.translations.en;
            const sourceEntry = item.translations[sourceLang.code] || item.translations.en;
            const targetExample = item.example[targetLang.code] || item.example.en;
            const sourceExample = item.example[sourceLang.code] || item.example.en;

            const isTargetRtl = isRtlText(targetEntry?.text || "") || targetLang.code === "ar";
            const isSourceRtl = isRtlText(sourceEntry?.text || "") || sourceLang.code === "ar";

            const isFav = stats.favoriteIds.includes(item.id);
            const isLearned = stats.learnedIds.includes(item.id);
            const isNeedsPractice = stats.needsPracticeIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-zinc-900 rounded-2xl border transition-all hover:shadow-md p-4 sm:p-5 flex flex-col justify-between relative ${
                  isNeedsPractice
                    ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/10 dark:bg-rose-950/10"
                    : isLearned
                    ? "border-emerald-200 dark:border-emerald-900/50"
                    : "border-zinc-200/90 dark:border-zinc-800"
                }`}
              >
                <div>
                  {/* Card Header Badges & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          item.level === "Beginner"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                            : item.level === "Elementary"
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                            : "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                        }`}
                      >
                        {item.level}
                      </span>
                      {isNeedsPractice && (
                        <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0">
                          ⚠️ Practice Again
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Favorite Button */}
                      <button
                        onClick={() => handleToggleFavorite(item)}
                        className={`p-1.5 rounded-lg transition cursor-pointer active:scale-90 ${
                          isFav
                            ? "text-amber-500 hover:text-amber-600"
                            : "text-zinc-300 hover:text-amber-400 dark:text-zinc-600"
                        }`}
                        title={isFav ? "Remove from favorites" : "Save to favorites"}
                        aria-label="Toggle Favorite"
                      >
                        <span className="text-base leading-none">{isFav ? "⭐" : "☆"}</span>
                      </button>

                      {/* Learned Checkmark */}
                      <button
                        onClick={() => handleToggleLearned(item)}
                        className={`p-1.5 sm:px-2 rounded-lg transition cursor-pointer text-xs font-bold flex items-center gap-1 active:scale-95 ${
                          isLearned
                            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60"
                            : "text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                        title={isLearned ? "Mark as not learned" : "Mark as learned"}
                        aria-label={isLearned ? "Learned" : "Mark as learned"}
                      >
                        <span>✓</span>
                        <span className="hidden sm:inline">{isLearned ? "Learned" : "Learn"}</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. TARGET LANGUAGE WORD/PHRASE */}
                  <div className="space-y-1.5 mb-3">
                    <p
                      dir={isTargetRtl ? "rtl" : "ltr"}
                      className={`text-xl sm:text-2xl font-black text-zinc-900 dark:text-white leading-tight break-words ${
                        isTargetRtl ? "text-right font-arabic" : "text-left font-sans"
                      }`}
                    >
                      {targetEntry?.text}
                    </p>

                    {/* 2. ROMAN PRONUNCIATION */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md inline-block max-w-full break-words">
                        Read: {targetEntry?.romanized}
                      </span>
                    </div>
                  </div>

                  {/* 3. SOURCE LANGUAGE MEANING */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 mb-3">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-0.5">
                      {sourceLang.name}:
                    </p>
                    <p
                      dir={isSourceRtl ? "rtl" : "ltr"}
                      className={`text-sm sm:text-base font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed break-words ${
                        isSourceRtl ? "text-right font-arabic" : "text-left font-sans"
                      }`}
                    >
                      {sourceEntry?.text}
                    </p>
                  </div>

                  {/* 4. EXAMPLE SENTENCE */}
                  {targetExample && (
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800 mb-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Example Sentence:
                        </span>
                        <button
                          onClick={() => handleListen(targetExample.text, `ex-${item.id}`)}
                          className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <span>🔊</span> Listen
                        </button>
                      </div>

                      <p
                        dir={isTargetRtl ? "rtl" : "ltr"}
                        className={`text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 break-words ${
                          isTargetRtl ? "text-right font-arabic" : "text-left"
                        }`}
                      >
                        {targetExample.text}
                      </p>
                      <p className="text-[11px] text-indigo-600/80 dark:text-indigo-300/80 font-medium break-words">
                        Read: {targetExample.romanized}
                      </p>
                      <p
                        dir={isSourceRtl ? "rtl" : "ltr"}
                        className={`text-xs text-zinc-500 dark:text-zinc-400 pt-0.5 break-words ${
                          isSourceRtl ? "text-right font-arabic" : "text-left"
                        }`}
                      >
                        {sourceExample.text}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons: Listen & Speak */}
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => handleListen(targetEntry?.text, item.id)}
                    className={`flex-1 min-h-[42px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border active:scale-[0.98] ${
                      playingWordId === item.id
                        ? "bg-indigo-600 text-white border-indigo-600 animate-pulse"
                        : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    <span className="text-sm">🔊</span>
                    <span>Listen</span>
                  </button>

                  <button
                    onClick={() => handleOpenPractice(item)}
                    className="flex-1 min-h-[42px] py-2 px-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    <span className="text-sm">🎤</span>
                    <span>Speak</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. SPEAK PRACTICE MODAL / BOTTOM DRAWER */}
      {activePracticeItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0"
            onClick={() => {
              stopTTS();
              handleStopSpeaking();
              setActivePracticeItem(null);
            }}
          />

          <div className="relative z-10 bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col overflow-y-auto animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            {/* Mobile Sheet Drag Indicator Handle */}
            <div className="w-12 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                  🎤
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">
                    Speaking Practice
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-400">
                    Listen, then tap speak and repeat clearly.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  stopTTS();
                  handleStopSpeaking();
                  setActivePracticeItem(null);
                }}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center justify-center cursor-pointer text-sm font-bold transition active:scale-95"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Target Card Display */}
            {(() => {
              const target =
                activePracticeItem.translations[targetLang.code] || activePracticeItem.translations.en;
              const source =
                activePracticeItem.translations[sourceLang.code] || activePracticeItem.translations.en;
              const isTgtRtl = isRtlText(target.text) || targetLang.code === "ar";
              const isSrcRtl = isRtlText(source.text) || sourceLang.code === "ar";

              return (
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-700 text-center space-y-2">
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleListen(target.text, `modal-${activePracticeItem.id}`)}
                      className="px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-200 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <span>🔊 Listen First</span>
                    </button>
                  </div>

                  <p
                    dir={isTgtRtl ? "rtl" : "ltr"}
                    className={`text-xl sm:text-2xl font-black text-zinc-900 dark:text-white break-words ${
                      isTgtRtl ? "font-arabic" : "font-sans"
                    }`}
                  >
                    {target.text}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 break-words">
                    Read: {target.romanized}
                  </p>
                  <p
                    dir={isSrcRtl ? "rtl" : "ltr"}
                    className={`text-xs text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60 break-words ${
                      isSrcRtl ? "font-arabic" : "font-sans"
                    }`}
                  >
                    {sourceLang.name}: {source.text}
                  </p>
                </div>
              );
            })()}

            {/* Live Transcript & Recording Status */}
            <div className="text-center py-1 space-y-2">
              {isRecording ? (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      Listening in {targetLang.name}... Speak now!
                    </span>
                  </div>
                  {liveTranscript && (
                    <p className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 py-2 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 break-words">
                      &quot;{liveTranscript}&quot;
                    </p>
                  )}
                </div>
              ) : isEvaluating ? (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 py-2">
                  <span className="animate-spin text-sm">⏳</span>
                  Evaluating your pronunciation...
                </div>
              ) : attemptResult ? (
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl border text-left space-y-2 ${
                    attemptResult.status === "Correct"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800"
                      : attemptResult.status === "Almost Correct"
                      ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                        attemptResult.status === "Correct"
                          ? "bg-emerald-500 text-white"
                          : attemptResult.status === "Almost Correct"
                          ? "bg-amber-500 text-white"
                          : "bg-rose-500 text-white"
                      }`}
                    >
                      {attemptResult.status} ({attemptResult.score}%)
                    </span>
                    <span className="text-[11px] sm:text-xs font-bold text-zinc-500">
                      {attemptResult.status === "Correct"
                        ? "🎉 Perfect execution!"
                        : attemptResult.status === "Almost Correct"
                        ? "👍 Very close!"
                        : "⚠️ Added to Practice Again"}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 break-words">
                    You said: <span className="font-bold">&quot;{attemptResult.transcript}&quot;</span>
                  </p>

                  {attemptResult.feedback?.whatToImprove?.[0] && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 break-words">
                      💡 Tip: {attemptResult.feedback.whatToImprove[0]}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">
                  Tap the microphone button below to record your voice.
                </p>
              )}

              {micError && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-left">
                  ⚠️ {micError}
                </p>
              )}
            </div>

            {/* Modal Recording Controls */}
            <div className="flex items-center justify-center pt-2">
              {isRecording ? (
                <button
                  onClick={handleStopSpeaking}
                  className="w-full sm:w-auto px-8 py-3.5 min-h-[46px] rounded-2xl sm:rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer active:scale-95"
                >
                  <span className="text-sm">⏹</span>
                  <span>Stop & Check</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStartSpeaking(activePracticeItem)}
                  className="w-full sm:w-auto px-8 py-3.5 min-h-[46px] rounded-2xl sm:rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95"
                >
                  <span className="text-sm">🎤</span>
                  <span>{attemptResult ? "Try Again" : "Start Speaking"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
