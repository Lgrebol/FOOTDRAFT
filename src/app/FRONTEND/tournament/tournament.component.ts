import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class TournamentComponent implements OnInit {
  tournaments: any[] = [];
  newTournament = { name: '', type: 'Knockout', startDate: '', endDate: '' };

  public API_URL = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    console.log("En este instante el componente ha cargado");
  }

  loadTournaments() {
    this.http.get<any[]>(`${this.API_URL}/tournaments`).subscribe((data) => {
      this.tournaments = data;
    });
  }

  addTournament() {
    if (this.newTournament.name) {
      this.http.post(`${this.API_URL}/tournaments`, {
        tournamentName: this.newTournament.name,
        tournamentType: this.newTournament.type,
        startDate: this.newTournament.startDate,
        endDate: this.newTournament.endDate 
      }).subscribe(() => {
        this.loadTournaments();
        this.newTournament = { name: '', type: 'Knockout', startDate: '', endDate: '' };
      }, error => {
        console.error("Error en afegir torneig:", error);
      });
    }
  }  
  
  deleteTournament(id: number) {
    this.http.delete(`${this.API_URL}/tournaments/${id}`).subscribe(() => {
      this.loadTournaments();
    });
  }
}
