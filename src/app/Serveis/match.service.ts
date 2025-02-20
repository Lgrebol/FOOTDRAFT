import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Match } from '../Classes/match/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = 'http://localhost:3000/api/v1';
  
  constructor(private http: HttpClient) {}
  
  createMatch(matchData: { tournamentID: number; homeTeamID: number; awayTeamID: number; matchDate: Date }): Observable<any> {
    return this.http.post(`${this.apiUrl}/matches`, matchData);
  }
  
  getMatch(matchId: number): Observable<Match | null> {
    return this.http.get<any>(`${this.apiUrl}/matches/${matchId}`).pipe(
      map(response => {
        const backendData = response.match;
        if (!backendData) {
          return null;
        }
        const events = Array.isArray(backendData.events)
          ? backendData.events.map((event: any) => ({
              minute: event.Minute,
              eventType: event.EventType,
              description: event.Description,
              team: event.Team
            }))
          : [];
        return new Match(
          backendData.MatchID,
          backendData.HomeTeamID,
          backendData.AwayTeamID,
          backendData.HomeGoals,
          backendData.AwayGoals,
          backendData.CurrentMinute,
          backendData.TournamentID,
          backendData.MatchDate,
          events
        );
      })
    );
  }
  
  simulateMatch(matchId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/matches/simulate`, { matchID: matchId });
  }
  
  resetMatch(matchId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/matches/reset`, { matchID: matchId });
  }
}
