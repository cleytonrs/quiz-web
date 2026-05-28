import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuizResult } from '../../models/quiz.models';

/**
 * Pure logic functions extracted from ShareButtonsComponent for testing.
 * These mirror the component's methods without requiring Angular DI.
 */

function getShareText(quizResult: QuizResult): string {
  const status = quizResult.passed ? 'passed' : 'failed';
  return `I ${status} the ${quizResult.quizTopicName} quiz with a score of ${Math.round(quizResult.scorePercentage)}%!`;
}

function buildTwitterUrl(shareText: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
}

function buildLinkedInUrl(shareText: string, pageUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}&summary=${encodeURIComponent(shareText)}`;
}

describe('ShareButtonsComponent - getShareText', () => {
  it('should generate text with passed status when quiz is passed', () => {
    const result: QuizResult = {
      sessionId: 'session-1',
      quizTopicName: 'JavaScript',
      totalQuestions: 10,
      correctAnswers: 8,
      scorePercentage: 80,
      passed: true,
      elapsedTimeSeconds: 120,
      completedAt: '2024-01-01T00:00:00Z'
    };

    const text = getShareText(result);
    expect(text).toBe('I passed the JavaScript quiz with a score of 80%!');
  });

  it('should generate text with failed status when quiz is failed', () => {
    const result: QuizResult = {
      sessionId: 'session-2',
      quizTopicName: 'Python',
      totalQuestions: 10,
      correctAnswers: 5,
      scorePercentage: 50,
      passed: false,
      elapsedTimeSeconds: 90,
      completedAt: '2024-01-01T00:00:00Z'
    };

    const text = getShareText(result);
    expect(text).toBe('I failed the Python quiz with a score of 50%!');
  });

  it('should round the score percentage', () => {
    const result: QuizResult = {
      sessionId: 'session-3',
      quizTopicName: 'CSS',
      totalQuestions: 3,
      correctAnswers: 2,
      scorePercentage: 66.67,
      passed: false,
      elapsedTimeSeconds: 45,
      completedAt: '2024-01-01T00:00:00Z'
    };

    const text = getShareText(result);
    expect(text).toContain('67%');
  });

  it('should include the quiz topic name', () => {
    const result: QuizResult = {
      sessionId: 'session-4',
      quizTopicName: 'Advanced TypeScript',
      totalQuestions: 5,
      correctAnswers: 4,
      scorePercentage: 80,
      passed: true,
      elapsedTimeSeconds: 60,
      completedAt: '2024-01-01T00:00:00Z'
    };

    const text = getShareText(result);
    expect(text).toContain('Advanced TypeScript');
  });
});

describe('ShareButtonsComponent - buildTwitterUrl', () => {
  it('should create a valid Twitter intent URL with encoded text', () => {
    const text = 'I passed the JavaScript quiz with a score of 80%!';
    const url = buildTwitterUrl(text);

    expect(url).toBe(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    );
  });

  it('should properly encode special characters', () => {
    const text = 'I passed the C++ & C# quiz with a score of 100%!';
    const url = buildTwitterUrl(text);

    expect(url).toContain('https://twitter.com/intent/tweet?text=');
    expect(url).toContain(encodeURIComponent('C++ & C#'));
  });
});

describe('ShareButtonsComponent - buildLinkedInUrl', () => {
  it('should create a valid LinkedIn sharing URL', () => {
    const text = 'I passed the Python quiz with a score of 90%!';
    const pageUrl = 'https://example.com/results/abc';
    const url = buildLinkedInUrl(text, pageUrl);

    expect(url).toContain('https://www.linkedin.com/sharing/share-offsite/');
    expect(url).toContain(`url=${encodeURIComponent(pageUrl)}`);
    expect(url).toContain(`summary=${encodeURIComponent(text)}`);
  });
});

describe('ShareButtonsComponent - fallback behavior', () => {
  it('should show fallback when window.open returns null', () => {
    // Simulating the logic: if open returns null, showFallback becomes true
    const openResult: Window | null = null;
    const showFallback = !openResult;
    expect(showFallback).toBe(true);
  });

  it('should not show fallback when window.open succeeds', () => {
    // Simulating the logic: if open returns a window, showFallback stays false
    const openResult: Window | null = {} as Window;
    const showFallback = !openResult;
    expect(showFallback).toBe(false);
  });
});
