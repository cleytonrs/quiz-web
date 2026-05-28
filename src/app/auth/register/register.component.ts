import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest } from '../../shared/models/auth.models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  isLoading = false;
  errorMessage: string | null = null;

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const request: RegisterRequest = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/quizzes']);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        if (error.status === 409) {
          this.errorMessage = 'Email is already in use';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.error || 'Please check your input and try again.';
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      }
    });
  }
}
