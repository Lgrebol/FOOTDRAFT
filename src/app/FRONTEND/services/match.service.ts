import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = 'http://localhost:3000/api/v1/matches';

  constructor(private http: HttpClient) {}

  // Obtenir la partida i els esdeveniments
  getMatch(matchID: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${matchID}`);
  }

  // Simular un esdeveniment (ex: gol)
  simulateEvent(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/simulate`, data);
  }

  // Obtenir el resum de la partida
  getMatchSummary(matchID: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary/${matchID}`);
  }

  createMatch(matchData: any): Observable<any> {
    return this.http.post(this.apiUrl, matchData);
  }
}
