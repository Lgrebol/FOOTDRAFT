import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Match {
  id: number;
  // Add additional properties as needed.
}

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = 'http://localhost:3000/api/v1/matches';

  constructor(private http: HttpClient) {}

  getMatch(matchID: number): Observable<Match> {
    return this.http.get<Match>(`${this.apiUrl}/${matchID}`);
  }

  simulateEvent(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/simulate`, data);
  }

  getMatchSummary(matchID: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary/${matchID}`);
  }

  createMatch(matchData: any): Observable<Match> {
    return this.http.post<Match>(this.apiUrl, matchData);
  }
}
