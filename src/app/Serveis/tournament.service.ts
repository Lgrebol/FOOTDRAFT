import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Tournament } from '../Classes/tournament/tournament.model';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private apiUrl = 'http://localhost:3000/api/v1';
  private tournamentsSubject = new BehaviorSubject<Tournament[]>([]);

  constructor(private http: HttpClient) {
    this.fetchTournaments();
  }

  // Private method to get the Authorization header from localStorage
  private getAuthHeader(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Fetch tournaments with the auth header
  private fetchTournaments(): void {
    this.http.get<any[]>(`${this.apiUrl}/tournaments`, { headers: this.getAuthHeader() }).subscribe(
      tournaments => {
        const tournamentInstances = tournaments.map(t =>
          new Tournament(t.TournamentUUID, t.TournamentName, t.TournamentType, t.StartDate, t.EndDate)
        );
        this.tournamentsSubject.next(tournamentInstances);
      },
      error => console.error('Error fetching tournaments:', error)
    );
  }

  // Returns an observable of tournaments
  getTournaments(): Observable<Tournament[]> {
    return this.tournamentsSubject.asObservable();
  }

  // Add a tournament using the auth header
  addTournament(tournamentData: { tournamentName: string; tournamentType: string; startDate: string; endDate: string }): Observable<Tournament> {
    return this.http.post<any>(`${this.apiUrl}/tournaments`, tournamentData, { headers: this.getAuthHeader() }).pipe(
      tap(() => this.fetchTournaments()),
      map(t => new Tournament(t.TournamentUUID, t.TournamentName, t.TournamentType, t.StartDate, t.EndDate))
    );
  }

  // Delete a tournament using the auth header
  deleteTournament(tournamentUUID: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tournaments/${tournamentUUID}`, { headers: this.getAuthHeader() }).pipe(
      tap(() => this.fetchTournaments())
    );
  }
}
