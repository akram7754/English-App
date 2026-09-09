"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import UserPanelShell from "../components/UserPanelShell";
import {
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
  LanguageConfig,
} from "../../lib/languages";
import {
  checkGrammarAction,
  GrammarCheckResult,
} from "./actions";
import { learnVocabularyAction } from "../lessons/actions";
import { initTTS, resolveTTSLocale, speakMultilingualText } from "../../lib/tts";

interface GrammarCorrectionClientProps {
  userName: string;
  userEmail?: string;
  userLevel?: string;
  userInitials?: string;
  isAdmin?: boolean;
  detectedWeaknesses?: string[];
  initialNativeLang?: string;
  initialTargetLang?: string;
}

export default function GrammarCorrectionClient({
  userName,
  userEmail,
  userLevel = "Beginner",
  userInitials = "LE",
  isAdmin = false,
  detectedWeaknesses = [],
  initialNativeLang = "hi",
  initialTargetLang = "en",
}: GrammarCorrectionClientProps) {
  // Language selections
  const [sourceLangCode, setSourceLangCode] = useState<string>(initialNativeLang);
  const [targetLangCode, setTargetLangCode] = useState<string>(initialTargetLang);

  // Input & State
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<GrammarCheckResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Practice state
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({});
  const [practiceSubmitted, setPracticeSubmitted] = useState<Record<string, boolean>>({});

  // Audio & SRS state
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [savedVocabWords, setSavedVocabWords] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Active languages
  const sourceLang: LanguageConfig = useMemo(
    () => getLanguageByCode(sourceLangCode),
    [sourceLangCode]
  );
  const targetLang: LanguageConfig = useMemo(
    () => getLanguageByCode(targetLangCode),
    [targetLangCode]
  );

  // Handle changing source language
  const handleSourceLangChange = (newCode: string) => {
    if (newCode === targetLangCode) {
      // Auto switch target to another language
      const alternative =
        SUPPORTED_LANGUAGES.find((l) => l.code !== newCode)?.code || "en";
      setTargetLangCode(alternative);
    }
    setSourceLangCode(newCode);
    setResult(null);
  };

  // Handle changing target language
  const handleTargetLangChange = (newCode: string) => {
    if (newCode === sourceLangCode) {
      // Auto switch source to another language
      const alternative =
        SUPPORTED_LANGUAGES.find((l) => l.code !== newCode)?.code || "hi";
      setSourceLangCode(alternative);
    }
    setTargetLangCode(newCode);
    setResult(null);
  };

  // Swap languages
  const handleSwapLanguages = () => {
    const prevSource = sourceLangCode;
    const prevTarget = targetLangCode;
    setSourceLangCode(prevTarget);
    setTargetLangCode(prevSource);
    setResult(null);
  };

  // Sample sentences for quick testing
  const sampleSentences = [
    { label: "Grammar Error", text: "He go to office every day.", target: "en" },
    { label: "Past Tense", text: "Yesterday I go to market.", target: "en" },
    { label: "Correct Sentence", text: "I go to work every day.", target: "en" },
    { label: "Short Phrase", text: "tea please", target: "en" },
    { label: "Hindi Input", text: "मैं रोज अंग्रेजी सीखता हूँ।", target: "en", source: "hi" },
    { label: "English → French", text: "She works in Paris.", target: "fr", source: "en" },
    { label: "English → Arabic", text: "Good morning.", target: "ar", source: "en" },
    { label: "English → Spanish", text: "How are you?", target: "es", source: "en" },
    { label: "English → German", text: "I would like some water.", target: "de", source: "en" },
  ];

  const handleApplySample = (sample: typeof sampleSentences[0]) => {
    setInputText(sample.text);
    if (sample.target) setTargetLangCode(sample.target);
    if (sample.source) setSourceLangCode(sample.source);
    setResult(null);
    setErrorMsg(null);
  };

  // Check Grammar Action
  const handleCheckGrammar = async (overrideText?: string) => {
    const textToCheck = (typeof overrideText === "string" ? overrideText : inputText).trim();
    if (!textToCheck) {
      setErrorMsg("Please write or paste a sentence or paragraph to check.");
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);
    setPracticeAnswers({});
    setPracticeSubmitted({});

    try {
      const res = await checkGrammarAction({
        text: textToCheck,
        sourceLangCode,
        targetLangCode,
        userLevel,
        weaknesses: detectedWeaknesses,
      });
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze grammar.";
      setErrorMsg(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setInputText("");
    setResult(null);
    setErrorMsg(null);
    setPracticeAnswers({});
    setPracticeSubmitted({});
  };

  useEffect(() => {
    initTTS();
  }, []);

  // Audio Speech Synthesis
  const handleSpeak = (text: string, langCode: string) => {
    if (!text) return;
    const resolved = resolveTTSLocale(text, langCode);
    speakMultilingualText(text, resolved, {
      rate: 0.9,
      onStart: () => setSpeakingText(text),
      onEnd: () => setSpeakingText(null),
      onError: () => setSpeakingText(null),
    });
  };

  // Copy text to clipboard
  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Save vocabulary to Spaced Repetition System
  const handleSaveVocab = async (word: string) => {
    setSavedVocabWords((prev) => ({ ...prev, [word]: true }));
    try {
      await learnVocabularyAction(word);
    } catch (e) {
      console.warn("Could not save vocab to SRS:", e);
    }
  };

  // Practice Answer Handling
  const handleSelectPracticeOption = (qId: string, optionIdx: number) => {
    setPracticeAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    setPracticeSubmitted((prev) => ({ ...prev, [qId]: true }));
  };

  const isRTL = targetLang.code === "ar";
  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <UserPanelShell
      activeNav="grammar-correction"
      userName={userName}
      userEmail={userEmail}
      userLevel={userLevel}
      userInitials={userInitials}
      isAdmin={isAdmin}
    >
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* ====================================================
            1. TOP HEADER & MULTILINGUAL CONFIGURATION
           ==================================================== */}
        <div className="bg-gradient-to-r from-[#0c0b20] via-[#12112d] to-[#17153b] border border-[#23204e] rounded-3xl p-5 sm:p-7 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
                  AI Writing &amp; Grammar Coach
                </span>
                <span className="text-xs text-zinc-400">
                  {sourceLang.flag} {sourceLang.name} → {targetLang.flag} {targetLang.name}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Grammar Check
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Analyze sentence structure, verb tenses, subject-verb agreement, and articles with instant native explanations and interactive practice.
              </p>
            </div>

            {/* Language Pair Selectors */}
            <div className="flex flex-wrap items-center gap-2.5 bg-[#0a091a]/80 p-3 rounded-2xl border border-[#27234e] shrink-0">
              {/* I SPEAK */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  I Speak (Explanations)
                </label>
                <select
                  value={sourceLangCode}
                  onChange={(e) => handleSourceLangChange(e.target.value)}
                  className="bg-[#151430] border border-[#2f2b5a] text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} disabled={lang.code === targetLangCode}>
                      {lang.flag} {lang.name} {lang.code === targetLangCode ? "(Target Focus)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <button
                onClick={handleSwapLanguages}
                className="mt-4 p-2 rounded-xl bg-[#161434] hover:bg-[#252250] text-zinc-400 hover:text-white transition cursor-pointer border border-[#2b2756]"
                title="Swap Languages"
              >
                ⇄
              </button>

              {/* I WANT TO LEARN */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  I Want to Learn (Target)
                </label>
                <select
                  value={targetLangCode}
                  onChange={(e) => handleTargetLangChange(e.target.value)}
                  className="bg-[#151430] border border-[#2f2b5a] text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} disabled={lang.code === sourceLangCode}>
                      {lang.flag} {lang.name} {lang.code === sourceLangCode ? "(Explanations)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Sample Sentence Chips */}
          <div className="mt-5 pt-4 border-t border-[#232048]/80 space-y-2">
            <span className="text-[11px] font-extrabold uppercase text-zinc-400 tracking-wider">
              Quick Test Prompts:
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {sampleSentences.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplySample(sample)}
                  className="px-3 py-1.5 rounded-xl bg-[#151434] hover:bg-[#201d4a] text-zinc-300 hover:text-white border border-[#282552] text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-indigo-400 text-[10px] font-bold">
                    {sample.label}:
                  </span>
                  <span className="truncate max-w-[170px] sm:max-w-[220px]">
                    &quot;{sample.text}&quot;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ====================================================
            2. MAIN TEXT EDITOR & ACTION BAR
           ==================================================== */}
        <div className="bg-white dark:bg-[#0c0b1f] border border-zinc-200 dark:border-[#221f48] rounded-3xl p-5 sm:p-7 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>✍️</span>
              <span>Your Sentence or Paragraph</span>
            </h2>
            <div className="text-xs text-zinc-400 font-mono flex items-center gap-3">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} chars</span>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setErrorMsg(null);
              }}
              placeholder={`Write a sentence or paragraph in ${targetLang.name} (or enter in ${sourceLang.name} to translate and analyze)...`}
              rows={5}
              className={`w-full p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-[#110f29] border ${
                errorMsg
                  ? "border-red-500/60 focus:ring-red-500"
                  : "border-zinc-200 dark:border-[#282455] focus:border-indigo-500 focus:ring-indigo-500/20"
              } text-zinc-900 dark:text-zinc-100 text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 transition shadow-inner resize-y`}
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCheckGrammar()}
                disabled={isAnalyzing || !inputText.trim()}
                className="px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <span className="animate-spin text-base">⏳</span>
                    <span>Analyzing Grammar...</span>
                  </>
                ) : (
                  <>
                    <span>Check Grammar</span>
                    <span>⚡</span>
                  </>
                )}
              </button>

              <button
                onClick={handleClear}
                disabled={!inputText && !result}
                className="px-5 py-3 rounded-2xl bg-zinc-100 dark:bg-[#161434] hover:bg-zinc-200 dark:hover:bg-[#23204e] text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-bold border border-zinc-200 dark:border-[#2b2756] transition cursor-pointer disabled:opacity-40"
              >
                Clear
              </button>
            </div>

            <div className="text-[11px] text-zinc-400 italic">
              Flow: Grammar Analysis → Mistakes → Corrected → Natural Phrasing → Practice
            </div>
          </div>
        </div>

        {/* ====================================================
            3. ANALYSIS RESULTS VIEWPORT
           ==================================================== */}
        {result && (
          <div className="space-y-6">
            {/* Focus Area / Weakness Badge if matched */}
            {result.matchedWeakness && (
              <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-3 text-xs text-zinc-200 shadow-sm">
                <span className="text-xl shrink-0">🎯</span>
                <div>
                  <strong className="text-amber-300 font-extrabold">
                    Practicing Focus Area: {result.matchedWeakness}
                  </strong>
                  <p className="text-zinc-400 mt-0.5">
                    This directly addresses your personalized learning progress recommendations.
                  </p>
                </div>
              </div>
            )}

            {/* Overall Status Banner */}
            <div
              className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                result.isCorrect
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                  : "bg-indigo-950/20 border-indigo-500/30 text-indigo-200"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {result.isCorrect ? "✅" : "💡"}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {result.isCorrect
                      ? "Excellent! Grammatically Correct"
                      : `Grammar Analysis: ${result.mistakes.length} Improvement${
                          result.mistakes.length > 1 ? "s" : ""
                        } Found`}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
                  {result.overallExplanation}
                </p>
              </div>

              {/* Overall Score Badge */}
              <div className="bg-[#0b0a1a] border border-[#27234e] rounded-2xl p-3 px-5 text-center shrink-0 self-stretch sm:self-auto flex sm:flex-col items-center justify-between sm:justify-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Overall Score
                </span>
                <span className="text-2xl font-black text-emerald-400">
                  {result.scores.overall}/100
                </span>
              </div>
            </div>

            {/* Side-by-side comparison: Original vs Corrected */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Original */}
              <div className="bg-white dark:bg-[#0c0b1f] border border-zinc-200 dark:border-[#221f48] rounded-3xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                    <span>Original Text</span>
                    {!result.isCorrect && <span className="text-red-400">❌</span>}
                  </span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
                  {result.originalText}
                </p>
              </div>

              {/* Corrected */}
              <div className="bg-white dark:bg-[#0e0d26] border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 space-y-3 relative shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <span>✅ Corrected Version</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleSpeak(result.correctedText, targetLang.code)
                      }
                      className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition cursor-pointer text-xs"
                      title="Listen to pronunciation"
                    >
                      {speakingText === result.correctedText ? "🔊..." : "🔊 Listen"}
                    </button>
                    <button
                      onClick={() => handleCopy(result.correctedText)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition cursor-pointer"
                      title="Copy corrected sentence"
                    >
                      {copied ? "✓ Copied" : "📋 Copy"}
                    </button>
                  </div>
                </div>

                {/* Corrected text with RTL support for Arabic */}
                <p
                  dir={isRTL ? "rtl" : "ltr"}
                  className={`text-base sm:text-lg font-black text-white leading-relaxed ${
                    isRTL ? "font-serif text-right" : "font-sans"
                  }`}
                >
                  {result.correctedText}
                </p>

                {/* Phonetic Pronunciation (READ) */}
                {result.pronunciation && (
                  <div className="text-xs text-indigo-300/90 font-mono bg-[#141233] p-2.5 rounded-xl border border-[#252252] flex items-center gap-2">
                    <span className="font-extrabold text-[10px] text-indigo-400 uppercase">
                      READ:
                    </span>
                    <span className="truncate">{result.pronunciation}</span>
                  </div>
                )}

                {/* Native Meaning in user's I SPEAK language */}
                {result.meaningInSourceLang && (
                  <div className="text-xs text-zinc-300 pt-1">
                    <strong className="text-zinc-400 font-bold">
                      {sourceLang.name} Meaning:{" "}
                    </strong>
                    <span>{result.meaningInSourceLang}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error-by-Error Itemized Breakdown */}
            {result.mistakes.length > 0 && (
              <div className="bg-white dark:bg-[#0c0b1f] border border-zinc-200 dark:border-[#221f48] rounded-3xl p-5 sm:p-7 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#201d46] pb-3">
                  <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>🔍</span>
                    <span>Itemized Corrections ({result.mistakes.length})</span>
                  </h3>
                  <span className="text-xs text-zinc-400">
                    Explained in {sourceLang.name}
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {result.mistakes.map((mistake, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-50 dark:bg-[#110f29] border border-zinc-200 dark:border-[#272352] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold uppercase">
                            {mistake.category}
                          </span>
                          <span className="text-xs font-bold text-red-400 line-through">
                            &quot;{mistake.original}&quot;
                          </span>
                          <span className="text-zinc-400 text-xs">→</span>
                          <span className="text-xs font-bold text-emerald-400">
                            &quot;{mistake.corrected}&quot;
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {mistake.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🌟 Better / Natural Version */}
            {result.naturalVersion && (
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <span>🌟 More Natural / Native Version</span>
                  </span>
                  <button
                    onClick={() =>
                      handleSpeak(result.naturalVersion!, targetLang.code)
                    }
                    className="p-1 rounded-lg text-amber-400 hover:text-amber-300 text-xs cursor-pointer"
                    title="Listen"
                  >
                    🔊
                  </button>
                </div>
                <p className="text-base sm:text-lg font-black text-white">
                  &quot;{result.naturalVersion}&quot;
                </p>
                {result.naturalVersionExplanation && (
                  <p className="text-xs text-zinc-300">
                    <strong className="text-amber-300/90 font-bold">Why it sounds native: </strong>
                    <span>{result.naturalVersionExplanation}</span>
                  </p>
                )}
              </div>
            )}

            {/* AI Writing Scores */}
            <div className="bg-white dark:bg-[#0c0b1f] border border-zinc-200 dark:border-[#221f48] rounded-3xl p-5 sm:p-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-zinc-200 dark:border-[#201d46] pb-3">
                <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>📊</span>
                  <span>AI Writing Proficiency Scores</span>
                </h3>
                <span className="text-[11px] text-zinc-400 italic">
                  {result.isEstimateNotice}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Grammar */}
                <div className="bg-zinc-50 dark:bg-[#110f29] border border-zinc-200 dark:border-[#252250] rounded-2xl p-4 text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">
                    Grammar
                  </span>
                  <div className="text-2xl font-black text-indigo-400">
                    {result.scores.grammar}%
                  </div>
                  <div className="w-full bg-[#181636] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${result.scores.grammar}%` }}
                    />
                  </div>
                </div>

                {/* Accuracy */}
                <div className="bg-zinc-50 dark:bg-[#110f29] border border-zinc-200 dark:border-[#252250] rounded-2xl p-4 text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">
                    Accuracy
                  </span>
                  <div className="text-2xl font-black text-emerald-400">
                    {result.scores.accuracy}%
                  </div>
                  <div className="w-full bg-[#181636] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${result.scores.accuracy}%` }}
                    />
                  </div>
                </div>

                {/* Naturalness */}
                <div className="bg-zinc-50 dark:bg-[#110f29] border border-zinc-200 dark:border-[#252250] rounded-2xl p-4 text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">
                    Naturalness
                  </span>
                  <div className="text-2xl font-black text-amber-400">
                    {result.scores.naturalness}%
                  </div>
                  <div className="w-full bg-[#181636] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${result.scores.naturalness}%` }}
                    />
                  </div>
                </div>

                {/* Overall */}
                <div className="bg-zinc-50 dark:bg-[#110f29] border border-zinc-200 dark:border-[#252250] rounded-2xl p-4 text-center space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">
                    Overall
                  </span>
                  <div className="text-2xl font-black text-purple-400">
                    {result.scores.overall}%
                  </div>
                  <div className="w-full bg-[#181636] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${result.scores.overall}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Useful Vocabulary Help */}
            {result.vocabulary && result.vocabulary.length > 0 && (
              <div className="bg-white dark:bg-[#0c0b1f] border border-zinc-200 dark:border-[#221f48] rounded-3xl p-5 sm:p-7 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#201d46] pb-3">
                  <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>📚</span>
                    <span>Key Vocabulary &amp; Phrasing</span>
                  </h3>
                  <span className="text-xs text-zinc-400">
                    Save to Spaced Repetition (SRS)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {result.vocabulary.map((vocab, idx) => {
                    const isSaved = savedVocabWords[vocab.word];
                    return (
                      <div
                        key={idx}
                        className="bg-zinc-50 dark:bg-[#110f29] border border-zinc-200 dark:border-[#252250] rounded-2xl p-4 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-black text-white">
                              {vocab.word}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                              {vocab.partOfSpeech}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-indigo-300 font-mono">
                            <span>READ: {vocab.read}</span>
                            <button
                              onClick={() => handleSpeak(vocab.word, targetLang.code)}
                              className="text-indigo-400 hover:text-indigo-200 cursor-pointer"
                              title="Listen"
                            >
                              🔊
                            </button>
                          </div>

                          <p className="text-xs text-zinc-300">
                            <strong className="text-zinc-400">Meaning: </strong>
                            {vocab.meaning}
                          </p>

                          {vocab.example && (
                            <p className="text-xs text-zinc-400 italic bg-[#0a091a] p-2 rounded-lg border border-[#1d1a3e]">
                              &quot;{vocab.example}&quot;
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleSaveVocab(vocab.word)}
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
              </div>
            )}

            {/* Interactive Practice Mode */}
            {result.practiceQuestions && result.practiceQuestions.length > 0 && (
              <div className="bg-white dark:bg-[#0c0b1f] border border-zinc-200 dark:border-[#221f48] rounded-3xl p-5 sm:p-7 space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-[#201d46] pb-3">
                  <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>⚡</span>
                    <span>Practice This Grammar Rule</span>
                  </h3>
                  <span className="text-xs text-zinc-400">
                    Instant MCQ Assessment
                  </span>
                </div>

                <div className="space-y-4 pt-1">
                  {result.practiceQuestions.map((question, qIdx) => {
                    const selected = practiceAnswers[question.id];
                    const isSubmitted = practiceSubmitted[question.id];
                    const isCorrect = selected === question.correctIndex;

                    return (
                      <div
                        key={question.id}
                        className="bg-zinc-50 dark:bg-[#110f29] border border-zinc-200 dark:border-[#252250] rounded-2xl p-4 sm:p-5 space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black flex items-center justify-center">
                            {qIdx + 1}
                          </span>
                          <p className="text-xs sm:text-sm font-bold text-white">
                            {question.prompt}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          {question.options.map((option, optIdx) => {
                            const isThisSelected = selected === optIdx;
                            let btnStyle =
                              "bg-[#181636] hover:bg-[#23204e] border-[#292556] text-zinc-200";

                            if (isSubmitted) {
                              if (optIdx === question.correctIndex) {
                                btnStyle =
                                  "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold";
                              } else if (isThisSelected) {
                                btnStyle =
                                  "bg-red-600/20 border-red-500 text-red-300";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() =>
                                  handleSelectPracticeOption(question.id, optIdx)
                                }
                                className={`p-3 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                              >
                                <span>{option}</span>
                                {isSubmitted && optIdx === question.correctIndex && (
                                  <span className="text-emerald-400">✓</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Instant feedback explanation */}
                        {isSubmitted && (
                          <div
                            className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                              isCorrect
                                ? "bg-emerald-950/30 border border-emerald-500/30 text-emerald-300"
                                : "bg-red-950/30 border border-red-500/30 text-red-300"
                            }`}
                          >
                            <span>{isCorrect ? "✅ Correct!" : "❌ Rule Note:"}</span>
                            <span>{question.explanation}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </UserPanelShell>
  );
}
