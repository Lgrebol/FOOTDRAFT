import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Team, User, Player } from '../shared/data.service';

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
  
  selectedTeamId: number | null = null;
  selectedPlayerId: number | null = null;
  
  // Add a property for the current user ID
  currentUserId: number = 6; // Replace this with the actual logged-in user ID

  newTeam = {
    name: '',
    shirtColor: '',
    userId: null as number | null
  };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.dataService.getTeams().subscribe(teams => this.teams = teams);
    this.dataService.getUsers().subscribe(users => this.users = users);
    // Pass the currentUserId to getReservedPlayers
    this.dataService.getReservedPlayers(this.currentUserId).subscribe(
      players => this.reservedPlayers = players
    );
  }

  assignPlayerToTeam(): void {
    if (this.selectedTeamId && this.selectedPlayerId) {
      // Pass the currentUserId as the third argument
      this.dataService.assignPlayerToTeam(
        this.selectedTeamId,
        this.selectedPlayerId,
        this.currentUserId
      ).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error assignant jugador:', err)
      });
    }
  }

  addTeam(): void {
    if (this.newTeam.name && this.newTeam.shirtColor && this.newTeam.userId) {
      this.dataService.addTeam({
        teamName: this.newTeam.name,
        shirtColor: this.newTeam.shirtColor,
        userID: this.newTeam.userId
      }).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error('Error afegint equip:', err)
      });
    }
  }

  deleteTeam(teamId: number): void {
    this.dataService.deleteTeam(teamId).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error eliminant equip:', err)
    });
  }
}
