export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export type ExplanationMode = 'immediate' | 'end';

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: [string, string, string, string] | string[];
  correctIndex: number;
  explanation: string;
  distractorExplanations?: string[];
  topic: string;
  subcategory?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: 'ai' | 'bank';
}

export interface QuizSettings {
  topic: string;
  subcategory?: string;
  difficulty: Difficulty;
  questionCount: number;
  timed: boolean;
  timeLimitSeconds: number; // e.g. 60s per question or total time
  timerMode: 'per_question' | 'total';
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  explanationMode: ExplanationMode;
  useAiIfAvailable: boolean;
}

export interface UserAnswerRecord {
  questionId: string;
  selectedOptionIndex: number | null;
  timeSpentSeconds: number;
  isCorrect: boolean;
}

export interface QuizResult {
  id: string;
  createdAt: string;
  topic: string;
  subcategory?: string;
  difficulty: Difficulty;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  scorePercentage: number;
  timeSpentTotalSeconds: number;
  timed: boolean;
  explanationMode: ExplanationMode;
  questions: QuizQuestion[];
  userAnswers: Record<string, number | null>; // questionId -> selectedIndex
  performanceSummary: string;
  source: 'ai' | 'bank';
}

export interface QuizHistoryEntry {
  id: string;
  createdAt: string;
  topic: string;
  subcategory?: string;
  difficulty: Difficulty;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  timeSpentTotalSeconds: number;
  source: 'ai' | 'bank';
  resultData: QuizResult;
}

export interface QuestionReport {
  questionId: string;
  prompt: string;
  reason: 'ambiguous' | 'incorrect_answer' | 'typo' | 'other';
  comment: string;
  timestamp: string;
}
