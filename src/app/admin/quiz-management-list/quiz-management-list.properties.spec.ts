import { TestBed, ComponentFixture } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { QuizManagementListComponent } from './quiz-management-list.component';
import { QuizService } from '../../quiz/services/quiz.service';
import { QuizAdminService } from '../services/quiz-admin.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';
import { QuizSummary } from '../../shared/models/quiz.models';
import { Observable, of } from 'rxjs';

/**
 * Property 1: Quiz List Completeness
 *
 * *For any* array of QuizSummary objects returned by the service, the QuizManagementListComponent
 * SHALL render each quiz displaying its topic name, description, and question count, and each
 * rendered quiz item SHALL have an edit button and a delete button.
 *
 * **Validates: Requirements 2.1, 2.2**
 */

// --- Arbitraries ---

const quizSummaryArb: fc.Arbitrary<QuizSummary> = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  topicName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  questionCount: fc.integer({ min: 0, max: 100 })
});

const quizSummaryArrayArb: fc.Arbitrary<QuizSummary[]> = fc.array(quizSummaryArb, {
  minLength: 1,
  maxLength: 10
}).filter(arr => {
  // Ensure unique IDs
  const ids = arr.map(q => q.id);
  return new Set(ids).size === ids.length;
});

describe('Feature: quiz-crud-frontend, Property 1: Quiz List Completeness', () => {
  let fixture: ComponentFixture<QuizManagementListComponent>;
  let component: QuizManagementListComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QuizManagementListComponent],
      providers: [
        { provide: QuizService, useValue: { getQuizzes: () => of([]) } },
        { provide: QuizAdminService, useValue: { deleteQuiz: () => of(undefined) } },
        { provide: NotificationService, useValue: { showSuccess: () => {}, showError: () => {} } },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } }
      ]
    });

    fixture = TestBed.createComponent(QuizManagementListComponent);
    component = fixture.componentInstance;
    // Initial detectChanges triggers ngOnInit which calls loadQuizzes
    // The mock returns of([]) so loading becomes false and quizzes is []
    fixture.detectChanges();
  });

  it('for any array of QuizSummary objects, the component renders each with topic name, description, question count, edit button, and delete button', () => {
    fc.assert(
      fc.property(quizSummaryArrayArb, (quizzes: QuizSummary[]) => {
        // Set the quizzes signal directly with generated data
        component.quizzes.set(quizzes);
        component.loading.set(false);
        component.error.set(null);

        // Trigger change detection
        fixture.detectChanges();

        const nativeElement: HTMLElement = fixture.nativeElement;

        // Get all rendered quiz cards
        const quizCards = nativeElement.querySelectorAll('.quiz-card');
        expect(quizCards.length).toBe(quizzes.length);

        // Verify each quiz is rendered with the correct content
        quizCards.forEach((card, index) => {
          const quiz = quizzes[index];

          // Verify topic name is displayed
          const topicElement = card.querySelector('.quiz-card__topic');
          expect(topicElement).not.toBeNull();
          expect(topicElement!.textContent).toContain(quiz.topicName);

          // Verify description is displayed
          const descriptionElement = card.querySelector('.quiz-card__description');
          expect(descriptionElement).not.toBeNull();
          expect(descriptionElement!.textContent).toContain(quiz.description);

          // Verify question count is displayed
          const questionCountElement = card.querySelector('.quiz-card__question-count');
          expect(questionCountElement).not.toBeNull();
          expect(questionCountElement!.textContent).toContain(String(quiz.questionCount));

          // Verify edit button exists
          const editButton = card.querySelector('.btn-edit');
          expect(editButton).not.toBeNull();
          expect(editButton!.textContent).toContain('Edit');

          // Verify delete button exists
          const deleteButton = card.querySelector('.btn-delete');
          expect(deleteButton).not.toBeNull();
          expect(deleteButton!.textContent).toContain('Delete');
        });
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 4: Deletion Removes Quiz from List
 *
 * *For any* list of QuizSummary objects and any quiz in that list, after a successful delete
 * operation for that quiz, the resulting list SHALL NOT contain that quiz and its length SHALL
 * be exactly one less than the original.
 *
 * **Validates: Requirements 5.3**
 */

describe('Feature: quiz-crud-frontend, Property 4: Deletion Removes Quiz from List', () => {
  let fixture: ComponentFixture<QuizManagementListComponent>;
  let component: QuizManagementListComponent;
  let mockQuizAdminService: { deleteQuiz: (id: number) => Observable<undefined> };

  beforeEach(() => {
    mockQuizAdminService = { deleteQuiz: () => of(undefined) };

    TestBed.configureTestingModule({
      imports: [QuizManagementListComponent],
      providers: [
        { provide: QuizService, useValue: { getQuizzes: () => of([]) } },
        { provide: QuizAdminService, useValue: mockQuizAdminService },
        { provide: NotificationService, useValue: { showSuccess: () => {}, showError: () => {} } },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } }
      ]
    });

    fixture = TestBed.createComponent(QuizManagementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('for any list of QuizSummary objects and any quiz in that list, after a successful delete, the list does not contain the deleted quiz and length is one less', () => {
    fc.assert(
      fc.property(
        quizSummaryArrayArb.chain(quizzes => {
          // Pick a random index from the generated array
          return fc.tuple(
            fc.constant(quizzes),
            fc.integer({ min: 0, max: quizzes.length - 1 })
          );
        }),
        ([quizzes, deleteIndex]) => {
          const originalLength = quizzes.length;
          const quizToDelete = quizzes[deleteIndex];

          // Set the component's quizzes signal with the generated array
          component.quizzes.set([...quizzes]);

          // Set quizToDelete to the chosen quiz
          component.quizToDelete = quizToDelete;

          // Call onDeleteConfirmed
          component.onDeleteConfirmed();

          // Verify the resulting quizzes signal doesn't contain the deleted quiz
          const resultingQuizzes = component.quizzes();
          expect(resultingQuizzes.length).toBe(originalLength - 1);
          expect(resultingQuizzes.find(q => q.id === quizToDelete.id)).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
