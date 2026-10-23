import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateQuizScore,
  getPerformanceSummary,
  shuffleArray,
  shuffleQuestionAnswers,
  selectQuestionsFromBank,
  validateQuestion,
  formatDuration
} from './quizLogic';
import { QuizQuestion } from '../types/quiz';

const sampleQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'Question 1',
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 1, // B
    explanation: 'B is right',
    topic: 'Python',
    difficulty: 'easy',
    source: 'bank'
  },
  {
    id: 'q2',
    prompt: 'Question 2',
    options: ['W', 'X', 'Y', 'Z'],
    correctIndex: 3, // Z
    explanation: 'Z is right',
    topic: 'Python',
    difficulty: 'medium',
    source: 'bank'
  },
  {
    id: 'q3',
    prompt: 'Question 3',
    options: ['1', '2', '3', '4'],
    correctIndex: 0, // 1
    explanation: '1 is right',
    topic: 'Machine Learning',
    difficulty: 'hard',
    source: 'bank'
  }
];

test('calculateQuizScore handles perfect scores accurately', () => {
  const userAnswers = { q1: 1, q2: 3, q3: 0 };
  const res = calculateQuizScore(sampleQuestions, userAnswers);

  assert.equal(res.totalQuestions, 3);
  assert.equal(res.correctCount, 3);
  assert.equal(res.incorrectCount, 0);
  assert.equal(res.unansweredCount, 0);
  assert.equal(res.scorePercentage, 100);
  assert.equal(res.isPerfect, true);
  assert.deepEqual(res.missedQuestionIds, []);
});

test('calculateQuizScore handles partial and unanswered questions with no negative scoring', () => {
  // q1 correct, q2 wrong, q3 unanswered
  const userAnswers = { q1: 1, q2: 0, q3: null };
  const res = calculateQuizScore(sampleQuestions, userAnswers);

  assert.equal(res.totalQuestions, 3);
  assert.equal(res.correctCount, 1);
  assert.equal(res.incorrectCount, 1);
  assert.equal(res.unansweredCount, 1);
  assert.equal(res.scorePercentage, 33);
  assert.equal(res.isPerfect, false);
  assert.deepEqual(res.missedQuestionIds, ['q2', 'q3']);
});

test('shuffleQuestionAnswers preserves the exact correct answer text', () => {
  const original = sampleQuestions[0];
  const originalCorrectText = original.options[original.correctIndex]; // 'B'

  // Run 10 times to test random permutations
  for (let i = 0; i < 10; i++) {
    const shuffled = shuffleQuestionAnswers(original);
    assert.equal(shuffled.options.length, 4);
    assert.ok(shuffled.correctIndex >= 0 && shuffled.correctIndex <= 3);
    assert.equal(shuffled.options[shuffled.correctIndex], originalCorrectText);
  }
});

test('validateQuestion rejects duplicate options', () => {
  const duplicateOptionsRaw = {
    prompt: 'Valid prompt here?',
    options: ['Paris', 'London', 'Paris', 'Berlin'],
    correctIndex: 0,
    explanation: 'Paris is the capital of France.',
    topic: 'General Knowledge',
    difficulty: 'easy'
  };

  const res = validateQuestion(duplicateOptionsRaw, 'General Knowledge', 'easy');
  assert.equal(res.valid, false);
  assert.match(res.error || '', /distinct/);
});

test('validateQuestion rejects out-of-range correctIndex', () => {
  const invalidIndexRaw = {
    prompt: 'Valid prompt here?',
    options: ['Alpha', 'Beta', 'Gamma', 'Delta'],
    correctIndex: 4, // Out of bounds 0..3
    explanation: 'Explanation text here',
    topic: 'Math',
    difficulty: 'easy'
  };

  const res = validateQuestion(invalidIndexRaw, 'Math', 'easy');
  assert.equal(res.valid, false);
  assert.match(res.error || '', /correctIndex/);
});

test('validateQuestion accepts valid well-structured questions', () => {
  const validRaw = {
    prompt: 'What is gradient descent?',
    options: ['Optimization algorithm', 'A database index', 'A sorting method', 'A hashing function'],
    correctIndex: 0,
    explanation: 'Gradient descent minimizes the objective loss function.',
    topic: 'Machine Learning',
    difficulty: 'easy'
  };

  const res = validateQuestion(validRaw, 'Machine Learning', 'easy');
  assert.equal(res.valid, true);
  assert.equal(res.question?.prompt, 'What is gradient descent?');
  assert.equal(res.question?.options[0], 'Optimization algorithm');
  assert.equal(res.question?.source, 'ai');
});

test('selectQuestionsFromBank matches topic and respects count limit', () => {
  const selected = selectQuestionsFromBank(sampleQuestions, {
    topic: 'Python',
    difficulty: 'mixed',
    count: 2,
    shuffleQuestions: false,
    shuffleAnswers: false
  });

  assert.equal(selected.length, 2);
  assert.equal(selected[0].topic, 'Python');
  assert.equal(selected[1].topic, 'Python');
});

test('formatDuration formats seconds and minutes properly', () => {
  assert.equal(formatDuration(45), '45s');
  assert.equal(formatDuration(65), '1m 05s');
  assert.equal(formatDuration(180), '3m 00s');
});
