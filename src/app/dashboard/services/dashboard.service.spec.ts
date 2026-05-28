import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { Dashboard } from '../../shared/models/dashboard.models';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(DashboardService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /api/dashboard', () => {
    const mockDashboard: Dashboard = {
      sessions: [
        {
          sessionId: 'abc-123',
          quizTopicName: 'JavaScript',
          score: 7,
          totalQuestions: 10,
          passed: true,
          completedAt: '2024-01-15T10:30:00Z'
        }
      ]
    };

    service.getDashboard().subscribe(dashboard => {
      expect(dashboard).toEqual(mockDashboard);
      expect(dashboard.sessions.length).toBe(1);
      expect(dashboard.sessions[0].quizTopicName).toBe('JavaScript');
    });

    const req = httpTesting.expectOne('/api/dashboard');
    expect(req.request.method).toBe('GET');
    req.flush(mockDashboard);
  });

  it('should return empty sessions array when user has no history', () => {
    const emptyDashboard: Dashboard = { sessions: [] };

    service.getDashboard().subscribe(dashboard => {
      expect(dashboard.sessions).toEqual([]);
    });

    const req = httpTesting.expectOne('/api/dashboard');
    req.flush(emptyDashboard);
  });
});
