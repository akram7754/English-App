"use client";

import React, { useState } from "react";
import { learnVocabularyAction } from "./lessons/actions";

interface WordOfTheDayProps {
  word: string;
  definition: string;
  partOfSpeech: string;
  example: string;
  initialSaved: boolean;
}

export default function WordOfTheDay({
  word,
  definition,
  partOfSpeech,
  example,
  initialSaved,
}: WordOfTheDayProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (saved || loading) return;
    setLoading(true);
    const res = await learnVocabularyAction(word);
    setLoading(false);
    if (res.success) {
      setSaved(true);
    } else {
      alert(res.error || "Failed to save vocabulary.");
    }
  };

  const handlePronounce = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between dark:bg-zinc-900 dark:border-zinc-800">
      <div className="space-y-4">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center dark:bg-emerald-950/30 dark:text-emerald-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Word of the Day</h3>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full dark:bg-emerald-950/30 dark:text-emerald-400">Vocabulary</span>
          </div>
          <p className="font-bold text-xl text-zinc-800 mt-2 dark:text-zinc-200">
            {word} <span className="text-sm font-normal text-zinc-400">({partOfSpeech})</span>
          </p>
          <p className="text-zinc-500 text-sm mt-1">{definition}</p>
          <p className="text-xs text-zinc-400 italic mt-2">"{example}"</p>
        </div>
      </div>

      <div className="flex gap-4 mt-6 text-sm font-medium border-t border-zinc-100 pt-3 dark:border-zinc-800/80 shrink-0">
        <button
          onClick={handlePronounce}
          className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 focus:outline-none"
        >
          Pronounce
        </button>
        <span className="text-zinc-200 dark:text-zinc-700">|</span>
        <button
          disabled={saved || loading}
          onClick={handleSave}
          className={`${
            saved
              ? "text-emerald-600 font-semibold cursor-default"
              : "text-zinc-500 hover:text-zinc-650 dark:text-zinc-400 dark:hover:text-zinc-300"
          } focus:outline-none`}
        >
          {loading ? "Saving..." : saved ? "Saved ✓" : "Save to list"}
        </button>
      </div>
    </div>
  );
}
