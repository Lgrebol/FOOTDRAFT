import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { DashboardStats } from '../Classes/dashboard/dashboard-stats.model';
import { IDashboardApiResponse } from '../Interfaces/dashboard-api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api/v1/dashboard';
  private dashboardStats: DashboardStats = new DashboardStats();
  private dashboardStatsSubject = new BehaviorSubject<DashboardStats>(this.dashboardStats);

  constructor(private http: HttpClient) { this.fetchDashboardStats(); }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });
  }

  private fetchDashboardStats(): void {
    this.dashboardStats.setLoading(true);
    this.http.get<IDashboardApiResponse>(this.apiUrl, { headers: this.getAuthHeaders() }).subscribe({
      next: data => {
        this.dashboardStats.updateStats({
          totalTeams: data.totalTeams,
          totalPlayers: data.totalPlayers,
          totalTournaments: data.totalTournaments,
          totalGoals: data.totalGoals,
          totalMatches: data.totalMatches
        });
        this.dashboardStats.setError(null);
        this.dashboardStats.setLoading(false);
        this.dashboardStatsSubject.next(this.dashboardStats);
      },
      error: error => {
        console.error('Error fetching dashboard stats:', error);
        this.dashboardStats.setError('Error obtenint estadístiques');
        this.dashboardStats.setLoading(false);
        this.dashboardStatsSubject.next(this.dashboardStats);
      }
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.dashboardStatsSubject.asObservable();
  }
}
