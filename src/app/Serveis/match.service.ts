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

  constructor(private http: HttpClient) {}

  createMatch(matchData: any): Observable<any> {
    return this.http.post(this.apiUrl, matchData);
  }

  getMatch(matchId: number): Observable<Match> {
    return this.http.get<any>(`${this.apiUrl}/${matchId}`).pipe(
      map(response => {
        const backendData = response.match;
        return new Match(
          backendData.MatchID,
          backendData.HomeTeamID,
          backendData.AwayTeamID,
          backendData.HomeGoals,
          backendData.AwayGoals,
          backendData.CurrentMinute,
          backendData.TournamentID,
          backendData.MatchDate,
          backendData.events || []
        );
      })
    );
  }

  simulateMatch(matchId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/simulate`, { matchID: matchId });
  }

  resetMatch(matchId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset`, { matchID: matchId });
  }
}