"use client";

import React, { useState, useEffect } from "react";
import {
  containsArabic,
  isRtlText,
  getRomanizedPronunciation,
  cleanRomanPronunciation,
} from "../../lib/transliteration";
import { getLanguageByCode } from "../../lib/languages";
import { initTTS, resolveTTSLocale, speakMultilingualText } from "../../lib/tts";

interface MultilingualMessageContentProps {
  text: string;
  pronunciation?: string;
  nativeExplanation?: string;
  targetLangCode?: string; // e.g. "ar", "en", "hi", "fr", "es", "de"
  sourceLangCode?: string; // e.g. "hi", "en", "ar", "fr", "es", "de"
  targetLangName?: string;
  sourceLangName?: string;
  onSpeak?: (textToSpeak: string, langLocale?: string) => void;
  isSpeaking?: boolean;
  ttsLocale?: string;
  variant?: "dark" | "light"; // "dark" for voice conversation (#121128), "light" for white bubbles
}

export default function MultilingualMessageContent({
  text,
  pronunciation,
  nativeExplanation,
  targetLangCode = "en",
  sourceLangCode = "hi",
  targetLangName,
  sourceLangName,
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

  const tgtConfig = getLanguageByCode(targetLangCode);
  const srcConfig = getLanguageByCode(sourceLangCode);
  const resolvedTargetName = targetLangName || tgtConfig.name;
  const resolvedSourceName = sourceLangName || srcConfig.name;

  // 1. Check if structured parts are already provided or if we should parse raw text
  let originalText = (text || "").trim();
  let readLine = (pronunciation || "").trim();
  let nativeLine = (nativeExplanation || "").trim();

  // If text itself has markdown or embedded "Read:" / "Roman pronunciation:" and Language/Meaning sections:
  if (!readLine && /(?:^|\n)\s*(?:🔊\s*)?(?:read|roman\s*pronunciation)\s*:/iu.test(originalText)) {
    const lines = originalText.split(/\r?\n/);
    const textLines: string[] = [];
    let foundRead = false;
    let foundNative = false;
    const nativeLines: string[] = [];

    const nativeHeaderRegex = new RegExp(
      `^(?:\\*{1,2}|🔊\\s*)*(?:${resolvedSourceName.toLowerCase()}|hindi|arabic|french|german|spanish|english|meaning|native|translation)\\s*:\\s*(?:\\*{1,2})?\\s*`,
      "iu"
    );

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (/^(?:\*{1,2}|🔊\s*)*(?:read|roman\s*pronunciation)\s*:\s*(?:\*{1,2})?\s*/iu.test(trimmedLine)) {
        foundRead = true;
        readLine = trimmedLine.replace(/^(?:\*{1,2}|🔊\s*)*(?:read|roman\s*pronunciation)\s*:\s*(?:\*{1,2})?\s*/iu, "").trim();
      } else if (nativeHeaderRegex.test(trimmedLine)) {
        foundNative = true;
        const remainder = trimmedLine.replace(nativeHeaderRegex, "").trim();
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

  // 2. Guarantee Roman pronunciation across ALL languages
  if (!readLine) {
    readLine = getRomanizedPronunciation(originalText, targetLangCode);
  } else {
    readLine = cleanRomanPronunciation(readLine, originalText);
  }

  // 3. Language & Script Analysis
  const isTargetRtl = isRtlText(originalText) || targetLangCode === "ar";
  const isNativeRtl = isRtlText(nativeLine) || sourceLangCode === "ar";

  // Dynamic source language label (e.g. "Hindi:", "French:", "Arabic:", etc.)
  const nativeLabel = `${resolvedSourceName}:`;

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

  return (
    <div className="space-y-2.5 py-0.5">
      {/* 1. TARGET LANGUAGE ORIGINAL SCRIPT */}
      <div className="w-full">
        <p
          dir={isTargetRtl ? "rtl" : "ltr"}
          className={`font-semibold leading-relaxed whitespace-pre-line ${
            isTargetRtl
              ? "text-base md:text-lg text-right font-arabic tracking-wide select-text"
              : "text-xs md:text-sm text-left select-text"
          } ${variant === "dark" ? "text-white" : "text-zinc-900 dark:text-zinc-100"}`}
        >
          {originalText}
        </p>
      </div>

      {/* 2. ROMAN PRONUNCIATION ("Read:") + SPEAKER BUTTON */}
      {readLine && (
        <div dir="ltr" className="space-y-1.5 pt-0.5 text-left">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeak}
              aria-label={`Listen to pronunciation of original ${resolvedTargetName} text`}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 border ${
                currentlyPlaying
                  ? "bg-indigo-600 text-white border-indigo-500 animate-pulse shadow-sm"
                  : variant === "dark"
                  ? "bg-[#181635] hover:bg-[#232049] text-indigo-300 border-[#2f2b60] hover:text-white"
                  : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900/60"
              }`}
              title={`Listen to original ${resolvedTargetName} pronunciation`}
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

      {/* 3. SOURCE LANGUAGE MEANING / EXPLANATION */}
      {nativeLine && (
        <div
          dir={isNativeRtl ? "rtl" : "ltr"}
          className={`pt-1.5 border-t ${isNativeRtl ? "text-right" : "text-left"} ${
            variant === "dark" ? "border-white/10" : "border-zinc-200/80 dark:border-zinc-800/80"
          }`}
        >
          <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-0.5">
            {nativeLabel}
          </p>
          <p
            className={`text-xs md:text-sm leading-relaxed ${
              isNativeRtl ? "font-arabic" : "font-sans"
            } select-text whitespace-pre-line ${
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
