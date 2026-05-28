import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../services/quiz.service';
import { QuizResult } from '../../shared/models/quiz.models';
import { ShareButtonsComponent } from '../../shared/components/share-buttons/share-buttons.component';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule, ShareButtonsComponent],
  templateUrl: './quiz-result.component.html',
  styleUrl: './quiz-result.component.scss'
})
export class QuizResultComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  result = signal<QuizResult | null>(null);

  formattedTime = computed(() => {
    const r = this.result();
    if (!r) return '';
    return this.formatElapsedTime(r.elapsedTimeSeconds);
  });

  scoreText = computed(() => {
    const r = this.result();
    if (!r) return '';
    return `${r.correctAnswers} out of ${r.totalQuestions} correct`;
  });

  percentageText = computed(() => {
    const r = this.result();
    if (!r) return '';
    return `${Math.round(r.scorePercentage)}%`;
  });

  passMessage = computed(() => {
    const r = this.result();
    if (!r) return '';
    return r.passed
      ? 'Congratulations! You passed!'
      : "You didn't pass this time. Try again!";
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly quizService: QuizService
  ) {}

  ngOnInit(): void {
    const sessionId = this.route.snapshot.paramMap.get('sessionId');
    if (!sessionId) {
      this.error.set('Invalid session ID.');
      this.loading.set(false);
      return;
    }
    this.loadResult(sessionId);
  }

  private loadResult(sessionId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.quizService.getSessionResult(sessionId).subscribe({
      next: (result) => {
        this.result.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load quiz result. Please try again later.');
        this.loading.set(false);
      }
    });
  }

  formatElapsedTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }

  getShareText(result: QuizResult): string {
    const status = result.passed ? 'passed' : 'failed';
    return `I ${status} the ${result.quizTopicName} quiz with a score of ${Math.round(result.scorePercentage)}%!`;
  }

  navigateToQuizzes(): void {
    this.router.navigate(['/quizzes']);
  }
}
