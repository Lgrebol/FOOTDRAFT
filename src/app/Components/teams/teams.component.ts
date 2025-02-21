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
  
  currentUserId: string = '6';

  newTeam = {
    name: '',
    shirtColor: '',
    userId: '' as string
  };

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
    this.userService.getUsers().subscribe(users => this.users = users);
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
        next: () => this.loadData(),
        error: err => console.error('Error assignant jugador:', err)
      });
    }
  }

  addTeam(): void {
    if (this.newTeam.name && this.newTeam.shirtColor && this.newTeam.userId) {
      this.teamService.addTeam({
        teamName: this.newTeam.name,
        shirtColor: this.newTeam.shirtColor,
        userID: this.newTeam.userId
      }).subscribe({
        next: () => this.loadData(),
        error: err => console.error('Error afegint equip:', err)
      });
    }
  }

  deleteTeam(teamId: string): void {
    this.teamService.deleteTeam(teamId).subscribe({
      next: () => this.loadData(),
      error: err => console.error('Error eliminant equip:', err)
    });
  }
}
