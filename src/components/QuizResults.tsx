import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Sparkles,
  BookOpen,
  Copy,
  Download,
  Check,
  ArrowRight,
  Filter,
  Flame,
  Info
} from 'lucide-react';
import { QuizQuestion, QuizResult } from '../types/quiz';
import { formatDuration } from '../utils/quizLogic';

interface QuizResultsProps {
  result: QuizResult;
  onRetakeQuiz: (questionsToRetake?: QuizQuestion[]) => void;
  onCreateNewQuiz: () => void;
  onReportQuestion: (question: QuizQuestion) => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  result,
  onRetakeQuiz,
  onCreateNewQuiz,
  onReportQuestion
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'missed' | 'correct'>('all');
  const [copied, setCopied] = useState<boolean>(false);

  const missedQuestions = result.questions.filter((q) => {
    const userChoice = result.userAnswers[q.id];
    return userChoice !== q.correctIndex;
  });

  const correctQuestions = result.questions.filter((q) => {
    const userChoice = result.userAnswers[q.id];
    return userChoice === q.correctIndex;
  });

  const displayedQuestions =
    filterMode === 'missed'
      ? missedQuestions
      : filterMode === 'correct'
      ? correctQuestions
      : result.questions;

  const handleCopySummary = async () => {
    const lines = [
      `📊 QuizForge Assessment: ${result.topic}`,
      `Score: ${result.correctCount}/${result.totalQuestions} (${result.scorePercentage}%)`,
      `Difficulty: ${result.difficulty.toUpperCase()}`,
      `Time Spent: ${formatDuration(result.timeSpentTotalSeconds)}`,
      `Performance: ${result.performanceSummary}`,
      `\nSummary:`,
      `• Correct: ${result.correctCount}`,
      `• Incorrect: ${result.incorrectCount}`,
      `• Unanswered: ${result.unansweredCount}`,
      `\nGenerated with QuizForge.`
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quizforge-${result.topic.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Determine score color accent
  const isHigh = result.scorePercentage >= 80;
  const isMedium = result.scorePercentage >= 50 && result.scorePercentage < 80;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {result.topic}
              </span>
              {result.subcategory && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {result.subcategory}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-slate-100 text-slate-700">
                {result.difficulty}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 flex items-center gap-1">
                {result.source === 'ai' ? (
                  <>
                    <Sparkles className="w-3 h-3 text-purple-600" /> AI Generated
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3 h-3 text-slate-500" /> Question Bank
                  </>
                )}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Quiz Results & Performance Review
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              {result.performanceSummary}
            </p>
          </div>

          {/* Primary Score Ring / Badge */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 border border-slate-200 min-w-[170px] text-center">
            <div className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-1">
              Final Score
            </div>
            <div
              className={`text-4xl sm:text-5xl font-black tracking-tight ${
                isHigh ? 'text-emerald-600' : isMedium ? 'text-amber-600' : 'text-slate-800'
              }`}
            >
              {result.scorePercentage}%
            </div>
            <div className="text-sm font-semibold text-slate-600 mt-1">
              {result.correctCount} of {result.totalQuestions} Correct
            </div>
          </div>
        </div>

        {/* Detailed Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Correct</span>
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">
              {result.correctCount}
            </div>
            <div className="text-[11px] text-emerald-700">
              +1 point each
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Incorrect</span>
            </div>
            <div className="text-2xl font-bold text-rose-900 mt-1">
              {result.incorrectCount}
            </div>
            <div className="text-[11px] text-rose-700">
              0 points (no penalty)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Unanswered</span>
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {result.unansweredCount}
            </div>
            <div className="text-[11px] text-slate-500">
              0 points
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Total Time</span>
            </div>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {formatDuration(result.timeSpentTotalSeconds)}
            </div>
            <div className="text-[11px] text-slate-500">
              ~{Math.round(result.timeSpentTotalSeconds / Math.max(result.totalQuestions, 1))}s / question
            </div>
          </div>
        </div>

        {/* Scoring Rule Explanatory Note */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            Standard scoring rule: exactly 1 point per correct answer, 0 points for incorrect or unanswered questions. No negative scoring.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onRetakeQuiz()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition flex items-center gap-2 shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>

            {missedQuestions.length > 0 && (
              <button
                type="button"
                onClick={() => onRetakeQuiz(missedQuestions)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition flex items-center gap-2 shadow-xs"
                title="Practice only the questions you missed"
              >
                <Flame className="w-4 h-4 fill-current" />
                <span>Practice Missed Only ({missedQuestions.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onCreateNewQuiz}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
            >
              New Quiz Setup
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition"
              title="Copy markdown performance summary to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition"
              title="Download full quiz questions, answers, and explanations as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Detailed Question Review
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review every answer choice, marked with visual badges and grounded explanations.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterMode === 'all'
                  ? 'bg-white text-indigo-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({result.totalQuestions})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('missed')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterMode === 'missed'
                  ? 'bg-white text-rose-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Missed ({missedQuestions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterMode === 'correct'
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Correct ({correctQuestions.length})
            </button>
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-4">
          {displayedQuestions.map((q, idx) => {
            const userChoiceIdx = result.userAnswers[q.id];
            const isUnanswered = userChoiceIdx === null || userChoiceIdx === undefined;
            const isCorrect = userChoiceIdx === q.correctIndex;

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">
                      #{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {q.topic}
                    </span>
                    {q.subcategory && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] text-slate-600 bg-slate-50 border border-slate-200">
                        {q.subcategory}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize bg-slate-100 text-slate-600">
                      {q.difficulty}
                    </span>
                  </div>

                  {/* Status Indicator (does not rely on color alone: icon + text + point label) */}
                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Correct (+1 pt)</span>
                      </span>
                    ) : isUnanswered ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span>Unanswered (0 pts)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Incorrect (0 pts)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Prompt */}
                <h3 className="text-base font-bold text-slate-900 mb-4 leading-snug">
                  {q.prompt}
                </h3>

                {/* Options List */}
                <div className="space-y-2 mb-4">
                  {q.options.map((opt, optIdx) => {
                    const isUserChoice = userChoiceIdx === optIdx;
                    const isCorrectAnswer = optIdx === q.correctIndex;
                    const letter = String.fromCharCode(65 + optIdx);

                    let itemStyle = 'border-slate-200 bg-white';
                    let badgeBg = 'bg-slate-100 text-slate-700';

                    if (isCorrectAnswer) {
                      itemStyle = 'border-emerald-300 bg-emerald-50/60 ring-1 ring-emerald-300';
                      badgeBg = 'bg-emerald-600 text-white';
                    } else if (isUserChoice && !isCorrectAnswer) {
                      itemStyle = 'border-rose-300 bg-rose-50/60 ring-1 ring-rose-300';
                      badgeBg = 'bg-rose-600 text-white';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-sm flex items-start gap-3 transition ${itemStyle}`}
                      >
                        <div
                          className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center font-bold text-xs mt-0.5 ${badgeBg}`}
                        >
                          {letter}
                        </div>
                        <div className="flex-1">
                          <span className="text-slate-800 font-medium">{opt}</span>
                          <div className="mt-1 flex items-center gap-2">
                            {isCorrectAnswer && (
                              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correct Answer
                              </span>
                            )}
                            {isUserChoice && !isCorrectAnswer && (
                              <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" /> Your Selection
                              </span>
                            )}
                            {isUserChoice && isCorrectAnswer && (
                              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                (Your Selection)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <div className="font-bold text-slate-900 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Why this is correct:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onReportQuestion(q)}
                      className="text-xs text-slate-400 hover:text-slate-700 font-normal underline"
                    >
                      Report question
                    </button>
                  </div>
                  <p>{q.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
