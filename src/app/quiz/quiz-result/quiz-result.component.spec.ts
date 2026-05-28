import { describe, it, expect } from 'vitest';
import { QuizResult } from '../../shared/models/quiz.models';

/**
 * Pure logic functions extracted from QuizResultComponent for testing.
 * These mirror the component's methods without requiring Angular DI.
 */

function formatElapsedTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

function getShareText(result: QuizResult): string {
  const status = result.passed ? 'passed' : 'failed';
  return `I ${status} the ${result.quizTopicName} quiz with a score of ${Math.round(result.scorePercentage)}%!`;
}

function getPassMessage(passed: boolean): string {
  return passed
    ? 'Congratulations! You passed!'
    : "You didn't pass this time. Try again!";
}

function getScoreText(correctAnswers: number, totalQuestions: number): string {
  return `${correctAnswers} out of ${totalQuestions} correct`;
}

function getPercentageText(scorePercentage: number): string {
  return `${Math.round(scorePercentage)}%`;
}

describe('QuizResultComponent - formatElapsedTime', () => {
  it('should format seconds only when less than 60', () => {
    expect(formatElapsedTime(45)).toBe('45s');
  });

  it('should format minutes and seconds when 60 or more', () => {
    expect(formatElapsedTime(125)).toBe('2m 5s');
  });

  it('should format exactly 60 seconds as 1m 0s', () => {
    expect(formatElapsedTime(60)).toBe('1m 0s');
  });

  it('should format 0 seconds as 0s', () => {
    expect(formatElapsedTime(0)).toBe('0s');
  });
});

describe('QuizResultComponent - getShareText', () => {
  it('should include topic name, score, and passed status', () => {
    const result: QuizResult = {
      sessionId: 'abc-123',
      quizTopicName: 'JavaScript',
      totalQuestions: 10,
      correctAnswers: 8,
      scorePercentage: 80,
      passed: true,
      elapsedTimeSeconds: 120,
      completedAt: '2024-01-01T00:00:00Z'
    };

    const text = getShareText(result);
    expect(text).toContain('JavaScript');
    expect(text).toContain('80%');
    expect(text).toContain('passed');
  });

  it('should include failed status when not passed', () => {
    const result: QuizResult = {
      sessionId: 'abc-123',
      quizTopicName: 'Python',
      totalQuestions: 10,
      correctAnswers: 5,
      scorePercentage: 50,
      passed: false,
      elapsedTimeSeconds: 90,
      completedAt: '2024-01-01T00:00:00Z'
    };

    const text = getShareText(result);
    expect(text).toContain('Python');
    expect(text).toContain('50%');
    expect(text).toContain('failed');
  });

  it('should round score percentage in share text', () => {
    const result: QuizResult = {
      sessionId: 'abc-123',
      quizTopicName: 'CSS',
      totalQuestions: 3,
      correctAnswers: 2,
      scorePercentage: 66.67,
      passed: false,
      elapsedTimeSeconds: 30,
      completedAt: '2024-01-01T00:00:00Z'
    };

    const text = getShareText(result);
    expect(text).toContain('67%');
  });
});

describe('QuizResultComponent - getPassMessage', () => {
  it('should return congratulations message when passed', () => {
    expect(getPassMessage(true)).toBe('Congratulations! You passed!');
  });

  it('should return encouragement message when failed', () => {
    expect(getPassMessage(false)).toBe("You didn't pass this time. Try again!");
  });
});

describe('QuizResultComponent - getScoreText', () => {
  it('should format correct answers out of total', () => {
    expect(getScoreText(7, 10)).toBe('7 out of 10 correct');
  });

  it('should handle perfect score', () => {
    expect(getScoreText(5, 5)).toBe('5 out of 5 correct');
  });

  it('should handle zero correct', () => {
    expect(getScoreText(0, 10)).toBe('0 out of 10 correct');
  });
});

describe('QuizResultComponent - getPercentageText', () => {
  it('should format whole number percentage', () => {
    expect(getPercentageText(80)).toBe('80%');
  });

  it('should round decimal percentage', () => {
    expect(getPercentageText(66.67)).toBe('67%');
  });

  it('should handle 100%', () => {
    expect(getPercentageText(100)).toBe('100%');
  });

  it('should handle 0%', () => {
    expect(getPercentageText(0)).toBe('0%');
  });
});
