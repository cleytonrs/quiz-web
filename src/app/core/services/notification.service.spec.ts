import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no toasts', () => {
    expect(service.toasts()).toEqual([]);
  });

  describe('showError', () => {
    it('should add an error toast', () => {
      service.showError('Something went wrong');
      const toasts = service.toasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].message).toBe('Something went wrong');
      expect(toasts[0].type).toBe('error');
    });

    it('should add multiple error toasts', () => {
      service.showError('Error 1');
      service.showError('Error 2');
      expect(service.toasts().length).toBe(2);
    });
  });

  describe('showSuccess', () => {
    it('should add a success toast', () => {
      service.showSuccess('Operation completed');
      const toasts = service.toasts();
      expect(toasts.length).toBe(1);
      expect(toasts[0].message).toBe('Operation completed');
      expect(toasts[0].type).toBe('success');
    });
  });

  describe('dismiss', () => {
    it('should remove a toast by id', () => {
      service.showError('Error 1');
      service.showError('Error 2');
      const firstId = service.toasts()[0].id;
      service.dismiss(firstId);
      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].message).toBe('Error 2');
    });

    it('should handle dismissing non-existent id gracefully', () => {
      service.showError('Error 1');
      service.dismiss('non-existent-id');
      expect(service.toasts().length).toBe(1);
    });
  });

  describe('auto-dismiss', () => {
    it('should auto-dismiss after 5 seconds', () => {
      service.showError('Temporary error');
      expect(service.toasts().length).toBe(1);
      vi.advanceTimersByTime(5000);
      expect(service.toasts().length).toBe(0);
    });

    it('should not auto-dismiss before 5 seconds', () => {
      service.showError('Temporary error');
      vi.advanceTimersByTime(4999);
      expect(service.toasts().length).toBe(1);
      vi.advanceTimersByTime(1);
      expect(service.toasts().length).toBe(0);
    });
  });
});
