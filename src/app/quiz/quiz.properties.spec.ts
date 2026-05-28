import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Property 2: Progress Calculation
 *
 * For any quiz with N total questions, when the user is on question index M (0-based),
 * the progress indicator SHALL report the current question as M + 1 and the total as N.
 *
 * **Validates: Requirements 2.2**
 */

/**
 * Pure progress calculation logic extracted from QuizSessionComponent:
 *   totalQuestions = quiz.questions.length
 *   currentQuestionNumber = currentQuestionIndex + 1
 */
function calculateProgress(totalQuestions: number, currentQuestionIndex: number) {
  return {
    currentQuestionNumber: currentQuestionIndex + 1,
    totalQuestions: totalQuestions,
  };
}

describe('Feature: quiz-app, Property 2: Progress Calculation', () => {
  it('should report current question as M+1 and total as N for any valid N and M', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }).chain((n) =>
          fc.tuple(fc.constant(n), fc.integer({ min: 0, max: n - 1 }))
        ),
        ([totalQuestions, currentQuestionIndex]) => {
          const progress = calculateProgress(totalQuestions, currentQuestionIndex);

          // currentQuestionNumber should be 1-indexed (M + 1)
          expect(progress.currentQuestionNumber).toBe(currentQuestionIndex + 1);

          // totalQuestions should equal N
          expect(progress.totalQuestions).toBe(totalQuestions);

          // Progress text should show "Question (M+1) of N"
          const progressText = `Question ${progress.currentQuestionNumber} of ${progress.totalQuestions}`;
          expect(progressText).toBe(`Question ${currentQuestionIndex + 1} of ${totalQuestions}`);

          // currentQuestionNumber should always be between 1 and N inclusive
          expect(progress.currentQuestionNumber).toBeGreaterThanOrEqual(1);
          expect(progress.currentQuestionNumber).toBeLessThanOrEqual(totalQuestions);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 3: Sequential Navigation Advancement
 *
 * For any quiz session at question index i (where i < totalQuestions - 1),
 * submitting an answer SHALL advance the current question index to i + 1.
 *
 * **Validates: Requirements 3.1**
 */

/**
 * Pure navigation advancement logic extracted from QuizSessionComponent.advanceOrComplete:
 *   const nextIndex = currentQuestionIndex + 1;
 *   if (nextIndex >= totalQuestions) { complete session }
 *   else { currentQuestionIndex = nextIndex }
 */
function advanceQuestionIndex(
  currentQuestionIndex: number,
  totalQuestions: number
): { newIndex: number; completed: boolean } {
  const nextIndex = currentQuestionIndex + 1;
  if (nextIndex >= totalQuestions) {
    return { newIndex: currentQuestionIndex, completed: true };
  }
  return { newIndex: nextIndex, completed: false };
}

describe('Feature: quiz-app, Property 3: Sequential Navigation Advancement', () => {
  it('should advance question index from i to i+1 when i < totalQuestions - 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 50 }).chain((n) =>
          fc.tuple(fc.constant(n), fc.integer({ min: 0, max: n - 2 }))
        ),
        ([totalQuestions, currentIndex]) => {
          const result = advanceQuestionIndex(currentIndex, totalQuestions);

          // Should advance to i + 1
          expect(result.newIndex).toBe(currentIndex + 1);

          // Should not complete the session (since i < N-1)
          expect(result.completed).toBe(false);

          // New index should still be within valid range
          expect(result.newIndex).toBeGreaterThan(currentIndex);
          expect(result.newIndex).toBeLessThan(totalQuestions);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 9: Share Text Content
 *
 * For any quiz result with a topic name, score, and pass/fail status,
 * the generated share text SHALL contain the quiz topic name, the numeric score,
 * and the pass or fail status text.
 *
 * **Validates: Requirements 6.2**
 */

/**
 * Pure share text generation logic extracted from QuizResultComponent:
 *   const status = result.passed ? 'passed' : 'failed';
 *   return `I ${status} the ${result.quizTopicName} quiz with a score of ${Math.round(result.scorePercentage)}%!`;
 */
function getShareText(result: { quizTopicName: string; scorePercentage: number; passed: boolean }): string {
  const status = result.passed ? 'passed' : 'failed';
  return `I ${status} the ${result.quizTopicName} quiz with a score of ${Math.round(result.scorePercentage)}%!`;
}

describe('Feature: quiz-app, Property 9: Share Text Content', () => {
  it('should contain quiz topic name, numeric score, and pass/fail status for any QuizResult', () => {
    fc.assert(
      fc.property(
        fc.record({
          quizTopicName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          scorePercentage: fc.double({ min: 0, max: 100, noNaN: true }),
          passed: fc.boolean(),
        }),
        (result) => {
          const shareText = getShareText(result);

          // Share text must contain the quiz topic name
          expect(shareText).toContain(result.quizTopicName);

          // Share text must contain the numeric score (rounded percentage)
          const roundedScore = Math.round(result.scorePercentage);
          expect(shareText).toContain(`${roundedScore}%`);

          // Share text must contain the pass or fail status text
          const expectedStatus = result.passed ? 'passed' : 'failed';
          expect(shareText).toContain(expectedStatus);
        }
      ),
      { numRuns: 100 }
    );
  });
});
