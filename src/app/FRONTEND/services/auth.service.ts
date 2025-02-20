import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Getter acting as a "getter" for the current user ID.
  get currentUserID(): number {
    // Assuming the user ID is stored in localStorage after login.
    return Number(localStorage.getItem('userID')) || 0;
  }
}
