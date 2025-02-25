import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Player } from '../Classes/players/player.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private apiUrl = 'http://localhost:3000/api/v1/players';
  
  constructor(private http: HttpClient) { }
  
  getPlayers(): Observable<Player[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(players => players.map(p => Player.fromApi(p)))
    );
  }
  
  addPlayer(playerData: FormData): Observable<Player> {
    return this.http.post<any>(this.apiUrl, playerData).pipe(
      map(p => Player.fromApi(p))
    );
  }
  
  deletePlayer(playerUUID: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${playerUUID}`);
  }
  
  getReservedPlayers(userUUID: string): Observable<Player[]> {
    const reserveUrl = `http://localhost:3000/api/v1/reserve/${userUUID}`;
    return this.http.get<any[]>(reserveUrl).pipe(
      map(players => players.map(p => Player.fromApi(p)))
    );
  }
}
