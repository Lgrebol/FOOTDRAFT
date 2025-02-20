import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DashboardStats } from '../Classes/dashboard/dashboard-stats.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api/v1/dashboard';
  private dashboardStatsSubject = new BehaviorSubject<DashboardStats | null>(null);
  
  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats | null> {
    return this.http.get<DashboardStats>(this.apiUrl).pipe(
      tap(data => {
        const stats = new DashboardStats(
          data.totalTeams,
          data.totalPlayers,
          data.totalTournaments || 0, // Valor per defecte si no existeix
          data.totalGoals,
          data.totalMatches
        );
        this.dashboardStatsSubject.next(stats);
      }),
      catchError(error => {
        console.error('Error fetching dashboard stats:', error);
        return throwError(() => new Error('Error carregant estadístiques'));
      })
    );
  }

  getStatsObservable(): Observable<DashboardStats | null> {
    return this.dashboardStatsSubject.asObservable();
  }
}