import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Player } from '../Classes//players/player.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private apiUrl = 'http://localhost:3000/api/v1';
  private storePlayersSubject = new BehaviorSubject<Player[]>([]);
  
  constructor(private http: HttpClient) {
    this.fetchStorePlayers();
  }
  
  private fetchStorePlayers(params?: HttpParams): void {
    this.http.get<any[]>(`${this.apiUrl}/players/store`, { params }).pipe(
      map(players => players.map(p =>
        new Player(
          p.PlayerID,
          p.PlayerName,
          p.Position,
          p.TeamID,
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
    ).subscribe(
      mappedPlayers => this.storePlayersSubject.next(mappedPlayers),
      error => console.error('Error fetching store players:', error)
    );
  }
  
  getStorePlayers(): Observable<Player[]> {
    return this.storePlayersSubject.asObservable();
  }
  
  refreshStorePlayers(searchTerm?: string, minPrice?: number, maxPrice?: number): void {
    let params = new HttpParams();
    if (searchTerm) { params = params.set('search', searchTerm); }
    if (minPrice) { params = params.set('minPrice', minPrice.toString()); }
    if (maxPrice) { params = params.set('maxPrice', maxPrice.toString()); }
    this.fetchStorePlayers(params);
  }
  
  buyPlayer(playerId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/players/buy/${playerId}`, { userID: userId }).pipe(
      tap(() => this.fetchStorePlayers())
    );
  }
}
