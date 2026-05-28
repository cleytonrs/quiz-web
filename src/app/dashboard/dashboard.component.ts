import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from './services/dashboard.service';
import { DashboardSession } from '../shared/models/dashboard.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  sessions = signal<DashboardSession[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getDashboard().subscribe({
      next: (dashboard) => {
        this.sessions.set(dashboard.sessions);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load your quiz history. Please try again later.');
        this.loading.set(false);
      }
    });
  }

  getScoreDisplay(session: DashboardSession): string {
    return `${session.score}/${session.totalQuestions}`;
  }

  getScorePercentage(session: DashboardSession): number {
    if (session.totalQuestions === 0) return 0;
    return Math.round((session.score / session.totalQuestions) * 100);
  }
}
