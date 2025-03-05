import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../Serveis/team.service';
import { TeamAssignmentService } from '../../Serveis/team-assignment.service';
import { Team } from '../../Classes/teams/team.model';
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
  newTeam: Team = new Team();
  currentUserId: string = localStorage.getItem('userUUID') || '';

  reservedPlayers: Player[] = [];
  selectedTeamId: string | null = null;
  selectedPlayerId: string | null = null;

  constructor(
    private teamService: TeamService,
    private teamAssignmentService: TeamAssignmentService
  ) {}

  ngOnInit(): void {
    this.loadTeams();
    if (this.currentUserId) {
      this.teamAssignmentService.loadReservedPlayers(this.currentUserId);
      this.teamAssignmentService.reservedPlayers$.subscribe(players => {
        this.reservedPlayers = players;
      });
    }
  }

  private loadTeams(): void {
    this.teamService.getTeams().subscribe({
      next: (teams: Team[]) => { this.teams = teams; },
      error: (err) => console.error('Error carregant equips:', err)
    });
  }

  addTeam(): void {
    if (this.newTeam.teamName && this.newTeam.shirtColor) {
      // Assignem automàticament l'usuari actual
      this.newTeam.userUUID = this.currentUserId;
      this.teamService.addTeam(this.newTeam).subscribe({
        next: (newTeamFromServer) => {
          this.teams = [...this.teams, Team.fromApi(newTeamFromServer)];
          this.newTeam = new Team();
        },
        error: (err) => console.error("Error afegint equip:", err)
      });
    }
  }

  deleteTeam(teamUUID: string): void {
    this.teamService.deleteTeam(teamUUID).subscribe({
      next: () => { this.teams = this.teams.filter(t => t.teamUUID !== teamUUID); },
      error: (err) => console.error("Error eliminant equip:", err)
    });
  }

  assignPlayerToTeam(): void {
    if (this.selectedTeamId && this.selectedPlayerId) {
      this.teamAssignmentService.assignPlayerToTeam(this.selectedTeamId, this.selectedPlayerId, this.currentUserId)
        .subscribe({
          next: () => {
            this.reservedPlayers = this.reservedPlayers.filter(p => p.playerUUID !== this.selectedPlayerId);
            this.selectedTeamId = null;
            this.selectedPlayerId = null;
          },
          error: (err) => console.error('Error assignant jugador:', err)
        });
    }
  }
}
