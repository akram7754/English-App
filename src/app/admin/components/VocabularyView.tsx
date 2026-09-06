"use client";

import React, { useState, useMemo } from "react";
import { deleteVocabularyAction } from "../actions";

interface VocabularyItem {
  id: number;
  word: string;
  definition: string;
  partOfSpeech?: string | null;
  example?: string | null;
  createdAt: string;
}

interface VocabularyViewProps {
  vocabularies: VocabularyItem[];
  onAddVocab: () => void;
  onEditVocab: (vocab: VocabularyItem) => void;
  onVocabDeleted: (vocabId: number) => void;
}

export default function VocabularyView({
  vocabularies,
  onAddVocab,
  onEditVocab,
  onVocabDeleted,
}: VocabularyViewProps) {
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredVocab = useMemo(() => {
    return vocabularies.filter((v) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        v.word.toLowerCase().includes(q) ||
        v.definition.toLowerCase().includes(q) ||
        (v.example && v.example.toLowerCase().includes(q));

      const matchPos =
        posFilter === "all" ||
        (v.partOfSpeech && v.partOfSpeech.toLowerCase() === posFilter.toLowerCase());

      return matchSearch && matchPos;
    });
  }, [vocabularies, search, posFilter]);

  const handleDelete = async (item: VocabularyItem) => {
    if (!confirm(`Delete vocabulary word "${item.word}"? If any student has saved this word to their progress, it will be protected to preserve their history.`)) {
      return;
    }

    setDeletingId(item.id);
    setError(null);
    try {
      const res = await deleteVocabularyAction(item.id);
      if (res.success) {
        onVocabDeleted(item.id);
      } else {
        setError(res.error || "Failed to delete vocabulary word");
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete vocabulary word");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800/80 shadow-xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vocabulary words, definitions, or phrases..."
              className="w-full py-2 pl-9 pr-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={posFilter}
            onChange={(e) => setPosFilter(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Parts of Speech</option>
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
            <option value="idiom">Idiom</option>
            <option value="phrase">Phrase</option>
          </select>
        </div>

        <button
          onClick={onAddVocab}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Word</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Vocabulary Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVocab.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
            No vocabulary found matching your search.
          </div>
        ) : (
          filteredVocab.map((v) => (
            <div
              key={v.id}
              className="flex flex-col justify-between p-5 rounded-2xl bg-[#0D1127]/80 backdrop-blur-xl border border-slate-800/80 shadow-xl hover:border-purple-500/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {v.partOfSpeech || "noun"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">#{v.id}</span>
                </div>

                <h3 className="text-lg font-extrabold text-white group-hover:text-purple-300 transition-colors mb-2">
                  {v.word}
                </h3>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {v.definition}
                </p>

                {v.example && (
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/70 text-slate-400 text-xs italic">
                    "{v.example}"
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {new Date(v.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditVocab(v)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-semibold border border-slate-800 transition-colors"
                    title="Edit Word"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(v)}
                    disabled={deletingId === v.id}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-rose-300 text-xs font-semibold border border-rose-900/40 transition-colors disabled:opacity-50"
                    title="Delete Word"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
