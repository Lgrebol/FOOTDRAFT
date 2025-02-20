import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tournament } from '../shared/data.service'; // Adjust the path if needed

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private apiUrl = 'http://localhost:3000/api/v1/tournaments';

  constructor(private http: HttpClient) { }

  getTournaments(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(this.apiUrl);
  }
}
