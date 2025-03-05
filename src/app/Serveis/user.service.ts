import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { User } from '../Classes/user/user.model';
import { IUserApiResponse } from '../Interfaces/user-api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/v1';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private footcoinsSubject = new BehaviorSubject<number>(0);
  private usersSubject = new BehaviorSubject<User[]>([]);

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' });
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getUsers(): Observable<User[]> {
    return this.http.get<IUserApiResponse[]>(`${this.apiUrl}/users`, { headers: this.getAuthHeaders() }).pipe(
      map(users => users.map(u => User.fromApi(u))),
      tap(users => this.usersSubject.next(users))
    );
  }
  
  getFootcoinsUpdates(): Observable<number> {
    return this.footcoinsSubject.asObservable();
  }

  refreshCurrentUserData(): Observable<User> {
    return this.http.get<IUserApiResponse>(`${this.apiUrl}/auth/current-user`, { headers: this.getAuthHeaders() }).pipe(
      tap(userData => {
        console.log('Dades usuari:', userData);
        const currentUser = User.fromApi(userData);
        this.currentUserSubject.next(currentUser);
        this.footcoinsSubject.next(currentUser.footcoins);
        localStorage.setItem('userUUID', currentUser.userUUID);
      }),
      catchError(error => {
        console.error('Error updating user data:', error);
        return throwError(() => error);
      }),
      map(userData => User.fromApi(userData))
    );
  }
  

  updateFootcoins(newAmount: number): void { 
    this.footcoinsSubject.next(newAmount); 
  }

  registerUser(user: User): Observable<unknown> {
    if (!user.isValidForRegistration()) {
      return throwError(() => new Error('Invalid registration data'));
    }
    return this.http.post<unknown>(`${this.apiUrl}/users/register`, 
      { name: user.username, email: user.email, password: user.password },
      { headers: this.getAuthHeaders() }
    );
  }

  loginUser(user: User): Observable<{ token: string }> {
    if (!user.isValidForLogin()) {
      return throwError(() => new Error('Invalid login data'));
    }
    return this.http.post<{ token: string }>(`${this.apiUrl}/users/login`, 
      { email: user.email, password: user.password },
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.token);
        // Refresquem les dades de l'usuari per actualitzar les footcoins
        this.refreshCurrentUserData().subscribe();
      })
    );
  }

  logoutUser(): void {
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    this.footcoinsSubject.next(0);
  }
}
