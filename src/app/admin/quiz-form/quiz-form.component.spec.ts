import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { QuizFormComponent } from './quiz-form.component';
import { QuizDetail } from '../../shared/models/quiz.models';

describe('QuizFormComponent', () => {
  let httpTesting: HttpTestingController;
  let router: Router;
  let fixture: ComponentFixture<QuizFormComponent>;

  const mockQuizDetail: QuizDetail = {
    id: 42,
    topicName: 'Angular Testing',
    description: 'A quiz about Angular unit testing',
    questions: [
      {
        id: 1,
        text: 'What is TestBed?',
        orderIndex: 0,
        answerOptions: [
          { id: 1, text: 'A testing utility', isCorrect: true },
          { id: 2, text: 'A CSS framework', isCorrect: false },
          { id: 3, text: 'A database', isCorrect: false },
          { id: 4, text: 'A build tool', isCorrect: false }
        ]
      },
      {
        id: 2,
        text: 'What is a fixture?',
        orderIndex: 1,
        answerOptions: [
          { id: 5, text: 'A wrapper around a component', isCorrect: true },
          { id: 6, text: 'A type of pipe', isCorrect: false },
          { id: 7, text: 'A routing guard', isCorrect: false },
          { id: 8, text: 'A service', isCorrect: false }
        ]
      }
    ]
  };

  function createComponent(idParam: string | null) {
    TestBed.configureTestingModule({
      imports: [QuizFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(idParam ? { id: idParam } : {})
            }
          }
        }
      ]
    });

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(QuizFormComponent);
  }

  afterEach(() => {
    httpTesting.verify();
  });

  describe('Create Mode', () => {
    beforeEach(() => {
      createComponent(null);
    });

    it('should display an empty form with one question in create mode', () => {
      fixture.detectChanges();

      const component = fixture.componentInstance;
      expect(component.mode).toBe('create');
      expect(component.quizForm.controls.topicName.value).toBe('');
      expect(component.quizForm.controls.description.value).toBe('');
      expect(component.questions.length).toBe(1);

      // Each question should have 4 answer options
      const answerOptions = component.getAnswerOptions(0);
      expect(answerOptions.length).toBe(4);

      // All answer option texts should be empty
      for (let i = 0; i < 4; i++) {
        expect(answerOptions.at(i).get('text')?.value).toBe('');
        expect(answerOptions.at(i).get('isCorrect')?.value).toBe(false);
      }
    });

    it('should call createQuiz on form submission in create mode', () => {
      fixture.detectChanges();

      const component = fixture.componentInstance;
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      // Fill in valid form data
      component.quizForm.controls.topicName.setValue('New Quiz');
      component.quizForm.controls.description.setValue('A new quiz description');

      const question = component.questions.at(0);
      question.get('text')?.setValue('Sample question?');

      const answers = component.getAnswerOptions(0);
      answers.at(0).get('text')?.setValue('Answer A');
      answers.at(1).get('text')?.setValue('Answer B');
      answers.at(2).get('text')?.setValue('Answer C');
      answers.at(3).get('text')?.setValue('Answer D');

      // Mark first answer as correct
      component.setCorrectAnswer(0, 0);

      component.onSubmit();

      const req = httpTesting.expectOne('/api/quizzes');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        topicName: 'New Quiz',
        description: 'A new quiz description',
        questions: [
          {
            text: 'Sample question?',
            answerOptions: [
              { text: 'Answer A', isCorrect: true },
              { text: 'Answer B', isCorrect: false },
              { text: 'Answer C', isCorrect: false },
              { text: 'Answer D', isCorrect: false }
            ]
          }
        ]
      });

      req.flush(mockQuizDetail);
      expect(navigateSpy).toHaveBeenCalledWith(['/admin/quizzes']);
    });

    it('should display inline validation errors on 400 response', () => {
      fixture.detectChanges();

      const component = fixture.componentInstance;

      // Fill in form data to make it valid for submission
      component.quizForm.controls.topicName.setValue('Quiz');
      component.quizForm.controls.description.setValue('Desc');

      const question = component.questions.at(0);
      question.get('text')?.setValue('Q?');

      const answers = component.getAnswerOptions(0);
      answers.at(0).get('text')?.setValue('A');
      answers.at(1).get('text')?.setValue('B');
      answers.at(2).get('text')?.setValue('C');
      answers.at(3).get('text')?.setValue('D');
      component.setCorrectAnswer(0, 0);

      component.onSubmit();

      const req = httpTesting.expectOne('/api/quizzes');
      req.flush(
        {
          errors: {
            TopicName: ['Topic name must be at least 3 characters.'],
            'Questions[0].Text': ['Question text is too short.']
          }
        },
        { status: 400, statusText: 'Bad Request' }
      );

      // Check that server errors are mapped to form controls
      expect(component.quizForm.controls.topicName.errors).toEqual({
        serverError: 'Topic name must be at least 3 characters.'
      });
      expect(component.questions.at(0).get('text')?.errors).toEqual({
        serverError: 'Question text is too short.'
      });
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      createComponent('42');
    });

    it('should call updateQuiz on form submission in edit mode', () => {
      fixture.detectChanges();

      // Flush the initial getQuiz request
      const getReq = httpTesting.expectOne('/api/quizzes/42');
      expect(getReq.request.method).toBe('GET');
      getReq.flush(mockQuizDetail);
      fixture.detectChanges();

      const component = fixture.componentInstance;
      expect(component.mode).toBe('edit');
      expect(component.quizId).toBe(42);

      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      // Modify the topic name
      component.quizForm.controls.topicName.setValue('Updated Topic');

      component.onSubmit();

      const putReq = httpTesting.expectOne('/api/quizzes/42');
      expect(putReq.request.method).toBe('PUT');
      expect(putReq.request.body.topicName).toBe('Updated Topic');

      putReq.flush(mockQuizDetail);
      expect(navigateSpy).toHaveBeenCalledWith(['/admin/quizzes']);
    });

    it('should show not-found message when quiz returns 404', () => {
      fixture.detectChanges();

      const getReq = httpTesting.expectOne('/api/quizzes/42');
      getReq.flush(null, { status: 404, statusText: 'Not Found' });
      fixture.detectChanges();

      const component = fixture.componentInstance;
      expect(component.notFound()).toBe(true);

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.not-found-state')).toBeTruthy();
      expect(compiled.textContent).toContain('Quiz not found');
    });
  });
});
