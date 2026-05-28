import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { QuizAdminService } from './quiz-admin.service';
import { CreateQuizRequest, UpdateQuizRequest, CreateQuestionRequest, CreateAnswerOptionRequest } from '../../shared/models/quiz-admin.models';

/**
 * Property 8: Service Request Correctness
 *
 * *For any* valid CreateQuizRequest payload, calling `QuizAdminService.createQuiz()` SHALL issue
 * a POST request to `/api/quizzes` with that exact payload as the request body.
 * *For any* valid quiz ID and UpdateQuizRequest payload, calling `QuizAdminService.updateQuiz()`
 * SHALL issue a PUT request to `/api/quizzes/{id}` with that payload.
 * *For any* valid quiz ID, calling `QuizAdminService.deleteQuiz()` SHALL issue a DELETE request
 * to `/api/quizzes/{id}`.
 *
 * **Validates: Requirements 7.1, 7.2, 7.3**
 */

// --- Arbitraries ---

const answerOptionArb: fc.Arbitrary<CreateAnswerOptionRequest> = fc.record({
  text: fc.string({ minLength: 1, maxLength: 100 }),
  isCorrect: fc.boolean()
});

const questionArb: fc.Arbitrary<CreateQuestionRequest> = fc.record({
  text: fc.string({ minLength: 1, maxLength: 200 }),
  answerOptions: fc.array(answerOptionArb, { minLength: 4, maxLength: 4 })
});

const createQuizRequestArb: fc.Arbitrary<CreateQuizRequest> = fc.record({
  topicName: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  questions: fc.array(questionArb, { minLength: 1, maxLength: 10 })
});

const updateQuizRequestArb: fc.Arbitrary<UpdateQuizRequest> = fc.record({
  topicName: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  questions: fc.array(questionArb, { minLength: 1, maxLength: 10 })
});

const quizIdArb: fc.Arbitrary<number> = fc.integer({ min: 1, max: 10000 });

describe('Feature: quiz-crud-frontend, Property 8: Service Request Correctness', () => {
  let service: QuizAdminService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(QuizAdminService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('createQuiz SHALL issue a POST request to /api/quizzes with the exact payload', () => {
    fc.assert(
      fc.property(createQuizRequestArb, (payload: CreateQuizRequest) => {
        service.createQuiz(payload).subscribe();

        const req = httpTesting.expectOne('/api/quizzes');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(payload);

        req.flush({ id: 1, topicName: payload.topicName, description: payload.description, questions: [] });
      }),
      { numRuns: 100 }
    );
  });

  it('updateQuiz SHALL issue a PUT request to /api/quizzes/{id} with the exact payload', () => {
    fc.assert(
      fc.property(quizIdArb, updateQuizRequestArb, (id: number, payload: UpdateQuizRequest) => {
        service.updateQuiz(id, payload).subscribe();

        const req = httpTesting.expectOne(`/api/quizzes/${id}`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(payload);

        req.flush({ id, topicName: payload.topicName, description: payload.description, questions: [] });
      }),
      { numRuns: 100 }
    );
  });

  it('deleteQuiz SHALL issue a DELETE request to /api/quizzes/{id}', () => {
    fc.assert(
      fc.property(quizIdArb, (id: number) => {
        service.deleteQuiz(id).subscribe();

        const req = httpTesting.expectOne(`/api/quizzes/${id}`);
        expect(req.request.method).toBe('DELETE');

        req.flush(null);
      }),
      { numRuns: 100 }
    );
  });
});
