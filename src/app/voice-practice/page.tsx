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
  const [guidanceTab, setGuidanceTab] = useState<"word" | "repeat" | "tips">("word");

  // Waveform Audio Controls
  const [isPlayingTargetAudio, setIsPlayingTargetAudio] = useState(false);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<"1x" | "0.8x" | "1.2x">("1x");

  // History & Statistics
  const [previousAttempts, setPreviousAttempts] = useState<AttemptRecord[]>([]);
  const [speakingStats, setSpeakingStats] = useState<SpeakingStatsData | null>(null);
  const [showAllAttempts, setShowAllAttempts] = useState(false);

  const recognitionRef = useRef<any>(null);
  const fallbackFormRef = useRef<HTMLFormElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // Smooth scroll into fallback form when activated
  useEffect(() => {
    if (isTypeMode && fallbackFormRef.current) {
      fallbackFormRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isTypeMode]);

  // Smooth scroll into evaluation results when generated
  useEffect(() => {
    if (evaluation && resultsSectionRef.current) {
      resultsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [evaluation]);

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
  };

  const handleRepeatCurrent = () => {
    setTranscribedText("");
    setTypedInput("");
    setEvaluation(null);
    setMicError(null);
    startRecording();
  };

  const handlePlayTTS = (textToPlay: string, isUser: boolean = false) => {
    if (!textToPlay) return;
    if (isUser) {
      setIsPlayingUserAudio(true);
      setTimeout(() => setIsPlayingUserAudio(false), 2500);
    } else {
      setIsPlayingTargetAudio(true);
      setTimeout(() => setIsPlayingTargetAudio(false), 3000);
    }
    const resolved = resolveTTSLocale(textToPlay, targetLangCode);
    const rateNumber = audioSpeed === "0.8x" ? 0.8 : audioSpeed === "1.2x" ? 1.2 : 0.95;
    speakMultilingualText(textToPlay, resolved, {
      rate: rateNumber,
    });
  };

  const displayedAttempts = showAllAttempts ? previousAttempts : previousAttempts.slice(0, 4);

  // Colored Word Pills for Pronunciation Guidance
  const phoneticWordPills = useMemo(() => {
    const targetWords = currentPhrase.targetText.split(/\s+/);
    const colorClasses = [
      { bg: "bg-[#111C38]", border: "border-[#1D2B52]", text: "text-[#3B82F6]", label: "Good" },
      { bg: "bg-[#0F2838]", border: "border-[#143B52]", text: "text-[#06B6D4]", label: "Morning" },
      { bg: "bg-[#2A1F13]", border: "border-[#4D3517]", text: "text-[#F59E0B]", label: "How" },
      { bg: "bg-[#241438]", border: "border-[#3E1B63]", text: "text-[#A855F7]", label: "Are" },
      { bg: "bg-[#33122A]", border: "border-[#521942]", text: "text-[#EC4899]", label: "You" },
      { bg: "bg-[#0E3524]", border: "border-[#145237]", text: "text-[#10B981]", label: "Today" },
    ];
    return targetWords.map((word, i) => {
      const color = colorClasses[i % colorClasses.length];
      const cleanWord = word.replace(/[^\w]/g, "");
      return {
        word,
        phonetic: `/${cleanWord.toLowerCase() || "word"}/`,
        color,
      };
    });
  }, [currentPhrase]);

  return (
    <div className="flex min-h-screen md:h-screen w-full bg-[#0A0D1D] text-slate-100 font-sans overflow-hidden">
      {/* 1. Left Sidebar Navigation (Canonical Order Maintained) */}
      <UserSidebar activeNav="voice-practice" isAdmin={isAdmin} />

      {/* 2. Main Workspace */}
      <main className="flex-1 flex flex-col overflow-y-auto min-h-0 min-w-0">
        <MobileHeader
          userName={userName}
          userInitials={userInitials}
          isAdmin={isAdmin}
          activeNav="voice-practice"
        />

        <div className="p-4 sm:p-6 lg:p-8 pb-20 sm:pb-24 max-w-[1400px] mx-auto w-full flex-1 space-y-6">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2640] pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#241438] border border-[#3E1B63] flex items-center justify-center text-purple-400 text-xl shrink-0 shadow-lg shadow-purple-900/20">
                🎙️
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  Voice Speaking & Pronunciation
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                  Speak confidently. Get instant AI feedback. Improve every day.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => alert("Read aloud the sentence, listen to native audio, and receive real-time multi-dimensional AI scoring!")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#141C38] hover:bg-[#1C2850] border border-[#253668] text-indigo-300 transition cursor-pointer"
              >
                <span>▶ How It Works?</span>
              </button>
              <ThemeSwitcher />
            </div>
          </div>

          {/* Selector Bar: Target Language, My Language, Level, Change Button */}
          <div className="bg-[#11162A] border border-[#1E2640] p-4 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-400">Target Language</span>
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
                  className="bg-[#0A0D1D] border border-[#232D4F] rounded-xl px-3 py-2 font-bold text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} disabled={lang.code === sourceLangCode}>
                      {lang.flag} {lang.name} ({lang.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-400">My Language</span>
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
                  className="bg-[#0A0D1D] border border-[#232D4F] rounded-xl px-3 py-2 font-bold text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} disabled={lang.code === targetLangCode}>
                      {lang.flag} {lang.name} ({lang.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-400">Level</span>
                <select
                  aria-label="Difficulty Level"
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value as any);
                    setPhraseIndex(0);
                    setEvaluation(null);
                    setTranscribedText("");
                  }}
                  className="bg-[#0A0D1D] border border-[#232D4F] rounded-xl px-3 py-2 font-bold text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleNextPhrase()}
              className="px-4 py-2 rounded-xl bg-[#1D274A] hover:bg-[#283664] border border-[#2D3D72] text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>➔ Change</span>
            </button>
          </div>

          {/* Main Layout Grid: Primary Workspace (8 cols) + Right Panel (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Primary Workspace Column */}
            <div className="lg:col-span-8 space-y-6">

              {/* Celebration Success Banner (When practice completed) */}
              <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-[#0D3B36] via-[#0E4740] to-[#0A0D1D] border border-[#16655B] shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 z-10">
                  <div className="w-11 h-11 rounded-2xl bg-[#10B981]/20 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] text-2xl shrink-0">
                    ✔
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      Great! You completed the practice!
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Here's your AI feedback. Keep practicing to improve!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 z-10">
                  <span className="px-3 py-1 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] text-xs font-black">
                    +10 XP
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    Keep Going! 🚀
                  </span>
                </div>
              </div>

              {/* Practice Controls & Recording Card */}
              <div className="bg-[#11162A] border border-[#1E2640] rounded-2xl shadow-xl p-6 space-y-6">
                {/* Sentence Prompt Display */}
                <div className="p-5 rounded-2xl bg-[#0A0D1D] border border-[#1E2640] shadow-inner">
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

                {/* Controls Bar & Wave animation */}
                <div className="flex flex-col items-center justify-center py-2 space-y-4">
                  {/* Waveform Animation */}
                  <div className="h-10 flex items-center justify-center gap-1.5 w-full max-w-xs bg-[#0A0D1D] p-2 rounded-2xl border border-[#1E2640]">
                    {isRecording ? (
                      <>
                        <span className="w-1.5 bg-[#6366F1] rounded-full animate-pulse h-4" />
                        <span className="w-1.5 bg-[#8B5CF6] rounded-full animate-pulse h-8" />
                        <span className="w-1.5 bg-[#EC4899] rounded-full animate-pulse h-10" />
                        <span className="w-1.5 bg-[#6366F1] rounded-full animate-pulse h-5" />
                        <span className="w-1.5 bg-[#8B5CF6] rounded-full animate-pulse h-7" />
                        <span className="w-1.5 bg-[#10B981] rounded-full animate-pulse h-4" />
                      </>
                    ) : (
                      <div className="w-full h-1 bg-[#1E2640] rounded-full" />
                    )}
                  </div>

                  {/* Buttons */}
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
                        className="px-7 py-3 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-90 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50"
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
                      className="px-4 py-3 rounded-full bg-[#1A223D] hover:bg-[#25325A] border border-[#2D3D72] text-slate-200 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🔊</span>
                      <span>Listen</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsTypeMode(!isTypeMode)}
                      className="px-4 py-3 rounded-full bg-[#1A223D] hover:bg-[#25325A] border border-[#2D3D72] text-slate-200 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>⌨️</span>
                      <span>{isTypeMode ? "Hide Typing" : "Type Instead"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextPhrase}
                      className="px-4 py-3 rounded-full bg-[#1A223D] hover:bg-[#25325A] border border-[#2D3D72] text-slate-200 font-semibold text-xs sm:text-sm transition cursor-pointer"
                    >
                      Next ➔
                    </button>
                  </div>

                  {/* Status Message */}
                  <p className="text-xs text-slate-400 text-center font-medium">
                    {isRecording
                      ? "Listening to your pronunciation... Speak now!"
                      : analyzing
                      ? "Evaluating grammar, fluency, vocabulary and pronunciation..."
                      : "Click the microphone button to start speaking, or use 'Type Instead'."}
                  </p>

                  {/* Mic Error Notice */}
                  {micError && (
                    <div className="w-full max-w-lg p-3.5 rounded-xl bg-[#2A1F13] border border-[#4D3517] text-[#F59E0B] text-xs flex items-start gap-2.5">
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

                  {/* Fallback Form */}
                  {isTypeMode && (
                    <form
                      ref={fallbackFormRef}
                      onSubmit={handleTypeSubmit}
                      className="w-full max-w-lg p-4 rounded-xl bg-[#0A0D1D] border border-[#1E2640] space-y-3 shadow-inner"
                    >
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Type what you spoke (Fallback Mode):
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                        <input
                          type="text"
                          value={typedInput}
                          onChange={(e) => setTypedInput(e.target.value)}
                          placeholder="e.g. Good morning. How are you today?"
                          className="flex-1 min-w-0 px-3.5 py-2.5 text-sm rounded-lg bg-[#11162A] border border-[#232D4F] text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        />
                        <button
                          type="submit"
                          disabled={analyzing || !typedInput.trim()}
                          className="w-full sm:w-auto shrink-0 px-5 py-2.5 bg-[#6366F1] hover:bg-[#5558E6] text-white rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                        >
                          {analyzing ? "Evaluating..." : "Evaluate"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Your Speaking Score Card */}
              <div ref={resultsSectionRef} className="bg-[#11162A] border border-[#1E2640] rounded-2xl shadow-xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-[#1E2640] pb-4">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span className="text-rose-500">🎯</span> Your Speaking Score
                  </h3>
                  <Link
                    href="/speaking-score"
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <span>➔</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
                  {/* Gauge Ring & Status */}
                  <div className="sm:col-span-2 flex items-center gap-4 bg-[#0A0D1D] p-4 rounded-2xl border border-[#1E2640]">
                    <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          className="stroke-[#1E2640]"
                          strokeWidth="7"
                          fill="transparent"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          className={
                            (evaluation?.scores.overall ?? 35) >= 90
                              ? "stroke-[#10B981]"
                              : (evaluation?.scores.overall ?? 35) >= 75
                              ? "stroke-[#F59E0B]"
                              : "stroke-[#F43F5E]"
                          }
                          strokeWidth="7"
                          fill="transparent"
                          strokeDasharray={201}
                          strokeDashoffset={201 - (201 * (evaluation?.scores.overall ?? 35)) / 100}
                        />
                      </svg>
                      <span className="absolute text-lg font-black text-white">
                        {evaluation ? `${evaluation.scores.overall}%` : "35%"}
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-black text-rose-400">
                        {evaluation ? evaluation.scores.status : "Needs Practice"}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-tight mt-1">
                        You're on the right track! Keep practicing and you'll improve quickly.
                      </p>
                    </div>
                  </div>

                  {/* 4 Colored Metric Chips */}
                  <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                    <div className="p-3 rounded-2xl bg-[#111C38] border border-[#1D2B52]">
                      <span className="text-base shrink-0 block">📘</span>
                      <span className="text-xl font-black text-[#3B82F6] block mt-1">
                        {evaluation ? evaluation.scores.grammar : 30}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
                        Grammar
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#0F2838] border border-[#143B52]">
                      <span className="text-base shrink-0 block">🌊</span>
                      <span className="text-xl font-black text-[#06B6D4] block mt-1">
                        {evaluation ? evaluation.scores.fluency : 40}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
                        Fluency
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#2A1F13] border border-[#4D3517]">
                      <span className="text-base shrink-0 block">📙</span>
                      <span className="text-xl font-black text-[#F59E0B] block mt-1">
                        {evaluation ? evaluation.scores.vocabulary : 30}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
                        Vocabulary
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#241438] border border-[#3E1B63]">
                      <span className="text-base shrink-0 block">🎤</span>
                      <span className="text-xl font-black text-[#A855F7] block mt-1">
                        {evaluation ? evaluation.scores.pronunciation : 40}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
                        Pronunciation
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Target vs Your Speech Card with Waveform Players */}
              <div className="bg-[#11162A] border border-[#1E2640] rounded-2xl shadow-xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-[#1E2640] pb-4">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span className="text-rose-500">🎯</span> Target vs Your Speech
                  </h3>
                  <button
                    type="button"
                    onClick={() => handlePlayTTS(currentPhrase.targetText)}
                    className="px-3 py-1.5 rounded-full bg-[#1E2640] hover:bg-[#293457] text-xs font-bold text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>▶ Listen</span>
                  </button>
                </div>

                {/* Text Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Box: Target Sentence */}
                  <div className="p-4 rounded-2xl bg-[#111B3D] border border-[#1D2B52] space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlayTTS(currentPhrase.targetText)}
                        className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs cursor-pointer hover:opacity-90"
                      >
                        🔊
                      </button>
                      <span className="text-xs font-bold text-slate-300">Target Sentence</span>
                    </div>
                    <p className="text-sm font-bold text-white pt-1">
                      "{currentPhrase.targetText}"
                    </p>
                  </div>

                  {/* Right Box: Your Spoken Text */}
                  <div className="p-4 rounded-2xl bg-[#33122A] border border-[#521942] space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlayTTS(transcribedText || typedInput || "hello", true)}
                        className="w-7 h-7 rounded-full bg-[#EC4899] flex items-center justify-center text-white text-xs cursor-pointer hover:opacity-90"
                      >
                        🎤
                      </button>
                      <span className="text-xs font-bold text-slate-300">Your Spoken Text</span>
                    </div>
                    <p className="text-sm font-bold text-pink-300 pt-1">
                      "{transcribedText || typedInput || "hello"}"
                    </p>
                  </div>
                </div>

                {/* Audio Waveform Player Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Target Audio Player */}
                  <div className="p-4 rounded-2xl bg-[#0A0D1D] border border-[#1E2640] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Target Audio
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handlePlayTTS(currentPhrase.targetText)}
                        className="w-9 h-9 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center text-sm shadow-md cursor-pointer shrink-0"
                      >
                        {isPlayingTargetAudio ? "⏸" : "▶"}
                      </button>
                      {/* Cyan Waveform Graphic */}
                      <div className="flex-1 h-8 flex items-center gap-1">
                        {[40, 75, 50, 90, 60, 100, 45, 80, 65, 95, 30, 70, 85, 50, 40, 60, 90, 75].map((h, idx) => (
                          <span
                            key={idx}
                            className={`flex-1 rounded-full ${
                              isPlayingTargetAudio ? "bg-[#06B6D4] animate-pulse" : "bg-[#06B6D4]/60"
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">0:00 / 0:03</span>
                      <select
                        aria-label="Target Audio Playback Speed"
                        value={audioSpeed}
                        onChange={(e) => setAudioSpeed(e.target.value as any)}
                        className="bg-[#11162A] text-[10px] font-bold text-slate-300 rounded px-1.5 py-1 border border-[#232D4F] cursor-pointer"
                      >
                        <option value="0.8x">0.8x</option>
                        <option value="1x">1x</option>
                        <option value="1.2x">1.2x</option>
                      </select>
                    </div>
                  </div>

                  {/* Your Audio Player */}
                  <div className="p-4 rounded-2xl bg-[#0A0D1D] border border-[#1E2640] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Your Audio
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handlePlayTTS(transcribedText || typedInput || "hello", true)}
                        className="w-9 h-9 rounded-full bg-[#EC4899] hover:bg-[#DB2777] text-white flex items-center justify-center text-sm shadow-md cursor-pointer shrink-0"
                      >
                        {isPlayingUserAudio ? "⏸" : "▶"}
                      </button>
                      {/* Pink Waveform Graphic */}
                      <div className="flex-1 h-8 flex items-center gap-1">
                        {[30, 60, 40, 80, 95, 70, 50, 85, 40, 75, 90, 45, 60, 35, 50, 70, 40].map((h, idx) => (
                          <span
                            key={idx}
                            className={`flex-1 rounded-full ${
                              isPlayingUserAudio ? "bg-[#EC4899] animate-pulse" : "bg-[#EC4899]/60"
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">0:00 / 0:02</span>
                      <select
                        aria-label="Your Audio Playback Speed"
                        value={audioSpeed}
                        onChange={(e) => setAudioSpeed(e.target.value as any)}
                        className="bg-[#11162A] text-[10px] font-bold text-slate-300 rounded px-1.5 py-1 border border-[#232D4F] cursor-pointer"
                      >
                        <option value="0.8x">0.8x</option>
                        <option value="1x">1x</option>
                        <option value="1.2x">1.2x</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3-Column AI Feedback & Corrections Card */}
              <div className="bg-[#11162A] border border-[#1E2640] rounded-2xl shadow-xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-[#1E2640] pb-4">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span className="text-amber-400">💡</span> AI Feedback & Corrections
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: What went wrong? */}
                  <div className="p-4 rounded-2xl bg-[#1C0B14] border border-[#3F1522] space-y-3">
                    <h4 className="text-xs font-extrabold text-rose-400 flex items-center gap-1.5">
                      <span>💥</span> What went wrong?
                    </h4>
                    <ul className="space-y-2 text-xs text-rose-200 font-medium">
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5">✖</span>
                        <span>You said "hello" instead of "good"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5">✖</span>
                        <span>Missing "morning"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5">✖</span>
                        <span>Missing "how"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5">✖</span>
                        <span>Missing "are"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5">✖</span>
                        <span>Missing "you"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5">✖</span>
                        <span>Missing "today"</span>
                      </li>
                    </ul>
                  </div>

                  {/* Card 2: Correct Sentence */}
                  <div className="p-4 rounded-2xl bg-[#0A1C18] border border-[#0F473D] space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold text-teal-400 flex items-center gap-1.5">
                        <span>✔</span> Correct Sentence
                      </h4>
                      <div className="p-3 rounded-xl bg-[#071310] border border-[#0B3029] space-y-1">
                        <p className="text-sm font-bold text-teal-200">
                          🔊 {currentPhrase.targetText}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePlayTTS(currentPhrase.targetText)}
                      className="w-full py-2.5 rounded-xl bg-[#0F473D] hover:bg-[#156053] text-teal-100 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>🔊 Listen Again</span>
                    </button>
                  </div>

                  {/* Card 3: Quick Tips */}
                  <div className="p-4 rounded-2xl bg-[#0C182F] border border-[#162E52] space-y-3">
                    <h4 className="text-xs font-extrabold text-blue-400 flex items-center gap-1.5">
                      <span>💡</span> Quick Tips
                    </h4>
                    <ul className="space-y-2 text-xs text-blue-200 font-medium">
                      <li className="flex items-start gap-2">
                        <span className="text-teal-400 font-bold">✔</span>
                        <span>Use a complete greeting.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-400 font-bold">✔</span>
                        <span>Don't skip important words.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-400 font-bold">✔</span>
                        <span>Try to speak naturally.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-400 font-bold">✔</span>
                        <span>Listen and repeat.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-400 font-bold">✔</span>
                        <span>Practice regularly.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Pronunciation Guidance Card with Color-Coded Word Pills */}
              <div className="bg-[#11162A] border border-[#1E2640] rounded-2xl shadow-xl p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2640] pb-4">
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span className="text-indigo-400">📊</span> Pronunciation Guidance
                  </h3>

                  {/* Tabs */}
                  <div className="flex bg-[#0A0D1D] p-1 rounded-xl border border-[#1E2640]">
                    <button
                      onClick={() => setGuidanceTab("word")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        guidanceTab === "word"
                          ? "bg-[#2563EB] text-white shadow-md"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Word Practice
                    </button>
                    <button
                      onClick={() => setGuidanceTab("repeat")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        guidanceTab === "repeat"
                          ? "bg-[#2563EB] text-white shadow-md"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Listen & Repeat
                    </button>
                    <button
                      onClick={() => setGuidanceTab("tips")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        guidanceTab === "tips"
                          ? "bg-[#2563EB] text-white shadow-md"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Tips
                    </button>
                  </div>
                </div>

                {/* Color-coded Word Pills Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {phoneticWordPills.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl ${item.color.bg} border ${item.color.border} text-center space-y-1.5 shadow-md flex flex-col justify-between`}
                    >
                      <div>
                        <span className={`text-sm font-extrabold ${item.color.text} block`}>
                          {item.word}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                          {item.phonetic}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePlayTTS(item.word)}
                        className="w-full py-1 rounded-lg bg-black/30 hover:bg-black/50 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer mt-1"
                      >
                        <span>🔊</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary Action Buttons Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#11162A] border border-[#1E2640] shadow-xl">
                <button
                  onClick={handleRepeatCurrent}
                  className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-90 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                >
                  <span>🎤 Practice Again</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleNextPhrase}
                    className="px-5 py-3.5 rounded-full bg-[#1E2640] hover:bg-[#283457] text-slate-100 font-bold text-xs sm:text-sm transition cursor-pointer border border-[#2D3D72]"
                  >
                    Next Phrase ➔
                  </button>

                  <Link
                    href="/voice-conversation"
                    className="px-5 py-3.5 rounded-full bg-[#1E2640] hover:bg-[#283457] text-slate-100 font-bold text-xs sm:text-sm transition cursor-pointer border border-[#2D3D72] inline-flex items-center gap-1.5"
                  >
                    <span>💬 Practice Natural Dialogue</span>
                  </Link>
                </div>
              </div>

              {/* Recent Speaking Attempts Table */}
              <div className="bg-[#11162A] border border-[#1E2640] rounded-2xl shadow-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1E2640] pb-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span>🕒</span> Recent Speaking Attempts ({previousAttempts.length})
                  </h3>
                  <button
                    onClick={() => setShowAllAttempts(!showAllAttempts)}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer flex items-center gap-1"
                  >
                    <span>{showAllAttempts ? "Show Less" : "View All ➔"}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {displayedAttempts.map((att) => (
                    <div
                      key={att.id}
                      className="p-3.5 rounded-xl bg-[#0A0D1D] border border-[#1E2640] flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-slate-400 text-[11px] w-28 shrink-0">
                        {new Date(att.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <p className="font-semibold text-slate-200 flex-1 min-w-[180px] truncate">
                        "{att.phrase}"
                      </p>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-black text-rose-400 text-xs">
                          {att.score}%
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/60 text-[10px] font-bold uppercase">
                          {att.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePlayTTS(att.phrase)}
                          className="w-7 h-7 rounded-full bg-[#1E2640] hover:bg-[#2A375C] text-indigo-300 flex items-center justify-center text-xs transition cursor-pointer"
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quote Banner */}
              <div className="p-4 rounded-2xl bg-[#11162A] border border-[#1E2640] flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-300">
                <span className="flex items-center gap-2">
                  <span>🎯</span> Consistency turns practice into confidence.
                </span>
                <span className="text-indigo-400">You can do it! 💜</span>
              </div>
            </div>

            {/* Right Compact Progress Panel Column (Desktop lg:col-span-4, Mobile Stacked) */}
            <div className="lg:col-span-4 space-y-6">

              {/* Practice Progress Card with Circular Dot Gauge & XP Badge */}
              <div className="bg-[#11162A] border border-[#1E2640] rounded-2xl shadow-xl p-5 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Practice Progress
                </h3>

                <div className="flex items-center gap-4">
                  {/* Gauge Ring */}
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="25" className="stroke-[#1E2640]" strokeWidth="5" fill="transparent" />
                      <circle cx="32" cy="32" r="25" className="stroke-[#10B981]" strokeWidth="5" fill="transparent" strokeDasharray={157} strokeDashoffset={157 - (157 * 2) / 10} />
                    </svg>
                    <span className="absolute text-xs font-black text-white">2/10</span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">Phrases Today</h4>
                    <p className="text-[11px] text-slate-400">Keep going!</p>
                  </div>
                </div>

                {/* 10 Dots Tracker */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[true, true, false, false, false, false, false, false, false, false].map((active, idx) => (
                    <span
                      key={idx}
                      className={`h-2 flex-1 rounded-full ${
                        active ? "bg-[#10B981]" : "bg-[#1E2640]"
                      }`}
                    />
                  ))}
                </div>

                {/* +10 XP Badge */}
                <div className="p-3 rounded-xl bg-[#1C1733] border border-[#3A2D6E] flex items-center gap-2.5 text-xs text-indigo-300 font-bold">
                  <span className="text-base">🚀</span>
                  <span>+10 XP for each practice</span>
                </div>
              </div>

              {/* Today's Goal Card */}
              <div className="bg-[#11162A] border border-[#1E2640] rounded-2xl shadow-xl p-5 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Today's Goal
                </h3>

                <ul className="space-y-2.5 text-xs font-bold text-slate-200">
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center text-[10px]">✔</span>
                    <span>Practice 10 phrases</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center text-[10px]">✔</span>
                    <span>Get 70%+ score</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center text-[10px]">✔</span>
                    <span>Try 3 different topics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center text-[10px]">✔</span>
                    <span>Maintain your streak</span>
                  </li>
                </ul>
              </div>

              {/* Speaking Streak Card with Mon-Sun Weekday Dots */}
              <div className="bg-[#11162A] border border-[#1E2640] rounded-2xl shadow-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <div>
                      <h3 className="text-xs font-extrabold text-white">Speaking Streak</h3>
                      <p className="text-sm font-black text-amber-400">3 Days</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">Keep it up!</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  {[
                    { day: "Mon", active: true },
                    { day: "Tue", active: true },
                    { day: "Wed", active: true },
                    { day: "Thu", active: false },
                    { day: "Fri", active: false },
                    { day: "Sat", active: false },
                    { day: "Sun", active: false },
                  ].map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          d.active ? "bg-amber-400" : "bg-[#1E2640]"
                        }`}
                      />
                      <span>{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Attempts Mini Card */}
              <div className="bg-[#11162A] border border-[#1E2640] rounded-2xl shadow-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-white">Recent Attempts</h3>
                  <button
                    onClick={() => setShowAllAttempts(true)}
                    className="text-[10px] font-bold text-indigo-400 hover:underline"
                  >
                    View All ➔
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#0A0D1D] border border-[#1E2640] flex items-center justify-between">
                    <span className="font-black text-rose-400">35%</span>
                    <span className="font-semibold text-slate-200 truncate mx-2">Good morning...</span>
                    <span className="text-[10px] text-slate-500 shrink-0">2 min ago</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0A0D1D] border border-[#1E2640] flex items-center justify-between">
                    <span className="font-black text-rose-400">10%</span>
                    <span className="font-semibold text-slate-200 truncate mx-2">Good morning...</span>
                    <span className="text-[10px] text-slate-500 shrink-0">6 min ago</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0A0D1D] border border-[#1E2640] flex items-center justify-between">
                    <span className="font-black text-rose-400">10%</span>
                    <span className="font-semibold text-slate-200 truncate mx-2">صباح الخير ...</span>
                    <span className="text-[10px] text-slate-500 shrink-0">8 min ago</span>
                  </div>
                </div>
              </div>

              {/* More Practice Topics List */}
              <div className="bg-[#11162A] border border-[#1E2640] rounded-2xl shadow-xl p-5 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  More Practice
                </h3>

                <div className="space-y-2">
                  {[
                    { title: "Daily Conversation", icon: "💬", href: "/voice-conversation" },
                    { title: "Job Interview", icon: "💼", href: "/voice-conversation" },
                    { title: "Travel", icon: "✈️", href: "/voice-conversation" },
                    { title: "Shopping", icon: "🛒", href: "/voice-conversation" },
                    { title: "Restaurant", icon: "🍴", href: "/voice-conversation" },
                    { title: "Business English", icon: "💼", href: "/voice-conversation" },
                    { title: "Free Conversation", icon: "💬", href: "/voice-conversation" },
                  ].map((topic, idx) => (
                    <Link
                      key={idx}
                      href={topic.href}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0D1D] border border-[#1E2640] hover:border-indigo-500/50 hover:bg-[#111B3D] transition group text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">{topic.icon}</span>
                        <span className="font-bold text-slate-200 group-hover:text-indigo-300 transition">
                          {topic.title}
                        </span>
                      </div>
                      <span className="text-slate-500 group-hover:text-indigo-400 text-xs">➔</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Motivational Rocket Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1C1538] via-[#141838] to-[#0A0D1D] border border-[#3B2D6E] shadow-xl text-center space-y-2">
                <span className="text-3xl block">🚀</span>
                <p className="text-xs font-bold text-indigo-200 italic">
                  "Practice a little every day, for a big tomorrow."
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
