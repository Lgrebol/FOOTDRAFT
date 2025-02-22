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
  
  newPlayer: Player = new Player();

  positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  constructor(
    private playerService: PlayerService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.playerService.getPlayers().subscribe(players => this.players = players);
    this.teamService.getTeams().subscribe(teams => this.teams = teams);
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    this.newPlayer.imageFile = file;
  }

  addPlayer(): void {
    const formData = this.newPlayer.toFormData();
    this.playerService.addPlayer(formData).subscribe({
      next: () => {
        this.loadData();
        this.newPlayer = new Player();
      },
      error: (err) => console.error('Error afegint jugador:', err)
    });
  }

  deletePlayer(playerUUID: string): void {
    this.playerService.deletePlayer(playerUUID).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error eliminant jugador:', err)
    });
  }
}