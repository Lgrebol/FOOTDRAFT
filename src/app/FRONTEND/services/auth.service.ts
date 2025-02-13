import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getCurrentUserID(): number {
    // Suposant que l'ID de l'usuari s'emmagatzema al localStorage després d'iniciar sessió
    return Number(localStorage.getItem('userID')) || 0;
  }
}
