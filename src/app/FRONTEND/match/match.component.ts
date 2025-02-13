import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit, OnDestroy {
  teams: any[] = [];
  selectedHomeTeam: number | null = null;
  selectedAwayTeam: number | null = null;
  match: any = null;
  matchSummary: any = null;
  matchStarted: boolean = false;
  pollingSubscription: Subscription | undefined;
  baseUrl = 'http://localhost:3000/api/v1';

  betAmount: number = 0;
  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  startMatch(): void {
    if (!this.canStartMatch()) {
      alert("⚠ Selecciona equips diferents per iniciar el partit.");
      return;
    }

    const newMatch = {
      tournamentID: 8,
      homeTeamID: this.selectedHomeTeam,
      awayTeamID: this.selectedAwayTeam,
      matchDate: new Date()
    };

    this.http.post<any>(`${this.baseUrl}/matches`, newMatch).subscribe(
      res => {
        const matchID = res.matchID;
        console.log("✅ Partida creada amb matchID:", matchID);

        this.matchStarted = true;
        this.pollingSubscription = interval(1000).subscribe(() => this.loadMatchData(matchID));
        this.simulateMatch(matchID);
      },
      error => console.error('Error creant partida:', error)
    );
  }
  loadTeams(): void {
    this.http.get<any[]>(`${this.baseUrl}/teams`).subscribe(
      data => this.teams = data,
      error => console.error('Error carregant equips:', error)
    );
  }

  canStartMatch(): boolean {
    return !!(
      this.selectedHomeTeam &&
      this.selectedAwayTeam &&
      this.selectedHomeTeam !== this.selectedAwayTeam &&
      !this.matchStarted
    );
  }

  simulateMatch(matchID: number): void {
    this.http.post<any>(`${this.baseUrl}/matches/simulate`, { matchID }).subscribe(
      summary => {
        this.matchSummary = summary;
        // Atura el polling perquè ja tenim les dades finals
        this.pollingSubscription?.unsubscribe();
      },
      error => console.error('Error en simular partida:', error)
    );
  }
  

  loadMatchData(matchID: number): void {
    this.http.get<any>(`${this.baseUrl}/matches/${matchID}`).subscribe(
      data => this.match = data.match,
      error => console.error('Error carregant dades del partit:', error)
    );
  }

  resetMatch(): void {
    if (!this.match) return;

    this.http.post<any>(`${this.baseUrl}/matches/reset`, { matchID: this.match.MatchID }).subscribe(
      () => {
        this.match = null;
        this.matchSummary = null;
        this.matchStarted = false;
        this.pollingSubscription?.unsubscribe();
      },
      error => console.error('Error reiniciant partida:', error)
    );
  }

  placeBet(): void {
    if (!this.selectedHomeTeam || !this.selectedAwayTeam) {
      alert("⚠ Selecciona els equips abans d'apostar.");
    }
  }  
}  