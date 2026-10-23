import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Clock,
  Shuffle,
  HelpCircle,
  Play,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Lightbulb,
  Zap,
  Check
} from 'lucide-react';
import { Difficulty, ExplanationMode, QuizSettings } from '../types/quiz';
import { TOPIC_SUGGESTIONS } from '../data/questionBank';

interface QuizSetupProps {
  onStartQuiz: (settings: QuizSettings) => void;
  aiAvailable: boolean;
  isLoading: boolean;
  error: string | null;
}

export const QuizSetup: React.FC<QuizSetupProps> = ({
  onStartQuiz,
  aiAvailable,
  isLoading,
  error
}) => {
  const [topic, setTopic] = useState('Python');
  const [subcategory, setSubcategory] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [timed, setTimed] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(60); // 60s per question
  const [timerMode, setTimerMode] = useState<'per_question' | 'total'>('per_question');
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [shuffleAnswers, setShuffleAnswers] = useState<boolean>(true);
  const [explanationMode, setExplanationMode] = useState<ExplanationMode>('immediate');
  const [useAiIfAvailable, setUseAiIfAvailable] = useState<boolean>(aiAvailable);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Suggested subcategories for current topic if matching
  const currentTopicData = TOPIC_SUGGESTIONS.find(
    (t) => t.topic.toLowerCase() === topic.trim().toLowerCase()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setValidationError('Please enter a quiz topic or select one of the suggested topics.');
      return;
    }
    setValidationError(null);

    onStartQuiz({
      topic: topic.trim(),
      subcategory: subcategory.trim() || undefined,
      difficulty,
      questionCount,
      timed,
      timeLimitSeconds: timerSeconds,
      timerMode,
      shuffleQuestions,
      shuffleAnswers,
      explanationMode,
      useAiIfAvailable: useAiIfAvailable && aiAvailable
    });
  };

  const loadSampleQuiz = (sampleTopic: string, sub?: string, diff: Difficulty = 'medium', count: number = 5) => {
    setTopic(sampleTopic);
    setSubcategory(sub || '');
    setDifficulty(diff);
    setQuestionCount(count);
    setValidationError(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Intro hero banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <Zap className="w-3.5 h-3.5 text-indigo-600" />
          <span>Active Recall & Technical Competency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Forge Your Knowledge
        </h1>
        <p className="mt-2 text-base text-slate-600 max-w-xl mx-auto">
          Test and solidify your understanding across Python, Generative AI, Machine Learning, JavaScript, and more.
        </p>
      </div>

      {/* Main Card Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Source status indicator banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Question Source:</span>
            {aiAvailable ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Gemini AI Enabled (or choose Built-in Bank)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Built-in Question Bank (Offline & Verified)
              </span>
            )}
          </div>
          <p className="text-slate-500 text-[11px]">
            {aiAvailable
              ? 'AI generates fresh questions with deep explanations'
              : 'Over 40+ carefully curated technical questions ready instantly'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Error alerts */}
          {(error || validationError) && (
            <div
              className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to start quiz</p>
                <p className="mt-0.5">{error || validationError}</p>
              </div>
            </div>
          )}

          {/* Quick preset buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick Start Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => loadSampleQuiz('Python', 'Data Structures', 'easy', 5)}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition text-xs group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-indigo-700">Python Basics</div>
                <div className="text-[11px] text-slate-500">5 Qs • Easy</div>
              </button>
              <button
                type="button"
                onClick={() => loadSampleQuiz('Generative AI', 'Transformer Attention', 'medium', 5)}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition text-xs group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-indigo-700">Generative AI</div>
                <div className="text-[11px] text-slate-500">5 Qs • Medium</div>
              </button>
              <button
                type="button"
                onClick={() => loadSampleQuiz('Machine Learning', 'Model Generalization', 'medium', 5)}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition text-xs group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-indigo-700">ML Essentials</div>
                <div className="text-[11px] text-slate-500">5 Qs • Medium</div>
              </button>
              <button
                type="button"
                onClick={() => loadSampleQuiz('JavaScript', 'Event Loop & Microtasks', 'hard', 4)}
                className="p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition text-xs group"
              >
                <div className="font-semibold text-slate-800 group-hover:text-indigo-700">JS Deep Dive</div>
                <div className="text-[11px] text-slate-500">4 Qs • Hard</div>
              </button>
            </div>
          </div>

          {/* Topic Input & Chips */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="topic-input" className="text-sm font-semibold text-slate-800">
                Topic
              </label>
              <span className="text-xs text-slate-500">Required</span>
            </div>
            <div className="relative">
              <input
                id="topic-input"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Python, Machine Learning, Generative AI, React, Docker..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-900 placeholder-slate-400 text-sm transition outline-none"
                maxLength={100}
                required
              />
            </div>

            {/* Suggestions Chips */}
            <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-slate-500 mr-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500" /> Popular:
              </span>
              {TOPIC_SUGGESTIONS.map((s) => (
                <button
                  key={s.topic}
                  type="button"
                  onClick={() => {
                    setTopic(s.topic);
                    setSubcategory('');
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs transition ${
                    topic.toLowerCase() === s.topic.toLowerCase()
                      ? 'bg-indigo-600 text-white font-medium shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {s.topic}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Subcategory / Focus Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="subcategory-input" className="text-sm font-semibold text-slate-800">
                Subcategory / Focus Area <span className="font-normal text-slate-500 text-xs">(Optional)</span>
              </label>
            </div>
            <input
              id="subcategory-input"
              type="text"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="e.g. Transformers & Attention, Decorators, Overfitting, Event Loop..."
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-900 placeholder-slate-400 text-sm transition outline-none"
              maxLength={100}
            />
            {currentTopicData && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {currentTopicData.subcategories.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubcategory(sub)}
                    className={`px-2 py-0.5 rounded text-[11px] border transition ${
                      subcategory.toLowerCase() === sub.toLowerCase()
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    + {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Difficulty and Question Count Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(['easy', 'medium', 'hard', 'mixed'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 px-1 text-xs font-medium rounded-lg capitalize transition text-center ${
                      difficulty === d
                        ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {difficulty === 'easy' && 'Focuses on definitions, syntax, and foundational recall.'}
                {difficulty === 'medium' && 'Tests comprehension, common pitfalls, and conceptual mechanics.'}
                {difficulty === 'hard' && 'Advanced nuances, internal runtime behavior, and architecture.'}
                {difficulty === 'mixed' && 'A balanced spread across foundational, intermediate, and advanced.'}
              </p>
            </div>

            {/* Question Count */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="question-count-select" className="text-sm font-semibold text-slate-800">
                  Question Count
                </label>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {questionCount} Questions
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[3, 5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition ${
                      questionCount === num
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Min 3, Max 20 questions per quiz session.
              </p>
            </div>
          </div>

          {/* Explanation Mode Selection */}
          <div className="pt-2">
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Feedback & Explanation Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition ${
                  explanationMode === 'immediate'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="explanationMode"
                  checked={explanationMode === 'immediate'}
                  onChange={() => setExplanationMode('immediate')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-semibold text-sm text-slate-900">
                    Immediate Feedback (Practice Mode)
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    See explanations and distractor reasons right after submitting each answer.
                  </div>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition ${
                  explanationMode === 'end'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="explanationMode"
                  checked={explanationMode === 'end'}
                  onChange={() => setExplanationMode('end')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="font-semibold text-sm text-slate-900">
                    End of Quiz (Exam Simulation)
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Save all score reveals and detailed question breakdowns for the results screen.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Advanced Quiz Settings Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Hide Quiz Settings' : 'Custom Timer & Shuffle Settings'}</span>
              {showAdvanced ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {showAdvanced && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                {/* Timer options */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-600" />
                      <span>Enable Quiz Timer</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Countdown clock with pause control and time-out alerts.
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTimed(!timed)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        timed ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                      role="switch"
                      aria-checked={timed}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          timed ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    {timed && (
                      <select
                        value={timerSeconds}
                        onChange={(e) => setTimerSeconds(Number(e.target.value))}
                        className="text-xs border border-slate-300 rounded-lg p-1.5 bg-white text-slate-700"
                        aria-label="Timer duration"
                      >
                        <option value={30}>30s per question</option>
                        <option value={45}>45s per question</option>
                        <option value={60}>60s per question</option>
                        <option value={90}>90s per question</option>
                        <option value={180}>3 minutes total</option>
                        <option value={300}>5 minutes total</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Shuffle questions */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                      <Shuffle className="w-4 h-4 text-slate-600" />
                      <span>Shuffle Questions</span>
                    </div>
                    <div className="text-xs text-slate-500">Randomize question presentation order.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                </div>

                {/* Shuffle answers */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                      <Shuffle className="w-4 h-4 text-slate-600" />
                      <span>Shuffle Choices (A/B/C/D)</span>
                    </div>
                    <div className="text-xs text-slate-500">Randomize answer position to prevent positional bias.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={shuffleAnswers}
                    onChange={(e) => setShuffleAnswers(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                </div>

                {/* Source Selection if AI available */}
                {aiAvailable && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div>
                      <div className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Use AI Generation</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Generate bespoke questions using Gemini 3.8 Flash (server-side).
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={useAiIfAvailable}
                      onChange={(e) => setUseAiIfAvailable(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Preparing Quiz Questions...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>
                    Create & Start Quiz ({questionCount} Questions)
                  </span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              Scoring rule: 1 point per correct answer • 0 for incorrect/unanswered • No negative penalty
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
