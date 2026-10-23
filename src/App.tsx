/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { QuizSetup } from './components/QuizSetup';
import { QuizTaking } from './components/QuizTaking';
import { QuizResults } from './components/QuizResults';
import { QuizHistoryView } from './components/QuizHistory';
import { BankExplorer } from './components/BankExplorer';
import { ReportModal } from './components/ReportModal';
import { QuizQuestion, QuizSettings, QuizResult, QuestionReport, Difficulty } from './types/quiz';
import { QUESTION_BANK } from './data/questionBank';
import {
  calculateQuizScore,
  getPerformanceSummary,
  selectQuestionsFromBank,
  shuffleArray,
  shuffleQuestionAnswers
} from './utils/quizLogic';
import { saveQuizResult } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'bank'>('create');
  const [viewState, setViewState] = useState<'setup' | 'taking' | 'results'>('setup');
  const [aiAvailable, setAiAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [currentSettings, setCurrentSettings] = useState<QuizSettings | null>(null);
  const [activeResult, setActiveResult] = useState<QuizResult | null>(null);
  const [reportingQuestion, setReportingQuestion] = useState<QuizQuestion | null>(null);

  // Check server AI status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.aiAvailable === 'boolean') {
          setAiAvailable(data.aiAvailable);
        }
      })
      .catch(() => {
        // Dev server or static fallback: bank mode stays ready
        setAiAvailable(false);
      });
  }, []);

  // Support ?autostart=1 from ultra-mode skill
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' && viewState === 'setup') {
      const defaultSettings: QuizSettings = {
        topic: 'Python',
        difficulty: 'easy',
        questionCount: 5,
        timed: false,
        timeLimitSeconds: 60,
        timerMode: 'per_question',
        shuffleQuestions: false,
        shuffleAnswers: false,
        explanationMode: 'immediate',
        useAiIfAvailable: false
      };
      startQuizWithSettings(defaultSettings);
    }
  }, []);

  const startQuizWithSettings = async (settings: QuizSettings) => {
    setIsLoading(true);
    setError(null);

    try {
      if (settings.useAiIfAvailable && aiAvailable) {
        // Attempt AI question generation via server
        const res = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: settings.topic,
            subcategory: settings.subcategory,
            difficulty: settings.difficulty,
            questionCount: settings.questionCount
          })
        });

        const data = await res.json();
        if (res.ok && Array.isArray(data.questions) && data.questions.length > 0) {
          let questions: QuizQuestion[] = data.questions;
          if (settings.shuffleAnswers) {
            questions = questions.map(shuffleQuestionAnswers);
          }
          if (settings.shuffleQuestions) {
            questions = shuffleArray(questions);
          }
          setCurrentQuestions(questions);
          setCurrentSettings(settings);
          setViewState('taking');
          setIsLoading(false);
          return;
        } else {
          // If AI endpoint returned an error, throw with message
          throw new Error(data.message || 'AI generation failed. Switching to Question Bank.');
        }
      }

      // Default or fallback: select from built-in Question Bank
      const bankQuestions = selectQuestionsFromBank(QUESTION_BANK, {
        topic: settings.topic,
        subcategory: settings.subcategory,
        difficulty: settings.difficulty,
        count: settings.questionCount,
        shuffleQuestions: settings.shuffleQuestions,
        shuffleAnswers: settings.shuffleAnswers
      });

      if (bankQuestions.length === 0) {
        throw new Error('No matching questions found in the Question Bank. Try another topic or difficulty.');
      }

      setCurrentQuestions(bankQuestions);
      setCurrentSettings(settings);
      setViewState('taking');
    } catch (err: any) {
      console.warn('Quiz initiation error:', err);
      // If AI failed, fall back to bank gracefully with informative message
      if (settings.useAiIfAvailable) {
        const fallbackQuestions = selectQuestionsFromBank(QUESTION_BANK, {
          topic: settings.topic,
          subcategory: settings.subcategory,
          difficulty: settings.difficulty,
          count: settings.questionCount,
          shuffleQuestions: settings.shuffleQuestions,
          shuffleAnswers: settings.shuffleAnswers
        });
        if (fallbackQuestions.length > 0) {
          setError(`AI generation was unavailable (${err.message}). Loaded matching questions from the Question Bank instead.`);
          setCurrentQuestions(fallbackQuestions);
          setCurrentSettings({ ...settings, useAiIfAvailable: false });
          setViewState('taking');
          setIsLoading(false);
          return;
        }
      }
      setError(err.message || 'Failed to prepare quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishQuiz = (userAnswers: Record<string, number | null>, totalTimeSeconds: number) => {
    if (!currentSettings) return;

    const score = calculateQuizScore(currentQuestions, userAnswers);
    const summary = getPerformanceSummary(
      score.scorePercentage,
      score.totalQuestions,
      currentSettings.topic,
      currentSettings.difficulty
    );

    const isAi = currentQuestions.some((q) => q.source === 'ai');

    const result: QuizResult = {
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topic: currentSettings.topic,
      subcategory: currentSettings.subcategory,
      difficulty: currentSettings.difficulty,
      totalQuestions: score.totalQuestions,
      correctCount: score.correctCount,
      incorrectCount: score.incorrectCount,
      unansweredCount: score.unansweredCount,
      scorePercentage: score.scorePercentage,
      timeSpentTotalSeconds: totalTimeSeconds,
      timed: currentSettings.timed,
      explanationMode: currentSettings.explanationMode,
      questions: currentQuestions,
      userAnswers,
      performanceSummary: summary,
      source: isAi ? 'ai' : 'bank'
    };

    saveQuizResult(result);
    setActiveResult(result);
    setViewState('results');
  };

  const handleRetakeQuiz = (questionsToRetake?: QuizQuestion[]) => {
    if (!currentSettings && !activeResult) return;

    const baseQuestions = questionsToRetake || activeResult?.questions || currentQuestions;
    // Permute answers for fresh challenge
    const shuffled = baseQuestions.map(shuffleQuestionAnswers);

    setCurrentQuestions(shuffleArray(shuffled));
    setViewState('taking');
  };

  const handleCreateNewQuiz = () => {
    setViewState('setup');
    setActiveTab('create');
    setError(null);
  };

  const handleExitQuiz = () => {
    setViewState('setup');
  };

  const handleReopenResult = (result: QuizResult) => {
    setActiveResult(result);
    setViewState('results');
    setActiveTab('create');
  };

  const handleRetakeFromHistory = (result: QuizResult) => {
    setActiveResult(result);
    setCurrentQuestions(shuffleArray(result.questions.map(shuffleQuestionAnswers)));
    setCurrentSettings({
      topic: result.topic,
      subcategory: result.subcategory,
      difficulty: result.difficulty,
      questionCount: result.totalQuestions,
      timed: result.timed,
      timeLimitSeconds: 60,
      timerMode: 'per_question',
      shuffleQuestions: true,
      shuffleAnswers: true,
      explanationMode: result.explanationMode,
      useAiIfAvailable: result.source === 'ai'
    });
    setViewState('taking');
    setActiveTab('create');
  };

  const handlePracticeMissedConcepts = (missedQuestions: QuizQuestion[]) => {
    if (missedQuestions.length === 0) return;
    setCurrentQuestions(missedQuestions);
    setViewState('taking');
    setActiveTab('create');
  };

  const handleStartQuizOnTopic = (topic: string, sub?: string, diff?: Difficulty) => {
    setActiveTab('create');
    const settings: QuizSettings = {
      topic,
      subcategory: sub,
      difficulty: diff || 'medium',
      questionCount: 5,
      timed: false,
      timeLimitSeconds: 60,
      timerMode: 'per_question',
      shuffleQuestions: true,
      shuffleAnswers: true,
      explanationMode: 'immediate',
      useAiIfAvailable: false
    };
    startQuizWithSettings(settings);
  };

  const handleSubmitReport = (report: QuestionReport) => {
    try {
      const existingRaw = localStorage.getItem('quizforge_question_reports') || '[]';
      const existing = JSON.parse(existingRaw);
      localStorage.setItem('quizforge_question_reports', JSON.stringify([report, ...existing]));
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (viewState !== 'taking') {
            if (tab === 'create') setViewState('setup');
          }
        }}
        aiAvailable={aiAvailable}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'history' ? (
          <QuizHistoryView
            onReopenResult={handleReopenResult}
            onRetakeFromHistory={handleRetakeFromHistory}
            onPracticeMissedConcepts={handlePracticeMissedConcepts}
          />
        ) : activeTab === 'bank' ? (
          <BankExplorer onStartQuizOnTopic={handleStartQuizOnTopic} />
        ) : (
          /* Create / Active Quiz / Results tab */
          <>
            {viewState === 'setup' && (
              <QuizSetup
                onStartQuiz={startQuizWithSettings}
                aiAvailable={aiAvailable}
                isLoading={isLoading}
                error={error}
              />
            )}

            {viewState === 'taking' && (
              <QuizTaking
                questions={currentQuestions}
                settings={
                  currentSettings || {
                    topic: 'General',
                    difficulty: 'medium',
                    questionCount: currentQuestions.length,
                    timed: false,
                    timeLimitSeconds: 60,
                    timerMode: 'per_question',
                    shuffleQuestions: false,
                    shuffleAnswers: false,
                    explanationMode: 'immediate',
                    useAiIfAvailable: false
                  }
                }
                onFinishQuiz={handleFinishQuiz}
                onExitQuiz={handleExitQuiz}
                onReportQuestion={(q) => setReportingQuestion(q)}
              />
            )}

            {viewState === 'results' && activeResult && (
              <QuizResults
                result={activeResult}
                onRetakeQuiz={handleRetakeQuiz}
                onCreateNewQuiz={handleCreateNewQuiz}
                onReportQuestion={(q) => setReportingQuestion(q)}
              />
            )}
          </>
        )}
      </main>

      {/* Question Reporting Modal */}
      {reportingQuestion && (
        <ReportModal
          question={reportingQuestion}
          onClose={() => setReportingQuestion(null)}
          onSubmitReport={handleSubmitReport}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong>QuizForge</strong> — Student Technical Assessment Platform.
          </p>
          <p className="text-slate-400">
            1 pt per correct answer • Local private storage • No tracker cookies
          </p>
        </div>
      </footer>
    </div>
  );
}
