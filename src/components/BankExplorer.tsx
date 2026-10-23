import React, { useState } from 'react';
import { Database, Search, Sparkles, Filter, ChevronRight, Play, CheckCircle2 } from 'lucide-react';
import { QUESTION_BANK } from '../data/questionBank';
import { QuizQuestion, Difficulty } from '../types/quiz';

interface BankExplorerProps {
  onStartQuizOnTopic: (topic: string, subcategory?: string, diff?: Difficulty) => void;
}

export const BankExplorer: React.FC<BankExplorerProps> = ({ onStartQuizOnTopic }) => {
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const topics = ['all', 'Python', 'Machine Learning', 'Generative AI', 'JavaScript', 'Data Science', 'General Knowledge'];

  const filtered = QUESTION_BANK.filter((q) => {
    const matchesSearch =
      q.prompt.toLowerCase().includes(search.toLowerCase()) ||
      (q.subcategory || '').toLowerCase().includes(search.toLowerCase()) ||
      q.explanation.toLowerCase().includes(search.toLowerCase());

    const matchesTopic = selectedTopic === 'all' || q.topic.toLowerCase() === selectedTopic.toLowerCase();
    const matchesDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;

    return matchesSearch && matchesTopic && matchesDiff;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-7 h-7 text-indigo-600" />
            <span>Built-in Question Bank</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and inspect {QUESTION_BANK.length} curated, peer-reviewed technical assessment questions.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by keyword, concept, or term..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Topic Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`px-2.5 py-1 rounded-lg text-xs capitalize transition ${
                  selectedTopic === t
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium">Difficulty:</span>
            {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className={`px-2 py-0.5 rounded capitalize ${
                  selectedDifficulty === d
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            No bank questions matched your search criteria.
          </div>
        ) : (
          filtered.map((q) => {
            const isExpanded = expandedId === q.id;

            return (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-5 transition shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                      {q.topic}
                    </span>
                    {q.subcategory && (
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                        {q.subcategory}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold capitalize bg-slate-100 text-slate-600">
                      {q.difficulty}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onStartQuizOnTopic(q.topic, q.subcategory, q.difficulty)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Quiz on this topic</span>
                  </button>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3">
                  {q.prompt}
                </h3>

                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 mb-2"
                >
                  <span>{isExpanded ? 'Hide Options & Explanation' : 'View Answer & Explanation'}</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correctIndex;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-lg border ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="font-bold mr-1.5">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            {opt}
                            {isCorrect && (
                              <span className="ml-1 text-[11px] font-bold text-emerald-700">
                                (Correct)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200 leading-relaxed mt-2">
                      <strong className="text-slate-900">Explanation: </strong>
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
