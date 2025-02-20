import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { MatchService } from '../../Serveis/match.service';
import { TeamService } from '../../Serveis/team.service';
import { BetService } from '../../Serveis/bet.service';
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
  selectedHomeTeam: number | null = null;
  selectedAwayTeam: number | null = null;
  match: Match | null = null;
  matchSummary: any = null;
  matchStarted: boolean = false;
  pollingSubscription: Subscription | undefined;

  betAmount: number = 0;
  predictedWinner: string = 'home';
  currentUserID: number = 6;

  constructor(
    private matchService: MatchService,
    private teamService: TeamService,
    private betService: BetService
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

    const newMatch = {
      tournamentID: 8,
      homeTeamID: this.selectedHomeTeam!,
      awayTeamID: this.selectedAwayTeam!,
      matchDate: new Date()
    };

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

  getTeamName(teamId: number): string {
    const team = this.teams.find(t => t.id === teamId);
    return team?.teamName || 'Equip Desconegut';
  }

  private startPolling(matchID: number): void {
    this.pollingSubscription = interval(1000).subscribe(() => {
      this.matchService.getMatch(matchID).subscribe({
        next: (match) => {
          this.match = match;
          if (match?.currentMinute > 90) this.handleMatchEnd();
        },
        error: (error) => console.error('Error carregant dades:', error)
      });
    });
  }

  private handleMatchEnd(): void {
    if (!this.match) return;

    this.matchSummary = {
      homeGoals: this.match.homeGoals,
      awayGoals: this.match.awayGoals,
      totalGoals: this.match.homeGoals + this.match.awayGoals,
      totalFouls: this.match.events.filter(e => e.eventType === 'Falta').length,
      totalRedCards: this.match.events.filter(e => e.eventType === 'Vermella').length,
      matchEnded: true,
      message: "El partit ha finalitzat!"
    };
    
    this.pollingSubscription?.unsubscribe();
  }

  simulateMatch(matchID: number): void {
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
    if (!this.selectedHomeTeam || !this.selectedAwayTeam) return;

    const betData = {
      matchID: this.match?.id,
      homeTeamID: this.selectedHomeTeam,
      awayTeamID: this.selectedAwayTeam,
      amount: this.betAmount,
      predictedWinner: this.predictedWinner
    };

    this.betService.placeBet(betData).subscribe({
      next: () => alert('Aposta realitzada amb èxit!'),
      error: (error) => alert(error.error?.error || "Error en l'aposta")
    });
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }
}