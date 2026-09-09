"use client";

import React, { useState, useEffect } from "react";
import { containsArabic, isRtlText, getRomanizedPronunciation } from "../../lib/transliteration";
import { initTTS, resolveTTSLocale, speakMultilingualText } from "../../lib/tts";

interface MultilingualMessageContentProps {
  text: string;
  pronunciation?: string;
  nativeExplanation?: string;
  targetLangCode?: string; // e.g. "ar", "en", "hi", "fr", "es", "de"
  sourceLangCode?: string; // e.g. "hi", "en"
  onSpeak?: (textToSpeak: string, langLocale?: string) => void;
  isSpeaking?: boolean;
  ttsLocale?: string; // e.g. "ar-SA"
  variant?: "dark" | "light"; // "dark" for voice conversation (#121128), "light" for white bubbles
}

export default function MultilingualMessageContent({
  text,
  pronunciation,
  nativeExplanation,
  targetLangCode = "en",
  sourceLangCode = "hi",
  onSpeak,
  isSpeaking = false,
  ttsLocale,
  variant = "dark",
}: MultilingualMessageContentProps) {
  const [isPlayingLocal, setIsPlayingLocal] = useState(false);
  const [ttsError, setTtsError] = useState<string>("");

  useEffect(() => {
    initTTS();
  }, []);

  // 1. Check if structured parts are already provided or if we should parse raw text
  let originalText = text.trim();
  let readLine = pronunciation?.trim() || "";
  let nativeLine = nativeExplanation?.trim() || "";

  // If text itself has markdown or embedded "Read:" and "Hindi:"/"Meaning:" sections:
  if (!readLine && /(?:^|\n)\s*(?:🔊\s*)?read\s*:/iu.test(originalText)) {
    const lines = originalText.split(/\r?\n/);
    const textLines: string[] = [];
    let foundRead = false;
    let foundNative = false;
    const nativeLines: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (/^(?:\*{1,2}|🔊\s*)*read\s*:\s*(?:\*{1,2})?\s*/iu.test(trimmedLine)) {
        foundRead = true;
        readLine = trimmedLine.replace(/^(?:\*{1,2}|🔊\s*)*read\s*:\s*(?:\*{1,2})?\s*/iu, "").trim();
      } else if (/^(?:\*{1,2})*(?:hindi|meaning|native|translation|english)\s*:\s*(?:\*{1,2})?\s*/iu.test(trimmedLine)) {
        foundNative = true;
        const remainder = trimmedLine.replace(/^(?:\*{1,2})*(?:hindi|meaning|native|translation|english)\s*:\s*(?:\*{1,2})?\s*/iu, "").trim();
        if (remainder) nativeLines.push(remainder);
      } else if (foundNative) {
        if (trimmedLine) nativeLines.push(trimmedLine);
      } else if (!foundRead) {
        textLines.push(line);
      }
    }

    if (foundRead || foundNative) {
      originalText = textLines.join("\n").trim();
      if (nativeLines.length > 0 && !nativeLine) {
        nativeLine = nativeLines.join("\n").trim();
      }
    }
  }

  // 2. Language & Script Analysis
  const hasArabic = containsArabic(originalText) || targetLangCode === "ar";
  const isRtl = isRtlText(originalText) || targetLangCode === "ar";

  // If target is Arabic or non-Latin script and no readLine provided, generate Roman pronunciation
  if (!readLine && hasArabic) {
    readLine = getRomanizedPronunciation(originalText, "ar");
  }

  // Determine TTS locale (defaults to ar-SA if Arabic, otherwise targetLangCode)
  const resolvedLocale =
    ttsLocale || (hasArabic ? "ar-SA" : targetLangCode === "hi" ? "hi-IN" : targetLangCode === "fr" ? "fr-FR" : "en-US");

  // Determine native label (e.g. "Hindi:" if source is Hindi)
  const nativeLabel = sourceLangCode === "hi" || /[\u0900-\u097F]/.test(nativeLine) ? "Hindi:" : "Meaning:";

  // Handle TTS playback for original target text
  const handleSpeak = () => {
    setTtsError("");
    const localeToUse = resolveTTSLocale(originalText, targetLangCode, ttsLocale);

    speakMultilingualText(originalText, localeToUse, {
      onStart: () => {
        setIsPlayingLocal(true);
        onSpeak?.(originalText, localeToUse);
      },
      onEnd: () => {
        setIsPlayingLocal(false);
      },
      onError: (err) => {
        setIsPlayingLocal(false);
        setTtsError(err);
        setTimeout(() => setTtsError(""), 7000);
      },
    });
  };

  const currentlyPlaying = isSpeaking || isPlayingLocal;

  // Render standard Latin response if no non-Latin pronunciation needed
  const isMultilingualStructured = Boolean(readLine || (hasArabic && nativeLine));

  if (!isMultilingualStructured) {
    return (
      <div className="space-y-1.5">
        <p className="text-xs md:text-sm font-semibold leading-relaxed whitespace-pre-line">
          {originalText}
        </p>
        {nativeLine && (
          <p className={`text-xs ${variant === "dark" ? "text-zinc-400" : "text-zinc-500"} font-sans leading-relaxed`}>
            {nativeLine}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2.5 py-0.5">
      {/* 1. ORIGINAL TARGET-LANGUAGE TEXT */}
      <div className="w-full">
        <p
          dir={isRtl ? "rtl" : "ltr"}
          className={`font-semibold leading-relaxed whitespace-pre-line ${
            isRtl
              ? "text-base md:text-lg text-right font-arabic tracking-wide select-text"
              : "text-xs md:text-sm text-left select-text"
          } ${variant === "dark" ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}
        >
          {originalText}
        </p>
      </div>

      {/* 2. "READ:" PRONUNCIATION IN ROMAN/LATIN LETTERS + SPEAKER BUTTON */}
      {readLine && (
        <div dir="ltr" className="space-y-1.5 pt-0.5 text-left">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeak}
              aria-label="Listen to pronunciation of original Arabic text"
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 border ${
                currentlyPlaying
                  ? "bg-indigo-600 text-white border-indigo-500 animate-pulse shadow-sm"
                  : variant === "dark"
                  ? "bg-[#181635] hover:bg-[#232049] text-indigo-300 border-[#2f2b60] hover:text-white"
                  : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900/60"
              }`}
              title="Listen to original Arabic pronunciation"
            >
              <span className="text-sm">🔊</span>
              <span className="font-bold">Read:</span>
            </button>
            <span
              className={`text-xs md:text-sm font-medium tracking-wide select-text ${
                variant === "dark" ? "text-indigo-200" : "text-indigo-900 dark:text-indigo-200"
              }`}
            >
              {readLine}
            </span>
          </div>
          {ttsError && (
            <p className="text-[11px] text-amber-300 font-normal bg-amber-500/10 border border-amber-500/20 rounded-md px-2.5 py-1 leading-relaxed" role="alert">
              ℹ️ {ttsError}
            </p>
          )}
        </div>
      )}

      {/* 3. HINDI / NATIVE-LANGUAGE MEANING */}
      {nativeLine && (
        <div dir="ltr" className={`pt-1.5 border-t text-left ${variant === "dark" ? "border-white/10" : "border-zinc-200/80 dark:border-zinc-800/80"}`}>
          <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-0.5">
            {nativeLabel}
          </p>
          <p
            className={`text-xs md:text-sm leading-relaxed font-sans select-text whitespace-pre-line ${
              variant === "dark" ? "text-zinc-300" : "text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {nativeLine}
          </p>
        </div>
      )}
    </div>
  );
}
