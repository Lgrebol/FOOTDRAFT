import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Player } from '../Classes/players/player.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private apiUrl = 'http://localhost:3000/api/v1/players';
  private playersSubject = new BehaviorSubject<Player[]>([]);
  
  constructor(private http: HttpClient) {
    this.fetchPlayers();
  }
  
  private fetchPlayers(): void {
    this.http.get<any[]>(this.apiUrl).subscribe(
      players => {
        const playerInstances = players.map(p => Player.fromApi(p));
        this.playersSubject.next(playerInstances);
      },
      error => console.error('Error fetching players:', error)
    );
  }
  
  getPlayers(): Observable<Player[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(players => players.map(p => Player.fromApi(p)))
    );
  }
  
  addPlayer(playerData: FormData): Observable<Player> {
    return this.http.post<any>(this.apiUrl, playerData).pipe(
      tap(() => this.fetchPlayers()),
      map(p => Player.fromApi(p))
    );
  }
  
  deletePlayer(playerId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${playerId}`).pipe(
      tap(() => this.fetchPlayers())
    );
  }
  
  getReservedPlayers(userId: string): Observable<Player[]> {
    const reserveUrl = `http://localhost:3000/api/v1/reserve/${userId}`;
    return this.http.get<any[]>(reserveUrl).pipe(
      map(players => players.map(p => Player.fromApi(p)))
    );
  }
}
