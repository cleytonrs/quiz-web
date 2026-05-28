import { Routes } from '@angular/router';

export const QUIZ_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./quiz-list/quiz-list.component').then(m => m.QuizListComponent)
  },
  {
    path: ':id/session',
    loadComponent: () => import('./quiz-session/quiz-session.component').then(m => m.QuizSessionComponent)
  },
  {
    path: 'results/:sessionId',
    loadComponent: () => import('./quiz-result/quiz-result.component').then(m => m.QuizResultComponent)
  }
];
