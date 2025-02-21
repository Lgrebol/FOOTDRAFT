import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Player } from '../Classes/players/player.model';

@Injectable({
  providedIn: 'root'
})
export class ReserveService {
  private apiUrl = 'http://localhost:3000/api/v1/reserve';

  constructor(private http: HttpClient) {}

  // Ara userId és de tipus string (UUID)
  getReservedPlayers(userId: string): Observable<Player[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`).pipe(
      map(players => players.map(p =>
        new Player(
          p.PlayerUUID,
          p.PlayerName,
          p.Position,
          p.TeamUUID,
          p.IsActive,
          p.IsForSale,
          p.Price,
          p.Height,
          p.Speed,
          p.Shooting,
          p.PlayerImage,
          p.Points,
          p.TeamName
        )
      ))
    );
  }
}
