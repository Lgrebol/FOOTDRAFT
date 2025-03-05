import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Tournament } from '../Classes/tournament/tournament.model';
import { ITournamentApiResponse } from '../Interfaces/tournament-api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private apiUrl = 'http://localhost:3000/api/v1';
  private tournamentsSubject = new BehaviorSubject<Tournament[]>([]);

  constructor(private http: HttpClient) { this.fetchTournaments(); }

  private getAuthHeader(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ 'Authorization': token ? `Bearer ${token}` : '' });
  }

  private fetchTournaments(): void {
    this.http.get<ITournamentApiResponse[]>(`${this.apiUrl}/tournaments`, { headers: this.getAuthHeader() }).subscribe(
      tournaments => {
        const tournamentInstances = tournaments.map(t => {
          const tournament = new Tournament();
          (tournament as any).tournamentUUID = t.TournamentUUID;
          tournament.tournamentName = t.TournamentName;
          tournament.tournamentType = t.TournamentType;
          tournament.startDate = t.StartDate;
          tournament.endDate = t.EndDate;
          return tournament;
        });
        this.tournamentsSubject.next(tournamentInstances);
      },
      error => console.error('Error fetching tournaments:', error)
    );
  }

  getTournaments(): Observable<Tournament[]> {
    return this.tournamentsSubject.asObservable();
  }

  addTournament(tournamentData: { tournamentName: string; tournamentType: string; startDate: string; endDate: string }): Observable<Tournament> {
    return this.http.post<ITournamentApiResponse>(`${this.apiUrl}/tournaments`, tournamentData, { headers: this.getAuthHeader() }).pipe(
      tap(() => this.fetchTournaments()),
      map(t => {
        const tournament = new Tournament();
        (tournament as any).tournamentUUID = t.TournamentUUID;
        tournament.tournamentName = t.TournamentName;
        tournament.tournamentType = t.TournamentType;
        tournament.startDate = t.StartDate;
        tournament.endDate = t.EndDate;
        return tournament;
      })
    );
  }

  deleteTournament(tournamentUUID: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.apiUrl}/tournaments/${tournamentUUID}`, { headers: this.getAuthHeader() }).pipe(
      tap(() => this.fetchTournaments())
    );
  }
}
