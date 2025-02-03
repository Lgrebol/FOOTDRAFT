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
  
  
}