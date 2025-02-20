import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { User } from '../Classes/user/user.model';
import { LoginRegister } from '../Classes//login-register/login-register.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  constructor(private http: HttpClient) {}
  
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  
  loginUser(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.apiUrl}/users/login`, 
      { email, password }
    ).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.token);
        this.refreshCurrentUserData().subscribe();
      })
    );
  }
  
  registerUser(username: string, email: string, password: string): Observable<any> {
    const data = new LoginRegister(email, password, username);
    if (!data.isValid()) {
      return throwError(() => new Error('Invalid registration data'));
    }
    return this.http.post(`${this.apiUrl}/users/register`, { name: username, email, password });
  }
  
  refreshCurrentUserData(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/auth/current-user`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(userData => {
        const currentUser = new User(
          userData.UserID,
          userData.Name,
          userData.Email,
          userData.Footcoins
        );
        this.currentUserSubject.next(currentUser);
      }),
      catchError(error => {
        console.error('Error refreshing current user:', error);
        return throwError(() => error);
      }),
      map(() => this.currentUserSubject.value as User)
    );
  }
  
  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }
  
  getFootcoinsUpdates(): Observable<number | undefined> {
    return this.currentUserSubject.asObservable().pipe(
      map(user => user?.footcoins)
    );
  }

  logoutUser(): void {
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }
}
