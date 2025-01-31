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
}
