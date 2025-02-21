import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BetService {
  private apiUrl = 'http://localhost:3000/api/v1/bets';

  constructor(private http: HttpClient) {}

  placeBet(betData: any): Observable<any> {
    return this.http.post(this.apiUrl, betData);
  }
}
