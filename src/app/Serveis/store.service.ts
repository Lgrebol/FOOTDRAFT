import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Player } from '../Classes/players/player.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private apiUrl = 'http://localhost:3000/api/v1/players';
  private storePlayersSubject = new BehaviorSubject<Player[]>([]);

  constructor(private http: HttpClient) {
    this.fetchStorePlayers();
  }

  private fetchStorePlayers(params?: HttpParams): void {
    this.http.get<any[]>(`${this.apiUrl}/store`, { params }).pipe(
      map((players: any[]) => players.map(p =>
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
    ).subscribe({
      next: (players: Player[]) => this.storePlayersSubject.next(players),
      error: (error: any) => console.error('Error fetching store players:', error)
    });
  }

  getStorePlayers(): Observable<Player[]> {
    return this.storePlayersSubject.asObservable();
  }

  refreshStorePlayers(searchTerm?: string, minPrice?: number, maxPrice?: number): void {
    let params = new HttpParams();
    if (searchTerm) { params = params.set('search', searchTerm); }
    if (minPrice) { params = params.set('minPrice', minPrice); }
    if (maxPrice) { params = params.set('maxPrice', maxPrice); }
    
    this.fetchStorePlayers(params);
  }

  buyPlayer(playerId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/buy/${playerId}`, { userID: userId }).pipe(
      tap(() => this.fetchStorePlayers())
    );
  }
}