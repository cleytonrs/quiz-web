import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { Dashboard, DashboardSession } from '../shared/models/dashboard.models';

describe('DashboardComponent', () => {
  let httpTesting: HttpTestingController;
  let fixture: ComponentFixture<DashboardComponent>;

  const mockSessions: DashboardSession[] = [
    {
      sessionId: 'session-1',
      quizTopicName: 'JavaScript',
      score: 8,
      totalQuestions: 10,
      passed: true,
      completedAt: '2024-01-15T10:30:00Z'
    },
    {
      sessionId: 'session-2',
      quizTopicName: 'TypeScript',
      score: 5,
      totalQuestions: 10,
      passed: false,
      completedAt: '2024-01-14T14:00:00Z'
    },
    {
      sessionId: 'session-3',
      quizTopicName: 'JavaScript',
      score: 9,
      totalQuestions: 10,
      passed: true,
      completedAt: '2024-01-16T09:00:00Z'
    }
  ];

  const mockDashboard: Dashboard = { sessions: mockSessions };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DashboardComponent);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function initComponent() {
    fixture.detectChanges();
  }

  function flushDashboard(dashboard: Dashboard = mockDashboard) {
    httpTesting.expectOne('/api/dashboard').flush(dashboard);
    fixture.detectChanges();
  }

  function flushError() {
    httpTesting.expectOne('/api/dashboard').error(new ProgressEvent('error'));
    fixture.detectChanges();
  }

  it('should create the component', () => {
    initComponent();
    flushDashboard();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show loading state initially', () => {
    initComponent();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loading-state')).toBeTruthy();
    expect(compiled.textContent).toContain('Loading your quiz history...');
    flushDashboard();
  });

  it('should display sessions after loading', () => {
    initComponent();
    flushDashboard();

    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
  });

  it('should display quiz topic name for each session', () => {
    initComponent();
    flushDashboard();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('JavaScript');
    expect(compiled.textContent).toContain('TypeScript');
  });

  it('should display score as fraction and percentage', () => {
    initComponent();
    flushDashboard();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('8/10');
    expect(compiled.textContent).toContain('(80%)');
    expect(compiled.textContent).toContain('5/10');
    expect(compiled.textContent).toContain('(50%)');
  });

  it('should display pass/fail badges', () => {
    initComponent();
    flushDashboard();

    const compiled = fixture.nativeElement as HTMLElement;
    const badges = compiled.querySelectorAll('.result-badge');
    expect(badges.length).toBe(3);

    const passBadges = compiled.querySelectorAll('.result-badge--pass');
    const failBadges = compiled.querySelectorAll('.result-badge--fail');
    expect(passBadges.length).toBe(2);
    expect(failBadges.length).toBe(1);
  });

  it('should display completion date', () => {
    initComponent();
    flushDashboard();

    const compiled = fixture.nativeElement as HTMLElement;
    // DatePipe with 'medium' format will render dates
    const dateCells = compiled.querySelectorAll('.session-date');
    expect(dateCells.length).toBe(3);
    // Verify dates are rendered (not empty)
    dateCells.forEach(cell => {
      expect(cell.textContent!.trim().length).toBeGreaterThan(0);
    });
  });

  it('should display all repeat attempts', () => {
    initComponent();
    flushDashboard();

    const compiled = fixture.nativeElement as HTMLElement;
    // Two JavaScript sessions should both appear
    const topicCells = compiled.querySelectorAll('.session-topic');
    const jsTopics = Array.from(topicCells).filter(cell =>
      cell.textContent!.includes('JavaScript')
    );
    expect(jsTopics.length).toBe(2);
  });

  it('should show error state when loading fails', () => {
    initComponent();
    flushError();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-state')).toBeTruthy();
    expect(compiled.textContent).toContain('Unable to load your quiz history');
  });

  it('should retry loading when retry button is clicked', () => {
    initComponent();
    flushError();

    const compiled = fixture.nativeElement as HTMLElement;
    const retryButton = compiled.querySelector('.retry-button') as HTMLElement;
    retryButton.click();
    fixture.detectChanges();

    flushDashboard();

    const rows = compiled.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
  });

  it('should show empty state when no sessions exist', () => {
    initComponent();
    flushDashboard({ sessions: [] });

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("You haven't completed any quizzes yet");
  });

  it('should have a "Take a Quiz" button linking to /quizzes', () => {
    initComponent();
    flushDashboard();

    const compiled = fixture.nativeElement as HTMLElement;
    const takeQuizButton = compiled.querySelector<HTMLAnchorElement>('.take-quiz-button');
    expect(takeQuizButton).toBeTruthy();
    expect(takeQuizButton!.textContent).toContain('Take a Quiz');
    expect(takeQuizButton!.getAttribute('href')).toBe('/quizzes');
  });

  it('should have accessible aria-label on result badges', () => {
    initComponent();
    flushDashboard();

    const compiled = fixture.nativeElement as HTMLElement;
    const passBadge = compiled.querySelector('.result-badge--pass') as HTMLElement;
    const failBadge = compiled.querySelector('.result-badge--fail') as HTMLElement;
    expect(passBadge.getAttribute('aria-label')).toBe('Passed');
    expect(failBadge.getAttribute('aria-label')).toBe('Failed');
  });

  it('should have accessible table with aria-label', () => {
    initComponent();
    flushDashboard();

    const compiled = fixture.nativeElement as HTMLElement;
    const table = compiled.querySelector('.sessions-table') as HTMLElement;
    expect(table.getAttribute('aria-label')).toBe('Completed quiz sessions');
  });

  it('should have a link to quizzes in empty state', () => {
    initComponent();
    flushDashboard({ sessions: [] });

    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector<HTMLAnchorElement>('.take-quiz-link');
    expect(link).toBeTruthy();
    expect(link!.getAttribute('href')).toBe('/quizzes');
  });
});
