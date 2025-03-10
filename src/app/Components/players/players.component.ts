import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../Serveis/player.service';
import { TeamService } from '../../Serveis/team.service';
import { Player } from '../../Classes/players/player.model';
import { PlayerList } from '../../Classes/players/player-list.model';
import { TeamList } from '../../Classes/teams/team-list.model';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  playerList: PlayerList = new PlayerList();
  teamList: TeamList = new TeamList();
  
  reservedPlayers: Player[] = [];
  currentUserId: string = localStorage.getItem('userUUID') || '';

  editingPlayer: Player | null = null;
  newPlayer: Player = new Player();

  positions: string[] = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  constructor(
    private playerService: PlayerService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadPlayers();
    this.loadTeams();
    this.loadReservedPlayers();
  }

  private loadPlayers(): void {
    this.playerService.getPlayers().subscribe((players) => {
      this.playerList.players = players;
    });
  }

  private loadTeams(): void {
    this.teamService.getTeams().subscribe((teams) => {
      this.teamList.teams = teams;
    });
  }
  
  private loadReservedPlayers(): void {
    if (this.currentUserId) {
      this.playerService.getReservedPlayers(this.currentUserId).subscribe({
        next: (players) => { this.reservedPlayers = players; },
        error: (err) => console.error('Error carregant jugadors reservats:', err)
      });
    }
  }

  addPlayer(): void {
    if (this.teamList.teams.length === 0) {
      alert('No hi ha equips disponibles');
      return;
    }
    if (!this.newPlayer.isValid()) {
      alert('Si us plau, omple tots els camps obligatoris.');
      return;
    }
    const formData = this.newPlayer.toFormData();
    this.playerService.addPlayer(formData).subscribe({
      next: (createdPlayer: Player) => {
        if (!createdPlayer.teamName && this.newPlayer.teamUUID) {
          const teamFound = this.teamList.teams.find(t => t.teamUUID === this.newPlayer.teamUUID);
          if (teamFound) {
            createdPlayer.teamName = teamFound.teamName;
          }
        }
        this.playerList.add(createdPlayer);
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
        this.playerList.remove(playerUUID);
      },
      error: (err) => console.error('Error eliminant jugador:', err)
    });
  }

  editPlayer(player: Player): void {
    this.editingPlayer = Player.clone(player);
  }

  updatePlayer(): void {
    if (!this.editingPlayer) { return; }
    if (!this.editingPlayer.isValid()) {
      alert('Si us plau, omple tots els camps obligatoris.');
      return;
    }
    const formData = this.editingPlayer.toFormData();
    this.playerService.updatePlayer(this.editingPlayer.playerUUID, formData).subscribe({
      next: (updatedPlayer: Player) => {
        this.playerList.update(updatedPlayer);
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
}
