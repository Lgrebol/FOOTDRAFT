import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'http://localhost:3000/api/v1/teams'; // ✅ Corregeix la ruta

  constructor(private http: HttpClient) { }

  // Obtenir tots els equips
  getTeams(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Obtenir equips d'un torneig (necessita implementació al backend)
  getTeamsByTournament(tournamentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tournament/${tournamentId}`);
  }
}