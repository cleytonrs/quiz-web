import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dashboard } from '../../shared/models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = '/api';

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.apiUrl}/dashboard`);
  }
}
