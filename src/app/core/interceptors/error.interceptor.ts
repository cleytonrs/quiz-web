import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        notificationService.showError('Unable to connect. Please check your connection.');
      } else if (error.status === 401 && !req.url.includes('/api/auth/')) {
        authService.logout();
        router.navigate(['/auth/login']);
      } else if (error.status >= 500) {
        notificationService.showError('Something went wrong. Please try again.');
      }
      return throwError(() => error);
    })
  );
};
