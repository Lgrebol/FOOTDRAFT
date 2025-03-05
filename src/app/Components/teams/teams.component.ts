import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../Serveis/team.service';
import { UserService } from '../../Serveis/user.service';
import { PlayerService } from '../../Serveis/player.service';
import { Team } from '../../Classes/teams/team.model';
import { User } from '../../Classes/user/user.model';
import { Player } from '../../Classes/players/player.model';
import { UserList } from '../../Classes/user/user-list.model';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  teams: Team[] = [];
  userList: UserList = new UserList();
  reservedPlayers: Player[] = [];
  
  selectedTeamId: string | null = null;
  selectedPlayerId: string | null = null;
  
  currentUserId: string = '';
  newTeam: Team = new Team();

  constructor(
    private teamService: TeamService,
    private userService: UserService,
    private playerService: PlayerService
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.currentUserId = user.userUUID;
          console.log('Usuari actual:', user);
          this.fetchReservedPlayers();
        } else {
          console.warn('No s\'ha obtingut l\'usuari actual.');
        }
      },
      error: (err) => console.error('Error obtenint l\'usuari:', err)
    });

    this.loadData();
  }

  private loadData(): void {
    // Carrega els equips
    this.teamService.getTeams().subscribe({
      next: (teams: Team[]) => { this.teams = teams; },
      error: (err) => console.error('Error carregant equips:', err)
    });
    // Carrega els usuaris i assigna al model UserList
    this.userService.getUsers().subscribe({
      next: (users: User[]) => { this.userList.users = users; },
      error: (err) => console.error('Error carregant usuaris:', err)
    });
  }

  fetchReservedPlayers(): void {
    if (!this.currentUserId) {
      console.warn('currentUserId és buit, no es poden carregar reserves.');
      return;
    }
    this.playerService.getReservedPlayers(this.currentUserId).subscribe({
      next: (players: Player[]) => {
        console.log('Jugadors reservats:', players);
        this.reservedPlayers = players;
      },
      error: (err) => console.error('Error carregant reserves:', err)
    });
  }

  assignPlayerToTeam(): void {
    if (this.selectedTeamId && this.selectedPlayerId) {
      this.teamService.assignPlayerToTeam(this.selectedTeamId, this.selectedPlayerId, this.currentUserId).subscribe({
        next: () => {
          this.reservedPlayers = this.reservedPlayers.filter(p => p.playerUUID !== this.selectedPlayerId);
          this.selectedTeamId = null;
          this.selectedPlayerId = null;
        },
        error: err => console.error('Error assignant jugador:', err)
      });
    }
  }

  addTeam(): void {
    if (this.newTeam.teamName && this.newTeam.shirtColor && this.newTeam.userUUID) {
      this.teamService.addTeam(this.newTeam).subscribe({
        next: (newTeamFromServer) => {
          console.log("Equip creat:", newTeamFromServer);
          this.teams = [...this.teams, Team.fromApi(newTeamFromServer)];
          this.newTeam = new Team();
        },
        error: (err) => console.error("Error afegint equip:", err)
      });
    }
  }

  deleteTeam(teamUUID: string): void {
    console.log("Intentant eliminar equip amb UUID:", teamUUID);
    this.teamService.deleteTeam(teamUUID).subscribe({
      next: () => { this.teams = this.teams.filter(t => t.teamUUID !== teamUUID); },
      error: (err) => console.error("Error eliminant equip:", err)
    });
  }
}
