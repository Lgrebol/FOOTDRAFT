import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../Serveis/player.service';
import { TeamService } from '../../Serveis/team.service';
import { Player } from '../../Classes/players/player.model';
import { Team } from '../../Classes/teams/team.model';
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
  // Encapsulate player logic in the model
  playerList: PlayerList = new PlayerList();
  // Encapsulate team logic in a dedicated model instead of a standalone array
  teamList: TeamList = new TeamList();

  editingPlayer: Player | null = null;
  newPlayer: Player = new Player();

  positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  constructor(
    private playerService: PlayerService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadPlayers();
    this.loadTeams();
  }

  private loadPlayers(): void {
    this.playerService.getPlayers().subscribe(players => {
      this.playerList.players = players;
    });
  }

  private loadTeams(): void {
    this.teamService.getTeams().subscribe(teams => {
      this.teamList.teams = teams;
    });
  }

  // Public getter and setter for players, delegating to the PlayerList model
  get players(): Player[] {
    return this.playerList.players;
  }
  set players(players: Player[]) {
    this.playerList.players = players;
  }

  // Public getter and setter for teams, delegating to the TeamList model
  get teams(): Team[] {
    return this.teamList.teams;
  }
  set teams(teams: Team[]) {
    this.teamList.teams = teams;
  }

  get paginatedPlayers(): Player[] {
    return this.playerList.paginatedPlayers;
  }

  addPlayer(): void {
    // Block addition if no teams are available.
    if (!this.teams || this.teams.length === 0) {
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
        this.playerList.players = [...this.playerList.players, createdPlayer];
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
        this.playerList.players = this.playerList.players.filter(p => p.playerUUID !== playerUUID);
      },
      error: (err) => console.error('Error eliminant jugador:', err)
    });
  }

  editPlayer(player: Player): void {
    this.editingPlayer = Player.clone(player);
  }

  updatePlayer(): void {
    if (!this.editingPlayer) return;
    if (!this.editingPlayer.isValid()) {
      alert('Si us plau, omple tots els camps obligatoris.');
      return;
    }
    const formData = this.editingPlayer.toFormData();
    this.playerService.updatePlayer(this.editingPlayer.playerUUID, formData).subscribe({
      next: (updatedPlayer: Player) => {
        this.playerList.players = this.playerList.players.map(p =>
          p.playerUUID === updatedPlayer.playerUUID ? updatedPlayer : p
        );
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
