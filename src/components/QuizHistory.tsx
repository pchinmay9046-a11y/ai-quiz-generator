import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  Eye,
  Trash2,
  AlertTriangle,
  Award,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  BookmarkCheck,
  Flame,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { QuizHistoryEntry, QuizResult, QuizQuestion } from '../types/quiz';
import {
  getQuizHistory,
  deleteQuizHistory,
  deleteQuizHistoryItem,
  getTopicMasteryStats,
  getMissedQuestions,
  MissedConceptItem
} from '../utils/storage';
import { formatDuration } from '../utils/quizLogic';

interface QuizHistoryProps {
  onReopenResult: (result: QuizResult) => void;
  onRetakeFromHistory: (result: QuizResult) => void;
  onPracticeMissedConcepts: (missedQuestions: QuizQuestion[]) => void;
}

export const QuizHistoryView: React.FC<QuizHistoryProps> = ({
  onReopenResult,
  onRetakeFromHistory,
  onPracticeMissedConcepts
}) => {
  const [history, setHistory] = useState<QuizHistoryEntry[]>(getQuizHistory());
  const [activeSubTab, setActiveSubTab] = useState<'recent' | 'mastery' | 'missed'>('recent');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const masteryStats = getTopicMasteryStats();
  const missedList = getMissedQuestions();

  const handleClearAll = () => {
    deleteQuizHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteQuizHistoryItem(id);
    setHistory(getQuizHistory());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title & Storage Privacy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-indigo-600" />
            <span>Quiz History & Learning Analytics</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your study progress over time. Saved entirely in your local browser storage.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs sm:text-sm font-semibold mb-6">
        <button
          type="button"
          onClick={() => setActiveSubTab('recent')}
          className={`flex-1 py-2 px-3 rounded-lg transition text-center ${
            activeSubTab === 'recent'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Recent Quizzes ({history.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('mastery')}
          className={`flex-1 py-2 px-3 rounded-lg transition text-center ${
            activeSubTab === 'mastery'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Topic Mastery
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('missed')}
          className={`flex-1 py-2 px-3 rounded-lg transition text-center ${
            activeSubTab === 'missed'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Concepts to Revisit ({missedList.length})
        </button>
      </div>

      {/* View 1: Recent Quizzes List */}
      {activeSubTab === 'recent' && (
        <div>
          {history.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Quiz History Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Take a quiz on Python, Machine Learning, or Generative AI to track your score history and mastery.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => {
                const dateStr = new Date(entry.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                const isHigh = entry.scorePercentage >= 80;
                const isMed = entry.scorePercentage >= 50 && entry.scorePercentage < 80;

                return (
                  <div
                    key={entry.id}
                    onClick={() => onReopenResult(entry.resultData)}
                    className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-2xs cursor-pointer group"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 text-base transition">
                          {entry.topic}
                        </span>
                        {entry.subcategory && (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                            {entry.subcategory}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold capitalize bg-slate-100 text-slate-600">
                          {entry.difficulty}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          {entry.source === 'ai' ? (
                            <span className="text-purple-600 flex items-center gap-0.5">
                              <Sparkles className="w-3 h-3" /> AI
                            </span>
                          ) : (
                            <span className="text-slate-600 flex items-center gap-0.5">
                              <BookOpen className="w-3 h-3" /> Bank
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {dateStr}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDuration(entry.timeSpentTotalSeconds)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      {/* Score Badge */}
                      <div className="text-right">
                        <div
                          className={`text-xl sm:text-2xl font-black ${
                            isHigh ? 'text-emerald-600' : isMed ? 'text-amber-600' : 'text-slate-700'
                          }`}
                        >
                          {entry.scorePercentage}%
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {entry.correctCount}/{entry.totalQuestions} correct
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetakeFromHistory(entry.resultData);
                          }}
                          className="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition"
                          title="Retake this quiz"
                          aria-label="Retake this quiz"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteItem(entry.id, e)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete from history"
                          aria-label="Delete from history"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="p-2 text-slate-400 group-hover:text-indigo-600 transition">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View 2: Topic Mastery */}
      {activeSubTab === 'mastery' && (
        <div className="space-y-4">
          {masteryStats.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
              Complete quizzes across different topics to populate your topic mastery analytics.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {masteryStats.map((stat) => (
                <div
                  key={stat.topic}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-base text-slate-900">{stat.topic}</span>
                    <span className="text-lg font-black text-indigo-600">
                      {stat.averageScorePercentage}% avg
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${stat.averageScorePercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{stat.quizzesTaken} quiz session{stat.quizzesTaken > 1 ? 's' : ''}</span>
                    <span>
                      {stat.totalCorrect} / {stat.totalAnswered} questions correct
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View 3: Concepts to Revisit */}
      {activeSubTab === 'missed' && (
        <div className="space-y-4">
          {missedList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Missed Concepts!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You have answered all questions correctly in your recorded sessions, or haven't taken a quiz yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  These are concepts you previously answered incorrectly. Review the explanations to reinforce your memory.
                </span>
              </div>

              {missedList.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                      {m.topic}
                    </span>
                    {m.subcategory && (
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                        {m.subcategory}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">{m.prompt}</h4>
                  <div className="text-xs space-y-1 mb-3">
                    <div className="text-rose-700 flex items-center gap-1 font-medium">
                      <XCircle className="w-3.5 h-3.5" /> Your Choice: {m.userAnswer}
                    </div>
                    <div className="text-emerald-700 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer: {m.correctAnswer}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-600 leading-relaxed border border-slate-100">
                    <strong className="text-slate-800">Explanation: </strong>
                    {m.explanation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Clear Quiz History?</h3>
            <p className="text-sm text-slate-600 mt-1.5">
              This will permanently delete all saved quiz results and topic mastery statistics from your local browser storage.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
