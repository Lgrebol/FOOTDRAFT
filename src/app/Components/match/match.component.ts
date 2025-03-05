import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { MatchService } from '../../Serveis/match.service';
import { TournamentService } from '../../Serveis/tournament.service';
import { TeamService } from '../../Serveis/team.service';
import { Match } from '../../Classes/match/match.model';
import { IMatchSummary } from '../../Interfaces/match-summary.interface';
import { Tournament } from '../../Classes/tournament/tournament.model';
import { Team } from '../../Classes/teams/team.model';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit, OnDestroy {
  // Propietats per al selector de torneig
  tournamentList: Tournament[] = [];
  selectedTournamentId: string = '';

  // Propietats per al selector d'equips
  teamList: Team[] = [];
  selectedHomeTeam: string | null = null;
  selectedAwayTeam: string | null = null;

  // Dades del partit
  match: Match | null = null;
  matchSummary: IMatchSummary | null = null;
  matchStarted: boolean = false;
  pollingSubscription?: Subscription;

  // Apostes
  betAmount: number = 0;
  predictedWinner: string = 'home';

  // Conservem l'identificador del partit per al reset
  currentMatchID: string | null = null;

  constructor(
    private matchService: MatchService,
    private tournamentService: TournamentService,
    private teamService: TeamService
  ) {}

  ngOnInit(): void {
    this.loadTournaments();
    this.loadTeams();
  }

  private loadTournaments(): void {
    this.tournamentService.getTournaments().subscribe({
      next: (tornejos) => { this.tournamentList = tornejos; },
      error: (error: unknown) => console.error('Error carregant tornejos:', error)
    });
  }

  private loadTeams(): void {
    this.teamService.getTeams().subscribe({
      next: (teams) => { this.teamList = teams; },
      error: (error: unknown) => console.error('Error carregant equips:', error)
    });
  }

  canStartMatch(): boolean {
    return !!(
      this.selectedTournamentId &&
      this.selectedHomeTeam &&
      this.selectedAwayTeam &&
      this.selectedHomeTeam !== this.selectedAwayTeam &&
      !this.matchStarted
    );
  }

  startMatch(): void {
    if (!this.canStartMatch()) {
      alert('Si us plau, selecciona el torneig i els equips correctament.');
      return;
    }
    const newMatch = Match.createNew(
      this.selectedTournamentId,
      this.selectedHomeTeam!,
      this.selectedAwayTeam!,
      new Date()
    );
    this.matchService.createMatch(newMatch).subscribe({
      next: (res: { matchID: string }) => {
        const matchID = res.matchID;
        this.currentMatchID = matchID; 
        this.matchStarted = true;
        this.startPolling(matchID);
        this.simulateMatch(matchID);
      },
      error: (error: unknown) => console.error('Error creant partit:', error)
    });
  }

  private startPolling(matchID: string): void {
    this.pollingSubscription = interval(500).subscribe(() => {
      this.matchService.getMatch(matchID).subscribe({
        next: (match) => {
          this.match = match;
        },
        error: (error: unknown) => console.error('Error carregant dades:', error)
      });
    });
  }
  
  simulateMatch(matchID: string): void {
    this.matchService.simulateMatch(matchID).subscribe({
      next: (finalSummary: any) => {
         console.log('Simulació completada', finalSummary);
         this.matchSummary = finalSummary;
         if (this.currentMatchID) {
           finalSummary.id = this.currentMatchID;
         }
         this.match = finalSummary;
         this.pollingSubscription?.unsubscribe();
      },
      error: (error: unknown) => console.error('Error en simulació:', error)
    });
  }

  resetMatch(): void {
    if (!this.currentMatchID) { return; }
    this.matchService.resetMatch(this.currentMatchID).subscribe({
      next: () => {
        this.match = null;
        this.matchSummary = null;
        this.matchStarted = false;
        this.selectedHomeTeam = null;
        this.selectedAwayTeam = null;
        this.currentMatchID = null;
        this.pollingSubscription?.unsubscribe();
      },
      error: (error: unknown) => console.error('Error en reinici:', error)
    });
  }

  placeBet(): void {
    if (!this.selectedHomeTeam || !this.selectedAwayTeam || !this.match) { return; }
    const betData = this.match.toBetApi(this.betAmount, this.predictedWinner, this.selectedHomeTeam, this.selectedAwayTeam);
    this.matchService.placeBet(betData).subscribe({
      next: () => alert('Aposta realitzada amb èxit!'),
      error: (error: unknown) => {
        const errObj = error as { error?: { error?: string } };
        alert(errObj.error?.error || "Error en l'aposta");
      }
    });
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }
}
