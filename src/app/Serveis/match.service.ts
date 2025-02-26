import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Match } from '../Classes/match/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = 'http://localhost:3000/api/v1/matches';
  private betsUrl = 'http://localhost:3000/api/v1/bets';

  constructor(private http: HttpClient) {}

  // Helper function to get auth headers from localStorage
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createMatch(match: Match): Observable<any> {
    return this.http.post(this.apiUrl, match.toApi(), { headers: this.getAuthHeaders() });
  }

  getMatch(matchUUID: string): Observable<Match> {
    return this.http.get<any>(`${this.apiUrl}/${matchUUID}`, { headers: this.getAuthHeaders() }).pipe(
      map(response => Match.fromApi(response.match))
    );
  }

  simulateMatch(matchUUID: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/simulate`,
      { matchID: matchUUID },
      { headers: this.getAuthHeaders() }
    );
  }

  resetMatch(matchUUID: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/reset`,
      { matchID: matchUUID },
      { headers: this.getAuthHeaders() }
    );
  }

  placeBet(betData: any): Observable<any> {
    return this.http.post(this.betsUrl, betData, { headers: this.getAuthHeaders() });
  }
}
