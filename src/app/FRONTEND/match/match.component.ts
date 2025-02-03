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
  
}