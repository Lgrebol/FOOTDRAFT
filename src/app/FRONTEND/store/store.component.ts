import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {
  storePlayers: any[] = [];
  currentUserID: number = 1; // Simulem l'usuari actual

  // Variables per als filtres
  searchTerm: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchStorePlayers();
  }

  // Funció per obtenir els jugadors amb els paràmetres de filtre
  fetchStorePlayers(): void {
    let params = new HttpParams();
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      params = params.set('search', this.searchTerm);
    }

    this.http.get<any[]>('http://localhost:3000/api/v1/players/store', { params })
      .subscribe(
        data => this.storePlayers = data,
        error => console.error('Error carregant els jugadors de la tenda:', error)
      );
  }

  buyPlayer(playerId: number): void {
    this.http.post(`http://localhost:3000/api/v1/players/buy/${playerId}`, { userID: this.currentUserID })
      .subscribe(
        (res: any) => {
          alert(res.message);
          this.fetchStorePlayers(); // Actualitza la llista de la tenda
        },
        error => {
          console.error('Error comprant el jugador:', error);
          alert(error.error?.error || 'Error comprant el jugador');
        }
      );
  }
}
