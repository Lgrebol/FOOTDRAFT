import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Player } from '../Classes/players/player.model';
import { PlayerService } from './player.service';
import { TeamService } from './team.service';

@Injectable({
  providedIn: 'root'
})
export class TeamAssignmentService {
  private reservedPlayersSubject = new BehaviorSubject<Player[]>([]);
  reservedPlayers$ = this.reservedPlayersSubject.asObservable();

  constructor(
    private playerService: PlayerService,
    private teamService: TeamService
  ) {}

  loadReservedPlayers(userUUID: string): void {
    this.playerService.getReservedPlayers(userUUID).subscribe({
      next: (players: Player[]) => this.reservedPlayersSubject.next(players),
      error: (err) => console.error('Error carregant jugadors reservats:', err)
    });
  }

  assignPlayerToTeam(teamUUID: string, playerUUID: string, userUUID: string): Observable<unknown> {
    return this.teamService.assignPlayerToTeam(teamUUID, playerUUID, userUUID);
  }
}
