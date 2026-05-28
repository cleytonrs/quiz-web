import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../services/quiz.service';
import { QuizDetail, Question, AnswerOption } from '../../shared/models/quiz.models';

@Component({
  selector: 'app-quiz-session',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-session.component.html',
  styleUrl: './quiz-session.component.scss'
})
export class QuizSessionComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);

  quiz = signal<QuizDetail | null>(null);
  sessionId = signal<string | null>(null);
  currentQuestionIndex = signal(0);

  currentQuestion = computed<Question | null>(() => {
    const q = this.quiz();
    if (!q) return null;
    return q.questions[this.currentQuestionIndex()] ?? null;
  });

  totalQuestions = computed(() => this.quiz()?.questions.length ?? 0);
  currentQuestionNumber = computed(() => this.currentQuestionIndex() + 1);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly quizService: QuizService
  ) {}

  ngOnInit(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isNaN(quizId)) {
      this.error.set('Invalid quiz ID.');
      this.loading.set(false);
      return;
    }
    this.initializeSession(quizId);
  }

  private initializeSession(quizId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.quizService.getQuiz(quizId).subscribe({
      next: (quiz) => {
        this.quiz.set(quiz);
        this.startSession(quizId);
      },
      error: () => {
        this.error.set('Unable to load quiz. Please try again later.');
        this.loading.set(false);
      }
    });
  }

  private startSession(quizId: number): void {
    this.quizService.startSession(quizId).subscribe({
      next: (session) => {
        this.sessionId.set(session.id);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to start quiz session. Please try again later.');
        this.loading.set(false);
      }
    });
  }

  selectAnswer(option: AnswerOption): void {
    const session = this.sessionId();
    const question = this.currentQuestion();
    if (!session || !question || this.submitting()) return;

    this.submitting.set(true);

    this.quizService.submitAnswer(session, {
      questionId: question.id,
      selectedAnswerOptionId: option.id
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.advanceOrComplete(session);
      },
      error: () => {
        this.submitting.set(false);
        this.error.set('Unable to submit answer. Please try again.');
      }
    });
  }

  private advanceOrComplete(sessionId: string): void {
    const nextIndex = this.currentQuestionIndex() + 1;

    if (nextIndex >= this.totalQuestions()) {
      this.completeSession(sessionId);
    } else {
      this.currentQuestionIndex.set(nextIndex);
    }
  }

  private completeSession(sessionId: string): void {
    this.submitting.set(true);

    this.quizService.completeSession(sessionId).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/quizzes/results', sessionId]);
      },
      error: () => {
        this.submitting.set(false);
        this.error.set('Unable to complete session. Please try again.');
      }
    });
  }
}
