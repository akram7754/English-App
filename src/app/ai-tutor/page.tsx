"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { getAuthUserRoleAction } from "../login/actions";
import { askTutorAction, AskTutorOptions } from "./actions";
import MobileHeader from "../components/MobileHeader";
import UserSidebar from "../components/UserSidebar";
import ThemeSwitcher from "../components/ThemeSwitcher";
import MultilingualMessageContent from "../components/MultilingualMessageContent";
import {
  SUPPORTED_LANGUAGES,
  LanguageConfig,
  getLanguageByCode,
} from "../../lib/languages";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

type TeacherMode = "conversation" | "grammar" | "vocabulary" | "translation" | "practice";
type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

export default function AITutorPage() {
  const [userName, setUserName] = useState("Learner");
  const [userInitials, setUserInitials] = useState("LE");
  const [isAdmin, setIsAdmin] = useState(false);

  // Language & Teaching Configuration (reusing src/lib/languages.ts)
  const [sourceLangCode, setSourceLangCode] = useState<string>("hi"); // Student Native (Default: Hindi)
  const [targetLangCode, setTargetLangCode] = useState<string>("en"); // Language Being Learned (Default: English)
  const [mode, setMode] = useState<TeacherMode>("conversation");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("Intermediate");

  // Speech Recognition (Dictation) state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const sourceLang: LanguageConfig = useMemo(
    () => getLanguageByCode(sourceLangCode),
    [sourceLangCode]
  );
  const targetLang: LanguageConfig = useMemo(
    () => getLanguageByCode(targetLangCode),
    [targetLangCode]
  );

  // Load User Session & Profile
  useEffect(() => {
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
            .slice(0, 2) || "LE"
        );
      }
    });
  }, []);

  // Helper to generate dynamic opening teacher welcome
  const getInitialGreeting = (targetCode: string, sourceCode: string): string => {
    const isSourceHindi = sourceCode === "hi";

    if (targetCode === "ar") {
      return isSourceHindi
        ? "مرحباً بك! أنا معلمك الشخصي للغة العربية. 👋\n\n" +
          "Read: Marhaban bika! Ana mu'allimuka ash-shakhsi li-lughat al-'arabiyyah.\n\n" +
          "Hindi:\n" +
          "नमस्ते! मैं आपका अरबी भाषा का व्यक्तिगत शिक्षक हूँ।\n\n" +
          "हम आज क्या सीखना या अभ्यास करना चाहेंगे? आप नीचे दिए गए विषयों में से चुन सकते हैं या कुछ भी लिख सकते हैं।"
        : "مرحباً بك! أنا معلمك الشخصي للغة العربية. 👋\n\n" +
          "Read: Marhaban bika! Ana mu'allimuka ash-shakhsi li-lughat al-'arabiyyah.\n\n" +
          "Meaning:\n" +
          "Welcome! I am your personal Arabic language teacher. 👋\n\n" +
          "What would you like to learn or practice today? You can choose a suggested topic below or write anything to get started.";
    }
    if (targetCode === "fr") {
      return isSourceHindi
        ? "Bonjour ! Je suis votre professeur personnel de français. 🇫🇷\n\n" +
          "Hindi:\nनमस्ते! मैं आपका व्यक्तिगत फ़्रेंच शिक्षक हूँ।\n\n" +
          "Comment puis-je vous aider à progresser aujourd'hui ? Vous pouvez choisir un thème ou poser une question."
        : "Bonjour ! Je suis votre professeur personnel de français. 🇫🇷\n\n" +
          "Meaning:\nHello! I am your personal French teacher. 🇫🇷\n\n" +
          "How can I help you improve today? You can choose a topic below or ask any question.";
    }
    if (targetCode === "es") {
      return isSourceHindi
        ? "¡Hola! Soy tu profesor personal de español. 🇪🇸\n\n" +
          "Hindi:\nनमस्ते! मैं आपका स्पैनिश शिक्षक हूँ।\n\n" +
          "¿Qué te gustaría aprender o practicar hoy? Elige un tema o escribe tu primera frase."
        : "¡Hola! Soy tu profesor personal de español. 🇪🇸\n\n" +
          "Meaning:\nHello! I am your personal Spanish teacher. 🇪🇸\n\n" +
          "What would you like to learn or practice today? Pick a topic below or write your first phrase.";
    }
    if (targetCode === "de") {
      return isSourceHindi
        ? "Guten Tag! Ich bin Ihr persönlicher Deutschlehrer. 🇩🇪\n\n" +
          "Hindi:\nनमस्ते! मैं आपका जर्मन शिक्षक हूँ।\n\n" +
          "Was möchten Sie heute üben? Wählen Sie ein Thema oder schreiben Sie Ihren Satz."
        : "Guten Tag! Ich bin Ihr persönlicher Deutschlehrer. 🇩🇪\n\n" +
          "Meaning:\nGood day! I am your personal German teacher. 🇩🇪\n\n" +
          "What would you like to practice today? Choose a topic or write your sentence.";
    }
    if (targetCode === "hi") {
      return isSourceHindi
        ? "नमस्ते! मैं आपका हिंदी भाषा का व्यक्तिगत शिक्षक हूँ। 🇮🇳\n\n" +
          "आज आप क्या अभ्यास करना चाहते हैं? नीचे दिए गए सुझावों में से चुनें या अपना वाक्य लिखें।"
        : "नमस्ते! मैं आपका हिंदी भाषा का व्यक्तिगत शिक्षक हूँ। 🇮🇳\n\n" +
          "Read: Namaste! Main aapka Hindi bhasha ka vyaktigat shikshak hoon.\n\n" +
          "Meaning:\nHello! I am your personal Hindi language teacher. 🇮🇳\n\n" +
          "What would you like to practice today? Choose from the suggestions below or write your own sentence.";
    }
    return isSourceHindi
      ? "Hello! I am your personal English Language Teacher. 👋\n\n" +
        "Hindi:\nनमस्ते! मैं आपका व्यक्तिगत अंग्रेज़ी शिक्षक हूँ।\n\n" +
        "I am here to guide your speaking, grammar, vocabulary, and translation step-by-step. " +
        "Choose a practice mode or question below, or write your own sentence to get started!"
      : "Hello! I am your personal English Language Teacher. 👋\n\n" +
        "I am here to guide your speaking, grammar, vocabulary, and translation step-by-step. " +
        "Choose a practice mode or question below, or write your own sentence to get started!";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: getInitialGreeting("en", "hi"),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle switching source language (I SPEAK): update initial greeting if starting out
  const handleSourceLanguageChange = (newSourceCode: string) => {
    setSourceLangCode(newSourceCode);
    if (messages.length === 1 && messages[0].sender === "ai") {
      setMessages([
        {
          id: Date.now().toString(),
          sender: "ai",
          text: getInitialGreeting(targetLangCode, newSourceCode),
          timestamp: new Date(),
        },
      ]);
    }
  };

  // Handle switching target language (I LEARN): reset messages with target greeting
  const handleTargetLanguageChange = (newTargetCode: string) => {
    setTargetLangCode(newTargetCode);
    const greetingText = getInitialGreeting(newTargetCode, sourceLangCode);
    setMessages([
      {
        id: Date.now().toString(),
        sender: "ai",
        text: greetingText,
        timestamp: new Date(),
      },
    ]);
  };

  // Dynamic Prompt Chips based on Target Language & Mode
  const quickPrompts = useMemo(() => {
    if (targetLangCode === "ar") {
      switch (mode) {
        case "grammar":
          return [
            { label: "Verb-Subject Order 📚", text: "Explain how verbs and subjects work in Arabic sentences." },
            { label: "Masculine vs Feminine ✍️", text: "How do masculine and feminine nouns work in Arabic?" },
            { label: "Check my Arabic grammar ✍️", text: "أنا يذهب إلى السوق أمس" },
          ];
        case "vocabulary":
          return [
            { label: "Family & Friends 👨‍👩‍👦", text: "Teach me 3 Arabic words for family members." },
            { label: "Workplace & Job 💼", text: "What are essential Arabic workplace words?" },
            { label: "Travel & Airport ✈️", text: "Give me useful Arabic airport phrases." },
          ];
        case "translation":
          return [
            { label: "Translate 'Good morning' 🌐", text: "How do I translate 'Good morning, how are you today?' into Arabic?" },
            { label: "Translate 'Thank you' 🙏", text: "How do I say 'Thank you very much for your help' in Arabic?" },
            { label: "Translate 'See you soon' ⏳", text: "Translate 'See you tomorrow' into Arabic." },
          ];
        case "practice":
          return [
            { label: "Arabic Greeting Drill 🎯", text: "Test me with an Arabic greeting challenge!" },
            { label: "Fill in the blank 📝", text: "Give me an Arabic fill-in-the-blank practice question." },
            { label: "Translate to Arabic ✍️", text: "Give me a sentence in Hindi to translate into Arabic." },
          ];
        default:
          return [
            { label: "Arabic Greeting 🇸🇦", text: "How do I say 'Good morning, how are you today?' in Arabic?" },
            { label: "Daily Conversation ☕", text: "Let's practice a casual Arabic conversation about my day." },
            { label: "Job Interview Practice 💼", text: "Let's practice an Arabic job interview." },
          ];
      }
    }

    if (targetLangCode === "fr") {
      switch (mode) {
        case "grammar":
          return [
            { label: "Vous vs Tu 📚", text: "Explain the difference between 'vous' and 'tu' in French." },
            { label: "Passé Composé ✍️", text: "How do I form the Passé Composé tense in French?" },
            { label: "Check my French grammar ✍️", text: "Je suis allé au travail hier et j'ai parlé avec mon chef." },
          ];
        case "vocabulary":
          return [
            { label: "Top 5 French verbs 📖", text: "What are the 5 most important French verbs to know?" },
            { label: "Café & Food 🥐", text: "Teach me phrases to order breakfast at a French bakery." },
            { label: "Polite expressions 🙏", text: "Teach me polite French phrases for daily life." },
          ];
        case "translation":
          return [
            { label: "Translate 'Have a nice day' 🌐", text: "Translate 'Have a nice day' into polite French." },
            { label: "Translate 'Where is the hotel?' 🏨", text: "How do I say 'Where is the hotel?' in French?" },
          ];
        case "practice":
          return [
            { label: "Conjugation Drill 🎯", text: "Give me a quick French verb conjugation exercise." },
            { label: "Dialogue Challenge 💬", text: "Let's do a French restaurant ordering simulation." },
          ];
        default:
          return [
            { label: "French Greeting 🇫🇷", text: "Bonjour ! Comment allez-vous aujourd'hui ?" },
            { label: "Introduce myself 👤", text: "How do I introduce myself formally in French?" },
            { label: "Order at a Café ☕", text: "Je voudrais un café s'il vous plaît." },
          ];
      }
    }

    if (targetLangCode === "es") {
      switch (mode) {
        case "grammar":
          return [
            { label: "Ser vs Estar 📚", text: "Can you explain the exact difference between 'Ser' and 'Estar'?" },
            { label: "Por vs Para ✍️", text: "When do I use 'Por' versus 'Para' in Spanish?" },
            { label: "Check my Spanish grammar ✍️", text: "Yo soy muy cansado hoy." },
          ];
        case "vocabulary":
          return [
            { label: "Essential Spanish Verbs 📖", text: "Teach me 5 common Spanish verbs with examples." },
            { label: "Travel & Directions ✈️", text: "Teach me phrases to ask for directions in Spanish." },
          ];
        default:
          return [
            { label: "Spanish Greeting 🇪🇸", text: "¡Hola! ¿Cómo estás hoy?" },
            { label: "Daily Small Talk ☕", text: "Let's have a friendly chat in Spanish." },
            { label: "At a Restaurant 🍽️", text: "How do I order food at a restaurant in Spain or Mexico?" },
          ];
      }
    }

    if (targetLangCode === "de") {
      switch (mode) {
        case "grammar":
          return [
            { label: "Der / Die / Das 📚", text: "How can I remember which German nouns take der, die, or das?" },
            { label: "German Word Order ✍️", text: "Explain why German verbs go to the end in subordinate clauses." },
          ];
        default:
          return [
            { label: "German Greeting 🇩🇪", text: "Guten Tag! Wie geht es Ihnen heute?" },
            { label: "Introduce myself 🤝", text: "How do I introduce myself in a German business meeting?" },
            { label: "Ask for directions 🗺️", text: "How do I ask where the train station is in German?" },
          ];
      }
    }

    // Default English
    switch (mode) {
      case "grammar":
        return [
          { label: "Explain Present Perfect 📚", text: "Can you explain the Present Perfect tense with clear examples?" },
          { label: "Since vs For ✍️", text: "What is the difference between 'since' and 'for' in English?" },
          { label: "Check my grammar ✍️", text: "She have a dog and she go to school yesterday." },
        ];
      case "vocabulary":
        return [
          { label: "Advanced Business Idioms 💼", text: "Teach me 3 professional English idioms for meetings." },
          { label: "Phrasal Verbs with 'Get' 📖", text: "What are the most common phrasal verbs with 'get'?" },
          { label: "Collocations for Fluency 🗣️", text: "Teach me natural collocations used by native speakers." },
        ];
      case "translation":
        return [
          { label: "Translate Hindi to English 🌐", text: "Translate: 'Mujhe kal meeting ke liye tayyari karni hai' into formal English." },
          { label: "Refine my sentence ✨", text: "Make this sound more native: 'I am knowing this information very well.'" },
        ];
      case "practice":
        return [
          { label: "Grammar Correction Drill 🎯", text: "Give me 2 sentences with mistakes to correct." },
          { label: "Fill-in-the-blank Quiz 📝", text: "Give me a preposition fill-in-the-blank challenge." },
        ];
      default:
        return [
          { label: "Job Interview Practice 💼", text: "I want to practice answering 'Tell me about yourself' for a job interview." },
          { label: "Daily Conversation ☕", text: "Let's have a casual conversation about hobbies and daily routines." },
          { label: "Check my grammar ✍️", text: "She have a dog and she go to school yesterday." },
          { label: "Arabic Greeting 🇸🇦", text: "How do I say 'Good morning, how are you today?' in Arabic?" },
        ];
    }
  }, [targetLangCode, mode]);

  // Send message to AI Tutor
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    const tutorOptions: AskTutorOptions = {
      sourceLanguage: sourceLang.name,
      targetLanguage: targetLang.name,
      sourceLangCode: sourceLang.code,
      targetLangCode: targetLang.code,
      mode,
      difficulty,
    };

    try {
      const aiReplyText = await askTutorAction(
        newMessages.map((m) => ({ sender: m.sender, text: m.text })),
        textToSend,
        tutorOptions
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiReplyText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error("AI Tutor send error:", e);
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Sorry, I am having trouble connecting to my teaching brain right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Toggle voice dictation
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      setIsListening(false);
      return;
    }

    interface WindowWithSpeech {
      SpeechRecognition?: any;
      webkitSpeechRecognition?: any;
    }
    const win = typeof window !== "undefined" ? (window as unknown as WindowWithSpeech) : {};
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = targetLang.sttLang || "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  const modeButtons: { key: TeacherMode; label: string; icon: string }[] = [
    { key: "conversation", label: "Conversation", icon: "💬" },
    { key: "grammar", label: "Grammar Coach", icon: "✍️" },
    { key: "vocabulary", label: "Vocabulary", icon: "📖" },
    { key: "translation", label: "Translate", icon: "🌐" },
    { key: "practice", label: "Practice", icon: "🎯" },
  ];

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans dark:bg-zinc-950 dark:text-zinc-50 overflow-hidden">
      {/* 1. Global Fixed Sidebar Navigation */}
      <UserSidebar activeNav="ai-tutor" isAdmin={isAdmin} />

      {/* 2. Main Chat & Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 min-w-0">
        <MobileHeader
          userName={userName}
          userInitials={userInitials}
          isAdmin={isAdmin}
          activeNav="ai-tutor"
        />

        {/* Top Header */}
        <header className="h-16 border-b border-zinc-200/80 bg-white px-6 md:px-8 flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl dark:bg-indigo-950 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 shadow-sm">
              🧑‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  AI Personal Language Teacher
                </p>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800 uppercase tracking-wider">
                  Phase 11 Multilingual
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                Active • 1-on-1 Personalized Bilingual Coaching
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span>Teaching:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {targetLang.flag} {targetLang.name}
              </span>
            </div>
            <ThemeSwitcher />
          </div>
        </header>

        {/* 3. MULTILINGUAL CONTROLS BAR (I SPEAK, I LEARN, MODE, LEVEL) */}
        <div className="px-6 py-2.5 bg-zinc-100/80 dark:bg-zinc-900/90 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* I SPEAK (Native Language) */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-xs">
              <span className="text-zinc-400 font-bold uppercase text-[10px]">I SPEAK:</span>
              <select
                value={sourceLangCode}
                onChange={(e) => handleSourceLanguageChange(e.target.value)}
                className="bg-transparent text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option
                    key={l.code}
                    value={l.code}
                    disabled={l.code === targetLangCode}
                    className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-zinc-400 font-bold">→</span>

            {/* I LEARN (Target Language) */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-xs">
              <span className="text-zinc-400 font-bold uppercase text-[10px]">I LEARN:</span>
              <select
                value={targetLangCode}
                onChange={(e) => handleTargetLanguageChange(e.target.value)}
                className="bg-transparent text-indigo-600 dark:text-indigo-400 font-bold focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.filter((l) => l.code !== sourceLangCode).map((l) => (
                  <option
                    key={l.code}
                    value={l.code}
                    className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    {l.flag} {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* LEVEL */}
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-xs">
              <span className="text-zinc-400 font-bold uppercase text-[10px]">LEVEL:</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="bg-transparent text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="Beginner" className="dark:bg-zinc-800">Beginner</option>
                <option value="Intermediate" className="dark:bg-zinc-800">Intermediate</option>
                <option value="Advanced" className="dark:bg-zinc-800">Advanced</option>
              </select>
            </div>
          </div>

          {/* TEACHER MODE PILLS */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {modeButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setMode(btn.key)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                  mode === btn.key
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                <span>{btn.icon}</span>
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Conversation Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                  msg.sender === "user"
                    ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                    : "bg-indigo-600 text-white"
                }`}
              >
                {msg.sender === "user" ? userInitials : "AI"}
              </div>

              {/* Message Bubble Container */}
              <div
                className={`p-4 md:p-5 rounded-2xl text-sm leading-relaxed shadow-xs border ${
                  msg.sender === "user"
                    ? "bg-indigo-600 border-indigo-600 text-white rounded-tr-none"
                    : "bg-white border-zinc-200/90 text-zinc-800 rounded-tl-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                }`}
              >
                {msg.sender === "ai" ? (
                  <MultilingualMessageContent
                    text={msg.text}
                    targetLangCode={targetLangCode}
                    sourceLangCode={sourceLangCode}
                    ttsLocale={targetLang.ttsLang}
                    variant="light"
                  />
                ) : (
                  <p className="whitespace-pre-line font-medium">{msg.text}</p>
                )}
              </div>
            </div>
          ))}

          {/* Teacher Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-2xl mr-auto">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                AI
              </div>
              <div className="bg-white border border-zinc-200/90 p-4 rounded-2xl rounded-tl-none shadow-xs dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex items-center gap-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  <span>Teacher is composing explanation</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 5. Input Bar & Dynamic Helper Prompts */}
        <div className="p-4 md:p-6 bg-white border-t border-zinc-200/80 dark:bg-zinc-900 dark:border-zinc-800/80 shrink-0 space-y-3">
          {/* Helper prompt chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider shrink-0">
              Suggested:
            </span>
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSend(prompt.text)}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium rounded-full border border-zinc-200/80 transition shrink-0 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-750 cursor-pointer"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Form input + Voice dictation */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2.5"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask in ${sourceLang.name} or practice in ${targetLang.name}...`}
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
              />

              {/* Microphone dictation button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition cursor-pointer ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                }`}
                title={isListening ? "Listening... (tap to stop)" : "Speak your message"}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <button
              type="submit"
              disabled={!input.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
