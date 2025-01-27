import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  players: any[] = []; // Llista de jugadors
  newPlayer = {
    name: '',
    position: '',
    team: ''
  };
  positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']; 

  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.fetchPlayers();
  }


  // Obtenir jugadors del backend
  fetchPlayers() {
    this.http.get<any[]>('http://localhost:3000/api/v1/players').subscribe(
      (data) => {
        this.players = data;
      },
      (error) => {
        console.error('Error carregant els jugadors:', error);
      }
    );
  }
}
