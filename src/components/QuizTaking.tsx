import React, { useState, useEffect, useCallback, useId } from 'react';
import {
  Clock,
  Pause,
  Play,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Flag,
  Sparkles,
  BookOpen,
  LogOut,
  ChevronRight,
  Info
} from 'lucide-react';
import { QuizQuestion, QuizSettings } from '../types/quiz';
import { formatDuration } from '../utils/quizLogic';

interface QuizTakingProps {
  questions: QuizQuestion[];
  settings: QuizSettings;
  onFinishQuiz: (userAnswers: Record<string, number | null>, totalTimeSeconds: number) => void;
  onExitQuiz: () => void;
  onReportQuestion: (question: QuizQuestion) => void;
}

export const QuizTaking: React.FC<QuizTakingProps> = ({
  questions,
  settings,
  onFinishQuiz,
  onExitQuiz,
  onReportQuestion
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | null>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Timer states
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    settings.timed ? settings.timeLimitSeconds : 0
  );
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState<number>(0);

  // Modals
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState<boolean>(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isImmediate = settings.explanationMode === 'immediate';
  const isCurrentSubmitted = !!submittedQuestions[currentQuestion?.id];

  // Sync selectedOption with userAnswers when changing question index
  useEffect(() => {
    if (currentQuestion) {
      setSelectedOption(userAnswers[currentQuestion.id] ?? null);
      if (settings.timed && settings.timerMode === 'per_question') {
        setSecondsRemaining(settings.timeLimitSeconds);
      }
    }
  }, [currentIndex, currentQuestion, settings.timed, settings.timerMode, settings.timeLimitSeconds]);

  // Overall timer tick
  useEffect(() => {
    if (!settings.timed || isTimerPaused) return;

    const interval = setInterval(() => {
      setTotalTimeElapsed((prev) => prev + 1);

      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Time expired
          clearInterval(interval);
          handleTimeExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.timed, isTimerPaused, currentIndex]);

  const handleTimeExpire = useCallback(() => {
    if (settings.timerMode === 'per_question') {
      // Auto submit current question with whatever was selected
      handleSubmitCurrentAnswer();
      if (!isLastQuestion) {
        setCurrentIndex((i) => i + 1);
      } else {
        triggerFinishQuiz();
      }
    } else {
      // Total time expired, conclude quiz
      triggerFinishQuiz();
    }
  }, [isLastQuestion, selectedOption, currentQuestion]);

  const handleSelectOption = (idx: number) => {
    if (isImmediate && isCurrentSubmitted) return; // Locked after submitting in immediate mode
    setSelectedOption(idx);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: idx
    }));
  };

  const handleSubmitCurrentAnswer = () => {
    if (!currentQuestion) return;
    setSubmittedQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: true
    }));
  };

  const triggerFinishQuiz = () => {
    onFinishQuiz(userAnswers, totalTimeElapsed);
  };

  const handleNextOrFinish = () => {
    if (isImmediate && !isCurrentSubmitted) {
      // Submit first
      handleSubmitCurrentAnswer();
      return;
    }

    if (isLastQuestion) {
      // Check if any unanswered
      const unansweredCount = questions.filter(
        (q) => userAnswers[q.id] === null || userAnswers[q.id] === undefined
      ).length;

      if (unansweredCount > 0 && !isImmediate) {
        setShowFinishConfirm(true);
      } else {
        triggerFinishQuiz();
      }
    } else {
      setCurrentIndex((i) => Math.min(i + 1, questions.length - 1));
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  // Keyboard navigation support: 1-4 or A-D to pick option, Enter to submit/advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < currentQuestion.options.length) {
          handleSelectOption(idx);
        }
      } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key)) {
        const keyMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
        const idx = keyMap[e.key.toLowerCase()];
        if (idx !== undefined && idx < currentQuestion.options.length) {
          handleSelectOption(idx);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (isImmediate && !isCurrentSubmitted && selectedOption !== null) {
          handleSubmitCurrentAnswer();
        } else if (isImmediate && isCurrentSubmitted) {
          handleNextOrFinish();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, isImmediate, isCurrentSubmitted, selectedOption, isLastQuestion]);

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600">No questions available.</p>
        <button
          onClick={onExitQuiz}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
        >
          Return to Setup
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).filter(
    (k) => userAnswers[k] !== null && userAnswers[k] !== undefined
  ).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Exit Button */}
        <button
          type="button"
          onClick={() => setShowExitConfirm(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition py-1.5 px-2.5 rounded-lg hover:bg-slate-100"
          aria-label="Exit quiz"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Quiz</span>
        </button>

        {/* Center: Question Counter & Progress */}
        <div className="text-center">
          <span className="text-xs font-bold text-slate-900 tracking-wide">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-slate-400 mx-2">•</span>
          <span className="text-xs text-slate-500">
            {answeredCount} of {questions.length} Answered
          </span>
        </div>

        {/* Right: Timer (if enabled) */}
        {settings.timed ? (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
                secondsRemaining <= 15
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDuration(secondsRemaining)}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title={isTimerPaused ? 'Resume timer' : 'Pause timer'}
              aria-label={isTimerPaused ? 'Resume timer' : 'Pause timer'}
            >
              {isTimerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-mono">
            {formatDuration(totalTimeElapsed)}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6 overflow-hidden">
        <div
          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Meta badges: Topic, Difficulty, Source */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {currentQuestion.topic}
            </span>
            {currentQuestion.subcategory && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                {currentQuestion.subcategory}
              </span>
            )}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                currentQuestion.difficulty === 'easy'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : currentQuestion.difficulty === 'medium'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {currentQuestion.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentQuestion.source === 'ai' ? (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200"
                title="Generated dynamically by Gemini 3.8 Flash"
              >
                <Sparkles className="w-3 h-3 text-purple-600" /> AI Generated
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200"
                title="Sourced from verified Question Bank"
              >
                <BookOpen className="w-3 h-3 text-slate-500" /> Question Bank
              </span>
            )}

            <button
              type="button"
              onClick={() => onReportQuestion(currentQuestion)}
              className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 transition"
              title="Report an issue or ambiguity with this question"
            >
              <Flag className="w-3 h-3" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Question Prompt */}
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-6">
          {currentQuestion.prompt}
        </h2>

        {/* Multiple Choice Options */}
        <div className="space-y-3" role="radiogroup" aria-label="Answer options">
          {currentQuestion.options.map((optionText, idx) => {
            const isSelected = selectedOption === idx;
            const letter = String.fromCharCode(65 + idx); // A, B, C, D

            // In immediate mode after submit, show correct/incorrect styles
            const showFeedback = isImmediate && isCurrentSubmitted;
            const isCorrectOption = idx === currentQuestion.correctIndex;
            const isUserWrongChoice = showFeedback && isSelected && !isCorrectOption;

            let borderStyle = 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50';
            let badgeBg = 'bg-slate-100 text-slate-700';

            if (isSelected && !showFeedback) {
              borderStyle = 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600 shadow-xs';
              badgeBg = 'bg-indigo-600 text-white';
            } else if (showFeedback) {
              if (isCorrectOption) {
                borderStyle = 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500';
                badgeBg = 'bg-emerald-600 text-white';
              } else if (isUserWrongChoice) {
                borderStyle = 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-400';
                badgeBg = 'bg-rose-600 text-white';
              } else {
                borderStyle = 'border-slate-200 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={showFeedback}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-4 rounded-xl border text-left flex items-start gap-3.5 transition group focus:outline-none focus:ring-2 focus:ring-indigo-400 ${borderStyle}`}
              >
                {/* Option Letter Indicator */}
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs transition ${badgeBg}`}
                >
                  {showFeedback && isCorrectOption ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : showFeedback && isUserWrongChoice ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    letter
                  )}
                </div>

                {/* Option Text */}
                <div className="flex-1 pt-0.5">
                  <div className="text-sm font-medium text-slate-800 leading-relaxed">
                    {optionText}
                  </div>

                  {/* Immediate feedback status label */}
                  {showFeedback && isCorrectOption && (
                    <div className="mt-1 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Correct Answer
                    </div>
                  )}
                  {showFeedback && isUserWrongChoice && (
                    <div className="mt-1 text-xs font-semibold text-rose-700 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Your Answer (Incorrect)
                    </div>
                  )}
                </div>

                {/* Keyboard shortcut hint */}
                <span className="hidden sm:inline-block text-[11px] text-slate-400 group-hover:text-slate-600 font-mono mt-0.5">
                  [{idx + 1}]
                </span>
              </button>
            );
          })}
        </div>

        {/* Immediate Explanation Box (shown right after submit in immediate mode) */}
        {isImmediate && isCurrentSubmitted && (
          <div
            className={`mt-6 p-4 sm:p-5 rounded-xl border ${
              selectedOption === currentQuestion.correctIndex
                ? 'bg-emerald-50/60 border-emerald-200'
                : 'bg-indigo-50/60 border-indigo-200'
            }`}
            aria-live="polite"
          >
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-2">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Explanation & Conceptual Breakdown</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Previous Button (supported in end-of-quiz mode) */}
          {!isImmediate && currentIndex > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {/* Right Action Button */}
          <div className="flex items-center gap-3">
            {isImmediate && !isCurrentSubmitted ? (
              <button
                type="button"
                onClick={handleSubmitCurrentAnswer}
                disabled={selectedOption === null}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-sm transition flex items-center gap-2"
              >
                <span>Check Answer</span>
                <span className="text-xs opacity-75 font-normal hidden sm:inline">[Enter]</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextOrFinish}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition flex items-center gap-2"
              >
                <span>{isLastQuestion ? 'Complete Quiz & View Score' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question Palette / Navigator (accessible jump grid, especially helpful in end-of-quiz mode) */}
      {!isImmediate && (
        <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
            <span>Question Navigator</span>
            <span className="font-normal capitalize text-slate-400">
              Click any question to jump
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const isAns = userAnswers[q.id] !== null && userAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center border ${
                    isCurrent
                      ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-200'
                      : isAns
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                  }`}
                  aria-label={`Jump to question ${idx + 1}${isAns ? ' (answered)' : ''}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal: Exit Quiz */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Leave Active Quiz?</h3>
            <p className="text-sm text-slate-600 mt-1.5">
              If you leave now, your current answers and progress on this quiz will not be recorded in your history.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-700 hover:bg-slate-100 transition"
              >
                Keep Taking Quiz
              </button>
              <button
                type="button"
                onClick={onExitQuiz}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                Leave Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Finish with unanswered */}
      {showFinishConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Unanswered Questions</h3>
            <p className="text-sm text-slate-600 mt-1.5">
              You have unanswered questions. Unanswered questions receive 0 points (no negative scoring). Do you want to submit now?
            </p>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-700 hover:bg-slate-100 transition"
              >
                Review Questions
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFinishConfirm(false);
                  triggerFinishQuiz();
                }}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
