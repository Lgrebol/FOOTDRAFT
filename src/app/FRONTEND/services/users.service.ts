import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUserUrl = 'http://localhost:3000/api/v1/auth/current-user';
  private footcoinsSubject = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("No token found in localStorage");
      return new HttpHeaders();
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Refresca les dades de l'usuari des del servidor
  refreshUserData(): Observable<any> {
    console.log("🔍 Enviant petició per obtenir dades d'usuari...");
    return this.http.get<any>(this.currentUserUrl, { 
      headers: this.getAuthHeaders() 
    }).pipe(
      tap(user => {
        console.log("✅ Resposta de current-user:", user);
        if (user && user.Footcoins !== undefined) {
          this.footcoinsSubject.next(user.Footcoins);
        }
      }),
      catchError(error => {
        console.error('❌ Error en refreshUserData:', error);
        throw error;
      })
    );
  }

  // Retorna un observable per subscriure's a les actualitzacions de footcoins
  getFootcoinsUpdates(): Observable<number> {
    return this.footcoinsSubject.asObservable();
  }

  // Actualitza manualment els footcoins
  updateFootcoins(newAmount: number) {
    this.footcoinsSubject.next(newAmount);
  }
}
