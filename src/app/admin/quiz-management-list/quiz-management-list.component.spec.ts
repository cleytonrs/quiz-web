import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QuizManagementListComponent } from './quiz-management-list.component';
import { QuizSummary } from '../../shared/models/quiz.models';

/**
 * Unit tests for QuizManagementListComponent
 *
 * Tests loading state, error state with retry, create button navigation,
 * and delete confirmation flow.
 *
 * **Validates: Requirements 2.3, 2.4, 2.5, 5.1**
 */

describe('QuizManagementListComponent', () => {
  let fixture: ComponentFixture<QuizManagementListComponent>;
  let component: QuizManagementListComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  const mockQuizzes: QuizSummary[] = [
    { id: 1, topicName: 'JavaScript', description: 'JS basics quiz', questionCount: 10 },
    { id: 2, topicName: 'TypeScript', description: 'TS fundamentals', questionCount: 5 },
    { id: 3, topicName: 'Angular', description: 'Angular framework', questionCount: 8 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizManagementListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(QuizManagementListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function initComponent() {
    fixture.detectChanges(); // triggers ngOnInit
  }

  function flushQuizzes(quizzes: QuizSummary[] = mockQuizzes) {
    httpTesting.expectOne('/api/quizzes').flush(quizzes);
    fixture.detectChanges();
  }

  function flushError() {
    httpTesting.expectOne('/api/quizzes').error(new ProgressEvent('error'));
    fixture.detectChanges();
  }

  describe('loading state', () => {
    it('should display loading indicator while quizzes are being fetched', () => {
      initComponent();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.loading-state')).toBeTruthy();
      expect(compiled.textContent).toContain('Loading quizzes...');

      flushQuizzes();
    });

    it('should hide loading indicator after quizzes are loaded', () => {
      initComponent();
      flushQuizzes();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.loading-state')).toBeNull();
    });

    it('should hide loading indicator after fetch error', () => {
      initComponent();
      flushError();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.loading-state')).toBeNull();
    });
  });

  describe('error state with retry', () => {
    it('should display error message when fetch fails', () => {
      initComponent();
      flushError();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.error-state')).toBeTruthy();
      expect(compiled.textContent).toContain('Failed to load quizzes');
    });

    it('should display a retry button in error state', () => {
      initComponent();
      flushError();

      const compiled = fixture.nativeElement as HTMLElement;
      const retryButton = compiled.querySelector('.error-state button');
      expect(retryButton).toBeTruthy();
      expect(retryButton!.textContent).toContain('Retry');
    });

    it('should reload quizzes when retry button is clicked', () => {
      initComponent();
      flushError();

      const compiled = fixture.nativeElement as HTMLElement;
      const retryButton = compiled.querySelector('.error-state button') as HTMLElement;
      retryButton.click();
      fixture.detectChanges();

      // Should show loading state again
      expect(compiled.querySelector('.loading-state')).toBeTruthy();

      flushQuizzes();

      // Should now show quizzes
      const cards = compiled.querySelectorAll('.quiz-card');
      expect(cards.length).toBe(3);
    });

    it('should clear error state when retry succeeds', () => {
      initComponent();
      flushError();

      const compiled = fixture.nativeElement as HTMLElement;
      const retryButton = compiled.querySelector('.error-state button') as HTMLElement;
      retryButton.click();
      fixture.detectChanges();

      flushQuizzes();

      expect(compiled.querySelector('.error-state')).toBeNull();
    });
  });

  describe('create button navigation', () => {
    it('should display a Create New Quiz button', () => {
      initComponent();
      flushQuizzes();

      const compiled = fixture.nativeElement as HTMLElement;
      const createButton = compiled.querySelector('.quiz-management__header button');
      expect(createButton).toBeTruthy();
      expect(createButton!.textContent).toContain('Create New Quiz');
    });

    it('should navigate to /admin/quizzes/create when Create New Quiz is clicked', () => {
      initComponent();
      flushQuizzes();

      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      const compiled = fixture.nativeElement as HTMLElement;
      const createButton = compiled.querySelector('.quiz-management__header button') as HTMLElement;
      createButton.click();

      expect(navigateSpy).toHaveBeenCalledWith(['/admin/quizzes/create']);
    });
  });

  describe('delete confirmation flow', () => {
    it('should open delete dialog when delete button is clicked', () => {
      initComponent();
      flushQuizzes();

      const compiled = fixture.nativeElement as HTMLElement;
      const deleteButton = compiled.querySelector('.btn-delete') as HTMLElement;
      deleteButton.click();
      fixture.detectChanges();

      expect(component.deleteDialogVisible).toBe(true);
      expect(component.quizToDelete).toEqual(mockQuizzes[0]);
    });

    it('should send DELETE request when deletion is confirmed', () => {
      initComponent();
      flushQuizzes();

      // Set up delete state and call onDeleteConfirmed
      component.quizToDelete = mockQuizzes[0];
      component.deleteDialogVisible = true;
      component.onDeleteConfirmed();

      const deleteReq = httpTesting.expectOne('/api/quizzes/1');
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush(null);
    });

    it('should remove quiz from list after successful deletion', () => {
      initComponent();
      flushQuizzes();

      component.quizToDelete = mockQuizzes[0];
      component.deleteDialogVisible = true;
      component.onDeleteConfirmed();

      httpTesting.expectOne('/api/quizzes/1').flush(null);

      expect(component.quizzes().length).toBe(2);
      expect(component.quizzes().find(q => q.id === 1)).toBeUndefined();
    });

    it('should close dialog and reset state when deletion is cancelled', () => {
      initComponent();
      flushQuizzes();

      component.quizToDelete = mockQuizzes[0];
      component.deleteDialogVisible = true;

      component.onDeleteCancelled();

      expect(component.deleteDialogVisible).toBe(false);
      expect(component.quizToDelete).toBeNull();
    });

    it('should retain quiz in list when delete API returns error', () => {
      initComponent();
      flushQuizzes();

      component.quizToDelete = mockQuizzes[0];
      component.deleteDialogVisible = true;
      component.onDeleteConfirmed();

      httpTesting.expectOne('/api/quizzes/1').error(new ProgressEvent('error'));

      expect(component.quizzes().length).toBe(3);
      expect(component.quizzes().find(q => q.id === 1)).toBeDefined();
    });
  });
});
