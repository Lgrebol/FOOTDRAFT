import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  // Mètode per obtenir l'usuari actual
  getCurrentUser(): Observable<any> {
    return this.http.get('http://localhost:3000/api/v1/auth/current-user');
  }
}
