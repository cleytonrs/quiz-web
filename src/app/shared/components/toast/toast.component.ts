import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
  private readonly notificationService = inject(NotificationService);

  readonly toasts = this.notificationService.toasts;

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}
