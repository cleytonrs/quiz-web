import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { QuizListComponent } from './quiz-list.component';
import { QuizSummary } from '../../shared/models/quiz.models';

describe('QuizListComponent', () => {
  let httpTesting: HttpTestingController;
  let router: Router;
  let fixture: ComponentFixture<QuizListComponent>;

  const mockQuizzes: QuizSummary[] = [
    { id: 1, topicName: 'JavaScript', description: 'JS basics quiz', questionCount: 10 },
    { id: 2, topicName: 'TypeScript', description: 'TS fundamentals', questionCount: 5 },
    { id: 3, topicName: 'Angular', description: 'Angular framework', questionCount: 8 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(QuizListComponent);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function initComponent() {
    fixture.detectChanges(); // triggers ngOnInit
  }

  function flushQuizzes(quizzes: QuizSummary[] = mockQuizzes) {
    httpTesting.expectOne('/api/quizzes').flush(quizzes);
    fixture.detectChanges();
  }

  function flushError() {
    httpTesting.expectOne('/api/quizzes').error(new ProgressEvent('error'));
    fixture.detectChanges();
  }

  it('should create the component', () => {
    initComponent();
    flushQuizzes();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show loading state initially', () => {
    initComponent();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loading-state')).toBeTruthy();
    expect(compiled.textContent).toContain('Loading quizzes...');
    flushQuizzes();
  });

  it('should display quizzes after loading', () => {
    initComponent();
    flushQuizzes();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.quiz-card');
    expect(cards.length).toBe(3);
  });

  it('should display topic name and question count for each quiz', () => {
    initComponent();
    flushQuizzes();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('JavaScript');
    expect(compiled.textContent).toContain('10 questions');
    expect(compiled.textContent).toContain('TypeScript');
    expect(compiled.textContent).toContain('5 questions');
  });

  it('should display quiz description', () => {
    initComponent();
    flushQuizzes();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('JS basics quiz');
    expect(compiled.textContent).toContain('TS fundamentals');
  });

  it('should navigate to quiz session on card click', () => {
    initComponent();
    flushQuizzes();

    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const compiled = fixture.nativeElement as HTMLElement;
    const firstCard = compiled.querySelector('.quiz-card') as HTMLElement;
    firstCard.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/quizzes', 1, 'session']);
  });

  it('should show error state when loading fails', () => {
    initComponent();
    flushError();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-state')).toBeTruthy();
    expect(compiled.textContent).toContain('Unable to load quizzes');
  });

  it('should retry loading when retry button is clicked', () => {
    initComponent();
    flushError();

    const compiled = fixture.nativeElement as HTMLElement;
    const retryButton = compiled.querySelector('.retry-button') as HTMLElement;
    retryButton.click();
    fixture.detectChanges();

    flushQuizzes();

    const cards = compiled.querySelectorAll('.quiz-card');
    expect(cards.length).toBe(3);
  });

  it('should show empty state when no quizzes are available', () => {
    initComponent();
    flushQuizzes([]);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No quizzes available');
  });

  it('should have accessible aria-label on quiz cards', () => {
    initComponent();
    flushQuizzes();

    const compiled = fixture.nativeElement as HTMLElement;
    const firstCard = compiled.querySelector('.quiz-card') as HTMLElement;
    expect(firstCard.getAttribute('aria-label')).toBe('JavaScript - 10 questions');
  });
});
