"use client";

import { SUPPORTED_LANGUAGES, getLanguageByCode } from "./languages";
import { containsArabic } from "./transliteration";

// Keep active utterance and audio in memory to manage playback lifecycle cleanly
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeAudio: HTMLAudioElement | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let isVoicesListenerAdded = false;

/**
 * Initializes voice caching and listens for the asynchronous voiceschanged event in browsers.
 */
export function initTTS(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  try {
    const updateVoices = () => {
      try {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
          cachedVoices = v;
        }
      } catch {
        // ignore voice retrieval restrictions
      }
    };

    updateVoices();
    if (!isVoicesListenerAdded) {
      if (typeof window.speechSynthesis.addEventListener === "function") {
        window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
        isVoicesListenerAdded = true;
      } else if ("onvoiceschanged" in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
        isVoicesListenerAdded = true;
      }
    }
  } catch (err) {
    console.warn("[TTS] Voice initialization warning:", err);
  }
}

/**
 * Determines the appropriate BCP-47 TTS locale for a given text and target language.
 */
export function resolveTTSLocale(
  text: string,
  preferredLangCode?: string,
  explicitLocale?: string
): string {
  const cleanText = text?.trim() || "";

  // 1. Script-based detection (highest priority for non-Latin script correctness)
  if (containsArabic(cleanText)) {
    return "ar-SA";
  }
  if (/[\u0900-\u097F]/.test(cleanText)) {
    return "hi-IN";
  }

  // 2. Explicit locale if provided and text matches Latin script
  if (explicitLocale) {
    return explicitLocale;
  }

  // 3. Language code detection from canonical SUPPORTED_LANGUAGES registry
  if (preferredLangCode) {
    const matched = getLanguageByCode(preferredLangCode);
    if (matched?.ttsLang) {
      return matched.ttsLang;
    }
  }

  return "en-US";
}

/**
 * Finds the best matching SpeechSynthesisVoice for a target BCP-47 locale.
 * Returns undefined if no compatible voice is available on this device/browser.
 * For non-English languages (especially Arabic), NEVER returns an incompatible voice.
 */
export function findBestVoice(targetLocale: string): SpeechSynthesisVoice | undefined {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;

  let voices: SpeechSynthesisVoice[] = [];
  try {
    const liveVoices = window.speechSynthesis.getVoices();
    if (liveVoices && liveVoices.length > 0) {
      voices = liveVoices;
      cachedVoices = liveVoices;
    } else {
      voices = cachedVoices;
    }
  } catch {
    voices = cachedVoices;
  }

  if (!voices || voices.length === 0) return undefined;

  const normalizedTarget = targetLocale.toLowerCase().replace("_", "-");
  const langPrefix = normalizedTarget.split("-")[0];

  // Specific Arabic voice matching hierarchy (Requirements 4, 5, 6, 7)
  if (langPrefix === "ar") {
    // 1. Check exact ar-SA
    const exactArSa = voices.find(
      (v) => (v.lang || "").toLowerCase().replace("_", "-") === "ar-sa"
    );
    if (exactArSa) return exactArSa;

    // 2. Check generic "ar"
    const genericAr = voices.find(
      (v) => (v.lang || "").toLowerCase().replace("_", "-") === "ar"
    );
    if (genericAr) return genericAr;

    // 3. Check other ar-* locales (e.g. ar-EG, ar-AE, ar-QA, ar-KW, ar-DZ, ar-MA, etc.)
    const anyArLocale = voices.find((v) =>
      (v.lang || "").toLowerCase().replace("_", "-").startsWith("ar-")
    );
    if (anyArLocale) return anyArLocale;

    // 4. Check name contains Arabic or العربية
    const arabicNameVoice = voices.find((v) => {
      const n = (v.name || "").toLowerCase();
      return n.includes("arabic") || (v.name || "").includes("العربية");
    });
    if (arabicNameVoice) return arabicNameVoice;

    // If no Arabic voice exists on the device/browser, return undefined!
    // Never assign an English or other incompatible voice to Arabic text.
    return undefined;
  }

  // 1. Exact locale match (e.g. "hi-IN", "fr-FR", "es-ES", "de-DE", "en-US")
  const exactMatch = voices.find(
    (v) => (v.lang || "").toLowerCase().replace("_", "-") === normalizedTarget
  );
  if (exactMatch) return exactMatch;

  // 2. Language prefix match
  const prefixMatch = voices.find((v) =>
    (v.lang || "").toLowerCase().replace("_", "-").startsWith(langPrefix)
  );
  if (prefixMatch) return prefixMatch;

  // 3. Name-based match
  const canonicalLang = SUPPORTED_LANGUAGES.find(
    (l) => l.ttsLang.toLowerCase().startsWith(langPrefix) || l.code === langPrefix
  );
  if (canonicalLang) {
    const nameMatch = voices.find(
      (v) =>
        (v.name || "").toLowerCase().includes(canonicalLang.name.toLowerCase()) ||
        (v.name || "").toLowerCase().includes(canonicalLang.nativeName.toLowerCase())
    );
    if (nameMatch) return nameMatch;
  }

  // For English, safe fallback to default voice or voices[0]
  if (langPrefix === "en") {
    return voices.find((v) => v.default) || voices[0];
  }

  // For other non-English languages, return undefined so browser native synthesis is not forced to English
  return undefined;
}

export interface PlayTTSOptions {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (errorMsg: string) => void;
}

/**
 * Robust, cross-browser, multilingual Text-To-Speech playback with safe Arabic support.
 * When a native client-side voice is missing on the user's OS/device, seamlessly falls back
 * to server-streamed native audio so learners always hear crystal-clear pronunciation.
 */
export function speakMultilingualText(
  text: string,
  langLocale: string = "en-US",
  options: PlayTTSOptions = {}
): boolean {
  const cleanText = text?.trim();
  if (!cleanText) return false;

  const isArabic = containsArabic(cleanText) || langLocale.toLowerCase().startsWith("ar");
  const finalLocale = isArabic ? "ar-SA" : langLocale;

  // 1. Cancel previous speaking (both SpeechSynthesis and HTMLAudio) to prevent overlapping audio
  stopTTS();

  // Helper for playing via HTML Audio streaming fallback
  const playViaAudioFallback = (): boolean => {
    if (typeof window === "undefined" || typeof Audio === "undefined") {
      const errorMsg = isArabic
        ? "Arabic voice is not available on this device/browser. You can still use the Roman pronunciation guide."
        : "Text-to-speech is not supported in this browser.";
      options.onError?.(errorMsg);
      options.onEnd?.();
      return false;
    }

    try {
      const langCode = finalLocale.split("-")[0];
      const sanitizedAudioText = cleanText
        .replace(/[\r\n]+/g, " ")
        .replace(/[*_~`#]/g, "")
        .trim()
        .slice(0, 300);
      const audioUrl = `/api/tts?text=${encodeURIComponent(sanitizedAudioText)}&lang=${langCode}`;
      const audio = new Audio(audioUrl);
      if (options.rate && options.rate > 0) {
        audio.playbackRate = options.rate;
      }

      audio.onplay = () => {
        options.onStart?.();
      };

      audio.onended = () => {
        activeAudio = null;
        options.onEnd?.();
      };

      audio.onerror = (e) => {
        console.warn("[TTS Audio Fallback Error]:", e);
        activeAudio = null;
        const errorMsg = isArabic
          ? "Arabic voice is not available on this device/browser. You can still use the Roman pronunciation guide."
          : "Unable to play pronunciation. Please try again.";
        options.onError?.(errorMsg);
        options.onEnd?.();
      };

      activeAudio = audio;
      audio.play().catch((playErr) => {
        console.warn("[TTS Audio Play Failed]:", playErr);
        activeAudio = null;
        const errorMsg = isArabic
          ? "Arabic voice is not available on this device/browser. You can still use the Roman pronunciation guide."
          : "Unable to play pronunciation. Please try again.";
        options.onError?.(errorMsg);
        options.onEnd?.();
      });

      return true;
    } catch (fallbackErr) {
      console.warn("[TTS Fallback Exception]:", fallbackErr);
      activeAudio = null;
      const errorMsg = isArabic
        ? "Arabic voice is not available on this device/browser. You can still use the Roman pronunciation guide."
        : "Unable to play pronunciation. Please try again.";
      options.onError?.(errorMsg);
      options.onEnd?.();
      return false;
    }
  };

  const hasSpeechSynthesis = typeof window !== "undefined" && "speechSynthesis" in window;

  if (!hasSpeechSynthesis) {
    return playViaAudioFallback();
  }

  try {
    // Resume queue in case of Chromium paused state bug
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Refresh voice list
    let voices: SpeechSynthesisVoice[] = [];
    try {
      const liveVoices = window.speechSynthesis.getVoices();
      if (liveVoices && liveVoices.length > 0) {
        voices = liveVoices;
        cachedVoices = liveVoices;
      } else {
        voices = cachedVoices;
      }
    } catch {
      voices = cachedVoices;
    }

    // Find matching voice (Requirements 4, 5, 6, 7)
    const voice = findBestVoice(finalLocale);

    // Safe Development Diagnostics (Requirement 9)
    if (isArabic) {
      console.log("[TTS Diagnostics] Total available speech voices:", voices.length);
      console.log("[TTS Diagnostics] Arabic voice found:", Boolean(voice));
      console.log(
        "[TTS Diagnostics] Selected voice language:",
        voice ? voice.lang : "none (using high-fidelity audio stream)"
      );
      console.log(
        "[TTS Diagnostics] Selected voice name:",
        voice ? voice.name : "Server Audio Stream"
      );
    }

    // If Arabic or non-English language has NO voice installed on this OS/device, seamlessly stream real audio!
    if (!voice && (isArabic || !finalLocale.toLowerCase().startsWith("en"))) {
      return playViaAudioFallback();
    }

    // Create fresh SpeechSynthesisUtterance (Requirement 11)
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Set utterance.lang (Requirement 12)
    utterance.lang = finalLocale;
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;

    // If matching voice exists, assign it (Requirement 13)
    if (voice) {
      utterance.voice = voice;
    }

    let hasStarted = false;
    const startTime = Date.now();

    utterance.onstart = () => {
      hasStarted = true;
      options.onStart?.();
    };

    utterance.onend = () => {
      activeUtterance = null;
      const elapsed = Date.now() - startTime;
      // If Arabic and no Arabic voice was found, and speech finished immediately (< 80ms) without genuinely starting,
      // fallback to audio stream!
      if (isArabic && !voice && (!hasStarted || elapsed < 80) && cleanText.length > 2) {
        console.warn("[TTS] Speech ended immediately without audio; triggering audio stream fallback.");
        playViaAudioFallback();
      } else {
        options.onEnd?.();
      }
    };

    utterance.onerror = (event) => {
      activeUtterance = null;
      // Do not report error if speech was intentionally cancelled or interrupted by rapid clicks
      if (event.error !== "canceled" && event.error !== "interrupted") {
        console.warn("[TTS] Speech playback error, falling back to audio stream:", event.error);
        playViaAudioFallback();
      } else {
        options.onEnd?.();
      }
    };

    // Store in module variable to prevent Chromium V8 garbage collection bug
    activeUtterance = utterance;

    window.speechSynthesis.speak(utterance);

    // Unpause queue if paused in Chromium/Android Chrome
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    return true;
  } catch (err) {
    console.warn("[TTS] Speech execution failed, falling back to audio stream:", err);
    return playViaAudioFallback();
  }
}

/**
 * Stops any active speech synthesis or audio playback cleanly.
 */
export function stopTTS(): void {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // ignore
    }
    activeAudio = null;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
      activeUtterance = null;
    } catch {
      // ignore cancel error
    }
  }
}

/**
 * Returns the currently active utterance in memory (or null if idle).
 */
export function getActiveUtterance(): SpeechSynthesisUtterance | null {
  return activeUtterance;
}

/**
 * Returns the currently active HTMLAudioElement (or null if idle).
 */
export function getActiveAudio(): HTMLAudioElement | null {
  return activeAudio;
}
