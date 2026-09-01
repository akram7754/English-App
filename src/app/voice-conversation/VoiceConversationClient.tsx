"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { logoutAction } from "../login/actions";
import { processVoiceConversationTurnAction, getVoiceConversationHistoryAction } from "./actions";
import MobileHeader from "../components/MobileHeader";
import {
  SUPPORTED_LANGUAGES,
  CONVERSATION_TOPICS,
  LanguageConfig,
  ConversationTopic,
  getLanguageByCode,
} from "../../lib/languages";
import { VoiceTurnResult } from "../../lib/voice-prompts";

interface ConversationTurn {
  id: string;
  topic: string;
  sourceLang: string;
  targetLang: string;
  userNativeTranscript?: string;
  intentUnderstood?: string;
  taughtPhrase: string;
  nativeExplanation: string;
  userTargetTranscript?: string;
  score?: number;
  status?: "Excellent" | "Good" | "Needs Practice";
  grammarFeedback?: string;
  fluencyFeedback?: string;
  vocabFeedback?: string;
  pronunciationTip?: string;
  aiFollowUp?: string;
  timestamp: Date;
}

export default function VoiceConversationClient() {
  const [userName, setUserName] = useState("Sarah Jenkins");
  const [userInitials, setUserInitials] = useState("SJ");

  // Language & Topic Selection state
  const [sourceLangCode, setSourceLangCode] = useState<string>("hi"); // Hindi default
  const [targetLangCode, setTargetLangCode] = useState<string>("en"); // English default
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic>(CONVERSATION_TOPICS[1]); // Default: Job interview

  // Conversational Flow State Machine
  // "IDLE" | "LISTENING_NATIVE" | "PROCESSING_NATIVE" | "TEACHING_ACTIVE" | "LISTENING_TARGET" | "PROCESSING_TARGET"
  const [flowState, setFlowState] = useState<
    "IDLE" | "LISTENING_NATIVE" | "PROCESSING_NATIVE" | "TEACHING_ACTIVE" | "LISTENING_TARGET" | "PROCESSING_TARGET"
  >("IDLE");

  const [currentTurn, setCurrentTurn] = useState<ConversationTurn | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"score" | "grammar" | "fluency" | "vocab">("score");

  // Audio / Speech API state
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState<number>(1.0);
  const [autoPlayTTS, setAutoPlayTTS] = useState<boolean>(true);
  const [manualInputText, setManualInputText] = useState<string>("");
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const sourceLang: LanguageConfig = getLanguageByCode(sourceLangCode);
  const targetLang: LanguageConfig = getLanguageByCode(targetLangCode);

  // Initialize Auth from cookie
  useEffect(() => {
    const match = document.cookie.match(new RegExp("(^| )user=([^;]+)"));
    if (!match) {
      window.location.href = "/login";
    } else {
      try {
        const token = match[2];
        const payloadBase64 = token.split(".")[0];
        const decodedJSON = atob(payloadBase64);
        const decoded = JSON.parse(decodedJSON);
        const name = decoded.name || "Sarah Jenkins";
        setUserName(name);
        setUserInitials(
          name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "SJ"
        );
      } catch (e) {
        window.location.href = "/login";
      }
    }
  }, []);

  // Initialize SpeechSynthesis and check SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis;
      }
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
  }, []);

  // Load previous attempts
  useEffect(() => {
    getVoiceConversationHistoryAction().then((attempts) => {
      if (attempts && attempts.length > 0) {
        const formatted: ConversationTurn[] = attempts.map((att: any, idx: number) => ({
          id: `hist-${att.id || idx}`,
          topic: selectedTopic.title,
          sourceLang: "Hindi",
          targetLang: "English",
          taughtPhrase: att.phrase,
          nativeExplanation: "Saved from past practice session",
          userTargetTranscript: att.transcript || undefined,
          score: att.score,
          status: att.status as any,
          grammarFeedback: att.grammarFeedback || undefined,
          fluencyFeedback: att.fluencyFeedback || undefined,
          vocabFeedback: att.vocabFeedback || undefined,
          timestamp: new Date(att.createdAt),
        }));
        setConversationHistory(formatted);
      }
    });
  }, [selectedTopic]);

  // Scroll to bottom when conversation advances
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentTurn, flowState, conversationHistory]);

  // Stop Speech on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // TTS Helper Function
  const speakText = (text: string, speedMultiplier = ttsSpeed) => {
    if (!synthRef.current || !text) return;
    synthRef.current.cancel(); // Stop ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang.ttsLang;
    utterance.rate = speedMultiplier;

    // Try to select a natural English voice if available
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith(targetLang.code) && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Online"))
    ) || voices.find((v) => v.lang.startsWith(targetLang.code));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeakingTTS(true);
    utterance.onend = () => setIsSpeakingTTS(false);
    utterance.onerror = () => setIsSpeakingTTS(false);

    synthRef.current.speak(utterance);
  };

  // Start Speech Recognition
  const startListening = (langCode: string, stage: "native" | "target") => {
    if (synthRef.current) synthRef.current.cancel();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setFeedbackMessage("Speech Recognition is not supported in this browser. Please use manual input below.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = langCode;

      rec.onstart = () => {
        setMicPermissionDenied(false);
        if (stage === "native") {
          setFlowState("LISTENING_NATIVE");
          setFeedbackMessage(`Listening to your ${sourceLang.name}... Speak now!`);
        } else {
          setFlowState("LISTENING_TARGET");
          setFeedbackMessage(`Listening to your ${targetLang.name} pronunciation... Speak now!`);
        }
      };

      rec.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        if (stage === "native") {
          handleNativeSpeechResult(spokenText);
        } else {
          handleTargetSpeechResult(spokenText);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition error:", event.error);
        if (event.error === "not-allowed") {
          setMicPermissionDenied(true);
          setFeedbackMessage("Microphone permission was denied. Please allow microphone access in browser settings.");
        } else {
          setFeedbackMessage(`Speech recognition issue: ${event.error}. You can also type manually.`);
        }
        setFlowState(currentTurn ? "TEACHING_ACTIVE" : "IDLE");
      };

      rec.onend = () => {
        // Handled in result or error
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setFlowState(currentTurn ? "TEACHING_ACTIVE" : "IDLE");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setFlowState(currentTurn ? "TEACHING_ACTIVE" : "IDLE");
  };

  // STEP 1 -> STEP 2: Handle Native Language input (e.g. Hindi)
  const handleNativeSpeechResult = async (spokenText: string) => {
    if (!spokenText.trim()) return;
    setFlowState("PROCESSING_NATIVE");
    setFeedbackMessage(`Gemini is analyzing your ${sourceLang.name} intention...`);

    try {
      const res = await processVoiceConversationTurnAction({
        stage: "teach",
        sourceLanguage: sourceLang.name,
        targetLanguage: targetLang.name,
        difficulty,
        topic: selectedTopic.title,
        userTranscript: spokenText,
      });

      if (res.success && res.result) {
        const result: VoiceTurnResult = res.result;
        const newTurn: ConversationTurn = {
          id: `turn-${Date.now()}`,
          topic: selectedTopic.title,
          sourceLang: sourceLang.name,
          targetLang: targetLang.name,
          userNativeTranscript: spokenText,
          intentUnderstood: result.intentUnderstood,
          taughtPhrase: result.targetPhrase,
          nativeExplanation: result.nativeExplanation,
          aiFollowUp: result.followUpPrompt,
          timestamp: new Date(),
        };

        setCurrentTurn(newTurn);
        setFlowState("TEACHING_ACTIVE");
        setFeedbackMessage("Listen to the pronunciation and repeat the sentence.");

        // Automatically speak the English sentence aloud if auto-play is enabled
        if (autoPlayTTS) {
          const textToSpeak = result.spokenText || `In ${targetLang.name}, you can say: ${result.targetPhrase}`;
          speakText(textToSpeak, ttsSpeed);
        }
      } else {
        setFeedbackMessage("Could not process speech. Please try again.");
        setFlowState("IDLE");
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage("An error occurred during Gemini speech processing.");
      setFlowState("IDLE");
    }
  };

  // STEP 3 -> STEP 4: Handle Target Language repetition (e.g. English)
  const handleTargetSpeechResult = async (spokenText: string) => {
    if (!currentTurn) return;
    setFlowState("PROCESSING_TARGET");
    setFeedbackMessage(`Evaluating your ${targetLang.name} pronunciation and grammar with Gemini...`);

    try {
      const res = await processVoiceConversationTurnAction({
        stage: "evaluate",
        sourceLanguage: sourceLang.name,
        targetLanguage: targetLang.name,
        difficulty,
        topic: selectedTopic.title,
        userTranscript: spokenText,
        targetPhraseExpected: currentTurn.taughtPhrase,
      });

      if (res.success && res.result) {
        const result: VoiceTurnResult = res.result;
        const updatedTurn: ConversationTurn = {
          ...currentTurn,
          userTargetTranscript: spokenText,
          score: result.evaluation?.score || 80,
          status: result.evaluation?.status || "Good",
          grammarFeedback: result.evaluation?.grammarFeedback,
          fluencyFeedback: result.evaluation?.fluencyFeedback,
          vocabFeedback: result.evaluation?.vocabFeedback,
          pronunciationTip: result.evaluation?.pronunciationTip,
          aiFollowUp: result.followUpPrompt || currentTurn.aiFollowUp,
        };

        setCurrentTurn(updatedTurn);
        setConversationHistory((prev) => [updatedTurn, ...prev]);
        setFlowState("TEACHING_ACTIVE");
        setActiveTab("score");

        if (updatedTurn.score && updatedTurn.score >= 90) {
          setFeedbackMessage("🎉 Outstanding pronunciation and accuracy!");
        } else if (updatedTurn.score && updatedTurn.score >= 75) {
          setFeedbackMessage("👍 Good job! Keep practicing for continuous flow.");
        } else {
          setFeedbackMessage("🗣️ Keep practicing to match target words and rhythm.");
        }

        // Voice continuation from AI
        if (autoPlayTTS) {
          const followUpAudio = result.spokenText || result.followUpSpoken || `Great effort! ${result.followUpPrompt || ""}`;
          speakText(followUpAudio, ttsSpeed);
        }
      } else {
        setFeedbackMessage("Evaluation failed. Please try speaking again.");
        setFlowState("TEACHING_ACTIVE");
      }
    } catch (e) {
      console.error(e);
      setFeedbackMessage("Error during evaluation. Please try again.");
      setFlowState("TEACHING_ACTIVE");
    }
  };

  // Start new conversation turn
  const handleStartNewTurn = () => {
    setCurrentTurn(null);
    setFlowState("IDLE");
    setFeedbackMessage("");
    setManualInputText("");
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
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              Dashboard
            </Link>
            <Link href="/voice-conversation" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-indigo-900 text-white font-medium transition shadow-sm">
              <span className="text-lg">🎙️</span>
              AI Voice Tutor
            </Link>
            <Link href="/lessons" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Lessons / Skills
            </Link>
            <Link href="/ai-tutor" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              AI Tutor
            </Link>
            <Link href="/ai-chat" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              AI Chat
            </Link>
            <Link href="/voice-practice" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Voice Practice
            </Link>
            <Link href="/grammar-correction" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Grammar Check
            </Link>
            <Link href="/speaking-score" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Speaking Score
            </Link>
            <Link href="/progress" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Progress Track
            </Link>
            <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Panel
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Link>
            <form action={logoutAction} className="w-full">
              <button type="submit" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white text-left transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Logout / Exit
              </button>
            </form>
          </nav>
        </div>

        {/* Status footer */}
        <div className="p-6 border-t border-indigo-900/60 bg-indigo-950/50">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <div className="text-xs text-indigo-200">
              <p className="font-semibold text-white">Voice Engine Live</p>
              <p className="opacity-75">{sourceLang.name} ➔ {targetLang.name}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <MobileHeader userName={userName} userInitials={userInitials} />

        <div className="p-6 sm:p-8 space-y-6 flex-1 max-w-5xl mx-auto w-full">
          
          {/* Top Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                  AI Voice Conversation Tutor
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Phase 7 Live
                </span>
              </div>
              <p className="text-zinc-500 text-sm mt-1">
                Speak naturally in your native language ({sourceLang.name} {sourceLang.flag}), learn the exact {targetLang.name} {targetLang.flag} phrasing, practice pronunciation, and receive instant feedback.
              </p>
            </div>

            {/* Quick Level Switcher */}
            <div className="flex gap-1.5 self-start sm:self-auto bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    difficulty === lvl
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-800 dark:text-indigo-400"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Multilingual Selector & Options Bar */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              {/* Language Pair Selectors */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">I Speak:</span>
                  <select
                    value={sourceLangCode}
                    onChange={(e) => setSourceLangCode(e.target.value)}
                    className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.name} ({l.nativeName})
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-zinc-400 font-bold">➔</span>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">I Learn:</span>
                  <select
                    value={targetLangCode}
                    onChange={(e) => setTargetLangCode(e.target.value)}
                    className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.name} ({l.nativeName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TTS Controls */}
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-600 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    checked={autoPlayTTS}
                    onChange={(e) => setAutoPlayTTS(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Auto-Speak AI Voice</span>
                </label>

                <div className="flex items-center gap-1">
                  <span className="text-zinc-400 font-medium">Speed:</span>
                  <button
                    onClick={() => setTtsSpeed(ttsSpeed === 1.0 ? 0.85 : 1.0)}
                    className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-lg dark:bg-zinc-800 dark:text-zinc-300 transition"
                  >
                    {ttsSpeed === 0.85 ? "0.85x (Slow)" : "1.0x (Normal)"}
                  </button>
                </div>
              </div>

            </div>

            {/* Conversation Topics Pill List */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">Topic:</span>
                {CONVERSATION_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopic(topic);
                      handleStartNewTurn();
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      selectedTopic.id === topic.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-750"
                    }`}
                  >
                    <span>{topic.icon}</span>
                    <span>{topic.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Permission & Status Alert */}
          {micPermissionDenied && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-3 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-bold">Microphone access was blocked.</p>
                <p className="mt-0.5">Please click the lock/settings icon in your browser's address bar to allow microphone access, or use the manual text box below.</p>
              </div>
            </div>
          )}

          {/* MAIN INTERACTIVE CONVERSATION CARD */}
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-md p-6 sm:p-8 space-y-8 dark:bg-zinc-900 dark:border-zinc-800">
            
            {/* Step 1: User Speaks / Starts Intent in Native Language */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    Speak your thought in {sourceLang.name} ({sourceLang.flag})
                  </h3>
                </div>
                <span className="text-xs text-zinc-400 font-medium">
                  {selectedTopic.icon} {selectedTopic.title}
                </span>
              </div>

              {/* Sample quick prompt suggestions */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Try saying:</span>
                <button
                  onClick={() => handleNativeSpeechResult(selectedTopic.starterSourcePrompt)}
                  className="px-3 py-1 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs font-medium rounded-lg transition border border-indigo-100 dark:border-indigo-900"
                >
                  "{selectedTopic.starterSourcePrompt}"
                </button>
              </div>

              {/* Primary Native Mic Action Area */}
              <div className="p-6 bg-zinc-50 border border-zinc-200/70 rounded-2xl flex flex-col items-center justify-center space-y-4 dark:bg-zinc-950/40 dark:border-zinc-800">
                
                {/* Audio Wave Visualizer */}
                <div className="h-12 flex items-center justify-center gap-1.5 w-48">
                  {flowState === "LISTENING_NATIVE" || flowState === "LISTENING_TARGET" || isSpeakingTTS ? (
                    <>
                      <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: "40%", animationDuration: "0.5s" }} />
                      <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: "80%", animationDuration: "0.3s" }} />
                      <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: "100%", animationDuration: "0.4s" }} />
                      <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: "60%", animationDuration: "0.2s" }} />
                      <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: "75%", animationDuration: "0.6s" }} />
                      <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: "30%", animationDuration: "0.4s" }} />
                    </>
                  ) : (
                    <div className="w-full h-0.5 bg-zinc-200 dark:bg-zinc-800" />
                  )}
                </div>

                {/* Microphone Button for Native Language */}
                <div className="flex items-center gap-4">
                  {flowState === "LISTENING_NATIVE" ? (
                    <button
                      onClick={stopListening}
                      className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition animate-pulse"
                      title="Stop recording"
                    >
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => startListening(sourceLang.sttLang, "native")}
                      disabled={flowState === "PROCESSING_NATIVE" || flowState === "PROCESSING_TARGET"}
                      className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg transition disabled:opacity-50 hover:scale-105"
                      title={`Speak in ${sourceLang.name}`}
                    >
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                  )}
                </div>

                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 text-center">
                  {flowState === "LISTENING_NATIVE"
                    ? `Listening to your ${sourceLang.name}... Speak now.`
                    : flowState === "PROCESSING_NATIVE"
                    ? `Gemini is processing your ${sourceLang.name}...`
                    : `Tap mic and speak your idea in ${sourceLang.name}`}
                </p>

                {/* Manual text input fallback */}
                <div className="w-full max-w-md pt-2">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (manualInputText.trim()) {
                        handleNativeSpeechResult(manualInputText);
                        setManualInputText("");
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={manualInputText}
                      onChange={(e) => setManualInputText(e.target.value)}
                      placeholder={`Or type in ${sourceLang.name} (e.g. ${selectedTopic.starterSourcePrompt})...`}
                      className="flex-1 px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-900 dark:border-zinc-700"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition"
                    >
                      Send
                    </button>
                  </form>
                </div>

              </div>
            </div>

            {/* STEP 2: AI Teaching Card (Target English Phrasing & Native Explanation) */}
            {currentTurn && (
              <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                
                {/* Step 2 Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                      AI Tutor Teaches You the {targetLang.name} {targetLang.flag} Sentence
                    </h3>
                  </div>
                  {isSpeakingTTS && (
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 animate-pulse">
                      🔊 AI Voice Speaking...
                    </span>
                  )}
                </div>

                {/* You Spoke in Native Script */}
                {currentTurn.userNativeTranscript && (
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-xs text-zinc-600 dark:bg-zinc-950/30 dark:border-zinc-800 dark:text-zinc-400">
                    <span className="font-bold uppercase tracking-wider text-zinc-400">You expressed in {sourceLang.name}:</span>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5 italic">
                      "{currentTurn.userNativeTranscript}"
                    </p>
                  </div>
                )}

                {/* English Taught Box */}
                <div className="p-6 bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl dark:bg-indigo-950/30 dark:border-indigo-800/80 space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      In {targetLang.name}, you can say:
                    </span>
                    <h2 className="text-2xl font-black text-indigo-950 dark:text-indigo-100 tracking-tight mt-1 leading-snug">
                      "{currentTurn.taughtPhrase}"
                    </h2>
                  </div>

                  {/* Native language explanation */}
                  {currentTurn.nativeExplanation && (
                    <div className="p-3.5 bg-white/80 rounded-xl border border-indigo-100 text-xs text-zinc-700 dark:bg-zinc-900/80 dark:border-zinc-800 dark:text-zinc-300 leading-relaxed">
                      <span className="font-bold text-indigo-700 dark:text-indigo-400">💡 {sourceLang.name} Explanation: </span>
                      {currentTurn.nativeExplanation}
                    </div>
                  )}

                  {/* Audio Controls for Taught Phrase */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => speakText(currentTurn.taughtPhrase, 1.0)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      Listen (1.0x Normal)
                    </button>

                    <button
                      onClick={() => speakText(currentTurn.taughtPhrase, 0.85)}
                      className="px-4 py-2 bg-white hover:bg-zinc-50 text-indigo-700 font-semibold rounded-xl text-xs transition border border-indigo-200 dark:bg-zinc-900 dark:border-zinc-700 dark:text-indigo-300"
                    >
                      🐢 Slow Audio (0.85x)
                    </button>
                  </div>
                </div>

                {/* STEP 3: User Repeats / Speaks in Target English */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                        Now, try saying it yourself in {targetLang.name}! 🎤
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl flex flex-col items-center justify-center space-y-4 dark:bg-emerald-950/10 dark:border-emerald-900/40">
                    {/* Record button for English repetition */}
                    {flowState === "LISTENING_TARGET" ? (
                      <button
                        onClick={stopListening}
                        className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition animate-pulse"
                        title="Stop recording"
                      >
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => startListening(targetLang.sttLang, "target")}
                        disabled={flowState === "PROCESSING_TARGET"}
                        className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg transition disabled:opacity-50 hover:scale-105"
                        title={`Speak in ${targetLang.name}`}
                      >
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                    )}

                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 text-center">
                      {flowState === "LISTENING_TARGET"
                        ? `Listening to your ${targetLang.name} speech... Repeat the phrase aloud!`
                        : flowState === "PROCESSING_TARGET"
                        ? "Gemini is analyzing your enunciation and scoring your attempt..."
                        : `Click to record yourself saying: "${currentTurn.taughtPhrase}"`}
                    </p>
                  </div>
                </div>

                {/* STEP 4: Evaluation & Conversational Continuation */}
                {currentTurn.score !== undefined && (
                  <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center text-xs font-bold">
                          4
                        </span>
                        <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                          Pronunciation & Conversational Evaluation
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                      
                      {/* Score Circular Gauge */}
                      <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 border border-zinc-200/70 rounded-2xl dark:bg-zinc-950/40 dark:border-zinc-800">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Accuracy Score</span>
                        <div className="relative w-24 h-24 flex items-center justify-center mt-3 shrink-0">
                          <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="38" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="7" fill="transparent" />
                            <circle
                              cx="48"
                              cy="48"
                              r="38"
                              className={
                                currentTurn.score >= 90
                                  ? "stroke-emerald-500"
                                  : currentTurn.score >= 75
                                  ? "stroke-amber-500"
                                  : "stroke-red-500"
                              }
                              strokeWidth="7"
                              fill="transparent"
                              strokeDasharray={238}
                              strokeDashoffset={238 - (238 * currentTurn.score) / 100}
                            />
                          </svg>
                          <span
                            className={`absolute text-xl font-black ${
                              currentTurn.score >= 90
                                ? "text-emerald-500"
                                : currentTurn.score >= 75
                                ? "text-amber-500"
                                : "text-red-500"
                            }`}
                          >
                            {currentTurn.score}%
                          </span>
                        </div>
                        <span
                          className={`mt-2 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            currentTurn.status === "Excellent"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                              : currentTurn.status === "Good"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                              : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                          }`}
                        >
                          {currentTurn.status}
                        </span>
                      </div>

                      {/* Spoken Text & Tabbed Feedback */}
                      <div className="md:col-span-2 space-y-4">
                        <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 dark:bg-zinc-950/30 dark:border-zinc-800">
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">You Spoke in {targetLang.name}:</p>
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 italic mt-0.5">
                            "{currentTurn.userTargetTranscript || "(no transcription detected)"}"
                          </p>
                        </div>

                        {/* Tabs */}
                        <div className="border border-zinc-200 rounded-xl overflow-hidden dark:border-zinc-800">
                          <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                            {(["score", "grammar", "fluency", "vocab"] as const).map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition ${
                                  activeTab === tab
                                    ? "bg-white border-b-2 border-indigo-600 text-indigo-600 dark:bg-zinc-900"
                                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                                }`}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>

                          <div className="p-4 bg-white dark:bg-zinc-900 min-h-[90px] text-xs leading-relaxed text-zinc-650 dark:text-zinc-350">
                            {activeTab === "score" && (
                              <div className="space-y-2">
                                <p>Target Sentence: <strong>"{currentTurn.taughtPhrase}"</strong></p>
                                <p>
                                  Your communication match accuracy is <strong>{currentTurn.score}%</strong>. Gemini evaluated your word alignment, flow, and intelligibility.
                                </p>
                                {currentTurn.pronunciationTip && (
                                  <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                                    🗣️ <strong>Pronunciation Tip:</strong> {currentTurn.pronunciationTip}
                                  </p>
                                )}
                              </div>
                            )}
                            {activeTab === "grammar" && (
                              <p className="whitespace-pre-line">
                                {currentTurn.grammarFeedback || "Grammar evaluated correctly."}
                              </p>
                            )}
                            {activeTab === "fluency" && (
                              <p className="whitespace-pre-line">
                                {currentTurn.fluencyFeedback || "Good speaking cadence."}
                              </p>
                            )}
                            {activeTab === "vocab" && (
                              <p className="whitespace-pre-line">
                                {currentTurn.vocabFeedback || "Vocabulary is appropriate."}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Conversational follow-up & Next Turn Prompt */}
                        {currentTurn.aiFollowUp && (
                          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/40 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                                💬 Next Conversational Step:
                              </span>
                              <button
                                onClick={() => speakText(currentTurn.aiFollowUp || "")}
                                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                              >
                                🔊 Replay AI Voice
                              </button>
                            </div>
                            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                              "{currentTurn.aiFollowUp}"
                            </p>
                            <div className="flex gap-3 pt-1">
                              <button
                                onClick={handleStartNewTurn}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-sm"
                              >
                                Continue Conversation in {sourceLang.name} ➔
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* General Feedback / Status message */}
            {feedbackMessage && (
              <div className="p-3 bg-zinc-100 rounded-xl text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 font-medium text-center">
                {feedbackMessage}
              </div>
            )}

            <div ref={threadEndRef} />
          </div>

          {/* Conversation History / Attempts Log */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent AI Voice Practice Turns
            </h2>

            {conversationHistory.length === 0 ? (
              <div className="p-6 bg-white border border-zinc-200/80 rounded-2xl text-center text-zinc-400 text-sm dark:bg-zinc-900 dark:border-zinc-800">
                No conversation history yet. Click the microphone above to start practicing!
              </div>
            ) : (
              <div className="space-y-3">
                {conversationHistory.slice(0, 5).map((turn) => (
                  <div
                    key={turn.id}
                    className="p-4 bg-white rounded-2xl border border-zinc-200/80 shadow-sm space-y-2 dark:bg-zinc-900 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded dark:bg-indigo-950/40 dark:text-indigo-400">
                        {turn.topic}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {turn.timestamp.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">Taught Sentence:</p>
                      <p className="text-sm font-bold text-indigo-950 dark:text-indigo-200">"{turn.taughtPhrase}"</p>
                    </div>

                    {turn.score !== undefined && (
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-50 dark:border-zinc-800/80 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400 font-bold">Accuracy:</span>
                          <span
                            className={`font-black ${
                              turn.score >= 90
                                ? "text-emerald-500"
                                : turn.score >= 75
                                ? "text-amber-500"
                                : "text-red-500"
                            }`}
                          >
                            {turn.score}%
                          </span>
                        </div>
                        <button
                          onClick={() => speakText(turn.taughtPhrase)}
                          className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          🔊 Hear Phrase
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
