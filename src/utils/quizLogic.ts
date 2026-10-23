import { Difficulty, QuizQuestion } from '../types/quiz';

/**
 * Pure logic calculations and transformations for QuizForge.
 */

export interface ScoreBreakdown {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  scorePercentage: number;
  isPerfect: boolean;
  missedQuestionIds: string[];
}

/**
 * Calculates score: 1 point per correct answer, 0 for incorrect/unanswered, no negative scoring.
 */
export function calculateQuizScore(
  questions: QuizQuestion[],
  userAnswers: Record<string, number | null>
): ScoreBreakdown {
  const totalQuestions = questions.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  const missedQuestionIds: string[] = [];

  for (const q of questions) {
    const selected = userAnswers[q.id];
    if (selected === null || selected === undefined) {
      unansweredCount++;
      missedQuestionIds.push(q.id);
    } else if (selected === q.correctIndex) {
      correctCount++;
    } else {
      incorrectCount++;
      missedQuestionIds.push(q.id);
    }
  }

  const scorePercentage =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return {
    totalQuestions,
    correctCount,
    incorrectCount,
    unansweredCount,
    scorePercentage,
    isPerfect: totalQuestions > 0 && correctCount === totalQuestions,
    missedQuestionIds
  };
}

/**
 * Returns a measured, grounded performance summary.
 */
export function getPerformanceSummary(
  scorePercentage: number,
  totalQuestions: number,
  topic: string,
  difficulty: Difficulty
): string {
  const diffLabel = difficulty === 'mixed' ? 'mixed-difficulty' : `${difficulty}-level`;

  if (scorePercentage === 100) {
    return `Flawless score across all ${totalQuestions} questions. You demonstrated complete mastery of these ${diffLabel} ${topic} concepts.`;
  }
  if (scorePercentage >= 80) {
    return `Strong performance. You answered most questions accurately and have a solid working grasp of ${topic}. Review the missed explanations to close any remaining gaps.`;
  }
  if (scorePercentage >= 60) {
    return `Moderate grasp of ${topic}. You got the majority right, but several nuanced questions tripped you up. Focus on the reviewed topics and consider retaking.`;
  }
  if (scorePercentage >= 40) {
    return `Foundational understanding is present, but several core ${topic} concepts need reinforcement. Inspect the detailed explanations below to understand where things diverged.`;
  }
  return `This set proved challenging. Use the answer breakdowns and distractor analyses below as a focused study guide before attempting another run.`;
}

/**
 * Fisher-Yates shuffle returning a new array copy.
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Shuffles options for a multiple choice question while tracking the new correctIndex.
 */
export function shuffleQuestionAnswers(question: QuizQuestion): QuizQuestion {
  const originalOptions = question.options;
  const correctOptionText = originalOptions[question.correctIndex];

  // Create indexed pairs
  const indexed = originalOptions.map((opt, idx) => ({
    text: opt,
    isCorrect: idx === question.correctIndex,
    distractorExplanation: question.distractorExplanations?.[idx]
  }));

  const shuffled = shuffleArray(indexed);

  const newOptions = shuffled.map((item) => item.text);
  const newCorrectIndex = shuffled.findIndex((item) => item.isCorrect);

  const newDistractorExplanations = question.distractorExplanations
    ? shuffled.map((item) => item.distractorExplanation || '')
    : undefined;

  return {
    ...question,
    options: newOptions,
    correctIndex: newCorrectIndex !== -1 ? newCorrectIndex : 0,
    distractorExplanations: newDistractorExplanations
  };
}

/**
 * Filters and prepares questions from the bank.
 */
export function selectQuestionsFromBank(
  bank: QuizQuestion[],
  options: {
    topic: string;
    subcategory?: string;
    difficulty: Difficulty;
    count: number;
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
  }
): QuizQuestion[] {
  const normalizedTopic = options.topic.trim().toLowerCase();
  const normalizedSubcategory = options.subcategory?.trim().toLowerCase();

  // 1. Topic matching
  let matched = bank.filter((q) => {
    const qTopic = q.topic.toLowerCase();
    const qSub = (q.subcategory || '').toLowerCase();
    return (
      qTopic.includes(normalizedTopic) ||
      normalizedTopic.includes(qTopic) ||
      (normalizedSubcategory && qSub.includes(normalizedSubcategory))
    );
  });

  // If no direct topic match, match across all questions
  if (matched.length === 0) {
    matched = [...bank];
  }

  // 2. Subcategory prioritization if specified
  if (normalizedSubcategory) {
    const subMatches = matched.filter((q) =>
      (q.subcategory || '').toLowerCase().includes(normalizedSubcategory)
    );
    if (subMatches.length >= options.count) {
      matched = subMatches;
    }
  }

  // 3. Difficulty filtering
  if (options.difficulty !== 'mixed') {
    const diffMatches = matched.filter((q) => q.difficulty === options.difficulty);
    // If we have enough for the requested count, use them
    if (diffMatches.length >= options.count) {
      matched = diffMatches;
    } else if (diffMatches.length > 0) {
      // Put matching difficulty first, then pad with other difficulties from the same topic
      const others = matched.filter((q) => q.difficulty !== options.difficulty);
      matched = [...diffMatches, ...others];
    }
  }

  // 4. Pad from general bank if topic has fewer than requested
  if (matched.length < options.count) {
    const existingIds = new Set(matched.map((q) => q.id));
    const remainingInBank = bank.filter((q) => !existingIds.has(q.id));
    matched = [...matched, ...remainingInBank];
  }

  // 5. Shuffle questions
  let selected = options.shuffleQuestions ? shuffleArray(matched) : [...matched];

  // 6. Slice to count
  selected = selected.slice(0, Math.min(options.count, selected.length));

  // 7. Shuffle answers if requested
  if (options.shuffleAnswers) {
    selected = selected.map(shuffleQuestionAnswers);
  }

  return selected;
}

/**
 * Validates a raw question object (such as from AI generation) to ensure quality.
 */
export function validateQuestion(
  raw: any,
  fallbackTopic: string,
  fallbackDifficulty: Difficulty
): { valid: boolean; question?: QuizQuestion; error?: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Question data is not an object' };
  }

  const prompt = typeof raw.prompt === 'string' ? raw.prompt.trim() : '';
  if (prompt.length < 5) {
    return { valid: false, error: 'Question prompt is too short or missing' };
  }

  if (!Array.isArray(raw.options) || raw.options.length !== 4) {
    return { valid: false, error: 'Question must have exactly 4 options' };
  }

  const cleanOptions = raw.options.map((opt: any) =>
    typeof opt === 'string' ? opt.trim() : String(opt || '').trim()
  );

  // Check all options are non-empty
  if (cleanOptions.some((opt: string) => opt.length === 0)) {
    return { valid: false, error: 'All 4 options must be non-empty strings' };
  }

  // Check options are distinct
  const uniqueOptions = new Set(cleanOptions.map((opt: string) => opt.toLowerCase()));
  if (uniqueOptions.size !== 4) {
    return { valid: false, error: 'Question options must be distinct without duplicates' };
  }

  const correctIndex = Number(raw.correctIndex);
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
    return { valid: false, error: 'correctIndex must be an integer between 0 and 3' };
  }

  const explanation = typeof raw.explanation === 'string' ? raw.explanation.trim() : '';
  if (explanation.length < 5) {
    return { valid: false, error: 'Explanation is missing or too brief' };
  }

  const validDiffs = ['easy', 'medium', 'hard'] as const;
  const rawDiff = typeof raw.difficulty === 'string' ? raw.difficulty.toLowerCase() : '';
  const difficulty = validDiffs.includes(rawDiff as any)
    ? (rawDiff as 'easy' | 'medium' | 'hard')
    : fallbackDifficulty === 'mixed'
    ? 'medium'
    : fallbackDifficulty;

  const topic =
    typeof raw.topic === 'string' && raw.topic.trim().length > 0
      ? raw.topic.trim()
      : fallbackTopic;

  const subcategory =
    typeof raw.subcategory === 'string' && raw.subcategory.trim().length > 0
      ? raw.subcategory.trim()
      : undefined;

  const id =
    typeof raw.id === 'string' && raw.id.length > 0
      ? raw.id
      : `gen-${Math.random().toString(36).substring(2, 9)}`;

  return {
    valid: true,
    question: {
      id,
      prompt,
      options: cleanOptions,
      correctIndex,
      explanation,
      topic,
      subcategory,
      difficulty,
      source: 'ai'
    }
  };
}

/**
 * Formats time in seconds to mm:ss or s string.
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}
