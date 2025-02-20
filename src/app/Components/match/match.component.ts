import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { DataService, Team } from '../shared/data.service';

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
  match: any = null;
  matchSummary: any = null;
  matchStarted: boolean = false;
  pollingSubscription: Subscription | undefined;
  homeTeamName: string = '';
  awayTeamName: string = '';

  betAmount: number = 0;
  predictedWinner: string = 'home';
  currentUserID: number = 6;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  private loadTeams(): void {
    this.dataService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        console.log('Equips carregats:', teams);
      },
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
    if (!this.canStartMatch()) {
      alert("Selecciona equips diferents per començar el partit");
      return;
    }

    const newMatch = {
      tournamentID: 8,
      homeTeamID: this.selectedHomeTeam!,
      awayTeamID: this.selectedAwayTeam!,
      matchDate: new Date()
    };

    this.dataService.createMatch(newMatch).subscribe({
      next: (res: any) => {
        const matchID = res.matchID;
        console.log("Partit creat amb ID:", matchID);
        
        this.matchStarted = true;
        this.setTeamNames();
        this.startPolling(matchID);
        this.simulateMatch(matchID);
      },
      error: (error) => console.error('Error creant partit:', error)
    });
  }

  // Afegeix aquest mètode al component
getTeamName(teamId: number): string {
  const team = this.teams.find(t => t.id === teamId);
  return team ? team.teamName : 'Equip Desconegut';
}

  private setTeamNames(): void {
    if (this.selectedHomeTeam) {
      this.dataService.getTeamName(this.selectedHomeTeam).subscribe(
        name => this.homeTeamName = name
      );
    }
    if (this.selectedAwayTeam) {
      this.dataService.getTeamName(this.selectedAwayTeam).subscribe(
        name => this.awayTeamName = name
      );
    }
  }

  private startPolling(matchID: number): void {
    this.pollingSubscription = interval(1000).subscribe(() => {
      this.loadMatchData(matchID);
    });
  }

  loadMatchData(matchID: number): void {
    this.dataService.getMatch(matchID).subscribe({
      next: (data: any) => {
        console.log('Dades actualitzades del partit:', data);
        this.match = data;
        
        if (data?.currentMinute > 90) {
          this.handleMatchEnd();
        }
      },
      error: (error) => console.error('Error carregant dades:', error)
    });
  }

  private handleMatchEnd(): void {
    this.matchSummary = {
      homeGoals: this.match.homeGoals,
      awayGoals: this.match.awayGoals,
      totalGoals: this.match.homeGoals + this.match.awayGoals,
      totalFouls: this.match?.events?.filter((e: any) => e.eventType === 'Falta').length || 0,
      totalRedCards: this.match?.events?.filter((e: any) => e.eventType === 'Vermella').length || 0,
      matchEnded: true, // <-- Coma afegida aquí
      message: "El partit ha finalitzat!"
    };
    this.pollingSubscription?.unsubscribe();
  }

  simulateMatch(matchID: number): void {
    this.dataService.simulateMatch(matchID).subscribe({
      next: (summary: any) => {
        console.log('Simulació completada:', summary);
        this.loadMatchData(matchID);
      },
      error: (error) => console.error('Error en simulació:', error)
    });
  }

  resetMatch(): void {
    if (!this.match) return;

    console.log('Reiniciant partit...');
    this.dataService.resetMatch(this.match.id).subscribe({
      next: () => {
        console.log('Partit reiniciat correctament');
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
    this.homeTeamName = '';
    this.awayTeamName = '';
    this.pollingSubscription?.unsubscribe();
  }

  placeBet(): void {
    if (!this.selectedHomeTeam || !this.selectedAwayTeam) {
      alert("Selecciona equips abans d'apostar");
      return;
    }
    if (this.selectedHomeTeam === this.selectedAwayTeam) {
      alert("No pots apostar per un partit amb el mateix equip");
      return;
    }
    if (this.betAmount <= 0) {
      alert("L'import de l'aposta ha de ser superior a 0");
      return;
    }

    const bet = {
      homeTeamID: this.selectedHomeTeam,
      awayTeamID: this.selectedAwayTeam,
      amount: this.betAmount,
      predictedWinner: this.predictedWinner
    };

    this.dataService.placeBet(bet).subscribe({
      next: () => alert('Aposta realitzada amb èxit!'),
      error: (error) => {
        console.error("Error en l'aposta:", error);
        alert(error.error?.error || "Error en l'aposta");
      }
    });
  }
}