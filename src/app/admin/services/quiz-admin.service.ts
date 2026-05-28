import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateQuizRequest, UpdateQuizRequest } from '../../shared/models/quiz-admin.models';
import { QuizDetail } from '../../shared/models/quiz.models';

@Injectable({
  providedIn: 'root'
})
export class QuizAdminService {
  private readonly apiUrl = '/api/quizzes';

  constructor(private readonly http: HttpClient) {}

  createQuiz(request: CreateQuizRequest): Observable<QuizDetail> {
    return this.http.post<QuizDetail>(this.apiUrl, request);
  }

  updateQuiz(id: number, request: UpdateQuizRequest): Observable<QuizDetail> {
    return this.http.put<QuizDetail>(`${this.apiUrl}/${id}`, request);
  }

  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
