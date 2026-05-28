import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { QuizService } from '../../quiz/services/quiz.service';
import { QuizAdminService } from '../services/quiz-admin.service';
import { NotificationService } from '../../core/services/notification.service';
import { QuizDetail } from '../../shared/models/quiz.models';
import { CreateQuizRequest, UpdateQuizRequest } from '../../shared/models/quiz-admin.models';

export function exactlyOneCorrectValidator(group: AbstractControl): ValidationErrors | null {
  const answerOptions = (group as FormGroup).controls['answerOptions'] as FormArray;
  if (!answerOptions) return null;
  const correctCount = answerOptions.controls
    .filter(ctrl => ctrl.get('isCorrect')?.value === true).length;
  return correctCount === 1 ? null : { exactlyOneCorrect: true };
}

@Component({
  selector: 'app-quiz-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz-form.component.html',
  styleUrl: './quiz-form.component.scss'
})
export class QuizFormComponent implements OnInit {
  mode: 'create' | 'edit' = 'create';
  quizId: number | null = null;
  loading = signal(false);
  submitting = signal(false);
  notFound = signal(false);

  quizForm: FormGroup<{
    topicName: FormControl<string>;
    description: FormControl<string>;
    questions: FormArray<FormGroup<{
      text: FormControl<string>;
      answerOptions: FormArray<FormGroup<{
        text: FormControl<string>;
        isCorrect: FormControl<boolean>;
      }>>;
    }>>;
  }>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly quizService: QuizService,
    private readonly quizAdminService: QuizAdminService,
    private readonly notificationService: NotificationService
  ) {
    this.quizForm = this.buildForm();
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.mode = 'edit';
      this.quizId = Number(idParam);
      if (Number.isNaN(this.quizId)) {
        this.notFound.set(true);
        return;
      }
      this.loadQuiz(this.quizId);
    } else {
      this.mode = 'create';
      this.addQuestion();
    }
  }

  get questions(): FormArray {
    return this.quizForm.controls.questions;
  }

  getAnswerOptions(questionIndex: number): FormArray {
    const question = this.questions.at(questionIndex) as FormGroup;
    return question.controls['answerOptions'] as FormArray;
  }

  addQuestion(): void {
    this.questions.push(this.createQuestionGroup());
  }

  removeQuestion(index: number): void {
    if (this.questions.length > 1) {
      this.questions.removeAt(index);
    }
  }

  setCorrectAnswer(questionIndex: number, answerIndex: number): void {
    const answerOptions = this.getAnswerOptions(questionIndex);
    answerOptions.controls.forEach((ctrl, i) => {
      ctrl.get('isCorrect')?.setValue(i === answerIndex);
    });
  }

  onSubmit(): void {
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const formValue = this.quizForm.getRawValue();

    const request: CreateQuizRequest | UpdateQuizRequest = {
      topicName: formValue.topicName,
      description: formValue.description,
      questions: formValue.questions.map(q => ({
        text: q.text,
        answerOptions: q.answerOptions.map(a => ({
          text: a.text,
          isCorrect: a.isCorrect
        }))
      }))
    };

    if (this.mode === 'create') {
      this.quizAdminService.createQuiz(request).subscribe({
        next: () => {
          this.submitting.set(false);
          this.notificationService.showSuccess('Quiz created successfully.');
          this.router.navigate(['/admin/quizzes']);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.handleSubmitError(err);
        }
      });
    } else {
      this.quizAdminService.updateQuiz(this.quizId!, request).subscribe({
        next: () => {
          this.submitting.set(false);
          this.notificationService.showSuccess('Quiz updated successfully.');
          this.router.navigate(['/admin/quizzes']);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.handleSubmitError(err);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/quizzes']);
  }

  private buildForm() {
    return this.fb.group({
      topicName: this.fb.nonNullable.control('', Validators.required),
      description: this.fb.nonNullable.control('', Validators.required),
      questions: this.fb.array<FormGroup>([])
    }) as typeof this.quizForm;
  }

  private createQuestionGroup(): FormGroup {
    return this.fb.group({
      text: this.fb.nonNullable.control('', Validators.required),
      answerOptions: this.fb.array([
        this.createAnswerOptionGroup(),
        this.createAnswerOptionGroup(),
        this.createAnswerOptionGroup(),
        this.createAnswerOptionGroup()
      ])
    }, { validators: [exactlyOneCorrectValidator] });
  }

  private createAnswerOptionGroup(): FormGroup {
    return this.fb.group({
      text: this.fb.nonNullable.control('', Validators.required),
      isCorrect: this.fb.nonNullable.control(false)
    });
  }

  private loadQuiz(id: number): void {
    this.loading.set(true);
    this.quizService.getQuiz(id).subscribe({
      next: (quiz: QuizDetail) => {
        this.populateForm(quiz);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 404) {
          this.notFound.set(true);
        } else {
          this.notificationService.showError('Unable to load quiz.');
        }
      }
    });
  }

  private populateForm(quiz: QuizDetail): void {
    this.quizForm.controls.topicName.setValue(quiz.topicName);
    this.quizForm.controls.description.setValue(quiz.description);

    // Clear existing questions and rebuild from quiz data
    this.questions.clear();

    for (const question of quiz.questions) {
      const questionGroup = this.fb.group({
        text: this.fb.nonNullable.control(question.text, Validators.required),
        answerOptions: this.fb.array(
          question.answerOptions.map(option =>
            this.fb.group({
              text: this.fb.nonNullable.control(option.text, Validators.required),
              isCorrect: this.fb.nonNullable.control(option.isCorrect ?? false)
            })
          )
        )
      }, { validators: [exactlyOneCorrectValidator] });

      this.questions.push(questionGroup as any);
    }
  }

  private handleSubmitError(err: HttpErrorResponse): void {
    if (err.status === 400 && err.error?.errors) {
      this.mapBackendErrors(err.error.errors);
    } else {
      this.notificationService.showError('An error occurred. Please try again.');
    }
  }

  private mapBackendErrors(errors: Record<string, string[]>): void {
    for (const [field, messages] of Object.entries(errors)) {
      const control = this.resolveControl(field);
      if (control) {
        control.setErrors({ serverError: messages[0] });
      }
    }
  }

  private resolveControl(field: string): AbstractControl | null {
    // Handle nested paths like "Questions[0].Text" or "Questions[0].AnswerOptions[1].Text"
    const normalized = field
      .replace(/\[(\d+)\]/g, '.$1')
      .split('.')
      .map(part => {
        // Convert PascalCase to camelCase
        return part.charAt(0).toLowerCase() + part.slice(1);
      });

    let control: AbstractControl | null = this.quizForm;
    for (const part of normalized) {
      if (!control) return null;
      const index = Number(part);
      if (!Number.isNaN(index) && control instanceof FormArray) {
        control = control.at(index);
      } else if (control instanceof FormGroup) {
        control = control.get(part);
      } else {
        return null;
      }
    }
    return control;
  }
}
