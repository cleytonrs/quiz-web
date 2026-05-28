import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, HttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

describe('errorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  let notificationService: NotificationService;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: class {} as any }])
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(NotificationService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should show "Unable to connect" toast on network error (status 0)', () => {
    const errorSpy = vi.spyOn(notificationService, 'showError');

    httpClient.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpTesting.expectOne('/api/test');
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(errorSpy).toHaveBeenCalledWith('Unable to connect. Please check your connection.');
  });

  it('should logout and redirect on 401', () => {
    const logoutSpy = vi.spyOn(authService, 'logout');
    const navigateSpy = vi.spyOn(router, 'navigate');

    httpClient.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpTesting.expectOne('/api/test');
    req.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should show "Something went wrong" toast on 500 error', () => {
    const errorSpy = vi.spyOn(notificationService, 'showError');

    httpClient.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpTesting.expectOne('/api/test');
    req.flush({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });

    expect(errorSpy).toHaveBeenCalledWith('Something went wrong. Please try again.');
  });

  it('should not show toast for 400 errors (handled by components)', () => {
    const errorSpy = vi.spyOn(notificationService, 'showError');

    httpClient.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpTesting.expectOne('/api/test');
    req.flush({ error: 'Bad request' }, { status: 400, statusText: 'Bad Request' });

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should not show toast for 404 errors (handled by components)', () => {
    const errorSpy = vi.spyOn(notificationService, 'showError');

    httpClient.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpTesting.expectOne('/api/test');
    req.flush({ error: 'Not found' }, { status: 404, statusText: 'Not Found' });

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should still rethrow the error after handling', () => {
    let receivedError: any;

    httpClient.get('/api/test').subscribe({
      error: (err) => { receivedError = err; }
    });

    const req = httpTesting.expectOne('/api/test');
    req.flush({ error: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });

    expect(receivedError).toBeTruthy();
    expect(receivedError.status).toBe(500);
  });
});
