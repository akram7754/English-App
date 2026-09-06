"use client";

import React, { useState } from "react";
import { SUPPORTED_LANGUAGES, CONVERSATION_TOPICS } from "../../../lib/languages";

export default function LanguageSettingsView() {
  const [activeLanguages, setActiveLanguages] = useState<Record<string, boolean>>({
    "en-US": true,
    "hi-IN": true,
    "ar-SA": true,
    "fr-FR": true,
    "es-ES": true,
    "de-DE": true,
  });

  const [activeTopics, setActiveTopics] = useState<Record<string, boolean>>({
    daily: true,
    interview: true,
    travel: true,
    restaurant: true,
    business: true,
    shopping: true,
    academic: true,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleLanguage = (code: string) => {
    setActiveLanguages((prev) => {
      const next = { ...prev, [code]: !prev[code] };
      setToastMessage(`Updated language availability for ${code}`);
      setTimeout(() => setToastMessage(null), 3000);
      return next;
    });
  };

  const toggleTopic = (id: string) => {
    setActiveTopics((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      setToastMessage(`Updated conversation topic setting: ${id}`);
      setTimeout(() => setToastMessage(null), 3000);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-purple-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Supported Languages Matrix */}
      <div className="p-6 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Supported Language Matrix</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                6 Active Locales
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Configure Web Speech API recognition, synthesis, and Gemini translation pipelines
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isEnabled = activeLanguages[lang.code] ?? true;

            return (
              <div
                key={lang.code}
                className="flex flex-col justify-between p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {lang.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {lang.nativeName} ({lang.code})
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleLanguage(lang.code)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? "bg-purple-600" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Speech Recognition (STT):</span>
                      <span className="text-emerald-400 font-semibold">Active</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Voice Synthesis (TTS):</span>
                      <span className="text-emerald-400 font-semibold">Active</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Gemini 2.5 Dialogue:</span>
                      <span className="text-purple-400 font-semibold">Supported</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversation Topics Configuration */}
      <div className="p-6 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>AI Voice Conversation Topics</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              7 Topics
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Presets available to students in the AI Voice Tutor interface
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {CONVERSATION_TOPICS.map((topic) => {
            const isEnabled = activeTopics[topic.id] ?? true;

            return (
              <div
                key={topic.id}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl p-1.5 rounded-lg bg-slate-800">{topic.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{topic.title}</p>
                    <span className="text-[10px] text-slate-400 uppercase">Scenario</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleTopic(topic.id)}
                  className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isEnabled ? "bg-cyan-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? "translate-x-3" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
