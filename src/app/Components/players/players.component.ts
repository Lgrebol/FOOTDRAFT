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
  
  newPlayer: Player = new Player();

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
    const file: File = event.target.files[0];
    if (file) {
      console.log('Fitxer seleccionat:', file);
      this.newPlayer.imageFile = file;
    } else {
      console.error('No s\'ha seleccionat cap fitxer');
    }
  }  

addPlayer(): void {
  if (!this.newPlayer.isValid()) {
    alert('Si us plau, omple tots els camps obligatoris.');
    return;
  }

  const formData = this.newPlayer.toFormData();
  this.playerService.addPlayer(formData).subscribe({
    next: () => {
      this.loadData();
      this.newPlayer = new Player();
    },
    error: (err) => {
      console.error('Error del servidor:', err);
      alert(`Error al crear el jugador: ${err.error?.error || 'Error desconegut'}`);
    }
  });
}

  deletePlayer(playerUUID: string): void {
    this.playerService.deletePlayer(playerUUID).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error eliminant jugador:', err)
    });
  }
}