import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../Serveis/player.service';
import { TeamService } from '../../Serveis/team.service';
import { Player } from '../../Classes/players/player.model';
import { Team } from '../../Classes/teams/team.model';
import { PlayerList } from '../../Classes/players/player-list.model';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  playerList: PlayerList = new PlayerList();
  editingPlayer: Player | null = null;
  newPlayer: Player = new Player();

  positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];
  availableTeams: Team[] = [];

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
      this.availableTeams = teams;
    });
  }

  prevPage(): void {
    this.playerList.prevPage();
  }

  nextPage(): void {
    this.playerList.nextPage();
  }

  goToPage(page: number): void {
    this.playerList.goToPage(page);
  }

  addPlayer(): void {
    if (!this.newPlayer.isValid()) {
      alert('Si us plau, omple tots els camps obligatoris.');
      return;
    }
    const formData = this.newPlayer.toFormData();
    this.playerService.addPlayer(formData).subscribe({
      next: (createdPlayer: Player) => {
        const players = this.playerList.players;
        players.push(createdPlayer);
        this.playerList.players = players;
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
        const players = this.playerList.players.filter(p => p.playerUUID !== playerUUID);
        this.playerList.players = players;
      },
      error: (err) => console.error('Error eliminant jugador:', err)
    });
  }


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
        const index = this.playerList.players.findIndex(p => p.playerUUID === updatedPlayer.playerUUID);
        if (index !== -1) {
          const players = this.playerList.players;
          players[index] = updatedPlayer;
          this.playerList.players = players;
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