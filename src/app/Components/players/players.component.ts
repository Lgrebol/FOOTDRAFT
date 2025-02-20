// src/app/components/players/players.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../Serveis/player.service';
import { TeamService } from '../../Serveis/team.service';
import { Player } from '../../Classes/players/player.model';
import { Team } from '../../Classes/teams/team.model';

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
  
  newPlayer = {
    name: '',
    position: '',
    teamId: null as number | null,
    isActive: true,
    isForSale: false,
    price: 0,
    height: 0,
    speed: 0,
    shooting: 0
  };

  positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  constructor(
    private playerService: PlayerService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.playerService.getPlayers().subscribe(players => this.players = players);
    this.teamService.getTeams().subscribe(teams => this.teams = teams);
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  addPlayer(): void {
    const formData = new FormData();
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
    this.playerService.addPlayer(formData).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error afegint jugador:', err)
    });
  }

  deletePlayer(playerId: number): void {
    this.playerService.deletePlayer(playerId).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error eliminant jugador:', err)
    });
  }
}
