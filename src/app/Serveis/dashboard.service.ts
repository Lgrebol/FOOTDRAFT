import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DashboardStats } from '../Classes/dashboard/dashboard-stats.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api/v1';
  private dashboardStatsSubject = new BehaviorSubject<DashboardStats | null>(null);
  
  constructor(private http: HttpClient) {
    this.fetchDashboardStats();
  }
  
  private fetchDashboardStats(): void {
    this.http.get<any>(`${this.apiUrl}/dashboard`).subscribe(
      data => {
        const stats = new DashboardStats(
          data.totalTeams,
          data.totalPlayers,
          data.totalTournaments,
          data.totalGoals,
          data.totalMatches
        );
        this.dashboardStatsSubject.next(stats);
      },
      error => console.error('Error fetching dashboard stats:', error)
    );
  }
  
  getDashboardStats(): Observable<DashboardStats | null> {
    this.fetchDashboardStats();
    return this.dashboardStatsSubject.asObservable();
  }
}
