import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User } from '../Classes/user/user.model';
import { map } from 'rxjs/operators';

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
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getUsers(): Observable<User[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map(users => users.map(u => User.fromApi(u))),
      tap(users => this.usersSubject.next(users))
    );
  }
  
  getFootcoinsUpdates(): Observable<number> {
    return this.footcoinsSubject.asObservable();
  }

  refreshCurrentUserData(): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/auth/current-user`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(userData => {
        const currentUser = new User(
          userData.userUUID,
          userData.name,
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

  updateFootcoins(newAmount: number): void {
    this.footcoinsSubject.next(newAmount);
  }

  registerUser(user: User): Observable<any> {
    if (!user.isValidForRegistration()) {
      return throwError(() => new Error('Invalid registration data'));
    }
    return this.http.post(`${this.apiUrl}/users/register`, { 
      name: user.username, 
      email: user.email, 
      password: user.password 
    });
  }

  loginUser(user: User): Observable<{ token: string }> {
    if (!user.isValidForLogin()) {
      return throwError(() => new Error('Invalid login data'));
    }
    return this.http.post<{ token: string }>(
      `${this.apiUrl}/users/login`, 
      { email: user.email, password: user.password }
    ).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.token);
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