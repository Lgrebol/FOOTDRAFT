import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from '../Classes/user/user.model';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/v1/users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private footcoinsSubject = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  // Helper per obtenir headers d'autenticació
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtenir l'usuari actual
  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}`);
  }
  
  // Obtenir les actualitzacions dels footcoins
  getFootcoinsUpdates(): Observable<number> {
    return this.footcoinsSubject.asObservable();
  }

  // Refrescar dades de l'usuari actual
  refreshCurrentUserData(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/current-user`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(userData => {
        const currentUser = new User(
          userData.id,
          userData.username,
          userData.email,
          userData.footcoins
        );
        this.currentUserSubject.next(currentUser);
        this.footcoinsSubject.next(currentUser.footcoins);
      }),
      catchError(error => {
        console.error('Error actualitzant l’usuari:', error);
        return throwError(() => error);
      })
    );
  }

  // Actualitzar els footcoins d'un usuari
  updateFootcoins(newAmount: number): void {
    this.footcoinsSubject.next(newAmount);
  }

  // Registre d'un nou usuari
  registerUser(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { 
      username, email, password 
    });
  }

  // Inici de sessió d'un usuari
  loginUser(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.apiUrl}/login`, 
      { email, password }
    ).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.token);
        this.refreshCurrentUserData().subscribe();
      })
    );
  }

  // Tancar sessió
  logoutUser(): void {
    this.footcoinsSubject.next(0);
  }
}
