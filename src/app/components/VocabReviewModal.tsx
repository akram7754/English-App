"use client";

import React, { useState } from "react";
import { SpacedVocabItem } from "../../lib/learning-engine";
import { submitVocabReviewAction } from "../dashboard/actions";

interface VocabReviewModalProps {
  dueList: SpacedVocabItem[];
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function VocabReviewModal({
  dueList,
  isOpen,
  onClose,
  onRefresh,
}: VocabReviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  if (!isOpen) return null;

  const currentItem = dueList[currentIndex];
  const total = dueList.length;
  const isFinished = currentIndex >= total || total === 0;

  const handleReviewAnswer = async (remembered: boolean) => {
    if (!currentItem || submitting) return;
    setSubmitting(true);

    try {
      await submitVocabReviewAction(currentItem.vocabId, remembered);
      setCompletedCount((prev) => prev + 1);
      setShowAnswer(false);
      setCurrentIndex((prev) => prev + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
              🧠
            </span>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">
                Spaced Vocabulary Review
              </h3>
              <p className="text-xs text-zinc-400 font-medium">
                {isFinished ? "Session Completed" : `Word ${currentIndex + 1} of ${total}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center space-y-6 min-h-[300px]">
          {isFinished ? (
            <div className="space-y-4 py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto">
                🎉
              </div>
              <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Review Complete!</h4>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                You reviewed {completedCount} vocabulary items today. Your spaced repetition intervals have been automatically rescheduled!
              </p>
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md mt-2"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="w-full space-y-6">
              
              {/* Word & Mastery Level Badge */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 px-2 py-0.5 rounded">
                    Mastery Level {currentItem.masteryLevel}/5
                  </span>
                  {currentItem.partOfSpeech && (
                    <span className="text-[10px] italic text-zinc-400">
                      ({currentItem.partOfSpeech})
                    </span>
                  )}
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-indigo-950 dark:text-indigo-100 tracking-tight">
                  {currentItem.word}
                </h2>
              </div>

              {/* Reveal Card / Hidden Definition */}
              {showAnswer ? (
                <div className="p-6 bg-zinc-50 border border-zinc-200/80 rounded-2xl dark:bg-zinc-950/40 dark:border-zinc-800 space-y-3 text-left animate-fadeIn">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Definition:</span>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {currentItem.definition}
                    </p>
                  </div>
                  {currentItem.example && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Example Sentence:</span>
                      <p className="text-xs italic text-zinc-600 dark:text-zinc-400 mt-0.5">
                        "{currentItem.example}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="w-full py-12 border-2 border-dashed border-zinc-200 hover:border-indigo-400 rounded-2xl text-zinc-400 hover:text-indigo-600 dark:border-zinc-800 dark:hover:border-indigo-600 transition flex flex-col items-center justify-center gap-2"
                >
                  <span className="text-2xl">👀</span>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Click to Reveal Meaning & Example
                  </span>
                </button>
              )}

              {/* Action Buttons */}
              {showAnswer && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    disabled={submitting}
                    onClick={() => handleReviewAnswer(false)}
                    className="py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-bold rounded-2xl text-xs transition border border-amber-200 dark:border-amber-900 flex items-center justify-center gap-2"
                  >
                    <span>🔄</span>
                    <span>Needs Practice (1d)</span>
                  </button>

                  <button
                    disabled={submitting}
                    onClick={() => handleReviewAnswer(true)}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2"
                  >
                    <span>👍</span>
                    <span>Remembered!</span>
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
