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
  
  newPlayer: Player;
  editingPlayer: Player | null = null; // Utilitzem objectes del model

  positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  constructor(
    private playerService: PlayerService,
    private teamService: TeamService
  ) {
    this.newPlayer = new Player();
  }

  ngOnInit(): void {
    this.playerService.getPlayers().subscribe(players => this.players = players);
    this.teamService.getTeams().subscribe(teams => this.teams = teams);
  }
  
  // Mètode per assignar la imatge (en crear o editar) usant el model
  onFileSelected(event: any, isEditing: boolean = false): void {
    const file: File = event.target.files[0];
    if (file) {
      if (isEditing && this.editingPlayer) {
        this.editingPlayer.imageFile = file;
      } else {
        this.newPlayer.imageFile = file;
      }
    } else {
      console.error('No s\'ha seleccionat cap fitxer');
    }
  }  

  addPlayer(): void {
    // Comprovem si hi ha equips disponibles
    if (this.teams.length === 0) {
      alert('No hi ha equips disponibles');
      return;
    }
    
    // Validem el jugador
    if (!this.newPlayer.isValid()) {
      alert('Si us plau, omple tots els camps obligatoris.');
      return;
    }
    
    const formData = this.newPlayer.toFormData();
    this.playerService.addPlayer(formData).subscribe({
      next: (createdPlayer: Player) => {
        this.players.push(createdPlayer);
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
      next: () => {
        this.players = this.players.filter(player => player.playerUUID !== playerUUID);
      },
      error: (err) => console.error('Error eliminant jugador:', err)
    });
  }

  // Activa l'edició fent servir la funció clone del model
  editPlayer(player: Player): void {
    this.editingPlayer = Player.clone(player);
  }

  updatePlayer(): void {
    if (!this.editingPlayer) {
      return;
    }
    if (!this.editingPlayer.isValid()) {
      alert('Si us plau, omple tots els camps obligatoris.');
      return;
    }
    const formData = this.editingPlayer.toFormData();
    this.playerService.updatePlayer(this.editingPlayer.playerUUID, formData).subscribe({
      next: (updatedPlayer: Player) => {
        const index = this.players.findIndex(p => p.playerUUID === updatedPlayer.playerUUID);
        if (index !== -1) {
          // Actualitzem l'objecte completament
          this.players[index] = updatedPlayer;
        }
        this.editingPlayer = null;
      },
      error: (err) => {
        console.error('Error actualitzant jugador:', err);
        alert(`Error al actualitzar el jugador: ${err.error?.error || 'Error desconegut'}`);
      }
    });
  }

  cancelEdit(): void {
    this.editingPlayer = null;
  }
}
