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
  players: any[] = [];
  teams: any[] = [];
  newPlayer = {
    name: '',
    position: '',
    team: '',
    image: ''  // camp per l'URL de la imatge
  };
  positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  constructor(private http: HttpClient) {}
  
  ngOnInit() {
    this.fetchPlayers();
    this.fetchTeams();
  }

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

  fetchTeams() {
    this.http.get<any[]>('http://localhost:3000/api/v1/teams').subscribe(
      (data) => {
        this.teams = data;
      },
      (error) => {
        console.error('Error carregant els equips:', error);
      }
    );
  }

  addPlayer() {
    if (this.newPlayer.name && this.newPlayer.position && this.newPlayer.team) {
      this.http.post('http://localhost:3000/api/v1/players', {
        playerName: this.newPlayer.name,
        position: this.newPlayer.position,
        teamID: this.newPlayer.team,
        playerImage: this.newPlayer.image // enviem la imatge
      }).subscribe(
        () => {
          this.fetchPlayers();
          this.newPlayer = { name: '', position: '', team: '', image: '' };
        },
        (error) => {
          console.error('Error afegint el jugador:', error);
        }
      );
    }
  }

  deletePlayer(playerId: number) {
    this.http.delete(`http://localhost:3000/api/v1/players/${playerId}`).subscribe(
      () => {
        this.fetchPlayers();
      },
      (error) => {
        console.error('Error eliminant el jugador:', error);
      }
    );
  }
}
