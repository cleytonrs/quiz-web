import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from '../../quiz/services/quiz.service';
import { QuizAdminService } from '../services/quiz-admin.service';
import { NotificationService } from '../../core/services/notification.service';
import { QuizSummary } from '../../shared/models/quiz.models';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-quiz-management-list',
  standalone: true,
  imports: [ConfirmDialogComponent],
  templateUrl: './quiz-management-list.component.html',
  styleUrl: './quiz-management-list.component.scss'
})
export class QuizManagementListComponent implements OnInit {
  readonly quizzes = signal<QuizSummary[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  deleteDialogVisible = false;
  quizToDelete: QuizSummary | null = null;

  constructor(
    private readonly quizService: QuizService,
    private readonly quizAdminService: QuizAdminService,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.quizService.getQuizzes().subscribe({
      next: (quizzes) => {
        this.quizzes.set(quizzes);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load quizzes. Please try again.');
        this.loading.set(false);
      }
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/admin/quizzes/create']);
  }

  navigateToEdit(quizId: number): void {
    this.router.navigate(['/admin/quizzes', quizId, 'edit']);
  }

  openDeleteDialog(quiz: QuizSummary): void {
    this.quizToDelete = quiz;
    this.deleteDialogVisible = true;
  }

  onDeleteConfirmed(): void {
    if (!this.quizToDelete) return;

    const quizId = this.quizToDelete.id;
    this.deleteDialogVisible = false;

    this.quizAdminService.deleteQuiz(quizId).subscribe({
      next: () => {
        this.quizzes.update(quizzes => quizzes.filter(q => q.id !== quizId));
        this.notificationService.showSuccess('Quiz deleted successfully.');
        this.quizToDelete = null;
      },
      error: () => {
        this.notificationService.showError('Failed to delete quiz. Please try again.');
        this.quizToDelete = null;
      }
    });
  }

  onDeleteCancelled(): void {
    this.deleteDialogVisible = false;
    this.quizToDelete = null;
  }
}
