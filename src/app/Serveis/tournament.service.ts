import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  
  private fetchTournaments(): void {
    this.http.get<any[]>(`${this.apiUrl}/tournaments`).subscribe(
      tournaments => {
        const tournamentInstances = tournaments.map(t =>
          new Tournament(t.TournamentUUID, t.TournamentName, t.TournamentType, t.StartDate, t.EndDate)
        );
        this.tournamentsSubject.next(tournamentInstances);
      },
      error => console.error('Error fetching tournaments:', error)
    );
  }
  
  getTournaments(): Observable<Tournament[]> {
    return this.tournamentsSubject.asObservable();
  }
  
  trackById(index: number, item: Tournament): string {
    return item.id;
  }
  
  addTournament(tournamentData: { tournamentName: string; tournamentType: string; startDate: string; endDate: string }): Observable<Tournament> {
    return this.http.post<any>(`${this.apiUrl}/tournaments`, tournamentData).pipe(
      tap(() => this.fetchTournaments()),
      map(t => new Tournament(t.TournamentUUID, t.TournamentName, t.TournamentType, t.StartDate, t.EndDate))
    );
  }
  
  deleteTournament(tournamentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tournaments/${tournamentId}`).pipe(
      tap(() => this.fetchTournaments())
    );
  }
}