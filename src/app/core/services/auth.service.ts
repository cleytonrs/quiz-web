import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResult, LoginRequest, RegisterRequest } from '../../shared/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'quiz_app_token';
  private readonly EMAIL_KEY = 'quiz_app_email';

  private readonly _isAuthenticated = signal<boolean>(this.hasToken());

  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  constructor(private http: HttpClient) {}

  register(request: RegisterRequest): Observable<AuthResult> {
    return this.http.post<AuthResult>('/api/auth/register', request).pipe(
      tap(result => this.storeAuth(result))
    );
  }

  login(request: LoginRequest): Observable<AuthResult> {
    return this.http.post<AuthResult>('/api/auth/login', request).pipe(
      tap(result => this.storeAuth(result))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    this._isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getEmail(): string | null {
    return localStorage.getItem(this.EMAIL_KEY);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private storeAuth(result: AuthResult): void {
    localStorage.setItem(this.TOKEN_KEY, result.token);
    localStorage.setItem(this.EMAIL_KEY, result.email);
    this._isAuthenticated.set(true);
  }
}
