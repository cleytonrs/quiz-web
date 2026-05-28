import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizService } from '../services/quiz.service';
import { QuizSummary } from '../../shared/models/quiz.models';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-list.component.html',
  styleUrl: './quiz-list.component.scss'
})
export class QuizListComponent implements OnInit {
  quizzes = signal<QuizSummary[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private readonly quizService: QuizService,
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
      error: () => {
        this.error.set('Unable to load quizzes. Please try again later.');
        this.loading.set(false);
      }
    });
  }

  selectQuiz(quiz: QuizSummary): void {
    this.router.navigate(['/quizzes', quiz.id, 'session']);
  }

  trackByQuizId(_index: number, quiz: QuizSummary): number {
    return quiz.id;
  }
}
