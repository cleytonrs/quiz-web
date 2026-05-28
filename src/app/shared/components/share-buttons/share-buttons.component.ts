import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizResult } from '../../models/quiz.models';

@Component({
  selector: 'app-share-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './share-buttons.component.html',
  styleUrl: './share-buttons.component.scss'
})
export class ShareButtonsComponent {
  @Input({ required: true }) quizResult!: QuizResult;

  showFallback = signal(false);
  copied = signal(false);

  getShareText(): string {
    const status = this.quizResult.passed ? 'passed' : 'failed';
    return `I ${status} the ${this.quizResult.quizTopicName} quiz with a score of ${Math.round(this.quizResult.scorePercentage)}%!`;
  }

  shareOnTwitter(): void {
    const text = this.getShareText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    const opened = globalThis.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      this.showFallback.set(true);
    }
  }

  shareOnLinkedIn(): void {
    const text = this.getShareText();
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(globalThis.location?.href ?? '')}&summary=${encodeURIComponent(text)}`;
    const opened = globalThis.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      this.showFallback.set(true);
    }
  }

  async copyToClipboard(): Promise<void> {
    const text = this.getShareText();
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.showFallback.set(true);
    }
  }
}
