import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-match',
  standalone: true,
  providers: [],
  imports: [CommonModule, FormsModule],
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit, OnDestroy {
  teams: any[] = [];
  matchStarted: boolean = false;
  selectedHomeTeam: number | null = null;
  selectedAwayTeam: number | null = null;
  match: any = null;
  matchSummary: any = null;
  pollingSubscription: Subscription | undefined;
  // URL base (ajusta si és necessari)
  baseUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log("It works");
  }

  loadTeams(): void {
    this.http.get<any[]>(`${this.baseUrl}/teams`).subscribe(
      data => this.teams = data,
      error => console.error('Error carregant equips:', error)
    );
  }

  canStartMatch(): boolean {
    return !!(this.selectedHomeTeam &&
              this.selectedAwayTeam &&
              this.selectedHomeTeam !== this.selectedAwayTeam &&
              !this.matchStarted);
  }

  loadMatchData(matchID: number): void {
    this.http.get<any>(`${this.baseUrl}/matches/${matchID}`).subscribe(
      data => {
        this.match = data.match;
      },
      error => console.error('Error carregant dades de partida:', error)
    );
  }
  
  startMatch(): void {
    const newMatch = {
      tournamentID: 8, 
      homeTeamID: this.selectedHomeTeam,
      awayTeamID: this.selectedAwayTeam,
      matchDate: new Date()
    };
  
    this.http.post<any>(`${this.baseUrl}/matches`, newMatch).subscribe(
      res => {
        const matchID = res.matchID;
        this.matchStarted = true;
        this.http.post<any>(`${this.baseUrl}/matches/simulate`, { matchID }).subscribe(
          summary => {
            this.matchSummary = summary;
            if (this.pollingSubscription) {
              this.pollingSubscription.unsubscribe();
            }
          },
          error => console.error('Error en simular partida:', error)
        );
        this.pollingSubscription = interval(1000).subscribe(() => this.loadMatchData(matchID));
      },
      error => console.error('Error creant partida:', error)
    );
  }  
}