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

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    })
  };

  constructor(private http: HttpClient) {}

  private getToken(): string {
    return localStorage.getItem('token') || '';
  }

  createMatch(match: Match): Observable<any> {
    return this.http.post(this.apiUrl, match.toApi(), this.httpOptions);
  }

  getMatch(matchUUID: string): Observable<Match> {
    return this.http.get<any>(`${this.apiUrl}/${matchUUID}`, this.httpOptions).pipe(
      map(response => Match.fromApi(response.match))
    );
  }

  simulateMatch(matchUUID: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/simulate`, 
      { matchID: matchUUID }, 
      this.httpOptions
    );
  }

  resetMatch(matchUUID: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/reset`, 
      { matchID: matchUUID }, 
      this.httpOptions
    );
  }

  placeBet(betData: any): Observable<any> {
    return this.http.post(
      this.betsUrl, 
      betData, 
      this.httpOptions
    );
  }
}
