import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Assegura't d'importar CommonModule
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule], // Afegim CommonModule perquè NgFor i els pipes (com currency) estiguin disponibles
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit {
  storePlayers: any[] = [];
  currentUserID: number = 1; // Simulem l'usuari actual

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchStorePlayers();
  }

  fetchStorePlayers(): void {
    this.http.get<any[]>('http://localhost:3000/api/v1/players/store')
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