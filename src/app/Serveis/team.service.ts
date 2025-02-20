// src/app/services/team.service.ts
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
  
  constructor(private http: HttpClient) {
    this.fetchTeams();
  }
  
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  
  private fetchTeams(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      teams => {
        const teamInstances = teams.map(t =>
          new Team(t.TeamID, t.TeamName, t.ShirtColor, t.UserID, t.UserName)
        );
        this.teamsSubject.next(teamInstances);
      },
      error => console.error('Error fetching teams:', error)
    );
  }
  
  getTeams(): Observable<Team[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map(teams => teams.map(t =>
        new Team(t.TeamID, t.TeamName, t.ShirtColor, t.UserID, t.UserName)
      ))
    );
  }
}