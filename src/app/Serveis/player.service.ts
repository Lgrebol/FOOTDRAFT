import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Player } from '../Classes/players/player.model';
import { IPlayerApiResponse } from '../Interfaces/player-api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private apiUrl = 'http://localhost:3000/api/v1/players';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getPlayers(): Observable<Player[]> {
    return this.http.get<IPlayerApiResponse[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map(players => players.map(p => Player.fromApi(p)))
    );
  }

  addPlayer(playerData: FormData): Observable<Player> {
    return this.http.post<IPlayerApiResponse>(this.apiUrl, playerData, { headers: this.getAuthHeaders() }).pipe(
      map(p => Player.fromApi(p))
    );
  }

  deletePlayer(playerUUID: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.apiUrl}/${playerUUID}`, { headers: this.getAuthHeaders() });
  }

  updatePlayer(playerUUID: string, playerData: FormData): Observable<Player> {
    return this.http.put<IPlayerApiResponse>(`${this.apiUrl}/${playerUUID}`, playerData, { headers: this.getAuthHeaders() }).pipe(
      map(p => Player.fromApi(p))
    );
  }

  getReservedPlayers(userUUID: string): Observable<Player[]> {
    const reserveUrl = `http://localhost:3000/api/v1/reserve/${userUUID}`;
    return this.http.get<IPlayerApiResponse[]>(reserveUrl, { headers: this.getAuthHeaders() }).pipe(
      map(players => players.map(p => Player.fromApi(p)))
    );
  }
}
