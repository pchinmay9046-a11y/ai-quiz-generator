import { QuizHistoryEntry, QuizResult, QuizSettings } from '../types/quiz';

const HISTORY_KEY = 'quizforge_history_v1';
const PREFS_KEY = 'quizforge_preferences_v1';

export function saveQuizResult(result: QuizResult): void {
  try {
    const history = getQuizHistory();
    const entry: QuizHistoryEntry = {
      id: result.id,
      createdAt: result.createdAt,
      topic: result.topic,
      subcategory: result.subcategory,
      difficulty: result.difficulty,
      totalQuestions: result.totalQuestions,
      correctCount: result.correctCount,
      scorePercentage: result.scorePercentage,
      timeSpentTotalSeconds: result.timeSpentTotalSeconds,
      source: result.source,
      resultData: result
    };
    // Prepend new entry, keep last 50
    const updated = [entry, ...history].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save quiz result to localStorage:', e);
  }
}

export function getQuizHistory(): QuizHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse quiz history from localStorage:', e);
    return [];
  }
}

export function getQuizResultById(id: string): QuizResult | null {
  const history = getQuizHistory();
  const found = history.find((entry) => entry.id === id);
  return found ? found.resultData : null;
}

export function deleteQuizHistoryItem(id: string): void {
  try {
    const history = getQuizHistory();
    const updated = history.filter((entry) => entry.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to remove history item:', e);
  }
}

export function deleteQuizHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.warn('Failed to clear quiz history:', e);
  }
}

export interface TopicMasteryStat {
  topic: string;
  quizzesTaken: number;
  totalAnswered: number;
  totalCorrect: number;
  averageScorePercentage: number;
}

export function getTopicMasteryStats(): TopicMasteryStat[] {
  const history = getQuizHistory();
  const map: Record<string, { count: number; totalScore: number; answered: number; correct: number }> = {};

  for (const item of history) {
    const t = item.topic || 'General';
    if (!map[t]) {
      map[t] = { count: 0, totalScore: 0, answered: 0, correct: 0 };
    }
    map[t].count++;
    map[t].totalScore += item.scorePercentage;
    map[t].answered += item.totalQuestions;
    map[t].correct += item.correctCount;
  }

  return Object.entries(map).map(([topic, data]) => ({
    topic,
    quizzesTaken: data.count,
    totalAnswered: data.answered,
    totalCorrect: data.correct,
    averageScorePercentage: Math.round(data.totalScore / data.count)
  }));
}

export interface MissedConceptItem {
  id: string;
  quizId: string;
  quizDate: string;
  topic: string;
  subcategory?: string;
  prompt: string;
  correctAnswer: string;
  userAnswer?: string;
  explanation: string;
}

export function getMissedQuestions(): MissedConceptItem[] {
  const history = getQuizHistory();
  const missed: MissedConceptItem[] = [];

  for (const entry of history) {
    const res = entry.resultData;
    if (!res || !Array.isArray(res.questions)) continue;

    for (const q of res.questions) {
      const userChoiceIdx = res.userAnswers[q.id];
      if (userChoiceIdx !== q.correctIndex) {
        missed.push({
          id: `${entry.id}-${q.id}`,
          quizId: entry.id,
          quizDate: entry.createdAt,
          topic: q.topic,
          subcategory: q.subcategory,
          prompt: q.prompt,
          correctAnswer: q.options[q.correctIndex] || '',
          userAnswer:
            userChoiceIdx !== null && userChoiceIdx !== undefined
              ? q.options[userChoiceIdx]
              : 'Unanswered',
          explanation: q.explanation
        });
      }
    }
  }

  return missed.slice(0, 30); // show top 30 recent missed
}

export function savePreferences(prefs: Partial<QuizSettings>): void {
  try {
    const existing = getPreferences();
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...existing, ...prefs }));
  } catch (e) {
    console.warn('Failed to save preferences:', e);
  }
}

export function getPreferences(): Partial<QuizSettings> {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}
