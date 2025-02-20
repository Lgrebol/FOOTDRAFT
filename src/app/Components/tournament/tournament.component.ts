import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TournamentService } from '../../Serveis/tournament.service'; // Corregir ruta segons estructura
import { Tournament } from '../../Classes/tournament/tournament.model'; // Nou path de la classe

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
  tournaments: Tournament[] = [];
  newTournament = { name: '', type: 'Knockout', startDate: '', endDate: '' };

  constructor(private tournamentService: TournamentService) {}

  ngOnInit(): void {
    this.tournamentService.getTournaments().subscribe(
      (tournaments) => this.tournaments = tournaments
    );
  }

  addTournament(): void {
    if (this.newTournament.name) {
      this.tournamentService.addTournament({
        tournamentName: this.newTournament.name,
        tournamentType: this.newTournament.type,
        startDate: this.newTournament.startDate,
        endDate: this.newTournament.endDate
      }).subscribe({
        next: () => {
          this.newTournament = { name: '', type: 'Knockout', startDate: '', endDate: '' };
          this.tournamentService.getTournaments().subscribe( // Forçar actualització
            (tournaments) => this.tournaments = tournaments
          );
        },
        error: (error) => console.error("Error adding tournament:", error)
      });
    }
  }

  deleteTournament(id: number): void {
    this.tournamentService.deleteTournament(id).subscribe({
      next: () => {
        this.tournaments = this.tournaments.filter(t => t.id !== id);
      },
      error: (error) => console.error("Error deleting tournament:", error)
    });
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}