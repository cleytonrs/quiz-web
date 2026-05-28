import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { QuizService } from './quiz.service';
import { SubmitAnswerRequest } from '../../shared/models/quiz.models';

describe('QuizService', () => {
  let service: QuizService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(QuizService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getQuizzes', () => {
    it('should GET /api/quizzes and return QuizSummary[]', () => {
      const mockQuizzes = [
        { id: 1, topicName: 'JavaScript', description: 'JS basics', questionCount: 10 },
        { id: 2, topicName: 'TypeScript', description: 'TS fundamentals', questionCount: 5 }
      ];

      service.getQuizzes().subscribe(quizzes => {
        expect(quizzes).toEqual(mockQuizzes);
      });

      const req = httpTesting.expectOne('/api/quizzes');
      expect(req.request.method).toBe('GET');
      req.flush(mockQuizzes);
    });
  });

  describe('getQuiz', () => {
    it('should GET /api/quizzes/:id and return QuizDetail', () => {
      const mockQuiz = {
        id: 1,
        topicName: 'JavaScript',
        description: 'JS basics',
        questions: [
          {
            id: 1,
            text: 'What is var?',
            orderIndex: 0,
            answerOptions: [
              { id: 1, text: 'Variable declaration' },
              { id: 2, text: 'Function' },
              { id: 3, text: 'Class' },
              { id: 4, text: 'Interface' }
            ]
          }
        ]
      };

      service.getQuiz(1).subscribe(quiz => {
        expect(quiz).toEqual(mockQuiz);
      });

      const req = httpTesting.expectOne('/api/quizzes/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockQuiz);
    });
  });

  describe('startSession', () => {
    it('should POST /api/quizzes/:quizId/sessions and return QuizSession', () => {
      const mockSession = {
        id: 'session-123',
        quizId: 1,
        startedAt: '2024-01-01T00:00:00Z'
      };

      service.startSession(1).subscribe(session => {
        expect(session).toEqual(mockSession);
      });

      const req = httpTesting.expectOne('/api/quizzes/1/sessions');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockSession);
    });
  });

  describe('submitAnswer', () => {
    it('should POST /api/sessions/:sessionId/answers with request body and return AnswerResult', () => {
      const request: SubmitAnswerRequest = {
        questionId: 1,
        selectedAnswerOptionId: 3
      };
      const mockResult = {
        isCorrect: true,
        correctAnswerOptionId: 3
      };

      service.submitAnswer('session-123', request).subscribe(result => {
        expect(result).toEqual(mockResult);
      });

      const req = httpTesting.expectOne('/api/sessions/session-123/answers');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResult);
    });
  });

  describe('completeSession', () => {
    it('should POST /api/sessions/:sessionId/complete and return QuizResult', () => {
      const mockResult = {
        sessionId: 'session-123',
        quizTopicName: 'JavaScript',
        totalQuestions: 10,
        correctAnswers: 8,
        scorePercentage: 80,
        passed: true,
        elapsedTimeSeconds: 120,
        completedAt: '2024-01-01T00:02:00Z'
      };

      service.completeSession('session-123').subscribe(result => {
        expect(result).toEqual(mockResult);
      });

      const req = httpTesting.expectOne('/api/sessions/session-123/complete');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResult);
    });
  });

  describe('getSessionResult', () => {
    it('should GET /api/sessions/:sessionId/result and return QuizResult', () => {
      const mockResult = {
        sessionId: 'session-456',
        quizTopicName: 'TypeScript',
        totalQuestions: 5,
        correctAnswers: 3,
        scorePercentage: 60,
        passed: false,
        elapsedTimeSeconds: 90,
        completedAt: '2024-01-01T00:01:30Z'
      };

      service.getSessionResult('session-456').subscribe(result => {
        expect(result).toEqual(mockResult);
      });

      const req = httpTesting.expectOne('/api/sessions/session-456/result');
      expect(req.request.method).toBe('GET');
      req.flush(mockResult);
    });
  });
});
