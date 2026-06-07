import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QuizAdminService } from './quiz-admin.service';
import { CreateQuizRequest, UpdateQuizRequest } from '../../shared/models/quiz-admin.models';
import { QuizDetail } from '../../shared/models/quiz.models';

/**
 * Unit tests for QuizAdminService
 *
 * Tests successful create, update, delete calls and error handling scenarios.
**/

describe('QuizAdminService', () => {
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

  describe('createQuiz', () => {
    const createRequest: CreateQuizRequest = {
      topicName: 'Angular Basics',
      description: 'A quiz about Angular fundamentals',
      questions: [
        {
          text: 'What is Angular?',
          answerOptions: [
            { text: 'A framework', isCorrect: true },
            { text: 'A library', isCorrect: false },
            { text: 'A language', isCorrect: false },
            { text: 'A database', isCorrect: false }
          ]
        }
      ]
    };

    const mockResponse: QuizDetail = {
      id: 1,
      topicName: 'Angular Basics',
      description: 'A quiz about Angular fundamentals',
      questions: [
        {
          id: 1,
          text: 'What is Angular?',
          orderIndex: 0,
          answerOptions: [
            { id: 1, text: 'A framework' },
            { id: 2, text: 'A library' },
            { id: 3, text: 'A language' },
            { id: 4, text: 'A database' }
          ]
        }
      ]
    };

    it('should send a POST request to /api/quizzes with the request payload', () => {
      service.createQuiz(createRequest).subscribe(result => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne('/api/quizzes');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });

    it('should return the created QuizDetail on success', () => {
      let response: QuizDetail | undefined;
      service.createQuiz(createRequest).subscribe(result => {
        response = result;
      });

      const req = httpTesting.expectOne('/api/quizzes');
      req.flush(mockResponse);

      expect(response).toEqual(expect.objectContaining({ id: 1, topicName: 'Angular Basics' }));
    });

    it('should propagate a 400 validation error', () => {
      let error: HttpErrorResponse | undefined;
      service.createQuiz(createRequest).subscribe({
        error: (err) => { error = err; }
      });

      const req = httpTesting.expectOne('/api/quizzes');
      req.flush(
        { errors: { topicName: ['Topic name is required'] } },
        { status: 400, statusText: 'Bad Request' }
      );

      expect(error).toEqual(expect.objectContaining({ status: 400 }));
    });

    it('should propagate a 500 server error', () => {
      let error: HttpErrorResponse | undefined;
      service.createQuiz(createRequest).subscribe({
        error: (err) => { error = err; }
      });

      const req = httpTesting.expectOne('/api/quizzes');
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });

      expect(error).toEqual(expect.objectContaining({ status: 500 }));
    });
  });

  describe('updateQuiz', () => {
    const quizId = 42;
    const updateRequest: UpdateQuizRequest = {
      topicName: 'Updated Topic',
      description: 'Updated description',
      questions: [
        {
          text: 'Updated question?',
          answerOptions: [
            { text: 'Option A', isCorrect: false },
            { text: 'Option B', isCorrect: true },
            { text: 'Option C', isCorrect: false },
            { text: 'Option D', isCorrect: false }
          ]
        }
      ]
    };

    const mockResponse: QuizDetail = {
      id: quizId,
      topicName: 'Updated Topic',
      description: 'Updated description',
      questions: [
        {
          id: 10,
          text: 'Updated question?',
          orderIndex: 0,
          answerOptions: [
            { id: 40, text: 'Option A' },
            { id: 41, text: 'Option B' },
            { id: 42, text: 'Option C' },
            { id: 43, text: 'Option D' }
          ]
        }
      ]
    };

    it('should send a PUT request to /api/quizzes/{id} with the request payload', () => {
      service.updateQuiz(quizId, updateRequest).subscribe(result => {
        expect(result).toEqual(mockResponse);
      });

      const req = httpTesting.expectOne(`/api/quizzes/${quizId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);
    });

    it('should return the updated QuizDetail on success', () => {
      let response: QuizDetail | undefined;
      service.updateQuiz(quizId, updateRequest).subscribe(result => {
        response = result;
      });

      const req = httpTesting.expectOne(`/api/quizzes/${quizId}`);
      req.flush(mockResponse);

      expect(response).toEqual(expect.objectContaining({ id: quizId, topicName: 'Updated Topic' }));
    });

    it('should propagate a 404 not found error', () => {
      let error: HttpErrorResponse | undefined;
      service.updateQuiz(quizId, updateRequest).subscribe({
        error: (err) => { error = err; }
      });

      const req = httpTesting.expectOne(`/api/quizzes/${quizId}`);
      req.flush(
        { message: 'Quiz not found' },
        { status: 404, statusText: 'Not Found' }
      );

      expect(error).toEqual(expect.objectContaining({ status: 404 }));
    });

    it('should propagate a 400 validation error', () => {
      let error: HttpErrorResponse | undefined;
      service.updateQuiz(quizId, updateRequest).subscribe({
        error: (err) => { error = err; }
      });

      const req = httpTesting.expectOne(`/api/quizzes/${quizId}`);
      req.flush(
        { errors: { description: ['Description is required'] } },
        { status: 400, statusText: 'Bad Request' }
      );

      expect(error).toEqual(expect.objectContaining({ status: 400 }));
    });

    it('should propagate a 500 server error', () => {
      let error: HttpErrorResponse | undefined;
      service.updateQuiz(quizId, updateRequest).subscribe({
        error: (err) => { error = err; }
      });

      const req = httpTesting.expectOne(`/api/quizzes/${quizId}`);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });

      expect(error).toEqual(expect.objectContaining({ status: 500 }));
    });
  });

  describe('deleteQuiz', () => {
    const quizId = 7;

    it('should send a DELETE request to /api/quizzes/{id}', () => {
      service.deleteQuiz(quizId).subscribe();

      const req = httpTesting.expectOne(`/api/quizzes/${quizId}`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toBeNull();
      req.flush(null);
    });

    it('should complete successfully on 200 response', () => {
      let completed = false;
      service.deleteQuiz(quizId).subscribe({
        complete: () => { completed = true; }
      });

      const req = httpTesting.expectOne(`/api/quizzes/${quizId}`);
      req.flush(null);

      expect(completed).toBe(true);
    });

    it('should propagate a 404 not found error', () => {
      let error: HttpErrorResponse | undefined;
      service.deleteQuiz(quizId).subscribe({
        error: (err) => { error = err; }
      });

      const req = httpTesting.expectOne(`/api/quizzes/${quizId}`);
      req.flush(
        { message: 'Quiz not found' },
        { status: 404, statusText: 'Not Found' }
      );

      expect(error).toEqual(expect.objectContaining({ status: 404 }));
    });

    it('should propagate a 500 server error', () => {
      let error: HttpErrorResponse | undefined;
      service.deleteQuiz(quizId).subscribe({
        error: (err) => { error = err; }
      });

      const req = httpTesting.expectOne(`/api/quizzes/${quizId}`);
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });

      expect(error).toEqual(expect.objectContaining({ status: 500 }));
    });
  });
});
