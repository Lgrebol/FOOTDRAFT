import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RegistreService {
  private apiURLRegister = 'http://localhost:3000/api/v1/register';
  private apiURLValidate = 'http://localhost:3000/api/v1/login';
  private storage: Record<string, string> = {};

  constructor(private http: HttpClient) {}

  register(username: string, email: string, password: string): Observable<any> {
    const body = { name: username, email, password };
    console.log(body);
    return this.http.post(this.apiURLRegister, body);
  }

  validateUser(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(this.apiURLValidate, body);
  }
  
  saveToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('authToken', token);
    } else {
      this.storage['authToken'] = token;
    }
  }
  
}