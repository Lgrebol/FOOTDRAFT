import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Team } from '../Classes/teams/team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'http://localhost:3000/api/v1/teams';
  private teamsSubject = new BehaviorSubject<Team[]>([]);

  constructor(private http: HttpClient) { this.fetchTeams(); }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });
  }

  private fetchTeams(): void {
    this.http.get<Team[]>(this.apiUrl, { headers: this.getAuthHeaders() }).subscribe(
      teams => {
        const teamInstances = teams.map(t => Team.fromApi(t));
        this.teamsSubject.next(teamInstances);
      },
      error => console.error('Error fetching teams:', error)
    );
  }

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map(teams => teams.map(t => Team.fromApi(t)))
    );
  }

  addTeam(team: Team): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, team.toPayload(), { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.fetchTeams()),
      map(t => Team.fromApi(t))
    );
  }

  deleteTeam(teamUUID: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.apiUrl}/${teamUUID}`, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.fetchTeams())
    );
  }

  assignPlayerToTeam(teamUUID: string, playerUUID: string, userUUID: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/${teamUUID}/add-player-from-reserve`, { playerId: playerUUID, userID: userUUID }, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.fetchTeams())
    );
  }
}
