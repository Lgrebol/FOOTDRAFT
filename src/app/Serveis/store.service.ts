import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
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

  // Helper function to get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private fetchStorePlayers(params?: HttpParams): void {
    this.http.get<any[]>(`${this.apiUrl}/store`, { headers: this.getAuthHeaders(), params }).pipe(
      map(players => players.map(p => Player.fromApi(p))),
      catchError(error => {
        console.error('Error obtenint jugadors:', error);
        return throwError(() => new Error('Error carregant jugadors'));
      })
    ).subscribe({
      next: (players) => this.storePlayersSubject.next(players),
      error: (error) => console.error(error)
    });
  }

  getStorePlayers(): Observable<Player[]> {
    return this.storePlayersSubject.asObservable();
  }

  refreshStorePlayers(searchTerm?: string, minPrice?: number, maxPrice?: number): void {
    let params = new HttpParams();
    if (searchTerm) params = params.set('search', searchTerm);
    if (minPrice !== undefined && minPrice !== null) params = params.set('minPrice', minPrice);
    if (maxPrice !== undefined && maxPrice !== null) params = params.set('maxPrice', maxPrice);
    
    this.fetchStorePlayers(params);
  }

  buyPlayer(playerUUID: string, userUUID: string): Observable<any> {
    if (!this.isValidUUID(playerUUID) || !this.isValidUUID(userUUID)) {
      return throwError(() => new Error('ID invàlid'));
    }

    return this.http.post(
      `${this.apiUrl}/buy/${playerUUID}`, 
      { userID: userUUID },
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(() => this.refreshStorePlayers()),
      catchError(error => {
        console.error('Error en la compra:', error);
        return throwError(() => error);
      })
    );
  }
}
