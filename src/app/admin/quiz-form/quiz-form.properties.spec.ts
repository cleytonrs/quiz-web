import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { QuizFormComponent, exactlyOneCorrectValidator } from './quiz-form.component';
import { QuizService } from '../../quiz/services/quiz.service';
import { QuizAdminService } from '../services/quiz-admin.service';
import { NotificationService } from '../../core/services/notification.service';

/**
 * Property 2: Question Add/Remove Invariant
 *
 * *For any* quiz form with N questions (N ≥ 1), adding a question SHALL result in N+1 questions
 * in the form. *For any* quiz form with N questions where N > 1, removing a question SHALL result
 * in N-1 questions. *For any* quiz form with exactly 1 question, removal SHALL be prevented and
 * the form SHALL retain 1 question.
 *
 * **Validates: Requirements 3.2, 3.3, 4.3**
 */

describe('Feature: quiz-crud-frontend, Property 2: Question Add/Remove Invariant', () => {
  let component: QuizFormComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, QuizFormComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } }
        },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: QuizService, useValue: { getQuiz: () => ({ subscribe: () => {} }) } },
        { provide: QuizAdminService, useValue: { createQuiz: () => ({ subscribe: () => {} }) } },
        { provide: NotificationService, useValue: { showSuccess: () => {}, showError: () => {} } }
      ]
    });

    const fixture = TestBed.createComponent(QuizFormComponent);
    component = fixture.componentInstance;
  });

  it('adding a question to a form with N questions (N≥1) SHALL result in N+1 questions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (n: number) => {
          // Reset to empty questions
          component.questions.clear();

          // Add N questions to start with
          for (let i = 0; i < n; i++) {
            component.addQuestion();
          }
          expect(component.questions.length).toBe(n);

          // Adding one more question should result in N+1
          component.addQuestion();
          expect(component.questions.length).toBe(n + 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('removing a question from a form with N questions (N>1) SHALL result in N-1 questions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 20 }).chain((n) =>
          fc.tuple(fc.constant(n), fc.integer({ min: 0, max: n - 1 }))
        ),
        ([n, removeIndex]: [number, number]) => {
          // Reset to empty questions
          component.questions.clear();

          // Add N questions
          for (let i = 0; i < n; i++) {
            component.addQuestion();
          }
          expect(component.questions.length).toBe(n);

          // Removing a question at a valid index should result in N-1
          component.removeQuestion(removeIndex);
          expect(component.questions.length).toBe(n - 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('removing a question from a form with exactly 1 question SHALL be prevented and retain 1 question', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 0 }),
        (removeIndex: number) => {
          // Reset to empty questions
          component.questions.clear();

          // Add exactly 1 question
          component.addQuestion();
          expect(component.questions.length).toBe(1);

          // Attempting to remove should be prevented
          component.removeQuestion(removeIndex);
          expect(component.questions.length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 3: Form Population Round-Trip
 *
 * *For any* valid QuizDetail object (with non-empty topic name, description, and at least one
 * question where each question has exactly 4 answer options with exactly one correct), populating
 * the QuizFormComponent and then extracting the form values as a request DTO SHALL produce data
 * equivalent to the original QuizDetail (matching topic name, description, question texts, answer
 * option texts, and correct answer selections).
 *
 * **Validates: Requirements 4.1**
 */

describe('Feature: quiz-crud-frontend, Property 3: Form Population Round-Trip', () => {
  let component: QuizFormComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, QuizFormComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } }
        },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: QuizService, useValue: { getQuiz: () => ({ subscribe: () => {} }) } },
        { provide: QuizAdminService, useValue: { createQuiz: () => ({ subscribe: () => {} }) } },
        { provide: NotificationService, useValue: { showSuccess: () => {}, showError: () => {} } }
      ]
    });

    const fixture = TestBed.createComponent(QuizFormComponent);
    component = fixture.componentInstance;
  });

  // Arbitrary for a single answer option
  const answerOptionArb = (id: number, isCorrect: boolean) =>
    fc.record({
      id: fc.constant(id),
      text: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
      isCorrect: fc.constant(isCorrect)
    });

  // Arbitrary for exactly 4 answer options with exactly one correct
  const answerOptionsArb = fc.integer({ min: 0, max: 3 }).chain(correctIndex =>
    fc.tuple(
      ...([0, 1, 2, 3].map(i => answerOptionArb(i + 1, i === correctIndex)))
    )
  );

  // Arbitrary for a single question
  const questionArb = (index: number) =>
    answerOptionsArb.chain(answerOptions =>
      fc.record({
        id: fc.integer({ min: 1, max: 10000 }),
        text: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        orderIndex: fc.constant(index),
        answerOptions: fc.constant(answerOptions)
      })
    );

  // Arbitrary for a valid QuizDetail
  const quizDetailArb = fc.integer({ min: 1, max: 5 }).chain(numQuestions =>
    fc.tuple(
      fc.integer({ min: 1, max: 10000 }),
      fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
      fc.tuple(...Array.from({ length: numQuestions }, (_, i) => questionArb(i)))
    ).map(([id, topicName, description, questions]) => ({
      id,
      topicName,
      description,
      questions
    }))
  );

  it('populating the form and extracting values SHALL produce data equivalent to the original QuizDetail', () => {
    fc.assert(
      fc.property(
        quizDetailArb,
        (quiz) => {
          // Populate the form with the generated QuizDetail
          (component as any).populateForm(quiz);

          // Extract form values
          const formValue = component.quizForm.getRawValue();

          // Assert topic name matches
          expect(formValue.topicName).toBe(quiz.topicName);

          // Assert description matches
          expect(formValue.description).toBe(quiz.description);

          // Assert question count matches
          expect(formValue.questions.length).toBe(quiz.questions.length);

          // Assert each question's data matches
          for (let i = 0; i < quiz.questions.length; i++) {
            const originalQuestion = quiz.questions[i];
            const formQuestion = formValue.questions[i];

            // Question text matches
            expect(formQuestion.text).toBe(originalQuestion.text);

            // Answer options count matches
            expect(formQuestion.answerOptions.length).toBe(originalQuestion.answerOptions.length);

            // Each answer option matches
            for (let j = 0; j < originalQuestion.answerOptions.length; j++) {
              const originalOption = originalQuestion.answerOptions[j];
              const formOption = formQuestion.answerOptions[j];

              expect(formOption.text).toBe(originalOption.text);
              expect(formOption.isCorrect).toBe(originalOption.isCorrect);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 5: Answer Option Structure Invariant
 *
 * *For any* quiz form with N questions (N ≥ 1), each question's answer options FormArray SHALL
 * contain exactly 4 controls, regardless of how many questions have been added or removed.
 *
 * **Validates: Requirements 6.1**
 */

describe('Feature: quiz-crud-frontend, Property 5: Answer Option Structure Invariant', () => {
  let component: QuizFormComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, QuizFormComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } }
        },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: QuizService, useValue: { getQuiz: () => ({ subscribe: () => {} }) } },
        { provide: QuizAdminService, useValue: { createQuiz: () => ({ subscribe: () => {} }) } },
        { provide: NotificationService, useValue: { showSuccess: () => {}, showError: () => {} } }
      ]
    });

    const fixture = TestBed.createComponent(QuizFormComponent);
    component = fixture.componentInstance;
  });

  // Arbitrary for a sequence of add/remove operations
  const operationArb = fc.oneof(
    fc.constant({ type: 'add' as const }),
    fc.nat({ max: 50 }).map(index => ({ type: 'remove' as const, index }))
  );

  it('each question always has exactly 4 answer option controls regardless of add/remove operations', () => {
    fc.assert(
      fc.property(
        fc.array(operationArb, { minLength: 1, maxLength: 30 }),
        (operations) => {
          // Reset form to a clean state with one question
          component.questions.clear();
          component.addQuestion();

          for (const op of operations) {
            if (op.type === 'add') {
              component.addQuestion();
            } else {
              // Use modulo to target a valid index within current questions
              const currentLength = component.questions.length;
              const targetIndex = op.index % currentLength;
              component.removeQuestion(targetIndex);
            }

            // After each operation, verify every question has exactly 4 answer options
            for (let i = 0; i < component.questions.length; i++) {
              expect(component.getAnswerOptions(i).length).toBe(4);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 6: Correct Answer Exclusivity
 *
 * *For any* question in the form and any answer index I (0 ≤ I ≤ 3), calling setCorrectAnswer
 * for that question and index SHALL result in exactly one answer option having isCorrect=true
 * (at index I) and all other answer options having isCorrect=false.
 *
 * **Validates: Requirements 6.2**
 */

describe('Feature: quiz-crud-frontend, Property 6: Correct Answer Exclusivity', () => {
  let component: QuizFormComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, QuizFormComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } }
        },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: QuizService, useValue: { getQuiz: () => ({ subscribe: () => {} }) } },
        { provide: QuizAdminService, useValue: { createQuiz: () => ({ subscribe: () => {} }) } },
        { provide: NotificationService, useValue: { showSuccess: () => {}, showError: () => {} } }
      ]
    });

    const fixture = TestBed.createComponent(QuizFormComponent);
    component = fixture.componentInstance;
  });

  it('calling setCorrectAnswer(questionIndex, answerIndex) results in exactly one isCorrect=true at that index', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        fc.integer({ min: 0, max: 3 }),
        (numQuestions: number, answerIndex: number) => {
          // Reset form and add the specified number of questions
          component.questions.clear();
          for (let i = 0; i < numQuestions; i++) {
            component.addQuestion();
          }

          // Generate a valid question index
          const questionIndex = numQuestions - 1; // Use last question to ensure valid index

          // Call setCorrectAnswer
          component.setCorrectAnswer(questionIndex, answerIndex);

          // Verify exactly one answer option has isCorrect=true
          const answerOptions = component.getAnswerOptions(questionIndex);
          const correctCount = answerOptions.controls
            .filter(ctrl => ctrl.get('isCorrect')?.value === true).length;
          expect(correctCount).toBe(1);

          // Verify the correct answer is at the specified index
          expect(answerOptions.at(answerIndex).get('isCorrect')?.value).toBe(true);

          // Verify all other answer options have isCorrect=false
          for (let i = 0; i < answerOptions.length; i++) {
            if (i !== answerIndex) {
              expect(answerOptions.at(i).get('isCorrect')?.value).toBe(false);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('calling setCorrectAnswer on any question index results in exclusivity for that question', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }).chain((numQuestions) =>
          fc.tuple(
            fc.constant(numQuestions),
            fc.integer({ min: 0, max: numQuestions - 1 }),
            fc.integer({ min: 0, max: 3 })
          )
        ),
        ([numQuestions, questionIndex, answerIndex]: [number, number, number]) => {
          // Reset form and add the specified number of questions
          component.questions.clear();
          for (let i = 0; i < numQuestions; i++) {
            component.addQuestion();
          }

          // Call setCorrectAnswer for the randomly chosen question and answer index
          component.setCorrectAnswer(questionIndex, answerIndex);

          // Verify exactly one answer option has isCorrect=true at the specified index
          const answerOptions = component.getAnswerOptions(questionIndex);
          const correctCount = answerOptions.controls
            .filter(ctrl => ctrl.get('isCorrect')?.value === true).length;
          expect(correctCount).toBe(1);

          // Verify the correct answer is at the specified index
          expect(answerOptions.at(answerIndex).get('isCorrect')?.value).toBe(true);

          // Verify all other answer options have isCorrect=false
          for (let i = 0; i < answerOptions.length; i++) {
            if (i !== answerIndex) {
              expect(answerOptions.at(i).get('isCorrect')?.value).toBe(false);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 7: Correct Answer Validation
 *
 * *For any* question FormGroup where zero or more than one answer options have isCorrect=true
 * (i.e., the count of correct answers ≠ 1), the exactlyOneCorrect validator SHALL return a
 * validation error. *For any* question FormGroup where exactly one answer option has
 * isCorrect=true, the validator SHALL return null (valid).
 *
 * **Validates: Requirements 6.3**
 */

describe('Feature: quiz-crud-frontend, Property 7: Correct Answer Validation', () => {
  it('validator returns error when correct count ≠ 1 (zero or more than one correct)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.boolean(), { minLength: 4, maxLength: 4 }).filter(
          (booleans) => booleans.filter(b => b).length !== 1
        ),
        (isCorrectValues: boolean[]) => {
          const answerOptions = new FormArray(
            isCorrectValues.map(
              (isCorrect) =>
                new FormGroup({
                  text: new FormControl('Answer text'),
                  isCorrect: new FormControl(isCorrect)
                })
            )
          );

          const questionGroup = new FormGroup({
            text: new FormControl('Question text'),
            answerOptions: answerOptions
          });

          const result = exactlyOneCorrectValidator(questionGroup);
          expect(result).toEqual({ exactlyOneCorrect: true });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('validator returns null when exactly one answer option is correct', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3 }),
        (correctIndex: number) => {
          const answerOptions = new FormArray(
            [0, 1, 2, 3].map(
              (i) =>
                new FormGroup({
                  text: new FormControl(`Answer ${i + 1}`),
                  isCorrect: new FormControl(i === correctIndex)
                })
            )
          );

          const questionGroup = new FormGroup({
            text: new FormControl('Question text'),
            answerOptions: answerOptions
          });

          const result = exactlyOneCorrectValidator(questionGroup);
          expect(result).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
