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
  // Tota la lògica de jugadors es gestiona amb el model PlayerList.
  playerList: PlayerList = new PlayerList();
  // La gestió dels equips es fa a través del model TeamList.
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

  // Exposició dels jugadors: el getter i setter deleguen a PlayerList.
  get players(): Player[] {
    return this.playerList.players;
  }
  set players(players: Player[]) {
    this.playerList.players = players;
  }

  // Exposició dels equips per a les proves i per a la plantilla.
  // Les proves utilitzen la propietat 'teams' i la plantilla fa referència a 'availableTeams'.
  get teams(): any[] {
    return this.teamList.teams;
  }
  set teams(teams: any[]) {
    this.teamList.teams = teams;
  }
  get availableTeams(): any[] {
    return this.teamList.teams;
  }

  // Exposició dels jugadors paginats (per a la plantilla).
  get paginatedPlayers(): Player[] {
    return this.playerList.paginatedPlayers;
  }

  // Delegació dels mètodes de paginació al model.
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
    // Si no hi ha equips, bloqueja l'addició.
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
        // Deleguem l'addició al model.
        this.playerList.add(createdPlayer);
        // Reinicialitzem el formulari (newPlayer).
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
        // Deleguem l'eliminació al model.
        this.playerList.remove(playerUUID);
      },
      error: (err) => console.error('Error eliminant jugador:', err)
    });
  }

  editPlayer(player: Player): void {
    // Clonem el jugador per evitar modificar-lo directament mentre s'edita.
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
        // Deleguem l'actualització al model.
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
