import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Player, Team } from '../shared/data.service';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  players: Player[] = [];
  teams: Team[] = [];
  selectedFile: File | null = null;
  
  // Corregir estructura newPlayer
  newPlayer = {
    name: '',
    position: '',
    teamId: null as number | null,  // Canviar de 'team' a 'teamId'
    isActive: true,
    isForSale: false,
    price: 0,
    height: 0,
    speed: 0,
    shooting: 0
  };

  positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.dataService.getPlayers().subscribe(players => this.players = players);
    this.dataService.getTeams().subscribe(teams => this.teams = teams);
  }

  // Afegir mètode per gestionar fitxers
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  addPlayer(): void {
    const formData = new FormData();
    
    // Configurar FormData correctament
    formData.append('playerName', this.newPlayer.name);
    formData.append('position', this.newPlayer.position);
    formData.append('teamID', String(this.newPlayer.teamId));
    formData.append('isActive', this.newPlayer.isActive ? '1' : '0');
    formData.append('isForSale', this.newPlayer.isForSale ? '1' : '0');
    formData.append('price', String(this.newPlayer.price));
    formData.append('height', String(this.newPlayer.height));
    formData.append('speed', String(this.newPlayer.speed));
    formData.append('shooting', String(this.newPlayer.shooting));
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.dataService.addPlayer(formData).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error afegint jugador:', err)
    });
  }

  deletePlayer(playerId: number): void {
    this.dataService.deletePlayer(playerId).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error eliminant jugador:', err)
    });
  }
}