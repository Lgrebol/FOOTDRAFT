import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  createMatch(matchData: any): Observable<any> {
    return this.http.post(this.apiUrl, matchData);
  }

  getMatch(matchUUID: string): Observable<Match> {
    return this.http.get<any>(`${this.apiUrl}/${matchUUID}`).pipe(
      map(response => Match.fromApi(response.match))
    );
  }

  simulateMatch(matchUUID: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/simulate`, { matchID: matchUUID });
  }

  resetMatch(matchUUID: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset`, { matchID: matchUUID });
  }

  placeBet(betData: any): Observable<any> {
    return this.http.post(this.betsUrl, betData);
  }
}
