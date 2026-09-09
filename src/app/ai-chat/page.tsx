"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import UserPanelShell from "../components/UserPanelShell";
import { getAuthUserRoleAction } from "../login/actions";
import {
  processMultilingualChatTurnAction,
  AssistantMode,
  MultilingualChatResponse,
} from "./actions";
import {
  SUPPORTED_LANGUAGES,
  LanguageConfig,
  getLanguageByCode,
} from "../../lib/languages";
import { initTTS, resolveTTSLocale, speakMultilingualText } from "../../lib/tts";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
  data?: MultilingualChatResponse;
}

export default function AIChatPage() {
  const [userName, setUserName] = useState("Learner");
  const [userInitials, setUserInitials] = useState("LE");
  const [isAdmin, setIsAdmin] = useState(false);

  // Multilingual Configuration
  const [sourceLangCode, setSourceLangCode] = useState<string>("hi"); // I SPEAK
  const [targetLangCode, setTargetLangCode] = useState<string>("en"); // I LEARN
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [mode, setMode] = useState<AssistantMode>("chat");

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const sourceLang: LanguageConfig = useMemo(
    () => getLanguageByCode(sourceLangCode),
    [sourceLangCode]
  );
  const targetLang: LanguageConfig = useMemo(
    () => getLanguageByCode(targetLangCode),
    [targetLangCode]
  );

  // Initialize Speech Synthesis
  useEffect(() => {
    initTTS();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Load User Session & Profile
  useEffect(() => {
    getAuthUserRoleAction().then((res) => {
      setIsAdmin(res.isAdmin);
    });
    try {
      const match = document.cookie.match(/(?:^|;\s*)user=([^;]+)/);
      if (match) {
        const rawToken = decodeURIComponent(match[1]);
        const payloadBase64 = rawToken.split(".")[0];
        const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
        const decodedJSON = decodeURIComponent(escape(atob(normalized)));
        const decoded = JSON.parse(decodedJSON);
        if (decoded?.name) {
          setUserName(decoded.name);
          setUserInitials(
            decoded.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "LE"
          );
        }
      }
    } catch (e) {
      console.warn("Client session decode notice:", e);
    }
  }, []);

  // Helper to build dynamic welcome message
  const getInitialWelcome = useCallback((src: LanguageConfig, tgt: LanguageConfig): ChatMessage => {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    let welcomeText = `Hello! I am your Multilingual Language Assistant. 🌐\n\nI can help you translate, check grammar, explain vocabulary, and improve sentences between ${src.name} and ${tgt.name}.`;

    if (tgt.code === "en" && src.code === "hi") {
      welcomeText = "नमस्ते! मैं आपका बहुभाषी AI भाषा सहायक हूँ। 🌐\n\nमैं हिंदी से अंग्रेज़ी सीखने, अनुवाद करने, व्याकरण सुधारने और नए शब्दों के अर्थ समझने में आपकी पूरी मदद करूँगा। नीचे दिए गए सुझाव चुनें या कुछ भी लिखें!";
    } else if (tgt.code === "fr") {
      welcomeText = `Bonjour ! Je suis votre assistant linguistique pour apprendre le français depuis ${src.name}. 🇫🇷\nPosez une question, demandez une traduction ou vérifiez votre grammaire !`;
    } else if (tgt.code === "ar") {
      welcomeText = `مرحباً بك! أنا مساعدك الذكي لتعلم اللغة العربية. 🇸🇦\nاكتب جملتك للترجمة، أو تصحيح القواعد، أو شرح المفردات!`;
    } else if (tgt.code === "es") {
      welcomeText = `¡Hola! Soy tu asistente de idiomas para aprender español. 🇪🇸\n¡Escribe cualquier frase para traducir, corregir tu gramática o aprender vocabulario!`;
    } else if (tgt.code === "de") {
      welcomeText = `Hallo! Ich bin dein Sprachassistent für Deutsch. 🇩🇪\nÜbersetze Sätze, korrigiere Grammatik oder erweitere deinen Wortschatz!`;
    }

    return {
      id: "welcome-1",
      sender: "ai",
      text: welcomeText,
      time: timeStr,
      data: {
        type: "chat",
        targetText: welcomeText,
        meaningInSourceLang: `Multilingual Assistant ready for ${src.name} ➔ ${tgt.name}`,
      },
    };
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    getInitialWelcome(getLanguageByCode("hi"), getLanguageByCode("en")),
  ]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Language Swap Handler
  const handleSwapLanguages = () => {
    const oldSource = sourceLangCode;
    const oldTarget = targetLangCode;
    setSourceLangCode(oldTarget);
    setTargetLangCode(oldSource);
    setMessages((prev) => [
      ...prev,
      getInitialWelcome(getLanguageByCode(oldTarget), getLanguageByCode(oldSource)),
    ]);
  };

  // Text-To-Speech Playback
  const handleSpeak = (text: string, langLocale?: string) => {
    if (!text) return;
    const resolved = resolveTTSLocale(text, targetLangCode, langLocale);
    speakMultilingualText(text, resolved, {
      rate: 0.95,
      onStart: () => setSpeakingId(text),
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  // Copy to Clipboard
  const handleCopy = (text: string, msgId: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Send Message
  const handleSend = async (textToSend: string, specificMode?: AssistantMode) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const activeMode = specificMode || mode;
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.slice(-4).map((m) => ({ sender: m.sender, text: m.text }));
      const result = await processMultilingualChatTurnAction({
        message: trimmed,
        sourceLangCode,
        targetLangCode,
        level,
        mode: activeMode,
        conversationHistory: history,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now() + 1}`,
        sender: "ai",
        text: result.response.targetText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        data: result.response,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat turn error:", err);
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text: "Sorry, I had trouble processing your request. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Dynamic quick prompts based on Language Pair & Mode
  const quickPrompts = useMemo(() => {
    if (mode === "grammar") {
      return [
        { label: "Check: 'He go to office.' ✍️", text: "He go to office." },
        { label: "Check: 'I has two brothers.' ✍️", text: "I has two brothers." },
        { label: "Check: 'She don't know.' ✍️", text: "She don't know the answer." },
      ];
    }
    if (mode === "vocabulary") {
      if (targetLangCode === "fr") {
        return [
          { label: "Explain: 'Éphémère' 📚", text: "éphémère" },
          { label: "Explain: 'Bienveillance' 📚", text: "bienveillance" },
          { label: "Explain: 'Dépaysement' 📚", text: "dépaysement" },
        ];
      }
      if (targetLangCode === "es") {
        return [
          { label: "Explain: 'Sobremesa' 📚", text: "sobremesa" },
          { label: "Explain: 'Madrugar' 📚", text: "madrugar" },
          { label: "Explain: 'Ojalá' 📚", text: "ojalá" },
        ];
      }
      if (targetLangCode === "de") {
        return [
          { label: "Explain: 'Gemütlichkeit' 📚", text: "Gemütlichkeit" },
          { label: "Explain: 'Fernweh' 📚", text: "Fernweh" },
          { label: "Explain: 'Feierabend' 📚", text: "Feierabend" },
        ];
      }
      if (targetLangCode === "ar") {
        return [
          { label: "Explain: 'Shukran' 📚", text: "شكراً" },
          { label: "Explain: 'Habibi' 📚", text: "حبيبي" },
          { label: "Explain: 'Ahlan' 📚", text: "أهلاً وسهلاً" },
        ];
      }
      return [
        { label: "Explain: 'Ubiquitous' 📚", text: "ubiquitous" },
        { label: "Explain: 'Resilience' 📚", text: "resilience" },
        { label: "Explain: 'Pragmatic' 📚", text: "pragmatic" },
      ];
    }
    if (mode === "translate") {
      if (sourceLangCode === "hi" && targetLangCode === "en") {
        return [
          { label: "Office sentence 💼", text: "Mujhe office ke liye English sentence chahiye." },
          { label: "Apologize for delay ⏰", text: "Mujhe aane mein der ho jayegi, kripya intezar karein." },
          { label: "Ask for directions 🗺️", text: "Najdeeki metro station kahan hai?" },
        ];
      }
      if (targetLangCode === "fr") {
        return [
          { label: "Polite Greeting 🇫🇷", text: "How do I say 'Good morning' politely in French?" },
          { label: "Order Coffee ☕", text: "A cup of hot coffee, please." },
          { label: "Ask for Bill 💳", text: "Could I have the check, please?" },
        ];
      }
      if (targetLangCode === "ar") {
        return [
          { label: "Formal Greeting 🇸🇦", text: "Peace be upon you and good morning." },
          { label: "Say Thank You 🙏", text: "Thank you very much for your kind help." },
          { label: "Airport check-in ✈️", text: "Where is the departure terminal?" },
        ];
      }
      if (targetLangCode === "es") {
        return [
          { label: "Friendly Greeting 🇪🇸", text: "Hello! Nice to meet you." },
          { label: "Ask How Are You 💬", text: "How has your day been?" },
          { label: "Find Restaurant 🍽️", text: "Where is a good traditional restaurant?" },
        ];
      }
      if (targetLangCode === "de") {
        return [
          { label: "Workplace Greeting 🇩🇪", text: "Good day, I am happy to be here." },
          { label: "Meeting Confirmation 📅", text: "Our project meeting is confirmed for 2 PM." },
          { label: "Ask Directions 📍", text: "Excuse me, how do I get to the train station?" },
        ];
      }
    }
    // Default chat prompts
    if (sourceLangCode === "hi") {
      return [
        { label: "Daily sentence 🇮🇳➔🇬🇧", text: "Mujhe aam bolchal ke liye zaroori English sentence bataiye." },
        { label: "Correct my grammar ✍️", text: "He go to office every morning." },
        { label: "Explain new word 📚", text: "Explain the word 'Eloquent' with meaning and example." },
      ];
    }
    return [
      { label: "Polite French Greeting 🇫🇷", text: "How do I say 'Good morning' politely?" },
      { label: "Check my sentence ✍️", text: "He go to office." },
      { label: "Explain a word 📚", text: "Explain the word 'Serendipity'." },
    ];
  }, [mode, sourceLangCode, targetLangCode]);

  // Mode Tabs definition
  const modeTabs: { key: AssistantMode; label: string; icon: string }[] = [
    { key: "chat", label: "All / Chat", icon: "💬" },
    { key: "translate", label: "Translate", icon: "🌐" },
    { key: "grammar", label: "Grammar Check", icon: "✍️" },
    { key: "vocabulary", label: "Vocabulary", icon: "📚" },
    { key: "improve", label: "Improve Sentence", icon: "✨" },
  ];

  const getPlaceholder = () => {
    switch (mode) {
      case "translate":
        return `Type in ${sourceLang.name} to translate into ${targetLang.name}...`;
      case "grammar":
        return `Type a sentence in ${targetLang.name} to check for grammar errors...`;
      case "vocabulary":
        return `Enter any word in ${targetLang.name} to get definition, pronunciation & examples...`;
      case "improve":
        return `Type a draft sentence to get a more polished, native version...`;
      default:
        return `Ask anything, translate, check grammar, or practice between ${sourceLang.name} and ${targetLang.name}...`;
    }
  };

  return (
    <UserPanelShell
      activeNav="ai-chat"
      userName={userName}
      userInitials={userInitials}
      isAdmin={isAdmin}
      fullHeightContent={true}
      searchPlaceholder="Search AI chat history, translations..."
    >
      <div className="flex-1 flex flex-col min-w-0 h-auto lg:h-full overflow-visible lg:overflow-hidden bg-[#07060f] text-zinc-100 font-sans select-none relative">
        {/* ========================================================= */}
        {/* 1. TOP MULTILINGUAL CONTROL BAR (I SPEAK, SWAP, I LEARN, LEVEL) */}
        {/* ========================================================= */}
        <div className="px-4 sm:px-6 py-3 border-b border-[#18162e] bg-[#090817] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 max-w-full">
            {/* I SPEAK SELECTOR */}
            <div className="flex items-center gap-1.5 bg-[#100f21] px-3 py-1.5 rounded-xl border border-[#232044]">
              <span className="text-zinc-400 font-bold uppercase text-[10px] shrink-0">I SPEAK:</span>
              <select
                value={sourceLangCode}
                onChange={(e) => {
                  const newSrc = e.target.value;
                  setSourceLangCode(newSrc);
                  if (newSrc === targetLangCode) {
                    const fallbackTgt = SUPPORTED_LANGUAGES.find((l) => l.code !== newSrc)?.code || "en";
                    setTargetLangCode(fallbackTgt);
                  }
                }}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-[#100f21] text-white">
                    {l.flag} {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* SWAP BUTTON */}
            <button
              type="button"
              onClick={handleSwapLanguages}
              title="Swap languages"
              className="w-8 h-8 rounded-xl bg-[#15132d] hover:bg-[#201d44] border border-[#2b2756] text-zinc-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0 text-sm"
            >
              ⇄
            </button>

            {/* I LEARN SELECTOR */}
            <div className="flex items-center gap-1.5 bg-[#100f21] px-3 py-1.5 rounded-xl border border-[#232044]">
              <span className="text-zinc-400 font-bold uppercase text-[10px] shrink-0">I LEARN:</span>
              <select
                value={targetLangCode}
                onChange={(e) => setTargetLangCode(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer truncate"
              >
                {SUPPORTED_LANGUAGES.filter((l) => l.code !== sourceLangCode).map((l) => (
                  <option key={l.code} value={l.code} className="bg-[#100f21] text-white">
                    {l.flag} {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* LEVEL SELECTOR */}
            <div className="flex items-center gap-1.5 bg-[#100f21] px-3 py-1.5 rounded-xl border border-[#232044]">
              <span className="text-zinc-400 font-bold uppercase text-[10px] shrink-0">LEVEL:</span>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as "Beginner" | "Intermediate" | "Advanced")}
                className="bg-transparent text-[#34d399] font-semibold focus:outline-none cursor-pointer truncate"
              >
                <option value="Beginner" className="bg-[#100f21] text-white">Beginner</option>
                <option value="Intermediate" className="bg-[#100f21] text-white">Intermediate</option>
                <option value="Advanced" className="bg-[#100f21] text-white">Advanced</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#1b1542] text-[#a78bfa] border border-[#352c78] text-[10px] font-bold uppercase tracking-wider">
              Phase 12 Multilingual Assistant
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. ASSISTANT MODE TABS (Chat, Translate, Grammar, Vocab, Improve) */}
        {/* ========================================================= */}
        <div className="px-4 sm:px-6 py-2 border-b border-[#18162e] bg-[#0a091a] flex items-center gap-1.5 overflow-x-auto shrink-0">
          {modeTabs.map((tab) => {
            const isActive = mode === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMode(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#4338ca] text-white shadow-sm shadow-indigo-600/30 border border-[#5c50e6]"
                    : "bg-[#111024] hover:bg-[#1b1938] text-zinc-400 hover:text-zinc-200 border border-[#232046]"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* 3. CHAT MESSAGE LOGS (Scrollable, Structured, Formatted)    */}
        {/* ========================================================= */}
        <div id="chat-messages-stream" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-[380px]">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            const data = msg.data;
            const isSpeakingThis = speakingId === msg.text || (data && speakingId === data.targetText);
            const isCopiedThis = copiedId === msg.id;

            return (
              <div
                key={msg.id}
                data-sender={msg.sender}
                className={`flex gap-3 max-w-2xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                    isUser
                      ? "bg-[#3730a3] text-white border border-[#4f46e5]"
                      : "bg-gradient-to-tr from-indigo-600 to-purple-600 text-white border border-indigo-400/40"
                  }`}
                >
                  {isUser ? userInitials : "AI"}
                </div>

                {/* Message Bubble Container */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg border transition ${
                    isUser
                      ? "bg-[#14122d] border-[#29245c] text-white rounded-tr-none text-right"
                      : "bg-[#0c0a20] border-[#1f1c42] text-zinc-100 rounded-tl-none text-left w-full space-y-3"
                  }`}
                >
                  {/* USER MESSAGE */}
                  {isUser ? (
                    <div>
                      <p className="whitespace-pre-line font-medium">{msg.text}</p>
                      <span className="text-[10px] text-zinc-500 block mt-1">{msg.time}</span>
                    </div>
                  ) : (
                    /* AI ASSISTANT STRUCTURED RESPONSE */
                    <div className="space-y-3">
                      {/* Header bar: Badge + Copy + TTS */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/5 text-[11px]">
                        <span className="font-bold text-[#a78bfa] flex items-center gap-1.5">
                          <span>✨</span>
                          <span>
                            {data?.type === "grammar"
                              ? "Grammar Correction"
                              : data?.type === "vocabulary"
                              ? "Vocabulary Analysis"
                              : data?.type === "translation"
                              ? "Translation"
                              : data?.type === "improvement"
                              ? "Sentence Improvement"
                              : "Language Assistant"}
                          </span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Text-to-Speech Button */}
                          <button
                            type="button"
                            onClick={() => handleSpeak(data?.targetText || msg.text, targetLang.ttsLang)}
                            title="Listen to pronunciation"
                            className={`p-1.5 rounded-lg border transition cursor-pointer text-xs ${
                              isSpeakingThis
                                ? "bg-indigo-600 text-white border-indigo-400 animate-pulse"
                                : "bg-[#14122d] hover:bg-[#1f1c44] text-zinc-400 hover:text-white border-[#272352]"
                            }`}
                          >
                            🔊
                          </button>

                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopy(data?.targetText || msg.text, msg.id)}
                            title="Copy text"
                            className="px-2 py-1 rounded-lg bg-[#14122d] hover:bg-[#1f1c44] border border-[#272352] text-zinc-400 hover:text-white transition cursor-pointer text-xs flex items-center gap-1"
                          >
                            <span>{isCopiedThis ? "✓" : "📋"}</span>
                            <span className="text-[10px]">{isCopiedThis ? "Copied!" : "Copy"}</span>
                          </button>
                        </div>
                      </div>

                      {/* 1. GRAMMAR CORRECTION FORMAT */}
                      {data?.grammarDetails ? (
                        <div className="space-y-2.5">
                          {/* Incorrect Sentence */}
                          <div className="p-2.5 rounded-xl bg-red-950/25 border border-red-500/20 text-red-300">
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                              ❌ Incorrect:
                            </span>
                            <p className="mt-0.5 line-through font-medium opacity-90">
                              &ldquo;{data.grammarDetails.incorrectSentence}&rdquo;
                            </p>
                          </div>

                          {/* Correct Sentence */}
                          <div className="p-2.5 rounded-xl bg-emerald-950/25 border border-emerald-500/20 text-emerald-200">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                              ✅ Correct:
                            </span>
                            <p className="mt-0.5 font-bold">
                              &ldquo;{data.grammarDetails.correctedSentence}&rdquo;
                            </p>
                          </div>

                          {/* Explanation in I SPEAK language */}
                          <div className="pt-1 text-xs text-zinc-300 space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                              Explanation ({sourceLang.name}):
                            </span>
                            <p className="leading-relaxed">
                              {data.grammarDetails.explanationInSourceLang}
                            </p>
                          </div>
                        </div>
                      ) : data?.vocabularyDetails ? (
                        /* 2. VOCABULARY FORMAT */
                        <div className="space-y-2.5">
                          {/* Word + Part of Speech */}
                          <div className="flex items-baseline gap-2">
                            <h3 className="text-base sm:text-lg font-black text-white">
                              {data.vocabularyDetails.word}
                            </h3>
                            {data.vocabularyDetails.partOfSpeech && (
                              <span className="text-[11px] font-semibold text-[#818cf8] px-2 py-0.5 rounded-full bg-[#18153d] border border-[#2b2663]">
                                {data.vocabularyDetails.partOfSpeech}
                              </span>
                            )}
                          </div>

                          {/* Read / Pronunciation */}
                          {data.vocabularyDetails.pronunciation && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-zinc-500 font-bold uppercase text-[10px]">Read:</span>
                              <span className="text-[#a78bfa] font-medium tracking-wide italic">
                                {data.vocabularyDetails.pronunciation}
                              </span>
                            </div>
                          )}

                          {/* Meaning in I SPEAK language */}
                          <div className="p-2.5 rounded-xl bg-[#110f2b] border border-[#23204d] text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                              {sourceLang.name} Meaning:
                            </span>
                            <p className="text-zinc-200 font-medium">
                              {data.vocabularyDetails.meaningInSourceLang}
                            </p>
                          </div>

                          {/* Example sentence */}
                          {data.vocabularyDetails.exampleSentence && (
                            <div className="space-y-1 text-xs pt-1 border-t border-white/5">
                              <span className="text-[10px] font-bold uppercase text-zinc-500 block">
                                Example:
                              </span>
                              <p className="text-white italic">
                                &ldquo;{data.vocabularyDetails.exampleSentence}&rdquo;
                              </p>
                              {data.vocabularyDetails.exampleTranslation && (
                                <p className="text-zinc-400 text-[11px]">
                                  {data.vocabularyDetails.exampleTranslation}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* 3. STANDARD / TRANSLATION / IMPROVEMENT FORMAT */
                        <div className="space-y-2.5">
                          {/* Primary Target Text */}
                          <div className="w-full">
                            <p
                              dir={targetLang.code === "ar" ? "rtl" : "ltr"}
                              className={`font-semibold leading-relaxed ${
                                targetLang.code === "ar"
                                  ? "text-base sm:text-lg text-right font-arabic tracking-wide"
                                  : "text-xs sm:text-sm text-white"
                              }`}
                            >
                              {data?.targetText || msg.text}
                            </p>
                          </div>

                          {/* "Read:" Pronunciation (in Latin/Roman letters) */}
                          {data?.pronunciation && (
                            <div className="flex items-center gap-2 pt-0.5 text-left">
                              <span className="text-zinc-500 font-bold uppercase text-[10px] shrink-0">
                                Read:
                              </span>
                              <span className="text-xs sm:text-sm text-[#a78bfa] font-medium tracking-wide italic select-text">
                                {data.pronunciation}
                              </span>
                            </div>
                          )}

                          {/* Meaning in I SPEAK language */}
                          {data?.meaningInSourceLang && (
                            <div className="pt-2 border-t border-white/5 text-left space-y-0.5">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">
                                {sourceLang.name} Meaning:
                              </span>
                              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans select-text">
                                {data.meaningInSourceLang}
                              </p>
                            </div>
                          )}

                          {/* Clarification prompt if input was ambiguous */}
                          {data?.clarificationQuestion && (
                            <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-200 text-xs">
                              <span className="font-bold text-[10px] uppercase text-amber-400 block mb-0.5">
                                💬 Quick Clarification:
                              </span>
                              <p>{data.clarificationQuestion}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <span className="text-[10px] text-zinc-500 block text-right pt-1">
                        {msg.time}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-xl mr-auto items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                AI
              </div>
              <div className="bg-[#0c0a20] border border-[#1f1c42] px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-xs text-zinc-400 font-medium ml-1">Analyzing in {targetLang.name}...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ========================================================= */}
        {/* 4. INPUT BAR & DYNAMIC QUICK PROMPTS                       */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 bg-[#090817] border-t border-[#18162e] shrink-0 space-y-3">
          {/* Helper prompt chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider shrink-0">
              Quick Prompts:
            </span>
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSend(prompt.text)}
                className="px-3 py-1 bg-[#100f24] hover:bg-[#1a183d] text-zinc-300 hover:text-white text-xs font-semibold rounded-full border border-[#232047] transition shrink-0 cursor-pointer"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Form input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2 sm:gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isTyping}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#232049] bg-[#0f0e24] text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="px-5 sm:px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md shadow-indigo-600/30 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <span>➤</span>
            </button>
          </form>
        </div>
      </div>
    </UserPanelShell>
  );
}
