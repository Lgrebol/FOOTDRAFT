import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private apiUrl = 'http://localhost:3000/api/v1/tournaments'; 

  constructor(private http: HttpClient) { }

  // Obtenir tots els torneigs
  getTournaments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}