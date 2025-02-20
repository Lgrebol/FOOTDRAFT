import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team } from '../shared/data.service'; // Adjust the path if needed

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'http://localhost:3000/api/v1/teams';

  constructor(private http: HttpClient) { }

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl);
  }

  getTeamsByTournament(tournamentId: number): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/tournament/${tournamentId}`);
  }
}
