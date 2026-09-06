"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  processVoiceConversationTurnAction,
  saveVoiceSessionSummaryAction,
} from "./actions";
import {
  SUPPORTED_LANGUAGES,
  CONVERSATION_TOPICS,
  LanguageConfig,
  ConversationTopic,
  getLanguageByCode,
} from "../../lib/languages";
import {
  TutorPersonality,
  VoiceEvaluationMetrics,
} from "../../lib/voice-prompts";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  nativeLanguage: string;
  targetLanguage: string;
  streakDays: number;
  xp: number;
  weaknesses: string[];
}

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  nativeExplanation?: string;
  isVoice?: boolean;
  time: string;
  evaluation?: VoiceEvaluationMetrics;
}

interface TranscriptItem {
  id: string;
  speaker: string;
  text: string;
}

interface Props {
  initialUserProfile: UserProfile;
  isAdmin?: boolean;
}

interface ISpeechRecognitionInstance {
  abort: () => void;
  start: () => void;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: () => void;
  onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
  onerror: (e: { error: string }) => void;
  onend: () => void;
}

export default function VoiceConversationClient({ initialUserProfile, isAdmin = false }: Props) {
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);

  // Settings & Controls
  const [sourceLangCode, setSourceLangCode] = useState<string>("hi");
  const [targetLangCode, setTargetLangCode] = useState<string>("en");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">(
    initialUserProfile.level || "Intermediate"
  );
  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic>(CONVERSATION_TOPICS[1]); // Job Interview default
  const [personality] = useState<TutorPersonality>("Friendly Teacher");

  // Session & Progress tracking
  const totalQuestions = 10;
  const [questionNumber, setQuestionNumber] = useState<number>(2);
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false);
  const [allEvaluations, setAllEvaluations] = useState<VoiceEvaluationMetrics[]>([]);

  // Conversational Flow State
  const [flowState, setFlowState] = useState<
    "IDLE" | "LISTENING" | "THINKING" | "SPEAKING" | "EVALUATING" | "PROCESSING"
  >("IDLE");

  // Audio / Speech Settings
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [speechRate, setSpeechRate] = useState<number>(1.0); // 0.85 or 1.0
  const [manualInputOpen, setManualInputOpen] = useState<boolean>(false);
  const [manualText, setManualText] = useState<string>("");
  const [micError, setMicError] = useState<string>("");
  const [lastAiSpokenText, setLastAiSpokenText] = useState<string>("Tell me about yourself.");

  // Messages seeded with initial dialogue matching the exact design
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "ai-1",
      sender: "ai",
      text: "Tell me about yourself.",
      nativeExplanation: "अपने बारे में बताइए।",
      time: "11:30 AM",
    },
    {
      id: "user-1",
      sender: "user",
      text: "I am working in marketing from last 3 years.",
      isVoice: true,
      time: "11:31 AM",
    },
    {
      id: "ai-2",
      sender: "ai",
      text: "That's good. What are your main strengths?",
      nativeExplanation: "बहुत बढ़िया। आपकी मुख्य खूबियाँ क्या हैं?",
      time: "11:31 AM",
    },
  ]);

  // Transcripts seeded with initial dialogue matching the exact design
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    {
      id: "tr-1",
      speaker: "You (Hindi)",
      text: "मुझे जॉब इंटरव्यू की प्रैक्टिस करनी है।",
    },
    {
      id: "tr-2",
      speaker: "AI (English)",
      text: "Sure! Let's practice a job interview.",
    },
    {
      id: "tr-3",
      speaker: "AI (English)",
      text: "Tell me about yourself.",
    },
    {
      id: "tr-4",
      speaker: "You (English)",
      text: "I am working in marketing from last 3 years.",
    },
  ]);

  // Latest evaluation metrics matching the exact design
  const [latestEvaluation, setLatestEvaluation] = useState<VoiceEvaluationMetrics>({
    score: 82,
    grammarScore: 85,
    fluencyScore: 78,
    vocabScore: 82,
    pronunciationScore: 76,
    status: "Good",
    whatWentWell: "Good sentence structure",
    whatToImprove: "Try to use more specific words",
    correctedSentence: "I have been working in marketing for the last 3 years.",
    tip: 'Use "for the last" for duration.',
    grammarFeedback: "Identified standard sentence syntax.",
    fluencyFeedback: "Natural cadence with minor preposition adjustment.",
    vocabFeedback: "Accurate context words for marketing role.",
    pronunciationTip: "Focus on crisp vowel elongation in 'years'.",
  });

  const recognitionRef = useRef<ISpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const idCounterRef = useRef<number>(100);

  const targetLang: LanguageConfig = useMemo(
    () => getLanguageByCode(targetLangCode),
    [targetLangCode]
  );
  const sourceLang: LanguageConfig = useMemo(
    () => getLanguageByCode(sourceLangCode),
    [sourceLangCode]
  );

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, flowState]);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Text-To-Speech Playback function
  const speakText = (text: string, langCode: string = targetLang.ttsLang) => {
    if (!synthRef.current || !text) return;
    try {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = speechRate;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setFlowState("SPEAKING");
      };
      utterance.onend = () => {
        setFlowState("IDLE");
      };
      utterance.onerror = () => {
        setFlowState("IDLE");
      };

      synthRef.current.speak(utterance);
    } catch (err) {
      console.warn("TTS error:", err);
      setFlowState("IDLE");
    }
  };

  const stopAudioAndMic = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setFlowState("IDLE");
  };

  // Switch language pair & re-trigger turn in the new language
  const switchLanguagePair = async (
    srcCode: string,
    tgtCode: string,
    topicToUse: ConversationTopic = selectedTopic,
    diffToUse: "Beginner" | "Intermediate" | "Advanced" = difficulty
  ) => {
    stopAudioAndMic();
    setFlowState("THINKING");
    setQuestionNumber(1);

    const src = getLanguageByCode(srcCode);
    const tgt = getLanguageByCode(tgtCode);

    try {
      const res = await processVoiceConversationTurnAction({
        turnType: "start",
        questionNumber: 1,
        totalQuestions,
        topic: topicToUse.title,
        difficulty: diffToUse,
        personality,
        sourceLanguage: src.name,
        targetLanguage: tgt.name,
        userTranscript: "",
        weaknesses: userProfile.weaknesses,
      });

      if (res.success && res.result) {
        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const aiMsg: ChatMessage = {
          id: `ai-${++idCounterRef.current}`,
          sender: "ai",
          text: res.result.spokenText || res.result.targetPhrase,
          nativeExplanation: res.result.nativeExplanation,
          time: timeStr,
        };

        setMessages([aiMsg]);
        setTranscripts([
          {
            id: `tr-${++idCounterRef.current}`,
            speaker: `AI (${tgt.name})`,
            text: res.result.spokenText || res.result.targetPhrase,
          },
        ]);

        const toSpeak = res.result.spokenText || res.result.targetPhrase;
        setLastAiSpokenText(toSpeak);

        if (autoSpeak) {
          speakText(toSpeak, tgt.ttsLang);
        } else {
          setFlowState("IDLE");
        }
      } else {
        setFlowState("IDLE");
      }
    } catch (err) {
      console.error("Failed to switch language pair:", err);
      setFlowState("IDLE");
    }
  };

  const handleSourceLangChange = (newCode: string) => {
    if (newCode === targetLangCode) {
      // Pick alternate target language to prevent identical source & target
      const alternate = SUPPORTED_LANGUAGES.find((l) => l.code !== newCode);
      const newTargetCode = alternate ? alternate.code : "en";
      setTargetLangCode(newTargetCode);
      setSourceLangCode(newCode);
      switchLanguagePair(newCode, newTargetCode);
      return;
    }
    setSourceLangCode(newCode);
    switchLanguagePair(newCode, targetLangCode);
  };

  const handleTargetLangChange = (newCode: string) => {
    if (newCode === sourceLangCode) {
      // Pick alternate source language to prevent identical source & target
      const alternate = SUPPORTED_LANGUAGES.find((l) => l.code !== newCode);
      const newSourceCode = alternate ? alternate.code : "hi";
      setSourceLangCode(newSourceCode);
      setTargetLangCode(newCode);
      switchLanguagePair(newSourceCode, newCode);
      return;
    }
    setTargetLangCode(newCode);
    switchLanguagePair(sourceLangCode, newCode);
  };

  // Replay latest AI sentence
  const handleReplay = () => {
    if (lastAiSpokenText) {
      speakText(lastAiSpokenText, targetLang.ttsLang);
    } else {
      speakText(messages[messages.length - 1]?.text || "Hello!", targetLang.ttsLang);
    }
  };

  // Advance to Next Question
  const handleNextQuestion = async () => {
    stopAudioAndMic();
    if (questionNumber >= totalQuestions) {
      setIsSessionComplete(true);
      return;
    }

    setFlowState("THINKING");
    const nextQNum = questionNumber + 1;
    setQuestionNumber(nextQNum);

    try {
      const historyContext = messages.slice(-10).map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("model" as const),
        text: m.text,
      }));

      const res = await processVoiceConversationTurnAction({
        turnType: "next_question",
        questionNumber: nextQNum,
        totalQuestions,
        topic: selectedTopic.title,
        difficulty,
        personality,
        sourceLanguage: sourceLang.name,
        targetLanguage: targetLang.name,
        userTranscript: "",
        weaknesses: userProfile.weaknesses,
        conversationHistory: historyContext,
      });

      if (res.success && res.result) {
        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const aiMsg: ChatMessage = {
          id: `ai-${++idCounterRef.current}`,
          sender: "ai",
          text: res.result.spokenText || res.result.targetPhrase,
          nativeExplanation: res.result.nativeExplanation,
          time: timeStr,
        };

        setMessages((prev) => [...prev, aiMsg]);
        setTranscripts((prev) => [
          ...prev,
          {
            id: `tr-${++idCounterRef.current}`,
            speaker: `AI (${targetLang.name})`,
            text: res.result.spokenText || res.result.targetPhrase,
          },
        ]);

        const toSpeak = res.result.spokenText || res.result.targetPhrase;
        setLastAiSpokenText(toSpeak);

        if (autoSpeak) {
          speakText(toSpeak, targetLang.ttsLang);
        } else {
          setFlowState("IDLE");
        }
      } else {
        setFlowState("IDLE");
      }
    } catch (e) {
      console.error("Next question error:", e);
      setFlowState("IDLE");
    }
  };

  // Process User Spoken Answer
  const handleUserAnswer = async (userTranscript: string, isFromVoice: boolean = true) => {
    if (!userTranscript.trim()) return;

    stopAudioAndMic();
    setFlowState("EVALUATING");
    setMicError("");

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: ChatMessage = {
      id: `user-${++idCounterRef.current}`,
      sender: "user",
      text: userTranscript,
      isVoice: isFromVoice,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setTranscripts((prev) => [
      ...prev,
      {
        id: `tr-${++idCounterRef.current}`,
        speaker: isFromVoice ? `You (${targetLang.name})` : `You (${targetLang.name} Text)`,
        text: userTranscript,
      },
    ]);

    try {
      const historyContext = messages.slice(-10).map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("model" as const),
        text: m.text,
      }));

      const res = await processVoiceConversationTurnAction({
        turnType: "answer",
        questionNumber,
        totalQuestions,
        topic: selectedTopic.title,
        difficulty,
        personality,
        sourceLanguage: sourceLang.name,
        targetLanguage: targetLang.name,
        userTranscript,
        weaknesses: userProfile.weaknesses,
        conversationHistory: historyContext,
      });

      if (res.success && res.result) {
        if (res.result.evaluation) {
          setLatestEvaluation(res.result.evaluation);
          setAllEvaluations((prev) => [...prev, res.result.evaluation!]);
          setUserProfile((prev) => ({ ...prev, xp: prev.xp + 25 }));
        }

        const toSpeak =
          res.result.spokenText ||
          (res.result.aiReply
            ? `${res.result.aiReply} ${res.result.targetPhrase}`
            : res.result.targetPhrase);

        const aiMsg: ChatMessage = {
          id: `ai-${++idCounterRef.current}`,
          sender: "ai",
          text: toSpeak,
          nativeExplanation: res.result.nativeExplanation,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          evaluation: res.result.evaluation,
        };

        setMessages((prev) => [...prev, aiMsg]);
        setTranscripts((prev) => [
          ...prev,
          {
            id: `tr-${++idCounterRef.current}`,
            speaker: `AI (${targetLang.name})`,
            text: toSpeak,
          },
        ]);

        setLastAiSpokenText(toSpeak);

        if (typeof res.result.questionNumber === "number") {
          setQuestionNumber(res.result.questionNumber);
        }

        if (res.result.questionNumber >= totalQuestions) {
          setIsSessionComplete(true);
          const currentEvals = [...allEvaluations, res.result.evaluation!].filter(Boolean);
          const avgScore =
            currentEvals.length > 0
              ? currentEvals.reduce((a, c) => a + c.score, 0) / currentEvals.length
              : 85;
          saveVoiceSessionSummaryAction({
            topic: selectedTopic.title,
            difficulty,
            averageScore: avgScore,
            turnsCompleted: currentEvals.length,
          });
        }

        if (autoSpeak) {
          speakText(toSpeak, targetLang.ttsLang);
        } else {
          setFlowState("IDLE");
        }
      } else {
        setFlowState("IDLE");
      }
    } catch (err) {
      console.error("User answer evaluation error:", err);
      setFlowState("IDLE");
    }
  };

  // Microphone Recording Handler
  const startRecording = () => {
    setMicError("");
    interface WindowWithSpeech {
      SpeechRecognition?: new () => ISpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => ISpeechRecognitionInstance;
    }
    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError("Browser speech recognition is not supported. Use 'Type instead'.");
      return;
    }

    try {
      stopAudioAndMic();
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = targetLang.sttLang || "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setFlowState("LISTENING");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleUserAnswer(transcript, true);
        } else {
          setFlowState("IDLE");
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setMicError("Microphone permission denied. Please allow microphone access.");
        } else if (event.error === "no-speech") {
          setMicError("No speech detected. Tap microphone and speak clearly.");
        } else {
          setMicError("Speech recognition error. Tap again or type instead.");
        }
        setFlowState("IDLE");
      };

      recognition.onend = () => {
        if (flowState === "LISTENING") {
          setFlowState("IDLE");
        }
      };

      recognition.start();
    } catch (err: unknown) {
      console.error("Microphone start exception:", err);
      setMicError("Unable to access microphone. Check permissions.");
      setFlowState("IDLE");
    }
  };

  const progressPercentage = Math.min(100, Math.round((questionNumber / totalQuestions) * 100));

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#07060f] text-zinc-100 font-sans select-none relative">

        {/* 2. TOP HEADER (Title, Phase 9 Badge, Progress, Auto-Speak, Speed) */}
        <header className="px-6 py-3.5 border-b border-[#18162e] bg-[#090817] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-black text-white tracking-tight">
                AI Voice Conversation Tutor
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-[#201a47] text-[#9d8ff7] border border-[#3b3273] uppercase tracking-wide">
                Phase 9 Live
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Practice naturally, speak confidently.
            </p>
          </div>

          {/* Center/Right: Progress + Controls */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Question Progress Bar */}
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="flex-1">
                <div className="flex justify-between text-[11px] font-semibold text-zinc-300 mb-1">
                  <span>Question {questionNumber} of {totalQuestions}</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-[#181630] rounded-full h-1.5 overflow-hidden border border-[#27234d]">
                  <div
                    className="bg-[#6366f1] h-full rounded-full transition-all duration-500 shadow-sm shadow-indigo-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Auto-Speak Toggle */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <span>Auto-Speak</span>
              <button
                type="button"
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition duration-300 cursor-pointer ${
                  autoSpeak ? "bg-[#5b51d8] justify-end" : "bg-zinc-700 justify-start"
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
              </button>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-[#121124] px-3 py-1.5 rounded-xl border border-[#262447] text-xs font-semibold text-zinc-300">
              <button
                onClick={() => setSpeechRate((r) => (r === 1.0 ? 0.85 : 1.0))}
                className="focus:outline-none flex items-center gap-1 cursor-pointer"
              >
                <span>Speed: {speechRate === 0.85 ? "0.85x" : "1.0x"}</span>
                <span className="text-[10px] text-zinc-400">▼</span>
              </button>
            </div>
          </div>
        </header>

        {/* 3. CONTROL BAR (I SPEAK, I LEARN, TOPIC, LEVEL, Change) */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-[#18162e] bg-[#0a0918] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 max-w-full">
            {/* I SPEAK */}
            <div className="flex items-center gap-1.5 bg-[#100f21] px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#232044] max-w-full">
              <span className="text-zinc-400 font-bold uppercase text-[10px] shrink-0">I SPEAK:</span>
              <select
                value={sourceLangCode}
                onChange={(e) => handleSourceLangChange(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option
                    key={l.code}
                    value={l.code}
                    disabled={l.code === targetLangCode}
                    className="bg-[#100f21] text-white"
                  >
                    {l.flag} {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <span className="text-zinc-600 font-bold hidden sm:inline">→</span>

            {/* I LEARN */}
            <div className="flex items-center gap-1.5 bg-[#100f21] px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#232044] max-w-full">
              <span className="text-zinc-400 font-bold uppercase text-[10px] shrink-0">I LEARN:</span>
              <select
                value={targetLangCode}
                onChange={(e) => handleTargetLangChange(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate"
              >
                {SUPPORTED_LANGUAGES.filter((l) => l.code !== sourceLangCode).map((l) => (
                  <option
                    key={l.code}
                    value={l.code}
                    className="bg-[#100f21] text-white"
                  >
                    {l.flag} {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* TOPIC */}
            <div className="flex items-center gap-1.5 bg-[#3627a8] text-white px-2.5 sm:px-3 py-1.5 rounded-xl font-semibold shadow-sm max-w-full">
              <span className="shrink-0">TOPIC:</span>
              <span className="shrink-0">💼</span>
              <select
                value={selectedTopic.id}
                onChange={(e) => {
                  const t = CONVERSATION_TOPICS.find((top) => top.id === e.target.value);
                  if (t) {
                    setSelectedTopic(t);
                    switchLanguagePair(sourceLangCode, targetLangCode, t, difficulty);
                  }
                }}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer truncate"
              >
                {CONVERSATION_TOPICS.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#1c1459] text-white">
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* LEVEL */}
            <div className="flex items-center gap-1.5 bg-[#100f21] px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#232044] max-w-full">
              <span className="text-zinc-400 font-bold uppercase text-[10px] shrink-0">LEVEL:</span>
              <span className="text-[#34d399] font-bold shrink-0">📶</span>
              <select
                value={difficulty}
                onChange={(e) => {
                  const newDiff = e.target.value as "Beginner" | "Intermediate" | "Advanced";
                  setDifficulty(newDiff);
                  switchLanguagePair(sourceLangCode, targetLangCode, selectedTopic, newDiff);
                }}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate"
              >
                <option value="Beginner" className="bg-[#100f21] text-white">Beginner</option>
                <option value="Intermediate" className="bg-[#100f21] text-white">Intermediate</option>
                <option value="Advanced" className="bg-[#100f21] text-white">Advanced</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              const nextTopics = CONVERSATION_TOPICS.filter((t) => t.id !== selectedTopic.id);
              const randomT = nextTopics[Math.floor(Math.random() * nextTopics.length)];
              setSelectedTopic(randomT);
              switchLanguagePair(sourceLangCode, targetLangCode, randomT, difficulty);
            }}
            className="px-4 py-1.5 rounded-xl bg-[#121124] hover:bg-[#1c1a3b] text-zinc-300 hover:text-white border border-[#2b2756] text-xs font-semibold transition cursor-pointer shrink-0"
          >
            Change
          </button>
        </div>

        {/* ======================================================
            BODY AREA (3-COLUMN: Avatar Card | Chat Stream | Right Panel)
           ====================================================== */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden p-4 gap-4">
          {/* COLUMN 1 & 2 (Left & Center Main View) */}
          <div className="flex-1 flex flex-col min-w-0 h-full gap-3 overflow-hidden">
            {/* Upper Section: Avatar Card (Left) + Chat Stream (Center) */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 gap-3">
              {/* 5 & 6. AI AVATAR CARD */}
              <div className="w-full md:w-64 bg-[#0a091a] border border-[#1b1936] rounded-3xl p-4 flex flex-col items-center justify-between shrink-0 shadow-lg relative overflow-hidden">
                {/* Top status indicator badge */}
                <div className="px-3.5 py-1 rounded-full bg-[#2c2288] text-white text-[11px] font-extrabold flex items-center gap-2 shadow-md">
                  <span className="animate-pulse">🔊</span>
                  <span>{flowState === "SPEAKING" ? "AI SPEAKING..." : flowState === "LISTENING" ? "LISTENING..." : "AI READY"}</span>
                </div>

                {/* 3D Robot Avatar Graphic (Cropped directly from screenshot!) */}
                <div className="relative my-3 flex items-center justify-center">
                  <div className="w-36 h-40 relative rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src="/images/ai-avatar.png"
                      alt="AI Tutor Avatar"
                      width={168}
                      height={178}
                      className="w-full h-full object-cover select-none pointer-events-none"
                      priority
                    />
                  </div>
                </div>

                {/* Greeting Card Under Avatar */}
                <div className="w-full bg-[#0f0e24] border border-[#221f47] rounded-2xl p-3 text-left">
                  <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>Hello {userProfile.name}!</span>
                    <span>😊</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Let&apos;s practice {selectedTopic.title} in {targetLang.name}.
                  </p>
                </div>
              </div>

              {/* 8. CONVERSATION CHAT UI & ACTION BUTTONS */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#0a091a] border border-[#1b1936] rounded-3xl p-4 overflow-hidden shadow-lg justify-between">
                {/* Scrollable chat message stream */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-2xl border transition ${
                        msg.sender === "user"
                          ? "bg-[#0e0d20] border-[#1d1b3b] ml-12 text-right"
                          : "bg-[#121128] border-[#221f4a] mr-6 text-left"
                      }`}
                    >
                      {/* Message Header */}
                      <div className={`flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 ${
                        msg.sender === "user" ? "flex-row-reverse" : ""
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold">
                          {msg.sender === "ai" && (
                            <span className="w-4 h-4 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center text-[9px]">
                              ⭐
                            </span>
                          )}
                          <span className={msg.sender === "ai" ? "text-[#9d8ff7]" : "text-white"}>
                            {msg.sender === "ai" ? "AI Tutor" : "You"}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500">{msg.time}</span>
                      </div>

                      {/* Message Content */}
                      <div className="space-y-1">
                        <p className="text-xs md:text-sm font-semibold text-white leading-relaxed">
                          {msg.text}
                        </p>
                        {msg.nativeExplanation && (
                          <p className="text-xs text-zinc-400 font-sans">
                            {msg.nativeExplanation}
                          </p>
                        )}
                      </div>

                      {/* Bottom Audio / Voice Badge */}
                      <div className={`flex items-center mt-2 ${
                        msg.sender === "user" ? "justify-start" : "justify-end"
                      }`}>
                        {msg.sender === "ai" ? (
                          <button
                            onClick={() => speakText(msg.text, targetLang.ttsLang)}
                            className="text-zinc-400 hover:text-white transition cursor-pointer p-1"
                            title="Listen to pronunciation"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          </button>
                        ) : msg.isVoice ? (
                          <span className="text-[#34d399] font-bold text-xs flex items-center gap-1">
                            <span className="inline-block animate-pulse">|||</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  <div ref={chatScrollRef} />
                </div>

                {/* Bottom Row of Controls (Repeat, Slow, Normal, Next) */}
                <div className="pt-3 border-t border-[#18162e] flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReplay}
                      className="px-3 py-1.5 rounded-xl bg-[#111024] hover:bg-[#1a1838] border border-[#232046] text-xs font-semibold text-zinc-300 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🔄</span>
                      <span>Repeat</span>
                    </button>

                    <button
                      onClick={() => {
                        setSpeechRate(0.85);
                        handleReplay();
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                        speechRate === 0.85
                          ? "bg-[#4338ca] text-white border-[#5b4fe8] shadow-sm"
                          : "bg-[#111024] hover:bg-[#1a1838] border-[#232046] text-zinc-300"
                      }`}
                    >
                      <span>🐢</span>
                      <span>Slow (0.85x)</span>
                    </button>

                    <button
                      onClick={() => {
                        setSpeechRate(1.0);
                        handleReplay();
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                        speechRate === 1.0
                          ? "bg-[#4338ca] text-white border-[#5b4fe8] shadow-sm"
                          : "bg-[#111024] hover:bg-[#1a1838] border-[#232046] text-zinc-300"
                      }`}
                    >
                      <span>🔊</span>
                      <span>Normal (1.0x)</span>
                    </button>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-1.5 rounded-xl bg-[#121124] hover:bg-[#1c1a3b] border border-[#2b2756] text-xs font-semibold text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next</span>
                    <span>➡️</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Lower Section: Microphone & Recording Area */}
            <div className="bg-[#0a091a] border border-[#1b1936] rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shrink-0">
              {/* Left: Waveform & Status */}
              <div className="flex-1 min-w-[180px]">
                <div className="text-xs font-bold text-[#10b981] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping"></span>
                  <span>{flowState === "LISTENING" ? "Listening..." : "Listening..."}</span>
                </div>
                {/* Animated sound wave bars */}
                <div className="flex items-center gap-1 my-1.5 text-[#10b981] h-6 overflow-hidden">
                  <span className="w-1 bg-[#10b981] h-2 rounded-full"></span>
                  <span className="w-1 bg-[#10b981] h-3 rounded-full animate-pulse"></span>
                  <span className="w-1 bg-[#10b981] h-5 rounded-full animate-bounce"></span>
                  <span className="w-1 bg-[#10b981] h-4 rounded-full"></span>
                  <span className="w-1 bg-[#10b981] h-6 rounded-full animate-pulse"></span>
                  <span className="w-1 bg-[#10b981] h-3 rounded-full"></span>
                  <span className="w-1 bg-[#10b981] h-5 rounded-full animate-bounce"></span>
                  <span className="w-1 bg-[#10b981] h-2 rounded-full"></span>
                  <span className="w-1 bg-[#10b981] h-4 rounded-full"></span>
                </div>
                <p className="text-[11px] text-zinc-500">Speak now...</p>
                {micError && <p className="text-[10px] text-red-400 mt-1">{micError}</p>}
              </div>

              {/* Center: Giant Microphone Button */}
              <div className="flex flex-col items-center">
                <button
                  onClick={startRecording}
                  disabled={flowState === "THINKING" || flowState === "EVALUATING" || flowState === "PROCESSING"}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer ${
                    flowState === "LISTENING"
                      ? "bg-gradient-to-tr from-pink-600 to-red-600 shadow-red-500/50 scale-110 animate-pulse border-2 border-white"
                      : "bg-gradient-to-tr from-[#312588] to-[#4f46e5] hover:scale-105 border border-[#5244be] shadow-indigo-600/30"
                  }`}
                  title="Tap to speak"
                >
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className="text-xs font-semibold text-zinc-300 mt-1.5">Tap to speak</span>
              </div>

              {/* Right: Type Instead / Stop */}
              <div className="flex flex-col gap-2 min-w-[140px]">
                <button
                  onClick={() => setManualInputOpen(!manualInputOpen)}
                  className="px-3.5 py-2 rounded-xl bg-[#111024] hover:bg-[#1a1838] border border-[#232046] text-xs font-semibold text-zinc-300 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>⌨️</span>
                  <span>Type instead</span>
                </button>

                <button
                  onClick={stopAudioAndMic}
                  className="px-3.5 py-2 rounded-xl bg-[#111024] hover:bg-[#1a1838] border border-[#232046] text-xs font-semibold text-zinc-300 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-xs bg-red-500"></span>
                  <span>Stop</span>
                </button>
              </div>
            </div>

            {/* Manual input drawer when toggled */}
            {manualInputOpen && (
              <div className="bg-[#0f0e24] border border-[#232047] rounded-2xl p-2.5 flex items-center gap-2">
                <input
                  type="text"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && manualText.trim()) {
                      handleUserAnswer(manualText, false);
                      setManualText("");
                      setManualInputOpen(false);
                    }
                  }}
                  placeholder={`Type your response in ${targetLang.name} or ${sourceLang.name}...`}
                  className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (manualText.trim()) {
                      handleUserAnswer(manualText, false);
                      setManualText("");
                      setManualInputOpen(false);
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#4f46e5] text-white font-bold text-xs cursor-pointer"
                >
                  Send
                </button>
              </div>
            )}

            {/* Footer Row: Daily Tip & End Session */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-amber-400">💡</span>
                <span>
                  <strong className="text-zinc-300">Daily Tip:</strong> Practice speaking at least 15 minutes every day to improve fluency.
                </span>
              </div>

              <button
                onClick={() => setIsSessionComplete(true)}
                className="px-4 py-1.5 rounded-xl bg-transparent hover:bg-red-950/20 text-red-400 border border-red-500/30 font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>🚪</span>
                <span>End Session</span>
              </button>
            </div>
          </div>

          {/* ====================================================
              COLUMN 3: RIGHT SIDEBAR (Score + Feedback + Transcript)
             ==================================================== */}
          <div className="w-full lg:w-72 flex flex-col gap-3 shrink-0">
            {/* 1. AI SPEAKING SCORE CARD */}
            <div className="bg-[#0a091a] border border-[#1b1936] rounded-3xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">AI Speaking Score</span>
                <button className="text-[11px] font-semibold text-[#818cf8] hover:underline cursor-pointer">
                  Details
                </button>
              </div>

              <div className="flex items-center gap-4">
                {/* Radial circular progress gauge */}
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-[#15142e]"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeDasharray={238.7}
                      strokeDashoffset={238.7 - (238.7 * latestEvaluation.score) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-white">{latestEvaluation.score}</span>
                    <span className="text-[9px] text-zinc-400">/100</span>
                  </div>
                </div>

                {/* Score breakdown metrics bars */}
                <div className="flex-1 space-y-1.5 text-[11px]">
                  <div>
                    <div className="flex justify-between text-zinc-300 font-semibold">
                      <span>Grammar</span>
                      <span>{latestEvaluation.grammarScore}</span>
                    </div>
                    <div className="w-full bg-[#181630] rounded-full h-1 mt-0.5 overflow-hidden">
                      <div
                        className="bg-[#10b981] h-full rounded-full"
                        style={{ width: `${latestEvaluation.grammarScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-300 font-semibold">
                      <span>Fluency</span>
                      <span>{latestEvaluation.fluencyScore}</span>
                    </div>
                    <div className="w-full bg-[#181630] rounded-full h-1 mt-0.5 overflow-hidden">
                      <div
                        className="bg-[#f59e0b] h-full rounded-full"
                        style={{ width: `${latestEvaluation.fluencyScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-300 font-semibold">
                      <span>Vocabulary</span>
                      <span>{latestEvaluation.vocabScore}</span>
                    </div>
                    <div className="w-full bg-[#181630] rounded-full h-1 mt-0.5 overflow-hidden">
                      <div
                        className="bg-[#06b6d4] h-full rounded-full"
                        style={{ width: `${latestEvaluation.vocabScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-300 font-semibold">
                      <span>Pronunciation</span>
                      <span>{latestEvaluation.pronunciationScore}</span>
                    </div>
                    <div className="w-full bg-[#181630] rounded-full h-1 mt-0.5 overflow-hidden">
                      <div
                        className="bg-[#f43f5e] h-full rounded-full"
                        style={{ width: `${latestEvaluation.pronunciationScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. FEEDBACK CARD */}
            <div className="bg-[#0a091a] border border-[#1b1936] rounded-3xl p-4 shadow-lg space-y-3">
              <span className="text-xs font-bold text-white block">Feedback</span>

              <div className="space-y-2.5 text-xs">
                {/* What you did well */}
                <div>
                  <span className="text-[#10b981] font-bold flex items-center gap-1 text-[11px]">
                    <span>✔</span> What you did well
                  </span>
                  <p className="text-zinc-300 text-[11px] mt-0.5">
                    {latestEvaluation.whatWentWell}
                  </p>
                </div>

                {/* What to improve */}
                <div>
                  <span className="text-[#f59e0b] font-bold flex items-center gap-1 text-[11px]">
                    <span>⚠</span> What to improve
                  </span>
                  <p className="text-zinc-300 text-[11px] mt-0.5">
                    {latestEvaluation.whatToImprove}
                  </p>
                </div>

                {/* Corrected Sentence */}
                <div>
                  <span className="text-[#38bdf8] font-bold flex items-center gap-1 text-[11px]">
                    <span>🔁</span> Corrected Sentence
                  </span>
                  <p className="text-zinc-200 text-[11px] mt-0.5 font-medium italic">
                    {latestEvaluation.correctedSentence}
                  </p>
                </div>

                {/* Tip */}
                <div>
                  <span className="text-[#a78bfa] font-bold flex items-center gap-1 text-[11px]">
                    <span>💡</span> Tip
                  </span>
                  <p className="text-zinc-300 text-[11px] mt-0.5">
                    {latestEvaluation.tip}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. LIVE TRANSCRIPT CARD */}
            <div className="flex-1 bg-[#0a091a] border border-[#1b1936] rounded-3xl p-4 shadow-lg flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Live Transcript</span>
                <button
                  onClick={() => setTranscripts([])}
                  className="text-[11px] font-semibold text-[#818cf8] hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[120px] text-xs">
                {transcripts.map((t) => (
                  <div key={t.id} className="space-y-0.5">
                    <p className="text-[10px] font-bold text-[#10b981]">{t.speaker}</p>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">{t.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      {/* ========================================================
          17. SESSION COMPLETION CELEBRATION MODAL
         ======================================================== */}
      {isSessionComplete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e0d22] border border-[#23204b] rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-300 text-center">
            <span className="text-4xl">🎉</span>
            <h2 className="text-xl font-black text-white">Conversation Complete!</h2>
            <p className="text-xs text-zinc-400">
              You successfully practiced 10 conversational turns on &ldquo;{selectedTopic.title}&rdquo;!
            </p>

            <div className="p-4 bg-[#080716] rounded-2xl border border-[#1f1d40] flex items-center justify-around">
              <div>
                <span className="text-2xl font-black text-[#818cf8]">82</span>
                <p className="text-[10px] text-zinc-400 font-bold">Overall Score</p>
              </div>
              <div className="h-8 w-px bg-zinc-800"></div>
              <div>
                <span className="text-lg font-bold text-white">10 / 10</span>
                <p className="text-[10px] text-zinc-400 font-bold">Turns</p>
              </div>
              <div className="h-8 w-px bg-zinc-800"></div>
              <div>
                <span className="text-lg font-bold text-[#fbbf24]">+250 XP</span>
                <p className="text-[10px] text-zinc-400 font-bold">Earned</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  setIsSessionComplete(false);
                  setQuestionNumber(1);
                }}
                className="flex-1 py-3 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs cursor-pointer"
              >
                Practice Again
              </button>
              <Link
                href="/dashboard"
                className="flex-1 py-3 rounded-xl bg-[#14122b] hover:bg-[#1e1a40] text-zinc-300 font-bold text-xs border border-[#272352] text-center"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
