import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent {
  players = [
    { name: 'Player 1', team: 'Team A' },
    { name: 'Player 2', team: 'Team B' },
    { name: 'Player 3', team: 'Team C' }
  ];
}
