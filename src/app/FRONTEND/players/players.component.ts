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
  
  // Camps per al nou jugador
  newPlayer = {
    name: '',
    position: '',
    team: ''
  };

  positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
  selectedFile: File | null = null; // Fitxer seleccionat

  constructor(private http: HttpClient) {}
  
  ngOnInit() {
    this.fetchPlayers();
    this.fetchTeams();
  }

  // Obtenir la llista de jugadors
  fetchPlayers() {
    this.http.get<any[]>('http://localhost:3000/api/v1/players').subscribe(
      (data) => {
        // Si les imatges es retornen com a binari, potser has de convertir-les a Base64.
        // Aquest exemple assumeix que el servidor ja envia la imatge en format Base64.
        this.players = data;
      },
      (error) => {
        console.error('Error carregant els jugadors:', error);
      }
    );
  }

  // Obtenir la llista d'equips
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

  // Capturar el fitxer seleccionat
  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  // Afegir un nou jugador
  addPlayer() {
    // Comprovem que hi hagi fitxer seleccionat
    if (this.newPlayer.name && this.newPlayer.position && this.newPlayer.team && this.selectedFile) {
      const formData = new FormData();
      formData.append('playerName', this.newPlayer.name);
      formData.append('position', this.newPlayer.position);
      formData.append('teamID', this.newPlayer.team);
      // El nom "image" ha de coincidir amb el definit en upload.single("image")
      formData.append('image', this.selectedFile, this.selectedFile.name);

      this.http.post('http://localhost:3000/api/v1/players', formData).subscribe(
        () => {
          this.fetchPlayers(); // Actualitza la llista de jugadors
          // Reseteja el formulari
          this.newPlayer = { name: '', position: '', team: '' };
          this.selectedFile = null;
        },
        (error) => {
          console.error('Error afegint el jugador:', error);
        }
      );
    } else {
      alert("Tots els camps són obligatoris, incloent la imatge.");
    }
  }

  // Eliminar un jugador
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
