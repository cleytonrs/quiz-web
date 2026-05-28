import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'error' | 'success';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly _toasts = signal<Toast[]>([]);
  private readonly dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly toasts = this._toasts.asReadonly();

  showError(message: string): void {
    this.addToast(message, 'error');
  }

  showSuccess(message: string): void {
    this.addToast(message, 'success');
  }

  dismiss(id: string): void {
    const timer = this.dismissTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.dismissTimers.delete(id);
    }
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  private addToast(message: string, type: 'error' | 'success'): void {
    const id = crypto.randomUUID();
    const toast: Toast = { id, message, type };
    this._toasts.update(toasts => [...toasts, toast]);

    const timer = setTimeout(() => {
      this.dismiss(id);
    }, 5000);
    this.dismissTimers.set(id, timer);
  }
}
