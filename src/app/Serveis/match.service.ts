import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Match } from '../Classes/match/match.model';
import { IMatchBetPayload } from '../Interfaces/match.interface';
import { IMatchApiResponse } from '../Interfaces/match-api-response.interface';

interface GetMatchResponse { match: IMatchApiResponse; }

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = 'http://localhost:3000/api/v1/matches';
  private betsUrl = 'http://localhost:3000/api/v1/bets';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });
  }

  createMatch(match: Match): Observable<{ matchID: string }> {
    return this.http.post<{ matchID: string }>(this.apiUrl, match.toApi(), { headers: this.getAuthHeaders() });
  }

  getMatch(matchUUID: string): Observable<Match> {
    return this.http.get<GetMatchResponse>(`${this.apiUrl}/${matchUUID}`, { headers: this.getAuthHeaders() }).pipe(
      map(response => Match.fromApi(response.match))
    );
  }

  simulateMatch(matchUUID: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/simulate`, { matchID: matchUUID }, { headers: this.getAuthHeaders() });
  }

  resetMatch(matchUUID: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/reset`, { matchID: matchUUID }, { headers: this.getAuthHeaders() });
  }

  placeBet(betData: IMatchBetPayload): Observable<unknown> {
    return this.http.post<unknown>(this.betsUrl, betData, { headers: this.getAuthHeaders() });
  }
}
