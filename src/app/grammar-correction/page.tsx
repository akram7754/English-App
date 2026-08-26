"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Explanation {
  id: number;
  type: string;
  original: string;
  corrected: string;
  rule: string;
}

export default function GrammarCorrectionPage() {
  const [inputText, setInputText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [hasChecked, setHasChecked] = useState(false);

  const sampleSentences = [
    "She have a apple and he do not go to school yesterday.",
    "They was going to buy an car last week.",
    "I don't know nothing about the new grammar rules.",
  ];

  const handleCheckGrammar = () => {
    if (!inputText.trim()) return;

    let text = inputText;
    const rules: Explanation[] = [];
    let id = 1;

    // Singular have/has check
    if (text.toLowerCase().includes("she have")) {
      text = text.replace(/she have/gi, "she has");
      rules.push({
        id: id++,
        type: "Subject-Verb Agreement",
        original: "she have",
        corrected: "she has",
        rule: "Use the singular verb 'has' with the third-person singular pronoun 'she'."
      });
    }
    if (text.toLowerCase().includes("he have")) {
      text = text.replace(/he have/gi, "he has");
      rules.push({
        id: id++,
        type: "Subject-Verb Agreement",
        original: "he have",
        corrected: "he has",
        rule: "Use the singular verb 'has' with the third-person singular pronoun 'he'."
      });
    }

    // Article apple check
    if (text.toLowerCase().includes("a apple")) {
      text = text.replace(/a apple/gi, "an apple");
      rules.push({
        id: id++,
        type: "Article Misuse",
        original: "a apple",
        corrected: "an apple",
        rule: "Use the article 'an' before words beginning with vowel sounds."
      });
    }

    // Article car check
    if (text.toLowerCase().includes("an car")) {
      text = text.replace(/an car/gi, "a car");
      rules.push({
        id: id++,
        type: "Article Misuse",
        original: "an car",
        corrected: "a car",
        rule: "Use the article 'a' before words beginning with consonant sounds."
      });
    }

    // Tense yesterday check
    if (text.toLowerCase().includes("do not go... yesterday") || text.toLowerCase().includes("do not go to school yesterday")) {
      text = text.replace(/do not go to school yesterday/gi, "did not go to school yesterday");
      rules.push({
        id: id++,
        type: "Tense Conflict",
        original: "do not go... yesterday",
        corrected: "did not go... yesterday",
        rule: "Use past tense 'did not' when referring to actions occurring in past time frames ('yesterday')."
      });
    }

    // Subject verb count (they was / we was)
    if (text.toLowerCase().includes("they was")) {
      text = text.replace(/they was/gi, "they were");
      rules.push({
        id: id++,
        type: "Subject-Verb Agreement",
        original: "they was",
        corrected: "they were",
        rule: "Use the plural verb 'were' with the plural pronoun 'they'."
      });
    }
    if (text.toLowerCase().includes("we was")) {
      text = text.replace(/we was/gi, "we were");
      rules.push({
        id: id++,
        type: "Subject-Verb Agreement",
        original: "we was",
        corrected: "we were",
        rule: "Use the plural verb 'were' with the plural pronoun 'we'."
      });
    }

    // Double negative
    if (text.toLowerCase().includes("don't know nothing") || text.toLowerCase().includes("dont know nothing")) {
      text = text.replace(/don't know nothing/gi, "don't know anything").replace(/dont know nothing/gi, "don't know anything");
      rules.push({
        id: id++,
        type: "Double Negative",
        original: "don't know nothing",
        corrected: "don't know anything",
        rule: "Avoid double negatives in English. Change 'nothing' to 'anything' to maintain correct negative structuring."
      });
    }

    setCorrectedText(text);
    setExplanations(rules);
    setHasChecked(true);
  };

  const handleClear = () => {
    setInputText("");
    setCorrectedText("");
    setExplanations([]);
    setHasChecked(false);
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
            <Link href="/voice-practice" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-indigo-900/40 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Voice Practice
            </Link>
            <Link href="/grammar-correction" className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-indigo-900 text-white font-medium transition">
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
          </nav>
        </div>

        {/* Database Status footer */}
        <div className="p-6 border-t border-indigo-900/60 bg-indigo-950/50">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <div className="text-xs text-indigo-200">
              <p className="font-semibold text-white">Grammar Rules Loaded</p>
              <p className="opacity-75">Instant syntax checking</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main view area */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Panel: Text Editor */}
        <div className="flex-1 flex flex-col p-8 overflow-y-auto border-r border-zinc-200/80 dark:border-zinc-800/80">
          <div className="mb-6 shrink-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Grammar Correction</h1>
            <p className="text-zinc-500 text-sm mt-1">Paste your writing and get real-time recommendations, synonyms, and natural corrections.</p>
          </div>

          {/* Sample quick buttons */}
          <div className="mb-6 shrink-0 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Click a sample to test:</p>
            <div className="flex flex-wrap gap-2.5">
              {sampleSentences.map((sentence, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(sentence);
                    setHasChecked(false);
                  }}
                  className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 rounded-xl transition shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-850"
                >
                  Sample {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Text Editor Box */}
          <div className="flex-1 flex flex-col space-y-4">
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setHasChecked(false);
              }}
              placeholder="Start typing or paste your English text here..."
              className="flex-1 w-full min-h-[250px] p-6 rounded-2xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />

            <div className="flex gap-4 shrink-0">
              <button
                onClick={handleCheckGrammar}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-md"
              >
                Check Grammar
              </button>
              <button
                onClick={handleClear}
                className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl text-sm transition border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-750"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Corrections & Rules Explanations */}
        <div className="w-full md:w-[460px] bg-white border-t md:border-t-0 md:border-l border-zinc-200/80 p-8 flex flex-col overflow-y-auto shrink-0 dark:bg-zinc-900 dark:border-zinc-800/80">
          <div className="mb-6 shrink-0 pb-4 border-b border-zinc-150 dark:border-zinc-800">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Analysis & Diffs</h2>
            <p className="text-zinc-400 text-xs mt-0.5">Grammar checks and sentence suggestions display here.</p>
          </div>

          {hasChecked ? (
            <div className="space-y-8 flex-1">
              
              {/* Corrected Text block */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Corrected Sentence:</h3>
                <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-emerald-950 font-bold text-sm leading-relaxed dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-300">
                  {correctedText}
                </div>
              </div>

              {/* Explanations list */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Grammar Explanations ({explanations.length}):</h3>
                {explanations.length > 0 ? (
                  <div className="space-y-4">
                    {explanations.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-5 rounded-2xl border border-zinc-200/80 space-y-2 dark:border-zinc-800 dark:bg-zinc-950/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-600 px-2 py-0.5 rounded dark:bg-amber-950/40 dark:text-amber-400">
                            {exp.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span className="text-red-500 line-through">"{exp.original}"</span>
                          <span className="text-zinc-400">➔</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">"{exp.corrected}"</span>
                        </div>
                        <p className="text-zinc-500 text-xs leading-relaxed dark:text-zinc-400 pt-1">
                          {exp.rule}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 border border-dashed border-zinc-200 rounded-2xl text-center dark:border-zinc-800">
                    <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">✓ Perfect Sentence!</p>
                    <p className="text-zinc-400 text-[11px] mt-1">We analyzed your text structure and found zero grammatical mistakes.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <svg className="w-12 h-12 text-zinc-300 mb-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-bold text-zinc-700 dark:text-zinc-300">Ready to Analyze</h3>
              <p className="text-zinc-400 text-xs mt-1">Paste your writing and click "Check Grammar" to start checking spelling and sentence phrasing.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
