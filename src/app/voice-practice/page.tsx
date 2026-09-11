"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { getAuthUserRoleAction } from "../login/actions";
import {
  analyzeSpeakingAction,
  getAttemptsAction,
  getSpeakingStatsAction,
} from "./actions";
import MobileHeader from "../components/MobileHeader";
import UserSidebar from "../components/UserSidebar";
import ThemeSwitcher from "../components/ThemeSwitcher";
import MultilingualMessageContent from "../components/MultilingualMessageContent";
import {
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
} from "../../lib/languages";
import {
  getPhrasesForLanguage,
  MultilingualPracticePhrase,
  SpeakingEvaluationResult,
  parseStoredAttemptFeedback,
} from "../../lib/speaking-engine";
import { initTTS, resolveTTSLocale, speakMultilingualText } from "../../lib/tts";

interface AttemptRecord {
  id: number;
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

interface SpeakingStatsData {
  totalReadings: number;
  avgScore: number | null;
  grammarAvg: number | null;
  fluencyAvg: number | null;
  vocabAvg: number | null;
  pronunciationAvg: number | null;
  speakingStreak: number;
  trend: string;
  trendLabel: string;
  trendDelta: string;
}

export default function VoicePracticePage() {
  const [userName, setUserName] = useState("Learner");
  const [userInitials, setUserInitials] = useState("L");
  const [isAdmin, setIsAdmin] = useState(false);

  // Multilingual Configuration
  const [targetLangCode, setTargetLangCode] = useState("en");
  const [sourceLangCode, setSourceLangCode] = useState("hi");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Speech Recognition & State
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [typedInput, setTypedInput] = useState("");
  const [isTypeMode, setIsTypeMode] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  // Evaluation & Results
  const [evaluation, setEvaluation] = useState<SpeakingEvaluationResult | null>(null);
  const [activeTab, setActiveTab] = useState<"scores" | "feedback" | "guidance">("scores");

  // History & Statistics
  const [previousAttempts, setPreviousAttempts] = useState<AttemptRecord[]>([]);
  const [speakingStats, setSpeakingStats] = useState<SpeakingStatsData | null>(null);

  const recognitionRef = useRef<any>(null);
  const fallbackFormRef = useRef<HTMLFormElement>(null);

  // Smooth scroll into fallback form when activated
  useEffect(() => {
    if (isTypeMode && fallbackFormRef.current) {
      fallbackFormRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isTypeMode]);

  // Load User Details, Session & Practice Stats
  useEffect(() => {
    initTTS();
    getAuthUserRoleAction().then((res) => {
      setIsAdmin(res.isAdmin);
      if (res.name) {
        setUserName(res.name);
        setUserInitials(
          res.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "US"
        );
      }
      if (res.targetLanguage) {
        const matchedLang = SUPPORTED_LANGUAGES.find(
          (l) => l.name.toLowerCase() === res.targetLanguage?.toLowerCase()
        );
        if (matchedLang) setTargetLangCode(matchedLang.code);
      }
      if (res.nativeLanguage) {
        const matchedNative = SUPPORTED_LANGUAGES.find(
          (l) => l.name.toLowerCase() === res.nativeLanguage?.toLowerCase()
        );
        if (matchedNative) setSourceLangCode(matchedNative.code);
      }
    });
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = async () => {
    try {
      const attempts = await getAttemptsAction();
      setPreviousAttempts((attempts || []) as unknown as AttemptRecord[]);
    } catch (e) {
      console.error("Failed to load speaking attempts history:", e);
    }
  };

  const loadStats = async () => {
    try {
      const res = await getSpeakingStatsAction();
      if (res.success && res.stats) {
        setSpeakingStats(res.stats as SpeakingStatsData);
      }
    } catch (e) {
      console.error("Failed to load speaking stats:", e);
    }
  };

  // Available Phrases for Selected Target Language & Difficulty
  const availablePhrases = useMemo(() => {
    const list = getPhrasesForLanguage(targetLangCode, difficulty);
    return list.length > 0 ? list : getPhrasesForLanguage("en", difficulty);
  }, [targetLangCode, difficulty]);

  const currentPhrase: MultilingualPracticePhrase = useMemo(() => {
    return availablePhrases[phraseIndex % availablePhrases.length] || availablePhrases[0];
  }, [availablePhrases, phraseIndex]);

  const targetLangConfig = getLanguageByCode(targetLangCode);
  const sourceLangConfig = getLanguageByCode(sourceLangCode);

  // Initialize Web Speech API whenever current phrase or target language changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = targetLangConfig.sttLang;

        rec.onstart = () => {
          setIsRecording(true);
          setMicError(null);
          setTranscribedText("");
          setEvaluation(null);
        };

        rec.onresult = (event: any) => {
          const speechToText = event.results[0][0].transcript;
          setTranscribedText(speechToText);
          handleAnalyzeSpeech(speechToText, currentPhrase.targetText);
        };

        rec.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsRecording(false);
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            const isLocalhost =
              window.location.hostname === "localhost" ||
              window.location.hostname === "127.0.0.1" ||
              window.location.hostname === "[::1]";
            const isSecure = window.isSecureContext || isLocalhost;
            if (!isSecure) {
              setMicError(
                "Microphone blocked: Browsers require HTTPS or localhost. On local network IP, please use HTTPS or use 'Type Instead'."
              );
            } else {
              setMicError(
                "Microphone access was denied in your browser settings. Please allow microphone permissions or use 'Type Instead'."
              );
            }
          } else if (event.error === "no-speech") {
            setMicError("No speech detected. Please speak clearly into your microphone.");
          } else if (event.error === "network") {
            setMicError("Network speech-recognition service unavailable. You can use 'Type Instead'.");
          } else {
            setMicError(`Microphone notice: ${event.error}. You can practice again or use 'Type Instead'.`);
          }
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      } else {
        setSupported(false);
        setMicError("Web Speech API is not supported in this browser. Please use the 'Type Instead' mode below.");
      }
    }
  }, [currentPhrase, targetLangConfig]);

  const startRecording = () => {
    setMicError(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err: any) {
        console.warn("Speech recognition start error:", err);
        try {
          recognitionRef.current.abort();
          setTimeout(() => {
            recognitionRef.current?.start();
          }, 200);
        } catch (retryErr) {
          setMicError("Microphone access is unavailable. Please click 'Type Instead'.");
        }
      }
    } else {
      setMicError("Microphone access is unavailable. Please click 'Type Instead'.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Error stopping recording:", e);
      }
    }
    setIsRecording(false);
  };

  const handleAnalyzeSpeech = async (spokenText: string, targetText: string) => {
    const textToEvaluate = spokenText.trim();
    if (!textToEvaluate) return;

    setAnalyzing(true);
    try {
      const res = await analyzeSpeakingAction(
        targetText,
        textToEvaluate,
        difficulty,
        targetLangCode,
        sourceLangCode
      );

      setAnalyzing(false);

      if (res.success && res.evaluation) {
        setEvaluation(res.evaluation);
        loadHistory();
        loadStats();
      } else {
        setMicError(res.error || "Failed to analyze speaking attempt.");
      }
    } catch (e: any) {
      setAnalyzing(false);
      console.error("Analysis execution error:", e);
      setMicError("An error occurred during speaking evaluation.");
    }
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    setTranscribedText(typedInput.trim());
    handleAnalyzeSpeech(typedInput.trim(), currentPhrase.targetText);
  };

  const handleNextPhrase = () => {
    setPhraseIndex((prev) => (prev + 1) % availablePhrases.length);
    setTranscribedText("");
    setTypedInput("");
    setEvaluation(null);
    setMicError(null);
    setActiveTab("scores");
  };

  const handleRepeatCurrent = () => {
    setTranscribedText("");
    setTypedInput("");
    setEvaluation(null);
    setMicError(null);
    startRecording();
  };

  const handlePlayTTS = (textToPlay: string, langLocale?: string) => {
    if (!textToPlay) return;
    const resolved = resolveTTSLocale(textToPlay, targetLangCode, langLocale);
    speakMultilingualText(textToPlay, resolved, {
      rate: 0.95,
    });
  };

  return (
    <div className="flex min-h-screen md:h-screen w-full bg-zinc-950 text-zinc-50 font-sans overflow-hidden">
      {/* 1. Sidebar Navigation (Canonical 11-Item Order Maintained) */}
      <UserSidebar activeNav="voice-practice" isAdmin={isAdmin} />

      {/* 2. Main Workspace */}
      <main className="flex-1 flex flex-col overflow-y-auto min-h-0 min-w-0">
        <MobileHeader
          userName={userName}
          userInitials={userInitials}
          isAdmin={isAdmin}
          activeNav="voice-practice"
        />

        <div className="p-4 sm:p-6 lg:p-8 pb-20 sm:pb-24 max-w-7xl mx-auto w-full flex-1 space-y-6">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xl shrink-0">
                  🎙️
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-50">
                  Voice Speaking & Pronunciation
                </h1>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Read aloud, compare with the target sentence, and receive instant multi-dimensional AI feedback.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <Link
                href="/voice-conversation"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-600/25"
              >
                <span>💬</span>
                <span>Practice Natural Dialogue</span>
              </Link>
            </div>
          </div>

          {/* Main Grid: Left Workspace (8 cols) + Right Progress Panel (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Primary Workspace Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Multilingual Selectors & Level Tabs Card */}
              <div className="bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
                {/* Target & Source Dropdowns */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-400">Target Language:</span>
                    <select
                      aria-label="Target Language"
                      value={targetLangCode}
                      onChange={(e) => {
                        const newCode = e.target.value;
                        if (newCode === sourceLangCode) {
                          const alt = SUPPORTED_LANGUAGES.find((l) => l.code !== newCode);
                          if (alt) setSourceLangCode(alt.code);
                        }
                        setTargetLangCode(newCode);
                        setPhraseIndex(0);
                        setEvaluation(null);
                        setTranscribedText("");
                      }}
                      className="bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 font-bold text-zinc-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code} disabled={lang.code === sourceLangCode}>
                          {lang.flag} {lang.name} {lang.code === sourceLangCode ? "(My Language)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-400">My Language:</span>
                    <select
                      aria-label="Source Language"
                      value={sourceLangCode}
                      onChange={(e) => {
                        const newCode = e.target.value;
                        if (newCode === targetLangCode) {
                          const alt = SUPPORTED_LANGUAGES.find((l) => l.code !== targetLangCode);
                          if (alt) {
                            setTargetLangCode(alt.code);
                            setPhraseIndex(0);
                            setEvaluation(null);
                            setTranscribedText("");
                          }
                        }
                        setSourceLangCode(newCode);
                      }}
                      className="bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 font-bold text-zinc-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code} disabled={lang.code === targetLangCode}>
                          {lang.flag} {lang.name} {lang.code === targetLangCode ? "(Target Focus)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Level Tabs */}
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        setDifficulty(lvl);
                        setPhraseIndex(0);
                        setEvaluation(null);
                        setTranscribedText("");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        difficulty === lvl
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Practice Phrase Interactive Card */}
              <div className="bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
                {/* Phrase Header info */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Target Sentence ({difficulty})
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400">
                    Phrase {phraseIndex + 1} of {availablePhrases.length}
                  </span>
                </div>

                {/* Multilingual Sentence Display */}
                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-inner">
                  <MultilingualMessageContent
                    text={currentPhrase.targetText}
                    pronunciation={currentPhrase.romanized !== currentPhrase.targetText ? currentPhrase.romanized : undefined}
                    nativeExplanation={currentPhrase.translations[sourceLangCode] || currentPhrase.translations.en || ""}
                    targetLangCode={targetLangCode}
                    sourceLangCode={sourceLangCode}
                    ttsLocale={targetLangConfig.ttsLang}
                    variant="dark"
                  />
                </div>

                {/* Recording Controls & Waveform Area */}
                <div className="flex flex-col items-center justify-center py-4 border-y border-zinc-800/80 space-y-4">
                  {/* Wave Visualizer Bar */}
                  <div className="h-12 flex items-center justify-center gap-1.5 w-full max-w-xs bg-zinc-950/70 p-2 rounded-2xl border border-zinc-800/60">
                    {isRecording ? (
                      <>
                        <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse h-4" />
                        <span className="w-1.5 bg-purple-500 rounded-full animate-pulse h-10" />
                        <span className="w-1.5 bg-indigo-400 rounded-full animate-pulse h-12" />
                        <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse h-6" />
                        <span className="w-1.5 bg-purple-400 rounded-full animate-pulse h-9" />
                        <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse h-4" />
                      </>
                    ) : (
                      <div className="w-full h-1 bg-zinc-800 rounded-full" />
                    )}
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {isRecording ? (
                      <button
                        onClick={stopRecording}
                        className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30 transition cursor-pointer animate-pulse"
                      >
                        <span className="w-3 h-3 rounded-sm bg-white" />
                        <span>Stop Recording</span>
                      </button>
                    ) : (
                      <button
                        disabled={analyzing}
                        onClick={startRecording}
                        className="px-7 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          />
                        </svg>
                        <span>Click & Speak</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePlayTTS(currentPhrase.targetText)}
                      className="px-4 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer border border-zinc-700/60"
                    >
                      <span>🔊</span>
                      <span>Listen</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsTypeMode(!isTypeMode)}
                      className="px-4 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer border border-zinc-700/60"
                    >
                      <span>⌨️</span>
                      <span>{isTypeMode ? "Hide Typing" : "Type Instead"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextPhrase}
                      className="px-4 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs sm:text-sm transition cursor-pointer border border-zinc-700/60"
                    >
                      Next ➔
                    </button>
                  </div>

                  {/* Practice Status Text */}
                  <p className="text-xs text-zinc-400 text-center font-medium">
                    {isRecording
                      ? "Listening to your pronunciation... Speak now!"
                      : analyzing
                      ? "Evaluating grammar, fluency, vocabulary and pronunciation..."
                      : "Click the microphone button to start speaking, or use 'Type Instead'."}
                  </p>

                  {/* Microphone Error Notice */}
                  {micError && (
                    <div className="w-full max-w-lg p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                      <span className="text-base shrink-0">⚠️</span>
                      <div className="space-y-1 flex-1">
                        <p className="font-semibold">{micError}</p>
                        {!isTypeMode && (
                          <button
                            onClick={() => setIsTypeMode(true)}
                            className="text-indigo-400 underline font-bold cursor-pointer"
                          >
                            Click here to Type Instead
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* "Type Instead" Input Form (Fallback Mode) */}
                  {isTypeMode && (
                    <form
                      ref={fallbackFormRef}
                      onSubmit={handleTypeSubmit}
                      className="w-full max-w-lg p-4 sm:p-5 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-3 shadow-inner"
                    >
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Type what you spoke (Fallback Mode):
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                        <input
                          type="text"
                          value={typedInput}
                          onChange={(e) => setTypedInput(e.target.value)}
                          placeholder="e.g. Good morning. How are you today?"
                          className="flex-1 min-w-0 px-3.5 py-2.5 text-sm rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        />
                        <button
                          type="submit"
                          disabled={analyzing || !typedInput.trim()}
                          className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                        >
                          {analyzing ? "Evaluating..." : "Evaluate"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* AI Evaluation & Feedback Results */}
                {evaluation && (
                  <div className="space-y-6 pt-2">
                    {/* Score Summary Gauge & Subscores */}
                    <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
                      <div className="sm:col-span-2 flex items-center gap-4">
                        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                          <svg className="w-20 h-20 transform -rotate-90">
                            <circle
                              cx="40"
                              cy="40"
                              r="32"
                              className="stroke-zinc-800"
                              strokeWidth="7"
                              fill="transparent"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="32"
                              className={
                                evaluation.scores.overall >= 90
                                  ? "stroke-emerald-500"
                                  : evaluation.scores.overall >= 75
                                  ? "stroke-amber-500"
                                  : "stroke-rose-500"
                              }
                              strokeWidth="7"
                              fill="transparent"
                              strokeDasharray={201}
                              strokeDashoffset={201 - (201 * evaluation.scores.overall) / 100}
                            />
                          </svg>
                          <span className="absolute text-lg font-black text-zinc-50">
                            {evaluation.scores.overall}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Speaking Rating
                          </span>
                          <p className="text-base font-extrabold text-zinc-100 mt-0.5">
                            {evaluation.scores.status}
                          </p>
                          <span className="text-[11px] text-zinc-400 block mt-0.5">
                            Multi-dimensional AI assessment
                          </span>
                        </div>
                      </div>

                      {/* Dimensional Score Badges */}
                      <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Grammar</span>
                          <span className="text-base font-black text-indigo-400">
                            {evaluation.scores.grammar}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Fluency</span>
                          <span className="text-base font-black text-purple-400">
                            {evaluation.scores.fluency}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Vocab</span>
                          <span className="text-base font-black text-indigo-400">
                            {evaluation.scores.vocabulary}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Pronunciation</span>
                          <span className="text-base font-black text-emerald-400">
                            {evaluation.scores.pronunciation}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Result Tabs */}
                    <div className="flex border-b border-zinc-800 gap-2">
                      {[
                        { key: "scores", label: "Target Comparison" },
                        { key: "feedback", label: "AI Feedback" },
                        { key: "guidance", label: "Pronunciation Guidance" },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key as any)}
                          className={`pb-2.5 text-xs font-bold transition cursor-pointer border-b-2 px-3 ${
                            activeTab === tab.key
                              ? "border-indigo-500 text-indigo-400"
                              : "border-transparent text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-4">
                      {/* Tab 1: Comparison */}
                      {activeTab === "scores" && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                Target Sentence:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {evaluation.comparison.targetTokens.map((t, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                      t.status === "match"
                                        ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/80"
                                        : t.status === "omitted"
                                        ? "bg-amber-950/60 text-amber-300 border border-amber-800/80"
                                        : "bg-rose-950/60 text-rose-300 border border-rose-800/80"
                                    }`}
                                  >
                                    {t.word}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                                You Said (Spoken Transcript):
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {evaluation.comparison.spokenTokens.length > 0 ? (
                                  evaluation.comparison.spokenTokens.map((t, idx) => (
                                    <span
                                      key={idx}
                                      className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                        t.status === "match"
                                          ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/80"
                                          : "bg-rose-950/60 text-rose-300 border border-rose-800/80"
                                      }`}
                                    >
                                      {t.word}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-zinc-400 italic">No speech recognized</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                            <span className="text-xs font-bold text-zinc-200 block">
                              Identified Differences:
                            </span>
                            <ul className="space-y-1 text-xs text-zinc-300">
                              {evaluation.comparison.differences.map((diff, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <span className="text-amber-400">●</span>
                                  <span>{diff}</span>
                                </li>
                              ))}
                            </ul>

                            <div className="pt-2 border-t border-zinc-800">
                              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                                Refined Sentence:
                              </span>
                              <p className="text-sm font-semibold text-indigo-300">
                                "{evaluation.comparison.correctedSentence}"
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Feedback */}
                      {activeTab === "feedback" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                              <span>✓</span> What You Did Well
                            </h4>
                            <ul className="space-y-1.5 text-xs text-emerald-200">
                              {evaluation.feedback.whatWentWell.map((w, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-emerald-400">✔</span>
                                  <span>{w}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                              <span>⚠️</span> What To Improve
                            </h4>
                            <ul className="space-y-1.5 text-xs text-amber-200">
                              {evaluation.feedback.whatToImprove.map((i, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-amber-400">●</span>
                                  <span>{i}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="md:col-span-2 p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/60 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                              💡 Actionable Practice Tip
                            </span>
                            <p className="text-xs font-medium text-indigo-200">
                              {evaluation.feedback.practiceTip}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tab 3: Pronunciation Guidance */}
                      {activeTab === "guidance" && (
                        <div className="space-y-4">
                          {evaluation.pronunciationGuidance.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {evaluation.pronunciationGuidance.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-zinc-100">
                                      {item.word}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handlePlayTTS(item.audioTarget)}
                                      className="text-xs p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                                      title="Listen to pronunciation"
                                    >
                                      🔊
                                    </button>
                                  </div>
                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                                      Phonetic / Read:
                                    </span>
                                    <span className="text-xs font-mono text-indigo-400">
                                      {item.phonetic}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                                    {item.tip}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 rounded-xl bg-zinc-950/60 text-center text-xs text-zinc-400">
                              No difficult phoneme issues detected on this attempt! Great enunciation.
                            </div>
                          )}

                          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                            <span className="font-bold block text-zinc-300">
                              ℹ️ AI Pronunciation Guidance Note:
                            </span>
                            <p>{evaluation.disclaimer}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Controls & Recommendation */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleRepeatCurrent}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                        >
                          <span>🎤</span>
                          <span>Practice Again</span>
                        </button>
                        <button
                          onClick={handleNextPhrase}
                          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 text-xs font-bold transition cursor-pointer"
                        >
                          Next Phrase ➔
                        </button>
                      </div>

                      <Link
                        href={evaluation.recommendation.href}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/60 text-xs font-semibold transition"
                      >
                        <span>🎯 {evaluation.recommendation.actionLabel}:</span>
                        <span className="underline">{evaluation.recommendation.title}</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Speaking Attempts Log */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <span>📜</span>
                  Recent Speaking Attempts
                </h2>

                {previousAttempts.length === 0 ? (
                  <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-center text-zinc-400 text-xs sm:text-sm">
                    Complete your first speaking practice above to record your score!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {previousAttempts.slice(0, 8).map((att) => {
                      const breakdown = parseStoredAttemptFeedback(att);
                      return (
                        <div
                          key={att.id}
                          className="bg-zinc-900/90 p-4.5 rounded-2xl border border-zinc-800/90 shadow-lg space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded">
                                {att.difficulty}
                              </span>
                              <span className="text-xs text-zinc-400">
                                {new Date(att.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-400">Score:</span>
                              <span
                                className={`text-sm font-black ${
                                  att.score >= 90
                                    ? "text-emerald-400"
                                    : att.score >= 75
                                    ? "text-amber-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {att.score}%
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 font-bold rounded-full uppercase ${
                                  att.status === "Excellent"
                                    ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/50"
                                    : att.status === "Good"
                                    ? "bg-amber-950/40 text-amber-400 border border-amber-800/50"
                                    : "bg-rose-950/40 text-rose-400 border border-rose-800/50"
                                }`}
                              >
                                {att.status}
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                              Target:
                            </span>
                            <p className="text-xs sm:text-sm font-semibold text-zinc-200">
                              "{att.phrase}"
                            </p>
                          </div>

                          {att.transcript && (
                            <div>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                                You Spoke:
                              </span>
                              <p className="text-xs italic text-zinc-400">
                                "{att.transcript}"
                              </p>
                            </div>
                          )}

                          <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap gap-2 text-[10px] text-zinc-400">
                            <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                              Grammar: {breakdown.grammar}
                            </span>
                            <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                              Fluency: {breakdown.fluency}
                            </span>
                            <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                              Vocab: {breakdown.vocabulary}
                            </span>
                            <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                              Pronunciation: {breakdown.pronunciation}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Compact Progress Panel Column (Desktop lg:col-span-4, Mobile Stacked) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Practice Progress Card */}
              <div className="bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-md p-5 rounded-2xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <span>📊</span> Practice Progress
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800">
                    {speakingStats?.avgScore ? `${speakingStats.avgScore}% Avg` : "No data"}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 font-medium mb-1">
                      <span>Grammar Accuracy</span>
                      <span className="text-zinc-200 font-bold">
                        {speakingStats?.grammarAvg ? `${speakingStats.grammarAvg}%` : "--"}
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${speakingStats?.grammarAvg || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 font-medium mb-1">
                      <span>Fluency Rate</span>
                      <span className="text-zinc-200 font-bold">
                        {speakingStats?.fluencyAvg ? `${speakingStats.fluencyAvg}%` : "--"}
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${speakingStats?.fluencyAvg || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 font-medium mb-1">
                      <span>Pronunciation Estimate</span>
                      <span className="text-zinc-200 font-bold">
                        {speakingStats?.pronunciationAvg ? `${speakingStats.pronunciationAvg}%` : "--"}
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${speakingStats?.pronunciationAvg || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Goal & Speaking Streak */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl space-y-1 text-center">
                  <span className="text-2xl">🔥</span>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Speaking Streak
                  </span>
                  <span className="text-base font-black text-amber-400">
                    {speakingStats?.speakingStreak || 0} Days
                  </span>
                </div>

                <div className="bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl space-y-1 text-center">
                  <span className="text-2xl">🎯</span>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Daily Goal
                  </span>
                  <span className="text-base font-black text-indigo-400">
                    {speakingStats?.totalReadings || 0} / 5
                  </span>
                </div>
              </div>

              {/* Recommended Practice Modules */}
              <div className="bg-zinc-900/90 border border-zinc-800/90 backdrop-blur-md p-5 rounded-2xl shadow-xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  More Practice Topics
                </h4>

                <Link
                  href="/voice-conversation"
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-indigo-500/50 hover:bg-zinc-900 transition group"
                >
                  <span className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-base shrink-0">
                    💬
                  </span>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-zinc-100 group-hover:text-indigo-400 transition truncate">
                      Practice Natural Dialogue
                    </h5>
                    <p className="text-[11px] text-zinc-400 truncate">5-min interactive conversation</p>
                  </div>
                  <span className="text-zinc-500 group-hover:text-indigo-400 transition text-xs">➔</span>
                </Link>

                <Link
                  href="/grammar-correction"
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-purple-500/50 hover:bg-zinc-900 transition group"
                >
                  <span className="p-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 text-base shrink-0">
                    ✍️
                  </span>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-zinc-100 group-hover:text-purple-400 transition truncate">
                      Grammar Corrections
                    </h5>
                    <p className="text-[11px] text-zinc-400 truncate">Fix sentence structure</p>
                  </div>
                  <span className="text-zinc-500 group-hover:text-purple-400 transition text-xs">➔</span>
                </Link>

                <Link
                  href="/speaking-score"
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-900 transition group"
                >
                  <span className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-base shrink-0">
                    📈
                  </span>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-zinc-100 group-hover:text-emerald-400 transition truncate">
                      Detailed Analytics
                    </h5>
                    <p className="text-[11px] text-zinc-400 truncate">View speaking trend reports</p>
                  </div>
                  <span className="text-zinc-500 group-hover:text-emerald-400 transition text-xs">➔</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
