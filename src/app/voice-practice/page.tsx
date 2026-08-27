"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { logoutAction } from "../login/actions";
import { saveAttemptAction } from "../ai-tutor/actions";

interface PracticePhrase {
  text: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export default function VoicePracticePage() {
  const [userName, setUserName] = useState("Sarah Jenkins");
  const [userInitials, setUserInitials] = useState("SJ");

  useEffect(() => {
    const match = document.cookie.match(new RegExp('(^| )user=([^;]+)'));
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
        setUserInitials(name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "SJ");
      } catch (e) {
        window.location.href = "/login";
      }
    }
  }, []);

  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  const phrases: PracticePhrase[] = [
    { text: "Good morning. How are you today?", difficulty: "Beginner" },
    { text: "Hello! It is a pleasure to meet you.", difficulty: "Beginner" },
    { text: "I would like to order a cup of hot coffee, please.", difficulty: "Beginner" },
    
    { text: "I have been practicing my English speaking skills every day.", difficulty: "Intermediate" },
    { text: "Could you please explain the difference between these two words?", difficulty: "Intermediate" },
    { text: "We need to get the ball rolling on this business project.", difficulty: "Intermediate" },

    { text: "If practice makes perfect, then persistent pronunciation practice will yield progress.", difficulty: "Advanced" },
    { text: "She sells seashells by the seashore, and the shells she sells are surely seashells.", difficulty: "Advanced" },
    { text: "The quick brown fox jumps over the lazy dog to verify all phonetic characters.", difficulty: "Advanced" },
  ];

  const currentPhrases = phrases.filter((p) => p.difficulty === difficulty);
  const targetPhrase = currentPhrases[phraseIndex] || currentPhrases[0];

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsRecording(true);
          setTranscribedText("");
          setScore(null);
          setFeedback("");
        };

        rec.onresult = (event: any) => {
          const speechToText = event.results[0][0].transcript;
          setTranscribedText(speechToText);
          analyzeSpeech(speechToText, targetPhrase.text);
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
          if (event.error === "not-allowed") {
            setFeedback("Microphone permission denied. Please enable it in browser settings.");
          } else {
            setFeedback(`Error: ${event.error}. Please try again.`);
          }
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      } else {
        setSupported(false);
      }
    }
  }, [targetPhrase]);

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    } else {
      // Fallback simulated recording if browser does not support Web Speech API
      simulateRecording();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const simulateRecording = () => {
    setIsRecording(true);
    setTranscribedText("");
    setScore(null);
    setFeedback("Recording... (Simulated)");
    
    setTimeout(() => {
      setIsRecording(false);
      // Mock perfect reading or near perfect reading for demonstration
      const simulatedText = targetPhrase.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
      setTranscribedText(simulatedText);
      analyzeSpeech(simulatedText, targetPhrase.text);
    }, 3000);
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const clean = (s: string) => s.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"").split(/\s+/).filter(Boolean);
    const w1 = clean(str1);
    const w2 = clean(str2);
    if (w1.length === 0 || w2.length === 0) return 0;
    
    let matches = 0;
    w1.forEach(word => {
      if (w2.includes(word)) matches++;
    });
    return Math.round((matches / Math.max(w1.length, w2.length)) * 100);
  };

  const analyzeSpeech = async (spoken: string, target: string) => {
    const similarityScore = calculateSimilarity(spoken, target);
    setScore(similarityScore);

    if (similarityScore >= 90) {
      setFeedback("🎉 Excellent! Your pronunciation and word matching is near-perfect. Keep it up!");
    } else if (similarityScore >= 70) {
      setFeedback("👍 Good job! Your pronunciation is clear, but check a few words that might have been skipped or misheard.");
    } else {
      setFeedback("🗣️ Keep practicing! Try speaking slowly, enunciating each word clearly, and ensure there's no background noise.");
    }

    try {
      await saveAttemptAction(target, similarityScore, targetPhrase.difficulty);
    } catch (e) {
      console.error("Failed to persist attempt:", e);
    }
  };

  const handleNext = () => {
    setPhraseIndex((prev) => (prev + 1) % currentPhrases.length);
    setTranscribedText("");
    setScore(null);
    setFeedback("");
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
            <Link href="/voice-practice" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-indigo-900 text-white font-medium transition">
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

        {/* Database Status footer */}
        <div className="p-6 border-t border-indigo-900/60 bg-indigo-950/50">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <div className="text-xs text-indigo-200">
              <p className="font-semibold text-white">Speech API Ready</p>
              <p className="opacity-75">{supported ? "Chrome Speech Recognition" : "Simulated Audio Engine"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-y-auto p-8 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Voice Speaking Practice</h1>
          <p className="text-zinc-500 text-sm mt-1">Read the phrase aloud to test your pronunciation accuracy in real-time.</p>
        </div>

        {/* Level Filters */}
        <div className="flex gap-2">
          {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => (
            <button
              key={level}
              onClick={() => {
                setDifficulty(level);
                setPhraseIndex(0);
                setTranscribedText("");
                setScore(null);
                setFeedback("");
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                difficulty === level
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Practice Form Card */}
        <div className="w-full max-w-3xl bg-white rounded-2xl border border-zinc-200/80 shadow-sm p-8 space-y-8 dark:bg-zinc-900 dark:border-zinc-800">
          
          {/* Target phrase prompt */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Target Phrase:</p>
            <blockquote className="text-xl font-extrabold text-indigo-950 dark:text-indigo-200 border-l-4 border-indigo-500 pl-4 py-1 leading-relaxed">
              "{targetPhrase.text}"
            </blockquote>
          </div>

          {/* Interactive controls */}
          <div className="flex flex-col items-center justify-center space-y-6 py-6 border-y border-zinc-100 dark:border-zinc-800/80">
            {/* Realtime voice visualizer wave */}
            <div className="h-16 flex items-center justify-center gap-1 w-full max-w-xs relative">
              {isRecording ? (
                <>
                  <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: '40%', animationDuration: '0.6s' }} />
                  <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: '70%', animationDuration: '0.4s' }} />
                  <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: '100%', animationDuration: '0.5s' }} />
                  <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: '60%', animationDuration: '0.3s' }} />
                  <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: '80%', animationDuration: '0.7s' }} />
                  <span className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: '30%', animationDuration: '0.4s' }} />
                </>
              ) : (
                <div className="w-full h-0.5 bg-zinc-200 dark:bg-zinc-800" />
              )}
            </div>

            {/* Rec Button */}
            <div className="flex gap-4">
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg transition"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl text-sm transition border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-750"
              >
                Skip / Next Phrase
              </button>
            </div>
            <p className="text-xs text-zinc-400 font-medium">
              {isRecording ? "Listening... Speak now." : "Click the microphone button to start recording."}
            </p>
          </div>

          {/* Results panel */}
          {(transcribedText || score !== null || feedback) && (
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Score Circular gauge */}
                {score !== null && (
                  <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 border border-zinc-100 rounded-2xl dark:bg-zinc-950/20 dark:border-zinc-800/80">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Match Score</span>
                    <div className="relative w-20 h-20 flex items-center justify-center mt-2 shrink-0">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="32" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="6" fill="transparent" />
                        <circle cx="40" cy="40" r="32" className={score >= 90 ? "stroke-green-500" : score >= 70 ? "stroke-amber-500" : "stroke-red-500"} strokeWidth="6" fill="transparent" strokeDasharray={201} strokeDashoffset={201 - (201 * score) / 100} />
                      </svg>
                      <span className={`absolute text-lg font-extrabold ${score >= 90 ? "text-green-500" : score >= 70 ? "text-amber-500" : "text-red-500"}`}>{score}%</span>
                    </div>
                  </div>
                )}

                {/* Spoken transcription */}
                <div className="md:col-span-2 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Your Spoken Text:</p>
                  <p className="text-md font-bold text-zinc-850 dark:text-zinc-200 italic">
                    {transcribedText ? `"${transcribedText}"` : "No transcription captured..."}
                  </p>
                  {feedback && (
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 pt-2">{feedback}</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
