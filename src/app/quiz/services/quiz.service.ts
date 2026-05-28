import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  QuizSummary,
  QuizDetail,
  QuizSession,
  SubmitAnswerRequest,
  AnswerResult,
  QuizResult
} from '../../shared/models/quiz.models';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly apiUrl = '/api';

  constructor(private readonly http: HttpClient) {}

  getQuizzes(): Observable<QuizSummary[]> {
    return this.http.get<QuizSummary[]>(`${this.apiUrl}/quizzes`);
  }

  getQuiz(id: number): Observable<QuizDetail> {
    return this.http.get<QuizDetail>(`${this.apiUrl}/quizzes/${id}`);
  }

  startSession(quizId: number): Observable<QuizSession> {
    return this.http.post<QuizSession>(`${this.apiUrl}/quizzes/${quizId}/sessions`, {});
  }

  submitAnswer(sessionId: string, request: SubmitAnswerRequest): Observable<AnswerResult> {
    return this.http.post<AnswerResult>(`${this.apiUrl}/sessions/${sessionId}/answers`, request);
  }

  completeSession(sessionId: string): Observable<QuizResult> {
    return this.http.post<QuizResult>(`${this.apiUrl}/sessions/${sessionId}/complete`, {});
  }

  getSessionResult(sessionId: string): Observable<QuizResult> {
    return this.http.get<QuizResult>(`${this.apiUrl}/sessions/${sessionId}/result`);
  }
}
