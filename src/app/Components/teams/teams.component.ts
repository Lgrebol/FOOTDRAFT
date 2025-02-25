import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../Serveis/team.service';
import { UserService } from '../../Serveis/user.service';
import { PlayerService } from '../../Serveis/player.service';
import { Team } from '../../Classes/teams/team.model';
import { User } from '../../Classes/user/user.model';
import { Player } from '../../Classes/players/player.model';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  teams: Team[] = [];
  users: User[] = [];
  reservedPlayers: Player[] = [];
  
  selectedTeamId: string | null = null;
  selectedPlayerId: string | null = null;
  
  currentUserId: string = '97C72798-B79D-4248-AC5C-11457F2E38AC';

  newTeam: Team = new Team();

  constructor(
    private teamService: TeamService,
    private userService: UserService,
    private playerService: PlayerService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.teamService.getTeams().subscribe(teams => this.teams = teams);
    
    this.userService.getUsers().subscribe({
      next: users => this.users = users,
      error: error => console.error('Error carregant usuaris:', error)
    });
  
    this.playerService.getReservedPlayers(this.currentUserId).subscribe(
      players => this.reservedPlayers = players
    );
  }

  assignPlayerToTeam(): void {
    if (this.selectedTeamId && this.selectedPlayerId) {
      this.teamService.assignPlayerToTeam(
        this.selectedTeamId,
        this.selectedPlayerId,
        this.currentUserId
      ).subscribe({
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
      next: () => {
        this.teams = this.teams.filter(t => t.teamUUID !== teamUUID);
      },
      error: (err) => console.error("Error eliminant equip:", err) 
    });
  }

  fetchReservedPlayers(): void {
    this.playerService.getReservedPlayers(this.currentUserId).subscribe({
      next: (players) => {
        console.log("Jugadors reservats:", players);
        this.reservedPlayers = players;
      },
      error: (err) => console.error("Error carregant reserves:", err)
    });
  }
}
