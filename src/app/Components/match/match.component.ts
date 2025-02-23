import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { MatchService } from '../../Serveis/match.service';
import { TeamService } from '../../Serveis/team.service';
import { Match } from '../../Classes/match/match.model';
import { Team } from '../../Classes/teams/team.model';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit, OnDestroy {
  teams: Team[] = [];
  selectedHomeTeam: string | null = null;
  selectedAwayTeam: string | null = null;
  match: Match | null = null;
  matchSummary: any = null;
  matchStarted: boolean = false;
  pollingSubscription: Subscription | undefined;

  betAmount: number = 0;
  predictedWinner: string = 'home';
  currentUserUUID: string = '6';

  constructor(
    private matchService: MatchService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  private loadTeams(): void {
    this.teamService.getTeams().subscribe({
      next: (teams) => this.teams = teams,
      error: (error) => console.error('Error carregant equips:', error)
    });
  }

  // Accepta també undefined i retorna un valor per defecte
  getTeamName(teamUUID: string | undefined): string {
    if (!teamUUID) return 'Equip Desconegut';
    const team = this.teams.find(t => t.teamUUID === teamUUID);
    return team?.teamName || 'Equip Desconegut';
  }

  canStartMatch(): boolean {
    return !!(
      this.selectedHomeTeam &&
      this.selectedAwayTeam &&
      this.selectedHomeTeam !== this.selectedAwayTeam &&
      !this.matchStarted
    );
  }

  startMatch(): void {
    if (!this.canStartMatch()) return;

    // Creem una nova instància de Match
    const newMatch = Match.createNew(
      '7E405744-880B-4D33-84A1-FCEB95C076A5',
      this.selectedHomeTeam!,
      this.selectedAwayTeam!,
      new Date()
    );

    this.matchService.createMatch(newMatch).subscribe({
      next: (res: any) => {
        const matchID = res.matchID;
        this.matchStarted = true;
        this.startPolling(matchID);
        this.simulateMatch(matchID);
      },
      error: (error) => console.error('Error creant partit:', error)
    });
  }

  private startPolling(matchID: string): void {
    this.pollingSubscription = interval(1000).subscribe(() => {
      this.matchService.getMatch(matchID).subscribe({
        next: (match) => {
          this.match = match;
          if (match.isMatchEnded()) {
            this.handleMatchEnd();
          }
        },
        error: (error) => console.error('Error carregant dades:', error)
      });
    });
  }

  private handleMatchEnd(): void {
    if (!this.match) return;
    this.matchSummary = this.match.getSummary();
    this.pollingSubscription?.unsubscribe();
  }

  simulateMatch(matchID: string): void {
    this.matchService.simulateMatch(matchID).subscribe({
      next: () => console.log('Simulació completada'),
      error: (error) => console.error('Error en simulació:', error)
    });
  }

  resetMatch(): void {
    if (!this.match) return;

    this.matchService.resetMatch(this.match.id).subscribe({
      next: () => {
        this.resetComponentState();
        this.loadTeams();
      },
      error: (error) => console.error('Error en reinici:', error)
    });
  }

  private resetComponentState(): void {
    this.match = null;
    this.matchSummary = null;
    this.matchStarted = false;
    this.selectedHomeTeam = null;
    this.selectedAwayTeam = null;
    this.pollingSubscription?.unsubscribe();
  }

  placeBet(): void {
    if (!this.selectedHomeTeam || !this.selectedAwayTeam || !this.match) return;

    // Generem l'objecte d'aposta a partir de la instància de Match
    const betData = this.match.toBetApi(
      this.betAmount,
      this.predictedWinner,
      this.selectedHomeTeam,
      this.selectedAwayTeam
    );

    this.matchService.placeBet(betData).subscribe({
      next: () => alert('Aposta realitzada amb èxit!'),
      error: (error) => alert(error.error?.error || "Error en l'aposta")
    });
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }
}