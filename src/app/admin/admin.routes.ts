import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'quizzes',
    loadComponent: () => import('./quiz-management-list/quiz-management-list.component')
      .then(m => m.QuizManagementListComponent)
  },
  {
    path: 'quizzes/create',
    loadComponent: () => import('./quiz-form/quiz-form.component')
      .then(m => m.QuizFormComponent)
  },
  {
    path: 'quizzes/:id/edit',
    loadComponent: () => import('./quiz-form/quiz-form.component')
      .then(m => m.QuizFormComponent)
  }
];
